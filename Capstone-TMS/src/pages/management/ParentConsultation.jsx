import { useState, useEffect, useRef } from 'react';
import { useConsultation } from '../../contexts/ConsultationContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Empty, Spin, Alert, Avatar, Drawer, Divider, message as antMessage } from 'antd';
import { SendOutlined, LoadingOutlined, PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../../config/axios';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { useLocation } from 'react-router-dom';

dayjs.locale('vi');

const ParentConsultation = () => {
  const { user } = useAuth();
  const location = useLocation();
  const {
    sessions,
    currentSession,
    messages,
    loading, 
    error,
    fetchSessions,
    sendMessage,
    selectSession,
    createSession,
    refreshSessions,
  } = useConsultation();

  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [centers, setCenters] = useState([]);
  const [centersLoading, setCentersLoading] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [hasHandledNavigation, setHasHandledNavigation] = useState(false);
  const messagesEndRef = useRef(null);

  // --- LOGIC XỬ LÝ ĐIỀU HƯỚNG TỪ TRANG CENTERS ---
  useEffect(() => {
    // Chỉ chạy khi đã tải xong danh sách (loading === false) và có targetCenter
    if (location.state?.targetCenter && !loading && !hasHandledNavigation && user) {
      const targetCenter = location.state.targetCenter;
      
      // Chuẩn hóa ID về dạng lowercase để so sánh cho chắc chắn
      const targetId = targetCenter.id.toString().toLowerCase();

      // Tìm session đã tồn tại
      const existingSession = sessions.find(s => 
        (s.centerId && s.centerId.toString().toLowerCase() === targetId) || 
        (s.centerProfileId && s.centerProfileId.toString().toLowerCase() === targetId)
      );

      if (existingSession) {
        console.log('ParentConsultation: Found existing session', existingSession.id);
        antMessage.info(`Tiếp tục trò chuyện với ${targetCenter.name}`);
        selectSession(existingSession);
      } else {
        console.log('ParentConsultation: Creating new session for', targetId);
        antMessage.loading({ content: 'Đang kết nối...', key: 'init_chat' });
        
        createSession(targetCenter.id)
          .then((newSession) => {
            antMessage.success({ content: 'Đã kết nối thành công', key: 'init_chat' });
            if (newSession) selectSession(newSession);
          })
          .catch((err) => {
            console.error(err);
            // Nếu lỗi là do đã tồn tại (backend trả lỗi) thì thử refresh lại list
            if(err.response && err.response.status === 409) { 
                 refreshSessions().then(() => setHasHandledNavigation(false)); // Thử lại sau khi refresh
            } else {
                 antMessage.error({ content: 'Lỗi kết nối', key: 'init_chat' });
            }
          });
      }

      setHasHandledNavigation(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, sessions, loading, hasHandledNavigation, user, createSession, selectSession, refreshSessions]);

  // Tải danh sách trung tâm từ API (cho Drawer)
  useEffect(() => {
    const loadCenters = async () => {
      try {
        setCentersLoading(true);
        const response = await api.get('/Users/Centers');
        setCenters(response.data.centers || []);
      } catch (err) {
        console.error('Error loading centers:', err);
      } finally {
        setCentersLoading(false);
      }
    };
    loadCenters();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentSession) return;
    try {
      setSending(true);
      await sendMessage(currentSession.id, messageInput);
      setMessageInput('');
    } catch (err) {
      console.error('Error sending message:', err);
      antMessage.error('Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const handleSelectSession = async (session) => {
    selectSession(session);
    try {
      await fetchSessions(session.id);
    } catch (err) {
      console.error('Error fetching session:', err);
      antMessage.error('Không thể tải tin nhắn');
    }
  };

  const handleCreateSession = async () => {
    if (!selectedCenter) {
      antMessage.warning('Vui lòng chọn trung tâm');
      return;
    }
    
    // Kiểm tra trùng lặp trước khi tạo
    const existing = sessions.find(s => s.centerId === selectedCenter.id);
    if (existing) {
        antMessage.info('Bạn đã có cuộc trò chuyện với trung tâm này');
        setIsDrawerVisible(false);
        selectSession(existing);
        return;
    }

    try {
      await createSession(selectedCenter.id);
      setIsDrawerVisible(false);
      setSelectedCenter(null);
      setSearchQuery('');
      antMessage.success('Tạo phiên tư vấn thành công');
    } catch (err) {
      console.error('Error creating session:', err);
      antMessage.error('Không thể tạo phiên tư vấn');
    }
  };

  const handleRefreshSessions = async () => {
    try {
      setRefreshing(true);
      await refreshSessions();
      antMessage.success('Làm mới danh sách thành công');
    } catch (err) {
      console.error('Error refreshing sessions:', err);
      antMessage.error('Không thể làm mới danh sách');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredCenters = centers
    .filter((center) => center.status === 'Active')
    .filter((center) =>
        center.centerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        center.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="h-screen flex bg-white">
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-gray-900">Tin nhắn</h1>
            <div className="flex gap-2">
              <Button type="text" icon={<ReloadOutlined />} onClick={handleRefreshSessions} loading={refreshing} size="large" />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsDrawerVisible(true)} className="bg-blue-500 hover:bg-blue-600 border-0" shape="circle" size="large" />
            </div>
          </div>
          <Input placeholder="Tìm kiếm cuộc trò chuyện..." prefix={<SearchOutlined />} style={{ borderRadius: '20px' }} />
        </div>

        {error && <Alert message={error} type="error" showIcon closable className="m-3" />}

        <div className="flex-1 overflow-y-auto">
          {loading && sessions.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Empty description="Chưa có cuộc trò chuyện" style={{ marginTop: 0 }} />
              <p className="text-sm mt-2">Bắt đầu tư vấn với trung tâm</p>
            </div>
          ) : (
            <div className="space-y-0">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session)}
                  className={`p-4 cursor-pointer transition-colors border-b border-gray-100 ${
                    currentSession?.id === session.id
                      ? 'bg-blue-50 border-l-4 border-l-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar size={48} style={{ backgroundColor: '#1890ff' }} className="flex-shrink-0">
                      {session.centerName?.charAt(0) || 'C'}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900 truncate text-sm">{session.centerName || 'Trung tâm'}</p>
                      </div>
                      <p className="text-xs text-gray-600 truncate">Chủ sở hữu: {session.centerOwnerName}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white">
        {currentSession ? (
          <>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar size={48} style={{ backgroundColor: '#1890ff' }}>
                  {currentSession.centerName?.charAt(0) || 'C'}
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{currentSession.centerName || 'Trung tâm'}</p>
                  <p className="text-xs text-gray-600">Chủ sở hữu: {currentSession.centerOwnerName}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <Avatar size={80} style={{ backgroundColor: '#1890ff' }} className="mx-auto mb-4">
                      {currentSession.centerName?.charAt(0) || 'C'}
                    </Avatar>
                    <p className="font-semibold text-gray-900">{currentSession.centerName}</p>
                    <p className="text-sm text-gray-600 mt-2">Chủ sở hữu: {currentSession.centerOwnerName}</p>
                    <p className="text-sm text-gray-500 mt-4">Bắt đầu cuộc trò chuyện của bạn</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.senderId === user?.userId ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-2xl ${message.senderId === user?.userId ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-900'}`}>
                        <p className="text-sm break-words">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.senderId === user?.userId ? 'text-blue-100' : 'text-gray-600'}`}>
                          {dayjs(message.createdAt).format('HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex gap-2 items-end">
                <Input
                  placeholder="Nhập tin nhắn..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onPressEnter={handleSendMessage}
                  disabled={sending}
                  style={{ borderRadius: '20px' }}
                />
                <Button type="primary" icon={<SendOutlined />} onClick={handleSendMessage} loading={sending} disabled={!messageInput.trim() || sending} className="bg-blue-500 hover:bg-blue-600 border-0" shape="circle" size="large" />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-xl font-semibold text-gray-900 mb-2">Chọn một cuộc trò chuyện</p>
              <p className="text-gray-500">Hoặc bắt đầu một cuộc trò chuyện mới</p>
            </div>
          </div>
        )}
      </div>

      <Drawer
        title="Tư vấn mới"
        placement="right"
        onClose={() => { setIsDrawerVisible(false); setSelectedCenter(null); setSearchQuery(''); }}
        open={isDrawerVisible}
        width={400}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm trung tâm</label>
            <Input placeholder="Nhập tên hoặc địa chỉ trung tâm..." prefix={<SearchOutlined />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Danh sách trung tâm</label>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {centersLoading ? (
                <div className="flex justify-center py-8"><Spin /></div>
              ) : filteredCenters.length === 0 ? (
                <Empty description="Không tìm thấy trung tâm" />
              ) : (
                filteredCenters.map((center) => (
                  <div key={center.id} onClick={() => setSelectedCenter(center)} className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${selectedCenter?.id === center.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className="flex items-start gap-3">
                      <Avatar size={40} style={{ backgroundColor: '#1890ff' }} className="flex-shrink-0">{center.centerName?.charAt(0) || 'C'}</Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{center.centerName}</p>
                        <p className="text-sm text-gray-600 truncate">{center.address}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <Divider />
          <div className="flex gap-2">
            <Button block onClick={() => { setIsDrawerVisible(false); setSelectedCenter(null); setSearchQuery(''); }}>Hủy</Button>
            <Button type="primary" block onClick={handleCreateSession} disabled={!selectedCenter} className="bg-blue-500 hover:bg-blue-600 border-0">Bắt đầu tư vấn</Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default ParentConsultation;
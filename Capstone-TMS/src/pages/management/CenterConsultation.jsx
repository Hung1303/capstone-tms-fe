import React, { useState, useEffect, useRef } from 'react';
import { useConsultation } from '../../contexts/ConsultationContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Empty, Spin, Alert, Avatar } from 'antd';
import { SendOutlined, LoadingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const CenterConsultation = () => {
  const { user } = useAuth();
  const {
    sessions,
    currentSession,
    messages,
    loading,
    error,
    fetchSessions,
    sendMessage,
    selectSession,
  } = useConsultation();

  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentSession) {
      return;
    }

    try {
      setSending(true);
      await sendMessage(currentSession.id, messageInput);
      setMessageInput('');
    } catch (err) {
      console.error('Error sending message:', err);
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
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Tư vấn với Phụ huynh</h1>
      </div>

      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          closable
          className="m-4"
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sessions List */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Danh sách tư vấn</h2>
          </div>

          {loading && sessions.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            </div>
          ) : sessions.length === 0 ? (
            <Empty
              description="Không có phiên tư vấn"
              style={{ marginTop: 50 }}
            />
          ) : (
            <div className="space-y-2 p-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    currentSession?.id === session.id
                      ? 'bg-orange-100 border-2 border-orange-500'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      size={40}
                      style={{ backgroundColor: '#87d068' }}
                    >
                      {session.parentName?.charAt(0) || 'P'}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {session.parentName || 'Phụ huynh'}
                      </p>
                      {/* ĐÃ XÓA: dòng "Chưa có tin nhắn" ở đây */}
                    </div>
                  </div>
                  {/* ĐÃ XÓA: dòng thời gian "vài giây trước" ở đây */}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {currentSession ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    size={40}
                    style={{ backgroundColor: '#87d068' }}
                  >
                    {currentSession.parentName?.charAt(0) || 'P'}
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {currentSession.parentName || 'Phụ huynh'}
                    </p>
                    {/* ĐÃ XÓA: dòng trạng thái "Đang hoạt động" ở đây */}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <Empty description="Chưa có tin nhắn" />
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.senderId === user?.userId
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.senderId === user?.userId
                            ? 'bg-orange-500 text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.senderId === user?.userId
                              ? 'text-orange-100'
                              : 'text-gray-500'
                          }`}
                        >
                          {dayjs(message.sentAt).format('HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập tin nhắn..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onPressEnter={handleSendMessage}
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button
                    type="primary"
                    icon={
                      sending ? (
                        <LoadingOutlined />
                      ) : (
                        <SendOutlined />
                      )
                    }
                    onClick={handleSendMessage}
                    loading={sending}
                    disabled={!messageInput.trim() || sending}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Gửi
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Empty description="Chọn một phiên tư vấn để bắt đầu" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CenterConsultation;
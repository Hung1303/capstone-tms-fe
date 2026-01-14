import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import consultationService from '../services/consultationService';
import { useAuth } from './AuthContext';

const ConsultationContext = createContext();

const ConsultationProvider = ({ children }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Khởi tạo kết nối SignalR và tải danh sách phiên
  useEffect(() => {
    if (user) {
      const initializeConnection = async () => {
        try {
          setLoading(true);
          
          // Lấy token từ localStorage
          const token = localStorage.getItem('token');
          
          if (!token) {
            console.warn('No token found in localStorage');
            setIsConnected(false);
            return;
          }

          // Thử kết nối SignalR nhưng không bắt buộc
          try {
            console.log('Attempting to connect SignalR...');
            await consultationService.connect(token);
            setIsConnected(true);
            setError(null);
            console.log('SignalR connected successfully');
          } catch (signalRError) {
            console.warn('SignalR connection failed, using API fallback:', signalRError);
            setIsConnected(false);
            // Không throw error, tiếp tục sử dụng API
          }
          
          // Tải danh sách phiên tư vấn của người dùng
          await loadUserSessions();
        } catch (err) {
          console.error('Failed to initialize:', err);
          setError('Không thể tải dữ liệu');
        } finally {
          setLoading(false);
        }
      };

      initializeConnection();
    }

    return () => {
      consultationService.disconnect();
    };
  }, [user]);

  // Tải danh sách phiên tư vấn của người dùng
  const loadUserSessions = useCallback(async () => {
    try {
      console.log('Loading user sessions...');
      const sessionsData = await consultationService.getUserSessions();
      console.log('User sessions loaded:', sessionsData);
      setSessions(sessionsData || []);
    } catch (err) {
      console.error('Error loading user sessions:', err);
      setError('Không thể tải danh sách phiên tư vấn');
    }
  }, []);

  // Lắng nghe các sự kiện từ SignalR
  useEffect(() => {
    const handleMessageReceived = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleSessionCreated = (session) => {
      setSessions((prev) => [session, ...prev]);
    };

    const handleSessionUpdated = (session) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? session : s))
      );
    };

    const handleReconnected = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setError('Mất kết nối đến dịch vụ tư vấn');
    };

    consultationService.on('messageReceived', handleMessageReceived);
    consultationService.on('sessionCreated', handleSessionCreated);
    consultationService.on('sessionUpdated', handleSessionUpdated);
    consultationService.on('reconnected', handleReconnected);
    consultationService.on('disconnected', handleDisconnected);

    return () => {
      consultationService.off('messageReceived', handleMessageReceived);
      consultationService.off('sessionCreated', handleSessionCreated);
      consultationService.off('sessionUpdated', handleSessionUpdated);
      consultationService.off('reconnected', handleReconnected);
      consultationService.off('disconnected', handleDisconnected);
    };
  }, []);

  // Tạo phiên tư vấn mới
  const createSession = useCallback(async (centerProfileId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Creating session with:', {
        parentProfileId: user?.parentProfileId,
        centerProfileId: centerProfileId,
        user: user
      });
      
      const session = await consultationService.createSession(
        user?.parentProfileId,
        centerProfileId
      );
      setSessions((prev) => [session, ...prev]);
      setCurrentSession(session);
      return session;
    } catch (err) {
      console.error('Error creating session:', err);
      const errorMessage = err.response?.data?.message || 'Lỗi tạo phiên tư vấn';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.parentProfileId]);

  // Làm mới danh sách phiên
  const refreshSessions = useCallback(async () => {
    await loadUserSessions();
  }, [loadUserSessions]);


  // Lấy tin nhắn của phiên tư vấn
  const fetchSessions = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching messages for session:', sessionId);
      
      // Lấy tin nhắn của người dùng trong session
      const data = await consultationService.getUserSessionMessages(sessionId);
      
      console.log('Fetched messages:', data);
      
      // Giả sử API trả về array of messages hoặc object với messages property
      const messages = Array.isArray(data) ? data : (data.messages || []);
      setMessages(messages);
      
      return data;
    } catch (err) {
      console.error('Error fetching session messages:', err);
      const errorMessage = err.response?.data?.message || 'Lỗi tải tin nhắn';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Gửi tin nhắn (luôn sử dụng API)
  const sendMessage = useCallback(async (sessionId, content) => {
    try {
      setError(null);
      if (!user?.userId) {
        throw new Error('User ID not found');
      }

      // Luôn gửi qua API
      await consultationService.sendMessageViaAPI(user.userId, sessionId, content);
      
      // Tự động làm mới tin nhắn sau 1 giây
      setTimeout(async () => {
        await fetchSessions(sessionId);
      }, 1000);
    } catch (err) {
      const errorMessage = err.message || 'Lỗi gửi tin nhắn';
      setError(errorMessage);
      throw err;
    }
  }, [user?.userId, fetchSessions]);

  // Chọn phiên hiện tại
  const selectSession = useCallback((session) => {
    setCurrentSession(session);
    setMessages([]);
  }, []);

  const value = {
    sessions,
    currentSession,
    messages,
    isConnected,
    loading,
    error,
    createSession,
    fetchSessions,
    sendMessage,
    selectSession,
    refreshSessions,
  };

  return (
    <ConsultationContext.Provider value={value}>
      {children}
    </ConsultationContext.Provider>
  );
};

export const useConsultation = () => {
  const context = useContext(ConsultationContext);
  if (!context) {
    throw new Error('useConsultation must be used within ConsultationProvider');
  }
  return context;
};

export default ConsultationProvider;
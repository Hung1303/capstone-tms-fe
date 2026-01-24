import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';
import consultationService from '../services/consultationService';
import { useAuth } from './AuthContext';

const ConsultationContext = createContext();

const ConsultationProvider = ({ children }) => {
  const { user } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ============================
      LOAD USER SESSIONS
     ============================ */
  const loadUserSessions = useCallback(async () => {
    try {
      const data = await consultationService.getUserSessions();
      setSessions(data || []);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách phiên tư vấn');
    }
  }, []);

  /* ============================
      INIT SIGNALR + LOAD SESSIONS
     ============================ */
  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }

    const init = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('No token found');
          return;
        }

        try {
          await consultationService.connect(token);
          setIsConnected(true);
        } catch (err) {
          console.warn('SignalR unavailable, fallback to API', err);
          setIsConnected(false);
        }

        await loadUserSessions();
      } catch (err) {
        console.error(err);
        setError('Không thể tải dữ liệu tư vấn');
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      consultationService.disconnect();
    };
  }, [user, loadUserSessions]);

  /* ============================
      SIGNALR EVENTS
     ============================ */
  useEffect(() => {
    const onMessageReceived = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    const onSessionCreated = (session) => {
      setSessions((prev) => {
        // Chống trùng lặp khi nhận tin nhắn realtime:
        // Nếu đã có session với ID này HOẶC với CenterId này -> bỏ qua hoặc cập nhật
        const exists = prev.some(s => s.id === session.id);
        if (exists) return prev;
        return [session, ...prev];
      });
    };

    const onSessionUpdated = (session) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? session : s))
      );
    };

    consultationService.on('messageReceived', onMessageReceived);
    consultationService.on('sessionCreated', onSessionCreated);
    consultationService.on('sessionUpdated', onSessionUpdated);

    return () => {
      consultationService.off('messageReceived', onMessageReceived);
      consultationService.off('sessionCreated', onSessionCreated);
      consultationService.off('sessionUpdated', onSessionUpdated);
    };
  }, []);

  /* ============================
      CREATE SESSION (SỬA LỖI DUPLICATE TẠI ĐÂY)
     ============================ */
  const createSession = useCallback(
    async (centerProfileId) => {
      setLoading(true);
      try {
        const session = await consultationService.createSession(
          user.parentProfileId,
          centerProfileId
        );
        
        // --- SỬA LỖI: LOGIC LỌC TRÙNG LẶP MẠNH HƠN ---
        setSessions((prev) => {
            // 1. Lọc bỏ tất cả các session cũ có cùng centerId hoặc cùng id với session mới
            // Điều này đảm bảo trong list chỉ có 1 dòng cho trung tâm này
            const filtered = prev.filter(s => 
                s.id !== session.id && 
                s.centerId !== session.centerId && 
                s.centerProfileId !== centerProfileId
            );
            
            // 2. Thêm session mới nhất lên đầu danh sách
            return [session, ...filtered];
        });
        
        setCurrentSession(session);
        return session;
      } catch (err) {
        console.error("Lỗi tạo phiên tư vấn:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.parentProfileId]
  );

  /* ============================
      FETCH SESSION MESSAGES
     ============================ */
  const fetchSessions = useCallback(async (sessionId) => {
    setLoading(true);
    try {
      const data =
        await consultationService.getUserSessionMessages(sessionId);
      const list = Array.isArray(data) ? data : data.messages || [];
      setMessages(list);
      return list;
    } catch (err) {
      setError('Lỗi tải tin nhắn');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ============================
      SEND MESSAGE (API ONLY)
     ============================ */
  const sendMessage = useCallback(async (sessionId, content) => {
    try {
      setError(null);

      if (!user?.userId) {
        throw new Error('User ID not found');
      }

      await consultationService.sendMessageViaAPI(
        sessionId,
        content
      );

      await fetchSessions(sessionId);

    } catch (err) {
      console.error('Send message failed:', err);
      setError('Lỗi gửi tin nhắn');
      throw err;
    }
  }, [user?.userId, fetchSessions]);

  /* ============================
      SELECT SESSION
     ============================ */
  const selectSession = useCallback(async (session) => {
    setCurrentSession(session);
    setMessages([]);

    await consultationService.joinSession(session.id);
    await fetchSessions(session.id);
  }, [fetchSessions]);

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
    refreshSessions: loadUserSessions
  };

  return (
    <ConsultationContext.Provider value={value}>
      {children}
    </ConsultationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useConsultation() {
  const context = useContext(ConsultationContext);
  if (!context) {
    throw new Error(
      'useConsultation must be used within ConsultationProvider'
    );
  }
  return context;
}

export default ConsultationProvider;
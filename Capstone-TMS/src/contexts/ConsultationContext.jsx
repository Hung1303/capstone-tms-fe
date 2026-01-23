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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ============================
     INIT SIGNALR + LOAD SESSIONS
     ============================ */
  useEffect(() => {
    if (!user) return;

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
        } catch (_) {
          console.warn('SignalR unavailable, fallback to API');
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
  }, [user]);

  /* ============================
     LOAD USER SESSIONS
     ============================ */
  const loadUserSessions = useCallback(async () => {
    try {
      const data = await consultationService.getUserSessions();
      setSessions(data || []);
    } catch (_) {
      setError('Không thể tải danh sách phiên tư vấn');
    }
  }, []);

  /* ============================
     SIGNALR EVENTS
     ============================ */
  useEffect(() => {
    const onMessageReceived = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    const onSessionCreated = (session) => {
      setSessions((prev) => [session, ...prev]);
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
     CREATE SESSION
     ============================ */
  const createSession = useCallback(
    async (centerProfileId) => {
      setLoading(true);
      try {
        const session = await consultationService.createSession(
          user.parentProfileId,
          centerProfileId
        );
        setSessions((prev) => [session, ...prev]);
        setCurrentSession(session);
        return session;
      } catch (err) {
        setError('Lỗi tạo phiên tư vấn');
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
    } catch (_) {
      setError('Lỗi tải tin nhắn');
      throw _;
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

    // reload messages
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
  // const selectSession = useCallback((session) => {
  //   setCurrentSession(session);
  //   setMessages([]);
  // }, []);

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

export const useConsultation = () => {
  const context = useContext(ConsultationContext);
  if (!context) {
    throw new Error(
      'useConsultation must be used within ConsultationProvider'
    );
  }
  return context;
};

export default ConsultationProvider;
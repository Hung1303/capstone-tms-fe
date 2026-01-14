import * as signalR from '@microsoft/signalr';
import api from '../config/axios';

// Lấy base URL từ axios config
const API_BASE_URL = 'https://tms-api-tcgn.onrender.com';
// const API_BASE_URL = 'https://localhost:7181';

// SignalR hub URL - thử nhiều endpoint khác nhau
const HUB_URLS = [
  `${API_BASE_URL}/api/consultationHub`,
  `${API_BASE_URL}/consultationHub`,
  `${API_BASE_URL}/api/hubs/consultation`,
  `${API_BASE_URL}/hubs/consultation`,
];

let HUB_URL = HUB_URLS[0]; // Mặc định là endpoint đầu tiên

class ConsultationService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.listeners = {};
  }

  // Khởi tạo kết nối SignalR
  async connect(token) {
    try {
      if (this.connection && this.isConnected) {
        console.log('SignalR already connected');
        return;
      }

      if (!token) {
        throw new Error('Token is required for SignalR connection');
      }

      console.log('Attempting to connect to SignalR at:', HUB_URL);
      console.log('Token:', token.substring(0, 20) + '...');

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
          accessTokenFactory: () => token,
          withCredentials: false,
          skipNegotiation: false,
          // Thử WebSockets trước, nếu không được thì fallback sang Long Polling
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: retryContext => {
            if (retryContext.previousRetryCount === 0) {
              return 0;
            }
            if (retryContext.previousRetryCount === 1) {
              return 2000;
            }
            if (retryContext.previousRetryCount < 5) {
              return 5000;
            }
            if (retryContext.previousRetryCount < 10) {
              return 10000;
            }
            return 30000;
          }
        })
        .withHubProtocol(new signalR.JsonHubProtocol())
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Thiết lập các event listeners
      this.setupEventListeners();

      console.log('Starting SignalR connection...');
      await this.connection.start();
      this.isConnected = true;
      console.log('SignalR connected successfully with connectionId:', this.connection.connectionId);
    } catch (error) {
      console.error('SignalR connection error:', error);
      console.error('Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        statusText: error.statusText,
      });
      this.isConnected = false;
      throw error;
    }
  }

  // Thiết lập các event listeners
  setupEventListeners() {
    if (!this.connection) return;

    // Nhận tin nhắn mới
    this.connection.on('ReceiveMessage', (message) => {
      console.log('Message received:', message);
      this.emit('messageReceived', message);
    });

    // Nhận danh sách phiên tư vấn
    this.connection.on('ReceiveConsultationSessions', (sessions) => {
      console.log('Sessions received:', sessions);
      this.emit('sessionsReceived', sessions);
    });

    // Phiên tư vấn được tạo
    this.connection.on('SessionCreated', (session) => {
      console.log('Session created:', session);
      this.emit('sessionCreated', session);
    });

    // Phiên tư vấn được cập nhật
    this.connection.on('SessionUpdated', (session) => {
      console.log('Session updated:', session);
      this.emit('sessionUpdated', session);
    });

    // Người dùng tham gia phiên
    this.connection.on('UserJoined', (data) => {
      console.log('User joined:', data);
      this.emit('userJoined', data);
    });

    // Người dùng rời phiên
    this.connection.on('UserLeft', (data) => {
      console.log('User left:', data);
      this.emit('userLeft', data);
    });

    // Lỗi kết nối
    this.connection.onreconnecting((error) => {
      console.warn('SignalR reconnecting...', error);
      this.isConnected = false;
      this.emit('reconnecting', error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR reconnected with connectionId:', connectionId);
      this.isConnected = true;
      this.emit('reconnected', connectionId);
    });

    this.connection.onclose((error) => {
      console.warn('SignalR connection closed:', error);
      this.isConnected = false;
      this.emit('disconnected', error);
    });
  }

  // Gửi tin nhắn qua SignalR
  async sendMessage(userId, sessionId, content) {
    try {
      if (!this.connection || !this.isConnected) {
        throw new Error('SignalR not connected');
      }

      await this.connection.invoke('SendMessage', userId, sessionId, content);
    } catch (error) {
      console.error('Error sending message via SignalR:', error);
      throw error;
    }
  }

  // Tạo phiên tư vấn mới
  async createSession(parentProfileId, centerProfileId) {
    try {
      console.log('Sending createSession request with:', {
        parentProfileId,
        centerProfileId,
      });
      
      const response = await api.post('/Consultation/Session', null, {
        params: {
          parentProfileId,
          centerProfileId,
        }
      });
      console.log('CreateSession response:', response);
      return response.data;
    } catch (error) {
      console.error('Error creating session:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  }

  // Lấy danh sách tất cả phiên tư vấn của người dùng hiện tại
  async getUserSessions() {
    try {
      console.log('Fetching all user sessions');
      const response = await api.get('/Consultation/User/Sessions');
      console.log('User sessions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      throw error;
    }
  }

  // Lấy tin nhắn của người dùng trong session
  async getUserSessionMessages(sessionId) {
    try {
      console.log('Fetching messages for session:', sessionId);
      const response = await api.get(`/Consultation/User/${sessionId}`);
      console.log('Messages response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user session messages:', error);
      throw error;
    }
  }

  // Lấy thông tin session (bao gồm tin nhắn của phụ huynh và trung tâm)
  async getSessionInfo(sessionId) {
    try {
      console.log('Fetching session info:', sessionId);
      const response = await api.get(`/Consultation/Session/${sessionId}`);
      console.log('Session info response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching session info:', error);
      throw error;
    }
  }


  // Gửi tin nhắn qua API (backup khi SignalR không kết nối)
  async sendMessageViaAPI(userId, sessionId, content) {
    try {
      console.log('Sending message via API with:', {
        userId,
        sessionId,
        content,
      });
      
      // Gửi content dạng plain string trong request body
      const response = await api.post(`/Consultation/Chat/${userId}`, content, {
        params: {
          sessionId,
        },
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('Message sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending message via API:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  }

  // Đăng ký listener
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // Hủy đăng ký listener
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    }
  }

  // Phát sự kiện
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }

  // Ngắt kết nối
  async disconnect() {
    try {
      if (this.connection) {
        await this.connection.stop();
        this.isConnected = false;
        console.log('SignalR disconnected');
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }

  // Kiểm tra trạng thái kết nối
  getConnectionStatus() {
    return this.isConnected;
  }
}

export default new ConsultationService();
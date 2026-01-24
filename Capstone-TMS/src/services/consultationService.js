import * as signalR from '@microsoft/signalr';
import api from '../config/axios';

const API_BASE_URL = 'https://tms-api-tcgn.onrender.com';


const HUB_URL = `${API_BASE_URL}/hubs/signalRServer`;

class ConsultationService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.currentSessionId = null;
    this.listeners = {};
  }

  /* ===========================
     SIGNALR CONNECTION
     =========================== */

  async connect(token) {
    if (this.connection && this.isConnected) {
      console.log('SignalR already connected');
      return;
    }

    if (!token) {
      throw new Error('JWT token is required for SignalR connection');
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => token,
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: ctx => {
          if (ctx.previousRetryCount === 0) return 0;
          if (ctx.previousRetryCount < 3) return 2000;
          if (ctx.previousRetryCount < 6) return 5000;
          return 10000;
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.setupEventListeners();

    await this.connection.start();
    this.isConnected = true;

    console.log(' SignalR connected:', this.connection.connectionId);
  }

  setupEventListeners() {
    if (!this.connection) return;

    this.connection.on('ReceiveMessage', message => {
      console.log(' Message received:', message);
      this.emit('messageReceived', message);
    });

    this.connection.onreconnecting(error => {
      console.warn(' SignalR reconnecting...', error);
      this.isConnected = false;
      this.emit('reconnecting', error);
    });

    this.connection.onreconnected(async connectionId => {
      console.log(' SignalR reconnected:', connectionId);
      this.isConnected = true;

      //  MUST rejoin group
      if (this.currentSessionId) {
        await this.joinSession(this.currentSessionId);
      }

      this.emit('reconnected', connectionId);
    });

    this.connection.onclose(error => {
      console.warn(' SignalR closed:', error);
      this.isConnected = false;
      this.emit('disconnected', error);
    });
  }

  async joinSession(sessionId) {
  if (!this.connection || !this.isConnected) {
    console.warn('SignalR not connected, cannot join session');
    return;
  }

  // Rời session cũ nếu có
  if (this.currentSessionId && this.currentSessionId !== sessionId) {
    await this.leaveSession(this.currentSessionId);
  }

  this.currentSessionId = sessionId;

  //  ĐÚNG TÊN METHOD BACKEND
  await this.connection.invoke('JoinGroup', sessionId);

  console.log('👥 Joined SignalR session:', sessionId);
  }

  // async leaveSession() {
  //   this.currentSessionId = null;
  // }

  async leaveSession(sessionId) {
  if (!this.connection || !this.isConnected || !sessionId) return;

  await this.connection.invoke('LeaveSession', sessionId);
  console.log(' Left SignalR session:', sessionId);

  if (this.currentSessionId === sessionId) {
    this.currentSessionId = null;
  }
  }

async sendMessageViaAPI(sessionId, content) {
  return api.post(
    `/Consultation/Chat`,
    JSON.stringify(content), // 👈 gửi string được stringify
    {
      params: { sessionId },
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

  /* ===========================
     CONSULTATION SESSIONS
     =========================== */

  async createSession(parentProfileId, centerProfileId) {
    const response = await api.post(
      '/Consultation/Session',
      null,
      {
        params: { parentProfileId, centerProfileId },
      }
    );

    return response.data;
  }

  async getUserSessions() {
    const response = await api.get('/Consultation/User/Sessions');
    return response.data;
  }

  async getUserSessionMessages(sessionId) {
    const response = await api.get(`/Consultation/User/${sessionId}`);
    return response.data;
  }

  async getSessionInfo(sessionId) {
    const response = await api.get(`/Consultation/Session/${sessionId}`);
    return response.data;
  }

  /* ===========================
     EVENT SYSTEM
     =========================== */

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(cb => cb(data));
  }

  /* ===========================
     DISCONNECT
     =========================== */

  async disconnect() {
    if (!this.connection) return;

    await this.connection.stop();
    this.isConnected = false;
    this.currentSessionId = null;

    console.log('🔌 SignalR disconnected');
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

export default new ConsultationService();
import axios from 'axios';

// Tạm thời dùng baseURL rỗng để tránh lỗi khi chưa có API backend
const api = axios.create({
    baseURL: "https://localhost:7181/api",
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Gắn Authorization từ localStorage cho mọi request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

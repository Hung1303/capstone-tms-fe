import axios from 'axios';

// Tạm thời dùng baseURL rỗng để tránh lỗi khi chưa có API backend
const api = axios.create({
    baseURL: '',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;

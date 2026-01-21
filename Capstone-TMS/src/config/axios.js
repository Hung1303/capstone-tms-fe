import axios from 'axios';

const api = axios.create({
    baseURL: "https://tms-api-tcgn.onrender.com/api", 
    // baseURL: "https://localhost:7181/api", 
    timeout: 30000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
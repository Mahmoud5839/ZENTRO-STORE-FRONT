import axios from 'axios';

const API_URL = 'https://zentro-store-5000.vercel.app/api';

const api = axios.create({
    baseURL: API_URL,
});

// إضافة التوكن لكل request
api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const { token } = JSON.parse(userInfo);
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
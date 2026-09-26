import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    try {
        const stored = localStorage.getItem('smartlearn_user');
        if (stored) {
            const user = JSON.parse(stored);
            if (user?.id) {
                config.headers['X-User-Id'] = user.id;
            }
            if (user?.role) {
                config.headers['X-User-Role'] = user.role;
            }
            if (user?.token) {
                config.headers['Authorization'] = `Bearer ${user.token}`;
            }
        }
    } catch (e) {
        console.error("Error attaching auth headers", e);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;

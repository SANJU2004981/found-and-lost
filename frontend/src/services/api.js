import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor to attach JWT token
API.interceptors.request.use(
    (config) => {
        const session = JSON.parse(localStorage.getItem('supabase_session'));
        if (session && session.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default API;

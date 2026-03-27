import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS } from './apiConfig';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
            console.log(`[ApiClient] Attaching token: ${token.substring(0, 10)}...`);
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn("[ApiClient] No token found in localStorage");
        }
        console.log(`[ApiClient] Request: ${config.method.toUpperCase()} ${config.url}`, config.headers);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            if (status === 401 && !error.config.url.includes('/login')) {
                // Unauthorized - clear token and redirect to login
                localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER_DATA);
                window.location.href = '/login';
            }

            return Promise.reject({
                message: data.error || 'An error occurred',
                status,
                data,
            });
        } else if (error.request) {
            // Request made but no response
            return Promise.reject({
                message: 'Network error. Please check your connection.',
                status: 0,
            });
        } else {
            // Something else happened
            return Promise.reject({
                message: error.message || 'An unexpected error occurred',
                status: 0,
            });
        }
    }
);

export default apiClient;

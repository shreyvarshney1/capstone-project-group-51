import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { API_BASE_URL } from './constants';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        // Get token from localStorage or session storage
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors and token refresh
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refresh_token: refreshToken,
                    });

                    const { access_token } = response.data.data;

                    // Save new token
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('access_token', access_token);
                    }

                    // Retry original request with new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    }

                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, logout user
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// API helper functions
export const api = {
    get: <T>(url: string, config?: AxiosRequestConfig) =>
        apiClient.get<T>(url, config).then(res => res.data),

    post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiClient.post<T>(url, data, config).then(res => res.data),

    put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiClient.put<T>(url, data, config).then(res => res.data),

    patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiClient.patch<T>(url, data, config).then(res => res.data),

    delete: <T>(url: string, config?: AxiosRequestConfig) =>
        apiClient.delete<T>(url, config).then(res => res.data),
};

// File upload helper
export const uploadFiles = async (files: File[], endpoint: string = '/files/upload') => {
    const formData = new FormData();

    files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
    });

    return apiClient.post(endpoint, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }).then(res => res.data);
};

// Error handler
export const handleApiError = (error: AxiosError | any): string => {
    if (axios.isAxiosError(error)) {
        if (error.response) {
            // Server responded with error status
            const message = error.response.data?.error?.message || error.response.data?.message;
            return message || `Error: ${error.response.status} ${error.response.statusText}`;
        } else if (error.request) {
            // Request was made but no response received
            return 'No response from server. Please check your connection.';
        }
    }

    return error?.message || 'An unexpected error occurred';
};

export default apiClient;

import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

// ─────────────────────────────────────────────────────────────────
// JWT Interceptor — automatically attaches Bearer token to every request
// All 4 dashboards use this same api instance so all get their token
// ─────────────────────────────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle global auth errors (e.g. token expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid — clear storage and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// ─────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────
export const loginUser = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const registerUser = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

// ─────────────────────────────────────────────────────────────────
// TICKETS — Admin / CM
// ─────────────────────────────────────────────────────────────────
export const fetchAllTickets = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/tickets/all${params ? `?${params}` : ''}`);
    return response.data;
};

export const fetchStats = async () => {
    const response = await api.get('/tickets/stats');
    return response.data;
};

export const assignOfficerToTicket = async (ticketId, officerId) => {
    const response = await api.put(`/tickets/${ticketId}/assign`, { officerId });
    return response.data;
};

export const sendAdminFeedback = async (ticketId, message) => {
    const response = await api.put(`/tickets/${ticketId}/feedback`, { message });
    return response.data;
};

// ─────────────────────────────────────────────────────────────────
// TICKETS — Officer
// ─────────────────────────────────────────────────────────────────
export const fetchMyTickets = async () => {
    const response = await api.get('/tickets/my-tickets');
    return response.data;
};

export const verifyTicket = async (ticketId, verificationStatus, mediaFiles) => {
    const formData = new FormData();
    formData.append('verificationStatus', verificationStatus);
    if (mediaFiles) {
        mediaFiles.forEach(file => formData.append('media', file));
    }
    const response = await api.put(`/tickets/${ticketId}/verify`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const updateTicketProgress = async (ticketId, mediaFiles) => {
    const formData = new FormData();
    if (mediaFiles) {
        mediaFiles.forEach(file => formData.append('media', file));
    }
    const response = await api.put(`/tickets/${ticketId}/progress`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const resolveTicket = async (ticketId, resolutionNotes, mediaFiles) => {
    const formData = new FormData();
    formData.append('resolutionNotes', resolutionNotes);
    if (mediaFiles) {
        mediaFiles.forEach(file => formData.append('media', file));
    }
    const response = await api.put(`/tickets/${ticketId}/resolve`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

// ─────────────────────────────────────────────────────────────────
// TICKETS — Citizen
// ─────────────────────────────────────────────────────────────────
export const fetchCitizenTickets = async () => {
    const response = await api.get('/tickets/citizen');
    return response.data;
};

export const createTicket = async (ticketData, mediaFiles) => {
    const formData = new FormData();
    formData.append('title', ticketData.title);
    formData.append('description', ticketData.description);
    formData.append('location', ticketData.location);
    if (mediaFiles) {
        mediaFiles.forEach(file => formData.append('media', file));
    }
    const response = await api.post('/tickets/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

// ─────────────────────────────────────────────────────────────────
// USERS — Admin
// ─────────────────────────────────────────────────────────────────
export const fetchOfficers = async () => {
    const response = await api.get('/users/officers');
    return response.data;
};

export const fetchAllUsers = async () => {
    const response = await api.get('/users/all');
    return response.data;
};

export const deleteUser = async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
};

export default api;

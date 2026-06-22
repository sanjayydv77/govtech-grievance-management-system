import axios from 'axios';

const getApiUrl = () => {
    const origin = window.location.origin;
    if (origin.includes('5173')) {
        return origin.replace('5173', '5000') + '/api';
    }
    return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

const api = axios.create({ baseURL: API_URL });

// ── JWT Interceptor ────────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Auto logout on 401 ────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// ── AUTH ──────────────────────────────────────────────────────
export const loginUser = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
};
export const registerUser = async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
};

// ── TICKETS — Admin / CM ──────────────────────────────────────
export const fetchAllTickets = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const res = await api.get(`/tickets/all${params ? `?${params}` : ''}`);
    return res.data;
};
export const fetchStats = async () => {
    const res = await api.get('/tickets/stats');
    return res.data;
};
export const assignOfficerToTicket = async (ticketId, officerId) => {
    const res = await api.put(`/tickets/${ticketId}/assign`, { officerId });
    return res.data;
};
export const sendAdminFeedback = async (ticketId, message) => {
    const res = await api.put(`/tickets/${ticketId}/feedback`, { message });
    return res.data;
};
export const adminUpdateTicketStatus = async (ticketId, status) => {
    const res = await api.put(`/tickets/${ticketId}/status`, { status });
    return res.data;
};
export const dischargeOfficerFromTicket = async (ticketId) => {
    const res = await api.put(`/tickets/${ticketId}/discharge`);
    return res.data;
};

// ── TICKETS — Officer ─────────────────────────────────────────
export const fetchMyTickets = async () => {
    const res = await api.get('/tickets/my-tickets');
    return res.data;
};
export const verifyTicket = async (ticketId, verificationStatus, mediaFiles) => {
    const formData = new FormData();
    formData.append('verificationStatus', verificationStatus);
    if (mediaFiles) mediaFiles.forEach(f => formData.append('media', f));
    const res = await api.put(`/tickets/${ticketId}/verify`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
};
export const updateTicketProgress = async (ticketId, mediaFiles) => {
    const formData = new FormData();
    if (mediaFiles) mediaFiles.forEach(f => formData.append('media', f));
    const res = await api.put(`/tickets/${ticketId}/progress`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
};
export const resolveTicket = async (ticketId, resolutionNotes, mediaFiles) => {
    const formData = new FormData();
    formData.append('resolutionNotes', resolutionNotes);
    if (mediaFiles) mediaFiles.forEach(f => formData.append('media', f));
    const res = await api.put(`/tickets/${ticketId}/resolve`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
};

// ── TICKETS — Citizen ─────────────────────────────────────────
export const fetchCitizenTickets = async () => {
    const res = await api.get('/tickets/citizen');
    return res.data;
};
export const trackTicketPublicly = async (ticketId) => {
    const res = await api.get(`/tickets/track/${ticketId}`);
    return res.data;
};
export const createTicket = async (ticketData, mediaFiles) => {
    let body;
    if (ticketData instanceof FormData) {
        body = ticketData;
    } else {
        body = new FormData();
        body.append('title', ticketData.title || '');
        body.append('description', ticketData.description || '');
        body.append('location', ticketData.location || '');
        if (ticketData.fullName) body.append('fullName', ticketData.fullName);
        if (ticketData.phone) body.append('phone', ticketData.phone);
        if (ticketData.email) body.append('email', ticketData.email);
        if (mediaFiles) {
            mediaFiles.forEach(f => body.append('media', f));
        }
    }
    const res = await api.post('/tickets/create', body, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
};

// ── USERS ─────────────────────────────────────────────────────
export const fetchOfficers = async () => {
    const res = await api.get('/users/officers');
    return res.data;
};
export const fetchAllUsers = async () => {
    const res = await api.get('/users/all');
    return res.data;
};
export const deleteUser = async (userId) => {
    const res = await api.delete(`/users/${userId}`);
    return res.data;
};
export const createUserByAdmin = async (userData) => {
    const res = await api.post('/users/create', userData);
    return res.data;
};

export default api;

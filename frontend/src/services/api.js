import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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
export const createTicket = async (ticketData, mediaFiles) => {
    const formData = new FormData();
    formData.append('title', ticketData.title);
    formData.append('description', ticketData.description);
    formData.append('location', ticketData.location);
    if (mediaFiles) mediaFiles.forEach(f => formData.append('media', f));
    const res = await api.post('/tickets/create', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
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

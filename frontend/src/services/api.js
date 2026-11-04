import axios from 'axios';

// Get base URL from environment or default to local proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smart_study_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear storage if on a protected route
      const currentPath = window.location.pathname;
      if (
        currentPath.includes('/dashboard') ||
        currentPath.includes('/upload') ||
        currentPath.includes('/favorites') ||
        currentPath.includes('/my-uploads') ||
        currentPath.includes('/admin')
      ) {
        localStorage.removeItem('smart_study_token');
        localStorage.removeItem('smart_study_user');
      }
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH APIs ====================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ==================== SUBJECT APIs ====================
export const subjectAPI = {
  getAll: () => api.get('/subjects'),
  create: (data) => api.post('/subjects', data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// ==================== MATERIAL APIs ====================
export const materialAPI = {
  getAll: (params) => api.get('/materials', { params }),
  getPopular: () => api.get('/materials/popular'),
  getRecent: () => api.get('/materials/recent'),
  getById: (id) => api.get(`/materials/${id}`),
  search: (q) => api.get('/materials/search', { params: { q } }),
  getMyUploads: () => api.get('/materials/my-uploads'),
  upload: (formData) =>
    api.post('/materials/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  download: (id) => api.get(`/materials/${id}/download`),
  delete: (id) => api.delete(`/materials/${id}`),
};

// ==================== REVIEW APIs ====================
export const reviewAPI = {
  getByMaterial: (materialId) => api.get(`/reviews/${materialId}`),
  addReview: (materialId, data) => api.post(`/reviews/${materialId}`, data),
};

// ==================== FAVORITE APIs ====================
export const favoriteAPI = {
  getAll: () => api.get('/favorites'),
  checkStatus: (materialId) => api.get(`/favorites/check/${materialId}`),
  add: (materialId) => api.post(`/favorites/${materialId}`),
  remove: (materialId) => api.delete(`/favorites/${materialId}`),
};

// ==================== ADMIN APIs ====================
export const adminAPI = {
  getPending: () => api.get('/admin/materials/pending'),
  approve: (id) => api.put(`/admin/materials/${id}/approve`),
  reject: (id) => api.put(`/admin/materials/${id}/reject`),
  deleteMaterial: (id) => api.delete(`/admin/materials/${id}`),
  getUsers: () => api.get('/admin/users'),
  getStats: () => api.get('/admin/stats'),
};

export default api;

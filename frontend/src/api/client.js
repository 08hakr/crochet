import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

const PUBLIC_AUTH_ENDPOINTS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/admin/login'];

function isPublicAuthEndpoint(url) {
  return PUBLIC_AUTH_ENDPOINTS.some(endpoint => url?.includes(endpoint));
}

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !isPublicAuthEndpoint(originalRequest.url)) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/api/auth/refresh');
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/register' && path !== '/admin-login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me'),
  refresh: () => api.post('/api/auth/refresh')
};

export const productsAPI = {
  getAll: (params) => api.get('/api/products', { params }),
  getOne: (id) => api.get(`/api/products/${id}`),
  getImage: (id) => api.get(`/api/products/image/${id}`, { responseType: 'blob' }),
  create: (formData) => api.post('/api/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/api/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/api/products/${id}`),
  getCategories: () => api.get('/api/products/categories'),
  createCategory: (data) => api.post('/api/products/categories', data),
  updateCategory: (id, data) => api.put(`/api/products/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/api/products/categories/${id}`)
};

export const cartAPI = {
  get: () => api.get('/api/cart'),
  add: (data) => api.post('/api/cart', data),
  update: (id, data) => api.put(`/api/cart/${id}`, data),
  remove: (id) => api.delete(`/api/cart/${id}`),
  clear: () => api.delete('/api/cart')
};

export const checkoutAPI = {
  createOrder: () => api.post('/api/checkout'),
  uploadScreenshot: (orderId, formData) => api.post(`/api/checkout/${orderId}/upload-screenshot`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyOrders: () => api.get('/api/checkout/my-orders'),
  getOrder: (id) => api.get(`/api/checkout/${id}`),
  getQRImage: () => api.get('/api/checkout/qr-image', { responseType: 'blob' }),
  adminGetOrders: (params) => api.get('/api/checkout/admin/orders', { params }),
  adminUpdateOrder: (id, data) => api.put(`/api/checkout/admin/orders/${id}`, data)
};

export const adminAPI = {
  login: (data) => api.post('/api/admin/login', data),
  dashboard: () => api.get('/api/admin/dashboard'),
  getSettings: () => api.get('/api/admin/settings'),
  updateSettings: (data) => api.put('/api/admin/settings', data),
  uploadQR: (formData) => api.post('/api/admin/upload-qr', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  initDefaultAdmin: () => api.post('/api/admin/init-default-admin'),
  initSettings: () => api.post('/api/admin/init-settings'),
  getMessages: () => api.get('/api/admin/messages'),
  markMessageRead: (id) => api.put(`/api/admin/messages/${id}`),
  deleteMessage: (id) => api.delete(`/api/admin/messages/${id}`)
};

export const contactAPI = {
  submit: (data) => api.post('/api/admin/contact', data)
};

export const settingsAPI = {
  getQR: () => api.get('/api/checkout/qr-image', { responseType: 'blob' })
};

export default api;

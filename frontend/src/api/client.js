import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
const baseURL = backendUrl ? `${backendUrl.replace(/\/+$/, '')}/api` : '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

const PUBLIC_AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh', '/admin/login'];

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
        await api.post('/auth/refresh');
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
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh')
};

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  getImage: (id) => api.get(`/products/image/${id}`, { responseType: 'blob' }),
  create: (formData) => api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  createCategory: (data) => api.post('/products/categories', data),
  updateCategory: (id, data) => api.put(`/products/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/products/categories/${id}`)
};

export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  update: (id, data) => api.put(`/cart/${id}`, data),
  remove: (id) => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart')
};

export const checkoutAPI = {
  createOrder: () => api.post('/checkout'),
  uploadScreenshot: (orderId, formData) => api.post(`/checkout/${orderId}/upload-screenshot`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyOrders: () => api.get('/checkout/my-orders'),
  getOrder: (id) => api.get(`/checkout/${id}`),
  getQRImage: () => api.get('/checkout/qr-image', { responseType: 'blob' }),
  adminGetOrders: (params) => api.get('/checkout/admin/orders', { params }),
  adminUpdateOrder: (id, data) => api.put(`/checkout/admin/orders/${id}`, data)
};

export const adminAPI = {
  login: (data) => api.post('/admin/login', data),
  dashboard: () => api.get('/admin/dashboard'),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  uploadQR: (formData) => api.post('/admin/upload-qr', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  initDefaultAdmin: () => api.post('/admin/init-default-admin'),
  initSettings: () => api.post('/admin/init-settings')
};

export const settingsAPI = {
  getQR: () => api.get('/checkout/qr-image', { responseType: 'blob' })
};

export default api;
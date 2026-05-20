import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,

});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('klaahub_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('klaahub_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Artworks
export const artworkAPI = {
  getAll: (params) => api.get('/artworks', { params }),
  getOne: (id) => api.get(`/artworks/${id}`),
  getFeatured: () => api.get('/artworks/featured'),
  getTrending: () => api.get('/artworks/trending'),
  create: (data) => api.post('/artworks', data),
  update: (id, data) => api.put(`/artworks/${id}`, data),
  delete: (id) => api.delete(`/artworks/${id}`),
  like: (id) => api.post(`/artworks/${id}/like`),
  rate: (id, rating) => api.post(`/artworks/${id}/rate`, { rating }),
  getByArtist: (artistId) => api.get(`/artworks/artist/${artistId}`),
  getCategoryStats: () => api.get('/artworks/categories/stats'),
};

// Artists
export const artistAPI = {
  getAll: (params) => api.get('/artists', { params }),
  getOne: (id) => api.get(`/artists/${id}`),
  getFeatured: () => api.get('/artists/featured'),
  follow: (id) => api.post(`/artists/${id}/follow`),
  getDashboard: () => api.get('/artists/stats/dashboard'),
};

// Orders
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getOne: (id) => api.get(`/orders/${id}`),
  verifyPayment: (data) => api.post('/orders/verify', data),
  getArtistSales: () => api.get('/orders/sales'),
};

// Reviews
export const reviewAPI = {
  add: (artworkId, data) => api.post(`/artworks/${artworkId}/reviews`, data),
  getAll: (artworkId) => api.get(`/artworks/${artworkId}/reviews`),
};

// Wishlist
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  toggle: (artworkId) => api.post(`/wishlist/${artworkId}`),
  remove: (artworkId) => api.delete(`/wishlist/${artworkId}`),
};

// Upload
export const uploadAPI = {
  image: (formData) => api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  analyze: (imageUrl) => api.post('/upload/analyze', { imageUrl }),
};


// Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getArtworks: (params) => api.get('/admin/artworks', { params }),
  approveArtist: (id) => api.put(`/admin/artists/${id}/approve`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  deleteArtwork: (id) => api.delete(`/admin/artworks/${id}`),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
};

export default api;

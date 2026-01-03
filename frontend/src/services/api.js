import { config } from '../config';

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const api = {
  get: async (endpoint) => {
    const res = await fetch(`${config.apiUrl}${endpoint}`, { headers: getHeaders() });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },
  
  post: async (endpoint, data) => {
    const res = await fetch(`${config.apiUrl}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },
  
  postForm: async (endpoint, formData) => {
    const headers = {};
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const res = await fetch(`${config.apiUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },
  
  put: async (endpoint, data) => {
    const res = await fetch(`${config.apiUrl}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },
  
  delete: async (endpoint) => {
    const res = await fetch(`${config.apiUrl}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },
};

// Photo API
export const photoApi = {
  getAll: (page = 1, limit = 12) => api.get(`/photos?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/photos/${id}`),
  getTrending: () => api.get('/photos/trending'),
  search: (query) => api.get(`/photos/search?q=${encodeURIComponent(query)}`),
  getByCreator: (creatorId) => api.get(`/photos/creator/${creatorId}`),
  create: (formData) => api.postForm('/photos', formData),
  update: (id, data) => api.put(`/photos/${id}`, data),
  delete: (id) => api.delete(`/photos/${id}`),
};

// Comment API
export const commentApi = {
  getByPhoto: (photoId) => api.get(`/photos/${photoId}/comments`),
  create: (photoId, content) => api.post(`/photos/${photoId}/comments`, { content }),
  delete: (id) => api.delete(`/comments/${id}`),
};

// Rating API
export const ratingApi = {
  getByPhoto: (photoId) => api.get(`/photos/${photoId}/ratings`),
  getUserRating: (photoId) => api.get(`/photos/${photoId}/ratings/me`),
  rate: (photoId, value) => api.post(`/photos/${photoId}/ratings`, { value }),
};

// User API
export const userApi = {
  getMe: () => api.get('/users/me'),
  getCreators: () => api.get('/users/creators'),
  getStats: () => api.get('/users/me/stats'),
  updateProfile: (data) => api.put('/users/me', data),
};

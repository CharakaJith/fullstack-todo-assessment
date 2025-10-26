import axios from 'axios';

const api = axios.create({
  baseURL: window._env_?.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true,
});

export default api;

import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'https://api-devmind.singhjitech.com/v1',
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('devmind_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('devmind_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

const PUBLIC_AUTH_PATHS = new Set([
  '/auth/register',
  '/auth/login',
  '/auth/health',
  '/auth/logout',
  '/auth/forgot-password/send-otp',
  '/auth/forgot-password/verify-otp',
  '/auth/forgot-password/reset-password',
  '/contact',
]);

// Request interceptor — attach access token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    const requestPath = config.url || '';
    const isPublicRequest = Array.from(PUBLIC_AUTH_PATHS).some((path) =>
      requestPath === path || requestPath.endsWith(path)
    );

    if (token && !isPublicRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('doctor');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('doctor');
      } catch (_) {}
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth?mode=login&session=expired';
      }
    }
    return Promise.reject(error);
  }
);

// Keep-alive health ping: ping the server every 10 minutes (600,000 ms) to prevent sleep/cold start.
setInterval(async () => {
  try {
    await api.get('/auth/health');
  } catch (err) {
    console.warn('Health ping failed:', err);
  }
}, 600000);

export default api;

import axios from 'axios'


const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'


const api = axios.create({
baseURL: API_BASE,
headers: { "Content-Type": "application/json" },
withCredentials: true,
})

api.interceptors.request.use((config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  }, (error) => Promise.reject(error));
  
  // Optional: handle 401 globally to logout/redirect
  api.interceptors.response.use(
    res => res,
    err => {
      if (err.response?.status === 401) {
        // optional: clear auth and redirect to login
        // localStorage.removeItem('token');
        // window.location.href = '/login';
      }
      return Promise.reject(err);
    }
  );


export default api
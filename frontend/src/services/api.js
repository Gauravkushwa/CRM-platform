// src/api.js
import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || 'https://crm-platform-2.onrender.com').replace(/\/+$/, '');
const client = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true, // send cookies (if using cookies)
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
});

// Logging interceptors (helpful)
client.interceptors.request.use(req => {
  console.log('[API REQUEST]', req.method?.toUpperCase(), req.baseURL + req.url);
  return req;
}, err => Promise.reject(err));

client.interceptors.response.use(res => {
  console.log('[API RESPONSE]', res.status, res.config?.method?.toUpperCase(), res.config?.url);
  return res;
}, err => {
  if (err.response) {
    console.error('[API ERROR] status:', err.response.status, 'data:', err.response.data);
  } else {
    console.error('[API ERROR]', err.message);
  }
  return Promise.reject(err);
});

export function setToken(token) {
  if (token) client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete client.defaults.headers.common['Authorization'];
}

// export your endpoints as before...
export const register = (data) => client.post('/auth/register', data);
export const login = (data) => client.post('/auth/login', data);
export const refresh = () => client.post('/auth/refresh');
export const logoutApi = (refreshToken) => client.post('/auth/logout', { refreshToken });

// leads etc...
export const getLeads = (params) => client.get('/leads', { params });
export const getLead = (id) => client.get(`/leads/${id}`);
export const createLead = (data) => client.post('/leads', data);
export const updateLead = (id, data) => client.put(`/leads/${id}`, data);
export const deleteLead = (id) => client.delete(`/leads/${id}`);

export default client;

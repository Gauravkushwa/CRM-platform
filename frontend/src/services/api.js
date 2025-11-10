// src/api.js
import axios from 'axios'

const RAW = import.meta.env.VITE_API_URL || 'https://crm-platform-2.onrender.com'
const cleaned = RAW.replace(/\/+$/, '') // remove trailing slashes
const API_BASE = cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`

const client = axios.create({ baseURL: API_BASE, withCredentials: true })

// Debug: log resolved base and env
console.log('[API] base from env/raw:', RAW)
console.log('[API] resolved API_BASE:', API_BASE)

// Interceptor: log outgoing request
client.interceptors.request.use(req => {
  try {
    console.log('[API REQUEST]', req.method?.toUpperCase(), req.baseURL + req.url)
    console.log('[API REQUEST] headers:', req.headers)
    if (req.params) console.log('[API REQUEST] params:', req.params)
    if (req.data) console.log('[API REQUEST] body:', req.data)
  } catch (e) { console.warn('[API REQUEST] logging failed', e) }
  return req
}, err => Promise.reject(err))

// Interceptor: log incoming response
client.interceptors.response.use(res => {
  console.log('[API RESPONSE]', res.status, res.config?.method?.toUpperCase(), res.config?.url)
  return res
}, err => {
  if (err.response) {
    // Server responded with a status code
    console.error('[API ERROR] status:', err.response.status)
    console.error('[API ERROR] url:', err.config?.baseURL + err.config?.url)
    console.error('[API ERROR] response data:', err.response.data)
    console.error('[API ERROR] response headers:', err.response.headers)
  } else if (err.request) {
    // Request made but no response
    console.error('[API ERROR] no response. request:', err.request)
  } else {
    console.error('[API ERROR] setup:', err.message)
  }
  return Promise.reject(err)
})

export function setToken(token) {
  if (token) client.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete client.defaults.headers.common['Authorization']
}

// Auth
export const register = (data) => client.post('/auth/register', data)
export const login = (data) => client.post('/auth/login', data)
export const refresh = (data) => client.post('/auth/refresh', data)
export const logoutApi = (refreshToken) => client.post('/auth/logout', { refreshToken })

// Leads
export const getLeads = (params) => client.get('/leads', { params })
export const getLead = (id) => client.get(`/leads/${id}`)
export const createLead = (data) => client.post('/leads', data)
export const updateLead = (id, data) => client.put(`/leads/${id}`, data)
export const deleteLead = (id) => client.delete(`/leads/${id}`)

// Activities
export const addActivity = (data) => client.post('/activities', data)

// Notifications
export const getNotifications = () => client.get('/notifications')
export const markNotificationRead = (id) => client.post(`/notifications/${id}/read`)

export default client

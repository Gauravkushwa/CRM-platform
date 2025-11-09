import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'
const client = axios.create({ baseURL: `${BASE}/api` })

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

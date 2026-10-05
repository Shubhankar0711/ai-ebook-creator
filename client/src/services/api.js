import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
 baseURL: import.meta.env.VITE_API_URL || '/api',
 timeout: 60000,
 headers: { 'Content-Type': 'application/json' },
})

// Attach token on every request
api.interceptors.request.use(
 (config) => {
 const token = localStorage.getItem('token')
 if (token) config.headers.Authorization = `Bearer ${token}`
 return config
 },
 (error) => Promise.reject(error)
)

// Global response error handling
api.interceptors.response.use(
 (response) => response,
 (error) => {
 const status = error.response?.status

 // Network / no response at all
 if (!error.response) {
 toast.error('Cannot reach server. Make sure the backend is running on port 5000.')
 return Promise.reject(error)
 }

 if (status === 401) {
 // Only redirect if not already on an auth page
 const path = window.location.pathname
 if (!path.includes('/login') && !path.includes('/register')) {
 localStorage.removeItem('token')
 window.location.href = '/login'
 }
 }

 if (status === 429) {
 toast.error('Too many requests. Please wait a moment.')
 }

 // Let individual call sites handle 400/404/500 with their own messages
 return Promise.reject(error)
 }
)

export default api


import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// WhatsApp API functions
export const sendWhatsAppTest = (number, message) => {
  return api.post('/whatsapp/test', { number, message })
}

export const sendWhatsAppInvoice = (invoiceId) => {
  return api.post(`/whatsapp/invoice/${invoiceId}`)
}

export const sendWhatsAppReminder = (reminderId) => {
  return api.post(`/whatsapp/reminder/${reminderId}`)
}

export const getWhatsAppStatus = () => {
  return api.get('/whatsapp/status')
}


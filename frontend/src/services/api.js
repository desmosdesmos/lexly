import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor для добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor для обработки ошибок — НЕ редиректит на auth-эндпоинтах
const authPaths = ['/auth/login', '/auth/register', '/auth/google', '/auth/refresh']

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || ''
      const isAuthPath = authPaths.some(p => url.includes(p))

      if (!isAuthPath) {
        // Только для НЕ auth-эндпоинтов — очищаем и редиректим
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  googleAuth: async (credential) => {
    const response = await api.post('/auth/google', { credential })
    return response.data
  },

  getProfile: async () => {
    const response = await api.get('/user/profile')
    return response.data
  },

  updateProfile: async (data) => {
    const response = await api.put('/user/profile', data)
    return response.data
  },

  getUsage: async () => {
    const response = await api.get('/user/usage')
    return response.data
  },

  getHistory: async (page = 1, limit = 20) => {
    const response = await api.get('/user/history', { params: { page, limit } })
    return response.data
  },
}

// Documents API
export const documentsAPI = {
  generate: async (documentType, data) => {
    const response = await api.post('/documents/generate', {
      document_type: documentType,
      data,
    })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/documents/${id}`)
    return response.data
  },

  list: async (page = 1, limit = 20) => {
    const response = await api.get('/documents', { params: { page, limit } })
    return response.data
  },
}

// Contracts API
export const contractsAPI = {
  review: async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/contracts/review', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/contracts/${id}`)
    return response.data
  },

  list: async (page = 1, limit = 20) => {
    const response = await api.get('/contracts', { params: { page, limit } })
    return response.data
  },
}

// Payments API
export const paymentsAPI = {
  getPlans: async () => {
    const response = await api.get('/payments/plans')
    return response.data
  },

  subscribe: async (planId, paymentMethod = 'card') => {
    const response = await api.post('/payments/subscribe', {
      plan_id: planId,
      payment_method: paymentMethod,
    })
    return response.data
  },

  getHistory: async (page = 1, limit = 20) => {
    const response = await api.get('/payments/history', { params: { page, limit } })
    return response.data
  },
}

export default api

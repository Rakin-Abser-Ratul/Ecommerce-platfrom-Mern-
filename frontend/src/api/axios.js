import axios from 'axios'

const API = axios.create({
  baseURL: 'https://ecommerce-platfrom-mern-git-main-rakin-abser-ratul1.vercel.app/', // Your FastAPI server URL
})

// Attach JWT bearer token to requests automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-logout if token is expired or invalid (401 response)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default API
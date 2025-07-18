// import axios from "axios"

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api"



// const api = axios.create({
//   baseURL: API_URL,
// })

// // Add auth token to requests
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token")
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`
//     }
//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   },
// )

// // Handle auth errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem("token")
//       window.location.href = "/login"
//     }
//     return Promise.reject(error)
//   },
// )

// export default api
import axios from "axios"

// 👇 Base URL from .env (Render OR Localhost)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api"

// 👇 Create axios instance
const api = axios.create({
  baseURL: API_URL,
})

// 👇 Automatically attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 👇 Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export default api

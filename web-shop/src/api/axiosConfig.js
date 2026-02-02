import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3333'

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout for slow queries
  headers: {
    'Content-Type': 'application/json',
  },
})

// Simple in-memory cache for GET requests
const cache = new Map()
const CACHE_DURATION = 60000 // 1 minute

// Automatically attach token to requests if available
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    // Check cache for GET requests
    if (config.method === 'get' && !config.skipCache) {
      const cacheKey = config.url + JSON.stringify(config.params)
      const cachedData = cache.get(cacheKey)

      if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        // Return cached response
        config.adapter = () =>
          Promise.resolve({
            data: cachedData.data,
            status: 200,
            statusText: 'OK (Cached)',
            headers: cachedData.headers,
            config,
          })
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle token expiration and cache responses
instance.interceptors.response.use(
  (response) => {
    // Cache GET responses
    if (response.config.method === 'get' && !response.config.skipCache) {
      const cacheKey = response.config.url + JSON.stringify(response.config.params)
      cache.set(cacheKey, {
        data: response.data,
        headers: response.headers,
        timestamp: Date.now(),
      })
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code

      // If token expired or invalid, logout user
      if (
        errorCode === 'TOKEN_EXPIRED' ||
        errorCode === 'INVALID_TOKEN' ||
        errorCode === 'NO_TOKEN'
      ) {
        localStorage.removeItem('token')
        cache.clear() // Clear cache on logout

        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// Clear cache function (export for manual cache clearing if needed)
export const clearCache = () => cache.clear()

export default instance

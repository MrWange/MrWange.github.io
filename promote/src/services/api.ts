import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器，添加 token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log('请求配置:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    })
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器，处理错误
api.interceptors.response.use(
  response => {
    console.log('响应成功:', {
      status: response.status,
      data: response.data
    })
    return response
  },
  error => {
    console.error('响应错误:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    })
    
    // 处理 401 错误，清除 token 并重定向到登录页
    if (error.response && error.response.status === 401) {
      console.warn('认证失败，请重新登录')
      localStorage.removeItem('token')
      // 不立即重定向，让错误处理逻辑先完成
      // window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api 
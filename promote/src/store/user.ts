import { reactive, readonly } from 'vue'
import api from '../services/api'

interface UserState {
  id: number | null
  username: string
  email: string
  avatar: string
  role: string
  isLoggedIn: boolean
  token: string
}

// 初始状态
const state = reactive<UserState>({
  id: null,
  username: '',
  email: '',
  avatar: '',
  role: '',
  isLoggedIn: false,
  token: localStorage.getItem('token') || ''
})

// 检查本地存储中的用户信息
const initializeFromStorage = () => {
  const storedUser = localStorage.getItem('user')
  const storedToken = localStorage.getItem('token')
  
  if (storedToken && storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser)
      state.id = parsedUser.id
      state.username = parsedUser.username
      state.email = parsedUser.email
      state.avatar = parsedUser.avatar || ''
      state.role = parsedUser.role
      state.isLoggedIn = true
      state.token = storedToken
    } catch (error) {
      console.error('解析存储的用户信息失败', error)
      clearUserData()
    }
  }
}

// 清除用户数据
const clearUserData = () => {
  state.id = null
  state.username = ''
  state.email = ''
  state.avatar = ''
  state.role = ''
  state.isLoggedIn = false
  state.token = ''
  
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// 登录
const login = async (username: string, password: string) => {
  try {
    console.log('尝试登录:', { username, password })
    
    const response = await api.post('/users/login', { username, password })
    console.log('登录响应:', response.data)
    
    const { token, user } = response.data
    
    state.id = user.id
    state.username = user.username
    state.email = user.email
    state.avatar = user.avatar || ''
    state.role = user.role
    state.isLoggedIn = true
    state.token = token
    
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    
    return { success: true }
  } catch (error) {
    console.error('登录错误详情:', error)
    console.error('错误响应:', error.response?.data)
    
    return {
      success: false,
      message: error.response?.data?.message || '登录失败，请检查用户名和密码'
    }
  }
}

// 登出
const logout = async () => {
  try {
    // 可以添加退出登录的 API 调用
    clearUserData()
    return { success: true }
  } catch (error) {
    return {
      success: false,
      message: '退出登录失败'
    }
  }
}

// 获取并更新用户信息
const fetchUserInfo = async () => {
  if (!state.isLoggedIn) return { success: false }
  
  try {
    const response = await api.get('/users/me')
    const userData = response.data.user
    
    state.id = userData.id
    state.username = userData.username
    state.email = userData.email
    state.avatar = userData.avatar || ''
    state.role = userData.role
    
    localStorage.setItem('user', JSON.stringify(userData))
    
    return { success: true }
  } catch (error) {
    if (error.response?.status === 401) {
      clearUserData()
    }
    return {
      success: false,
      message: '获取用户信息失败'
    }
  }
}

// 更新用户信息
const updateUserInfo = async (userData: Partial<UserState>) => {
  try {
    const response = await api.put('/users/update', userData)
    const updatedUser = response.data.user
    
    state.username = updatedUser.username
    state.email = updatedUser.email
    state.avatar = updatedUser.avatar || ''
    
    localStorage.setItem('user', JSON.stringify(updatedUser))
    
    return { success: true }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || '更新用户信息失败'
    }
  }
}

// 初始化
initializeFromStorage()

export const userStore = {
  state: readonly(state),
  login,
  logout,
  fetchUserInfo,
  updateUserInfo
} 
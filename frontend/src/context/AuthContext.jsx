import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.user)
    } catch (error) {
      localStorage.removeItem('token')
      console.error('Failed to fetch user:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', response.token)
      setUser(response.user)
      toast.success('Login successful')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
      throw error
    }
  }

  const register = async (name, email, password, role) => {
    try {
      const response = await api.post('/auth/register', { name, email, password, role })
      localStorage.setItem('token', response.token)
      setUser(response.user)
      toast.success('Registration successful')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}


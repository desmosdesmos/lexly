import { createContext, useState, useContext, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

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
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('access_token') || null
    } catch {
      return null
    }
  })

  useEffect(() => {
    let cancelled = false

    const loadUser = async () => {
      if (!token) {
        if (!cancelled) setLoading(false)
        return
      }
      try {
        const userData = await authAPI.getProfile()
        if (!cancelled) setUser(userData)
      } catch {
        if (!cancelled) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          setToken(null)
          setUser(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadUser()
    return () => { cancelled = true }
  }, [token])

  const login = async (email, password) => {
    const data = await authAPI.login(email, password)
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    setToken(data.access_token)
    const userData = await authAPI.getProfile()
    setUser(userData)
    return userData
  }

  const register = async (userData) => {
    return await authAPI.register(userData)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setToken(null)
    setUser(null)
  }

  const value = { user, token, loading, login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

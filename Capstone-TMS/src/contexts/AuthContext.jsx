import { createContext, useContext, useState, useEffect } from 'react'
import api from '../config/axios'
import { buildUserFromToken } from '../utils/jwt'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Khởi động: lấy token và dựng user từ JWT
    const token = localStorage.getItem('token')
    if (token) {
      const builtUser = buildUserFromToken(token)
      if (builtUser) {
        setUser(builtUser)
        api.defaults.headers.Authorization = `Bearer ${token}`
      } else {
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    if (token) {
      localStorage.setItem('token', token)
      api.defaults.headers.Authorization = `Bearer ${token}`
    }
    // Ưu tiên lấy user từ token để đảm bảo đúng role
    const builtUser = token ? buildUserFromToken(token) : null
    const nextUser = builtUser || userData || null
    setUser(nextUser)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    delete api.defaults.headers.Authorization
  }

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  const isStaff = () => {
    return user?.role === 'staff'
  }

  const hasPermission = (permission) => {
    if (!user) return false
    
    // Admin có tất cả quyền
    if (user.role === 'admin') return true
    
    // Staff chỉ có một số quyền nhất định
    const staffPermissions = [
      'view_students',
      'manage_classes',
      'view_schedule',
      'manage_students',
      'view_reports'
    ]
    
    return staffPermissions.includes(permission)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isStaff,
    hasPermission
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

import { createContext, useContext, useState, useEffect } from 'react'
import api from '../config/axios'
import { jwtDecode } from 'jwt-decode'

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
    const token = localStorage.getItem('token')
    if (token && token.split('.').length === 3) {
      const { Email, FullName, PhoneNumber, Role, UserId, UserName, ParentProfileId, CenterProfileId } = jwtDecode(token)

      const builtUser = {
        userId: UserId,
        fullName: FullName,
        email: Email,
        phoneNumber: PhoneNumber,
        role: Role,
        userName: UserName,
        parentProfileId: ParentProfileId,
        centerProfileId: CenterProfileId
      }

      if (builtUser) {
        setUser(builtUser)
        api.defaults.headers.Authorization = `Bearer ${token}`
      } else {
        localStorage.removeItem('token')
      }
    } else {
      setUser(null)
    }
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    if (token) {
      localStorage.setItem('token', token)
      api.defaults.headers.Authorization = `Bearer ${token}`
    }
    setUser(userData)
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
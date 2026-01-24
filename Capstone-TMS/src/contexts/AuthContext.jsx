import { createContext, useContext, useState, useEffect } from 'react'
import api from '../config/axios'
import { jwtDecode } from 'jwt-decode'
import * as signalR from "@microsoft/signalr";
import { toast } from 'react-toastify';

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

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    delete api.defaults.headers.Authorization
  }

  const login = (userData, token) => {
    if (token) {
      localStorage.setItem('token', token)
      api.defaults.headers.Authorization = `Bearer ${token}`
    }
    setUser(userData)
  }

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token)
      return decoded.exp * 1000 < Date.now()
    } catch {
      return true
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && token.split('.').length === 3) {
      if (isTokenExpired(token)) {
        logout()
        setLoading(false)
        return
      }

      const { Email, FullName, PhoneNumber, Role, UserId, UserName, ParentProfileId, CenterProfileId, TeacherProfileId, StudentProfileId } = jwtDecode(token)

      const builtUser = {
        userId: UserId,
        fullName: FullName,
        email: Email,
        phoneNumber: PhoneNumber,
        role: Role,
        userName: UserName,
        ...(ParentProfileId && { parentProfileId: ParentProfileId }),
        ...(CenterProfileId && { centerProfileId: CenterProfileId }),
        ...(TeacherProfileId && { teacherProfileId: TeacherProfileId }),
        ...(StudentProfileId && { studentProfileId: StudentProfileId })
      }

      setUser(builtUser)
      api.defaults.headers.Authorization = `Bearer ${token}`
    } else {
      logout();
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    if (!user) {
      console.log("No user.");
      return;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://tms-api-tcgn.onrender.com/hubs/notify", {
        accessTokenFactory: () => localStorage.getItem("token"),
        withCredentials: true
      })
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    connection.start()
              .then(() => console.log("SignalR connected"))
              .catch(err => console.error("SignalR error", err));

    connection.on("accountBannedPermanent", () => {
      toast.error("Tài khoản của bạn đã bị khóa vĩnh viễn.");
      logout();
      window.location.href = "/login";
    })

    connection.on("accountSuspended", data => {
      console.log("Account suspended data:", data);
      toast.error(`Tài khoản của bạn đã bị khóa trong ${data.days} ngày.`);
      logout();
      window.location.href = "/login";
    })

    return () => connection.stop();
  }, [user]);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

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
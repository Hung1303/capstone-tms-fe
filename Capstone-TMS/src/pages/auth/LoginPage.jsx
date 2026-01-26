import { useState } from 'react'
import { motion } from 'framer-motion'
import { EyeOutlined, EyeInvisibleOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../config/axios'
import { toast } from 'react-toastify'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'

const LoginPage = ({ switchTo }) => {
  const { login } = useAuth()
  const navigate = useNavigate()
  
  // State quản lý hiển thị: 'login' hoặc 'forgot'
  const [view, setView] = useState('login') 
  const [isLoading, setIsLoading] = useState(false)

  // --- STATE CHO ĐĂNG NHẬP ---
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loginErrors, setLoginErrors] = useState({})

  // --- STATE CHO QUÊN MẬT KHẨU ---
  const [resetData, setResetData] = useState({
    email: '',
    phoneNumber: '',
    newPassword: ''
  })
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [resetErrors, setResetErrors] = useState({})

  // ==========================================
  // XỬ LÝ ĐĂNG NHẬP
  // ==========================================
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value })
    if (loginErrors[e.target.name]) setLoginErrors({ ...loginErrors, [e.target.name]: "" })
  }

  const validateLogin = () => {
    const newErrors = {}
    if (!loginData.email.trim()) newErrors.email = "Vui lòng nhập email"
    if (!loginData.password) newErrors.password = "Vui lòng nhập mật khẩu"
    setLoginErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    if (!validateLogin()) return

    setIsLoading(true)
    try {
      const { email, password } = loginData
      const response = await api.post(`/Auth/Login?email=${email}&password=${password}`)
      
      const token = response?.data?.data?.accessToken || response?.data?.accessToken || ''
      if (!token) throw new Error('No token returned');

      const decoded = jwtDecode(token)
      // Map data từ token
      const userData = {
        userId: decoded.UserId,
        fullName: decoded.FullName,
        email: decoded.Email,
        phoneNumber: decoded.PhoneNumber,
        role: decoded.Role,
        userName: decoded.UserName,
        ...(decoded.ParentProfileId && { parentProfileId: decoded.ParentProfileId }),
        ...(decoded.CenterProfileId && { centerProfileId: decoded.CenterProfileId }),
        ...(decoded.TeacherProfileId && { teacherProfileId: decoded.TeacherProfileId }),
        ...(decoded.StudentProfileId && { studentProfileId: decoded.StudentProfileId })
      }

      login(userData, token)

      const roleRoutes = {
        Admin: '/admin',
        Staff: '/staff',
        Center: '/center',
        Teacher: '/teacher',
        Parent: '/',
        Student: '/student',
        Inspector: '/inspector'
      }
      navigate(roleRoutes[decoded.Role] || '/')
      
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại.')
    } finally {
      setIsLoading(false)
    }
  }

  // ==========================================
  // XỬ LÝ QUÊN MẬT KHẨU (RESET PASSWORD)
  // ==========================================
  const handleResetChange = (e) => {
    setResetData({ ...resetData, [e.target.name]: e.target.value })
    if (resetErrors[e.target.name]) setResetErrors({ ...resetErrors, [e.target.name]: "" })
  }

  const validateReset = () => {
    const newErrors = {}
    if (!resetData.email.trim()) newErrors.email = "Vui lòng nhập email"
    else if (!/\S+@\S+\.\S+/.test(resetData.email)) newErrors.email = "Email không hợp lệ"

    if (!resetData.phoneNumber.trim()) newErrors.phoneNumber = "Vui lòng nhập số điện thoại"
    
    if (!resetData.newPassword) newErrors.newPassword = "Vui lòng nhập mật khẩu mới"
    else if (resetData.newPassword.length < 6) newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự"

    setResetErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    if (!validateReset()) return

    setIsLoading(true)
    try {
      // API Body structure (Lưu ý: dùng key "phoneNubmer" do API typo)
      const payload = {
        email: resetData.email,
        phoneNubmer: resetData.phoneNumber, // Giữ nguyên lỗi chính tả của API server
        newPassword: resetData.newPassword
      }

      const response = await api.put('/Users/ResetPassword', payload)
      
      // Xử lý thành công
      if (response.status === 200) {
        toast.success(response.data?.message || "Thay đổi mật khẩu thành công.")
        // Reset form và quay về trang login
        setResetData({ email: '', phoneNumber: '', newPassword: '' })
        setView('login')
      }

    } catch (error) {
      console.error('Reset password error:', error)
      
      // Xử lý lỗi từ Server (VD: Mật khẩu mới trùng cũ)
      if (error.response) {
        // Trường hợp API trả về text trực tiếp hoặc object message
        const message = error.response.data?.message || error.response.data || "Có lỗi xảy ra"
        
        if (typeof message === 'string' && message.includes("trùng với mật khẩu cũ")) {
             toast.error("Mật khẩu mới không được trùng với mật khẩu cũ.")
        } else {
             toast.error(typeof message === 'string' ? message : "Thông tin không chính xác hoặc lỗi hệ thống.")
        }
      } else {
        toast.error("Lỗi kết nối đến máy chủ.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // ==========================================
  // RENDER GIAO DIỆN
  // ==========================================

  // --- GIAO DIỆN QUÊN MẬT KHẨU ---
  if (view === 'forgot') {
    return (
      <div className="p-8 md:p-10 h-full flex flex-col md:overflow-y-auto">
        <div className="mb-6">
          <button 
            onClick={() => setView('login')}
            className="flex items-center text-slate-500 hover:text-orange-500 transition-colors cursor-pointer"
          >
            <ArrowLeftOutlined className="mr-2" /> Quay lại đăng nhập
          </button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Đặt lại mật khẩu</h1>
          <p className="text-slate-500 mt-2 text-sm">Nhập email, số điện thoại và mật khẩu mới để khôi phục quyền truy cập.</p>
        </div>

        <form onSubmit={handleResetSubmit} className="space-y-6">
          {/* Input Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <motion.input
              whileFocus={{ scale: 1.02, borderColor: "#fdba74" }}
              animate={{ borderColor: resetErrors.email ? "#fca5a5" : "#d1d5db" }}
              name="email"
              type="email"
              value={resetData.email}
              onChange={handleResetChange}
              className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
              placeholder="nhapemail@example.com"
            />
            {resetErrors.email && <p className="mt-1 text-sm text-red-600">{resetErrors.email}</p>}
          </div>

          {/* Input Phone Number */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại</label>
            <motion.input
              whileFocus={{ scale: 1.02, borderColor: "#fdba74" }}
              animate={{ borderColor: resetErrors.phoneNumber ? "#fca5a5" : "#d1d5db" }}
              name="phoneNumber"
              type="text"
              value={resetData.phoneNumber}
              onChange={handleResetChange}
              className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
              placeholder="0901234567"
            />
            {resetErrors.phoneNumber && <p className="mt-1 text-sm text-red-600">{resetErrors.phoneNumber}</p>}
          </div>

          {/* Input New Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu mới</label>
            <div className="relative">
              <motion.input
                whileFocus={{ scale: 1.02, borderColor: "#fdba74" }}
                animate={{ borderColor: resetErrors.newPassword ? "#fca5a5" : "#d1d5db" }}
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={resetData.newPassword}
                onChange={handleResetChange}
                className="w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none"
                placeholder="Nhập mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showNewPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              </button>
            </div>
            {resetErrors.newPassword && <p className="mt-1 text-sm text-red-600">{resetErrors.newPassword}</p>}
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer w-full py-3 px-4 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Đang xử lý...' : 'Xác nhận thay đổi'}
          </motion.button>
        </form>
      </div>
    )
  }

  // --- GIAO DIỆN ĐĂNG NHẬP (Mặc định) ---
  return (
    <div className="p-8 md:p-10 h-full flex flex-col md:overflow-y-auto">
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-xl mb-4">T</div>
        <h1 className="text-2xl font-bold text-slate-900">Đăng nhập</h1>
      </div>
      <form onSubmit={handleLoginSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
          <motion.input
            whileFocus={{ scale: 1.02, boxShadow: "0 0 6px rgba(249,115,22,0.4)", borderColor: "#fdba74" }}
            animate={{ x: loginErrors.email ? [0, -5, 5, -5, 5, 0] : 0, borderColor: loginErrors.email ? "#fca5a5" : "#d1d5db" }}
            transition={{ duration: 0.4 }}
            name="email"
            type="email"
            value={loginData.email}
            onChange={handleLoginChange}
            className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
            placeholder="Nhập email của bạn"
          />
          {loginErrors.email && <p className="mt-1 text-sm text-red-600">{loginErrors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu</label>
          <div className="relative">
            <motion.input
              whileFocus={{ scale: 1.02, boxShadow: "0 0 6px rgba(249,115,22,0.4)", borderColor: "#fdba74" }}
              animate={{ x: loginErrors.password ? [0, -5, 5, -5, 5, 0] : 0, borderColor: loginErrors.password ? "#fca5a5" : "#d1d5db" }}
              transition={{ duration: 0.4 }}
              name="password"
              type={showPassword ? "text" : "password"}
              value={loginData.password}
              onChange={handleLoginChange}
              className="w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none"
              placeholder="Nhập mật khẩu"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            </button>
          </div>
          {loginErrors.password && <p className="mt-1 text-sm text-red-600">{loginErrors.password}</p>}
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-slate-600">Ghi nhớ đăng nhập</span>
          </label>
          
          {/* Nút chuyển sang màn hình Quên mật khẩu */}
          <button 
            type="button"
            onClick={() => setView('forgot')}
            className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
          >
            Quên mật khẩu?
          </button>

        </div>
        <motion.button
          type="submit"
          disabled={isLoading}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer w-full py-3 px-4 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </motion.button>
      </form>
      <div className="mt-8 text-center">
        <p className="text-slate-600">
          Chưa có tài khoản?{' '}<button type="button" onClick={() => switchTo('register')} className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">Đăng ký ngay</button>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
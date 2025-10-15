import { useState } from 'react'
import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { Link, useNavigate } from 'react-router-dom'
import { EyeOutlined, EyeInvisibleOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

const LoginPage = ({ switchTo }) => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student' // Mặc định là student
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ""
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu"
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    // Simulate API call - trong thực tế sẽ gọi API thật
    setTimeout(() => {
      // Mock data - trong thực tế sẽ nhận từ API
      const mockUser = {
        id: 1,
        name: formData.email === 'admin@tutorlink.com' ? 'Admin User' : 
              formData.email === 'staff@tutorlink.com' ? 'Staff User' : 'Student User',
        email: formData.email,
        role: formData.email === 'admin@tutorlink.com' ? 'admin' : 
              formData.email === 'staff@tutorlink.com' ? 'staff' : 'student'
      }
      
      const mockToken = 'mock-jwt-token-' + Date.now()
      
      login(mockUser, mockToken)
      
      // Redirect based on role
      if (mockUser.role === 'admin') {
        navigate('/admin')
      } else if (mockUser.role === 'staff') {
        navigate('/staff')
      } else {
        navigate('/')
      }
      
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="p-8 md:p-10 h-full flex flex-col md:overflow-y-auto">
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-xl mb-4">T</div>
        <h1 className="text-2xl font-bold text-slate-900">Đăng nhập</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
          <motion.input
            whileFocus={{ scale: 1.02, boxShadow: "0 0 6px rgba(249,115,22,0.4)", borderColor: "#fdba74" }}
            animate={{ x: errors.email ? [0, -5, 5, -5, 5, 0] : 0, borderColor: errors.email ? "#fca5a5" : "#d1d5db" }}
            transition={{ duration: 0.4 }}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
            placeholder="Nhập email của bạn"
          />
          {errors.email &&
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          }
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu</label>
          <div className="relative">
            <motion.input
              whileFocus={{ scale: 1.02, boxShadow: "0 0 6px rgba(249,115,22,0.4)", borderColor: "#fdba74" }}
              animate={{ x: errors.password ? [0, -5, 5, -5, 5, 0] : 0, borderColor: errors.password ? "#fca5a5" : "#d1d5db" }}
              transition={{ duration: 0.4 }}
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none"
              placeholder="Nhập mật khẩu"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            </button>
          </div>
          {errors.email &&
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          }
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-slate-600">Ghi nhớ đăng nhập</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">Quên mật khẩu?</Link>
        </div>
        <motion.button
          type="submit"
          disabled={isLoading}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-4 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </motion.button>
      </form>
      <div className="mt-8 text-center">
        <p className="text-slate-600">
          Chưa có tài khoản?{' '}<button type="button" onClick={() => switchTo('register')} className="text-blue-600 hover:text-blue-700 font-medium">Đăng ký ngay</button>
        </p>
      </div>
      
      {/* Demo accounts */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Tài khoản demo:</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <div>Admin: admin@tutorlink.com / password123</div>
          <div>Staff: staff@tutorlink.com / password123</div>
          <div>Student: student@tutorlink.com / password123</div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

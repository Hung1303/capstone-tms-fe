import { useState } from 'react'
import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { Link, useNavigate } from 'react-router-dom'
import { EyeOutlined, EyeInvisibleOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../config/axios'
import { getRoleFromToken } from '../../utils/jwt'

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

    try {
      const { email, password } = formData
      const url = `/Auth/Login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`

      // Prefer POST; if backend requires GET, it will still work if configured. Adjust if needed.
      let response
      try {
        response = await api.post(url)
        console.log('Login response (POST):', response.data);
      } catch {
        // fallback to GET if POST not allowed
        response = await api.get(url)
      }

      // Chuẩn hoá theo cấu trúc BE: { isSuccess, code, data: { accessToken, refreshToken, expiredAt }, message }
      const apiEnvelope = response?.data || {}
      const token = apiEnvelope?.data?.accessToken || apiEnvelope?.accessToken || ''

      // Lưu và dựng user từ token
      login(null, token)

      const role = getRoleFromToken(token)
      console.log('Logged in user role:', role)
      switch (role) {
        case 'admin':
          navigate('/admin')
          break
        case 'staff':
          navigate('/staff')
          break
        case 'center':
          navigate('/center')
          break
        case 'teacher':
          navigate('/teacher')
          break
        case 'parent':
          navigate('/parent')
          break
        case 'student':
          navigate('/student')
          break
        default:
          navigate('/')
      }
    } catch {
      setErrors({
        email: 'Email hoặc mật khẩu không đúng',
        password: 'Email hoặc mật khẩu không đúng'
      })
    } finally {
      setIsLoading(false)
    }
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
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
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

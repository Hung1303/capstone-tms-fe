import { useState } from "react"
import { motion } from "framer-motion" // eslint-disable-line no-unused-vars
import { Link } from "react-router-dom"
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons"

const RegisterPage = ({ switchTo }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userType: "student"
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ""
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại"
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ"
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

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      console.log("Register data:", formData)
    }, 1000)
  }

  const optionRole = [
    { value: "student", label: "Học sinh", icon: "🎓" },
    { value: "parent", label: "Phụ huynh", icon: "👨‍👩‍👧‍👦" },
  ];


  return (
    <div className="p-8 md:p-10 h-full flex flex-col md:overflow-y-auto">
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-xl mb-4">T</div>
        <h2 className="text-2xl font-bold text-slate-900">Đăng ký tài khoản</h2>
        <p className="text-slate-600 mt-2">Tạo tài khoản để bắt đầu học tập</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Bạn là:</label>
          <div className="grid grid-cols-2 gap-3">
            {optionRole.map((role) => {
              const isActive = formData.userType === role.value;

              return (
                <motion.label
                  key={role.value}
                  whileTap={{ scale: 0.97 }}
                  animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                  transition={{ type: "spring" }}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 text-cente ${isActive ? "border-orange-500 bg-orange-50" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <input
                    type="radio"
                    name="userType"
                    value={role.value}
                    checked={isActive}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="text-2xl mb-2">{role.icon}</div>
                  <div className="font-medium text-slate-900">{role.label}</div>
                </motion.label>
              )
            })}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Họ và tên</label>
          <motion.input 
            whileFocus={{ scale: 1.02, boxShadow: "0 0 6px rgba(249,115,22,0.4)", borderColor: "#fdba74" }}
            animate={{ x: errors.fullName ? [0, -5, 5, -5, 5, 0] : 0, borderColor: errors.fullName ? "#fca5a5" : "#d1d5db" }}
            transition={{ duration: 0.4 }}
            name="fullName" 
            type="text"
            value={formData.fullName} 
            onChange={handleChange} 
            className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
            placeholder="Nhập họ và tên đầy đủ" 
          />
          {errors.fullName && 
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          }
        </div>
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
          <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại</label>
          <motion.input 
            whileFocus={{ scale: 1.02, boxShadow: "0 0 6px rgba(249,115,22,0.4)", borderColor: "#fdba74" }}
            animate={{ x: errors.phone ? [0, -5, 5, -5, 5, 0] : 0, borderColor: errors.phone ? "#fca5a5" : "#d1d5db" }}
            transition={{ duration: 0.4 }}
            name="phone" 
            type="tel" 
            value={formData.phone} 
            onChange={handleChange} 
            className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
            placeholder="Nhập số điện thoại" 
          />
          {errors.phone && 
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
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
          {errors.password && 
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          }
        </div>
        <div className="flex items-start">
          <input 
            type="checkbox" 
            required 
            className="mt-1 rounded border-gray-300 text-orange-500 focus:ring-orange-500 focus:outline-none" 
          />
          <label className="ml-2 text-sm text-slate-600">
            Tôi đồng ý với{" "}<Link to="/terms" className="text-blue-600 hover:text-blue-700">Điều khoản sử dụng</Link>{" "}và{" "}<Link to="/privacy" className="text-blue-600 hover:text-blue-700">Chính sách bảo mật</Link>
          </label>
        </div>
        <motion.button
          type="submit"
          disabled={isLoading}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-4 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
        </motion.button>
      </form>
      <div className="mt-8 text-center">
        <p className="text-slate-600">
          Đã có tài khoản?{" "}<button type="button" onClick={() => switchTo("login")} className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">Đăng nhập ngay</button>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage

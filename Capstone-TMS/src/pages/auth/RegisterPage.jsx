import { useState } from "react"
import { motion } from "framer-motion" // eslint-disable-line no-unused-vars
import { Link } from "react-router-dom"
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons"
import api from "../../config/axios"
import { toast } from "react-toastify"

const RegisterPage = ({ switchTo }) => {
  const initialFormData = {
    fullName: "",
    email: "",
    userName: "",
    password: "",
    phoneNumber: "",
    phoneSecondary: "",
    address: ""
  }

  const [formData, setFormData] = useState(initialFormData)
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

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên"
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = "Họ tên phải có ít nhất 2 ký tự"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại"
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ"
    }

    if (!formData.phoneSecondary.trim()) {
      newErrors.phoneSecondary = "Vui lòng nhập số điện thoại"
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneSecondary.replace(/\s/g, ""))) {
      newErrors.phoneSecondary = "Số điện thoại không hợp lệ"
    } else if (formData.phoneSecondary === formData.phoneNumber) {
      newErrors.phoneSecondary = "Không được trùng với số điện thoại chính"
    }

    if (!formData.userName.trim()) {
      newErrors.userName = "Vui lòng nhập tên tài khoản"
    } else if (formData.userName.length < 6) {
      newErrors.userName = "Tên tài khoản phải có ít nhất 6 ký tự"
    } else if (/\s/.test(formData.userName)) {
      newErrors.userName = "Tên tài khoản không được chứa khoảng trắng"
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

    console.log("formData:", formData)

    // API register for parent
    try {
      const registerParent = await api.post("/Users/Parent", formData)
      toast.success("Tạo tài khoản thành công! Vui lòng đăng nhập.")
      switchTo("login")
      setFormData(initialFormData)
      console.log("API Call registerParent: ", registerParent)
    } catch (error) {
      console.error("Error registering parent:", error)

      if (error.response && error.response.data) {
        const message = error.response.data;

        if (message.includes("the full name")) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            fullName: "Phải viết hoa chữ cái đầu mỗi từ"
          }))
        }
        else if (message.includes("Duplicate email")) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            email: "Email đã được sử dụng"
          }))
        }
        else if (message.includes("Duplicate Username")) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            userName: "Tên tài khoản đã được sử dụng"
          }))
        }
        else if (message.includes("Duplicate Phonenumber")) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            phoneNumber: "Số điện thoại đã được sử dụng"
          }))
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8 md:p-10 h-full flex flex-col md:overflow-y-auto">
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-xl mb-4">T</div>
        <h2 className="text-2xl font-bold text-slate-900">Đăng ký tài khoản</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
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
            animate={{ x: errors.phoneNumber ? [0, -5, 5, -5, 5, 0] : 0, borderColor: errors.phoneNumber ? "#fca5a5" : "#d1d5db" }}
            transition={{ duration: 0.4 }}
            name="phoneNumber" 
            type="tel" 
            value={formData.phoneNumber} 
            onChange={handleChange} 
            className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
            placeholder="Nhập số điện thoại" 
          />
          {errors.phoneNumber && 
            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
          }
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại khác</label>
          <motion.input 
            whileFocus={{ scale: 1.02, boxShadow: "0 0 6px rgba(249,115,22,0.4)", borderColor: "#fdba74" }}
            animate={{ x: errors.phoneSecondary ? [0, -5, 5, -5, 5, 0] : 0, borderColor: errors.phoneSecondary ? "#fca5a5" : "#d1d5db" }}
            transition={{ duration: 0.4 }}
            name="phoneSecondary" 
            type="tel" 
            value={formData.phoneSecondary} 
            onChange={handleChange} 
            className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
            placeholder="Nhập số điện thoại" 
          />
          {errors.phoneSecondary && 
            <p className="mt-1 text-sm text-red-600">{errors.phoneSecondary}</p>
          }
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Tên tài khoản</label>
          <motion.input 
            whileFocus={{ scale: 1.02, boxShadow: "0 0 6px rgba(249,115,22,0.4)", borderColor: "#fdba74" }}
            animate={{ x: errors.userName ? [0, -5, 5, -5, 5, 0] : 0, borderColor: errors.userName ? "#fca5a5" : "#d1d5db" }}
            transition={{ duration: 0.4 }}
            name="userName" 
            type="text"
            value={formData.userName} 
            onChange={handleChange} 
            className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none"
            placeholder="Nhập tên tài khoản" 
          />
          {errors.userName && 
            <p className="mt-1 text-sm text-red-600">{errors.userName}</p>
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
          {errors.password && 
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          }
        </div>
        
        {/* Phần Checkbox với Link mở Tab mới */}
        <div className="flex items-start">
          <input 
            id="terms-checkbox"
            type="checkbox" 
            required 
            className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 focus:outline-none cursor-pointer" 
          />
          <label htmlFor="terms-checkbox" className="ml-2 text-sm text-slate-600 select-none cursor-pointer">
            Tôi đồng ý với{" "}
            <Link 
              to="/terms" 
              target="_blank" 
              className="text-orange-600 hover:text-orange-700 font-medium hover:underline"
            >
              Điều khoản sử dụng
            </Link>
            {" "}và{" "}
            <Link 
              to="/privacy" 
              target="_blank" 
              className="text-orange-600 hover:text-orange-700 font-medium hover:underline"
            >
              Chính sách bảo mật
            </Link>
          </label>
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer w-full py-3 px-4 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
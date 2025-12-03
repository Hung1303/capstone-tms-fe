import { Card, Input, Typography, DatePicker } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import api from '../../config/axios'
import { toast } from 'react-toastify'

const { Title, Paragraph } = Typography

const RegisterCenter = () => {
	const initialFormData = {
		email: "",
		userName: "",
		password: "",
		fullName: "",
		phoneNumber: "",
		centerName: "",
		licenseNumber: "",
		issueDate: "",
		licenseIssuedBy: "",
		address: ""
	}

	const [formData, setFormData] = useState(initialFormData)
	const [showPassword, setShowPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [errors, setErrors] = useState({})
	const [message, setMessage] = useState(false)
	const navigate = useNavigate()

	const handleChange = (field, value) => {
		setFormData({
			...formData,
			[field]: value
		})
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors({
				...errors,
				[field]: ""
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

    if (!formData.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ"
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

		if (!formData.centerName.trim()) {
			newErrors.centerName = "Vui lòng nhập tên trung tâm"
		}

		if (!formData.licenseIssuedBy.trim()) {
			newErrors.licenseIssueBy = "Vui lòng nhập nơi cấp"
		}

		if (!formData.licenseNumber.trim()) {
			newErrors.licenseNumber = "Vui lòng nhập số giấy phép"
		}

		if (!formData.issueDate) {
			newErrors.issueDate = "Vui lòng chọn ngày"
		}

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

	const normalizeFullName = (name) => {
    return name
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

	const formatAddress = (address) => {
		if (!address) return "";

		address = address.toLowerCase().trim();

		return address
			.split(",")
			.map(part => {
				let formatted = part.trim();

				formatted = formatted
					.split(/\s+/)
					.map(word => {
						if (/^(TP\.|Quận|Phường|Tỉnh|Huyện)$/i.test(word)) return word; 
						return word.charAt(0).toUpperCase() + word.slice(1);
					})
					.join(" ");

				return formatted;
			})
			.join(", ");
	}

	const handleSubmit = async (e) => {
		e.preventDefault()

		if (!validateForm()) {
			return
		}

		setIsLoading(true)
    console.log("formData:", formData)

		try {
			const apiResponse = await api.post("/Users/Center", formData)
			toast.success("Bạn đã gửi đơn thành công.")
			setMessage(true)
			console.log("apiResponse register center", apiResponse)
		} catch (error) {
			console.log("error register center:", error)

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

			setMessage(false)
			toast.error("Thất bại. Vui lòng thử lại")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-white via-orange-50 to-teal-50">
			<main className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-14">
				<div className="text-center mb-8 sm:mb-10">
					<Title level={1}>Đăng ký trung tâm</Title>
					<Paragraph className="!text-gray-600 !text-base">
						Vui lòng điền đầy đủ thông tin để bắt đầu quy trình thẩm định và hợp tác.
					</Paragraph>
				</div>

				<Card className="rounded-2xl !border-none !bg-white/70 shadow-sm">
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">Email :</label>
								<Input
									name="email"
									type="email"
									value={formData.email}
									onChange={(e) => handleChange("email", e.target.value)}
									className="!w-full !px-4 !py-3 !border-2"
									placeholder="user@example.com"
								/>
								{errors.email &&
									<p className="mt-1 text-sm text-red-600">{errors.email}</p>
								}
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">Họ và tên người đại diện :</label>
								<Input
									name="fullName"
									type="text"
									value={formData.fullName}
									onChange={(e) => handleChange("fullName", e.target.value)}
									onBlur={() => handleChange("fullName", normalizeFullName(formData.fullName))}
									className="!w-full !px-4 !py-3 !border-2"
									placeholder="--- Nguyễn Văn A ---"
								/>
								{errors.fullName &&
									<p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
								}
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">Tên đăng nhập :</label>
								<Input
									name="userName"
									type="text"
									value={formData.userName}
									onChange={(e) => handleChange("userName", e.target.value)}
									className="!w-full !px-4 !py-3 !border-2"
									placeholder="Nhập tên đăng nhập"
								/>
								{errors.userName &&
									<p className="mt-1 text-sm text-red-600">{errors.userName}</p>
								}
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu :</label>
								<div className="relative">
									<Input
										name="password"
										type={showPassword ? "text" : "password"}
										value={formData.password}
										onChange={(e) => handleChange("password", e.target.value)}
										className="!w-full !px-4 !py-3 !border-2"
										placeholder="*********"
									/>
									<motion.button
										type="button"
										whileHover={{ scale: 1.2 }}
										whileTap={{ scale: 0.98 }}
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
									>
										{showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
									</motion.button>
								</div>
								{errors.password &&
									<p className="mt-1 text-sm text-red-600">{errors.password}</p>
								}
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại :</label>
								<Input
									name="phoneNumber"
									type="text"
									maxLength={10}
									value={formData.phoneNumber}
									onChange={(e) => handleChange("phoneNumber", e.target.value)}
									className="!w-full !px-4 !py-3 !border-2"
									placeholder="098xxxxxxx"
								/>
								{errors.phoneNumber &&
									<p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
								}
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">Tên trung tâm :</label>
								<Input
									name="centerName"
									type="text"
									value={formData.centerName}
									onChange={(e) => handleChange("centerName", e.target.value)}
									className="!w-full !px-4 !py-3 !border-2"
									placeholder="--- Trung tâm A ---"
								/>
								{errors.centerName &&
									<p className="mt-1 text-sm text-red-600">{errors.centerName}</p>
								}
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">Số giấy phép :</label>
								<Input
									name="licenseNumber"
									type="text"
									value={formData.licenseNumber}
									onChange={(e) => handleChange("licenseNumber", e.target.value)}
									className="!w-full !px-4 !py-3 !border-2"
									placeholder="Nhập số giấy phép" 
								/>
								{errors.licenseNumber &&
									<p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>
								}
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">Ngày cấp :</label>
								<DatePicker
									value={formData.issueDate ? dayjs(formData.issueDate, "YYYY-MM-DD") : null}
									onChange={(date) => {
										const formattedDate = date ? date.format("YYYY-MM-DD") : ""
										setFormData({ ...formData, issueDate: formattedDate });
										if (errors.issueDate) {
											setErrors({ ...errors, issueDate: "" });
										}
									}}
									className="w-full !px-4 !py-3 !border-2"
									placeholder="DD-MM-YYYY"
									format="DD-MM-YYYY"
								/>
								{errors.issueDate &&
									<p className="mt-1 text-sm text-red-600">{errors.issueDate}</p>
								}
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">Nơi cấp :</label>
								<Input
									name="licenseIssuedBy"
									type="text"
									value={formData.licenseIssuedBy}
									onChange={(e) => handleChange("licenseIssuedBy", e.target.value)}
									className="!w-full !px-4 !py-3 !border-2"
									placeholder="Sở GD&ĐT ..." 
								/>
								{errors.licenseIssuedBy &&
									<p className="mt-1 text-sm text-red-600">{errors.licenseIssuedBy}</p>
								}
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">Địa chỉ :</label>
								<Input
									name="address"
									type="text"
									value={formData.address}
									onChange={(e) => handleChange("address", e.target.value)}
									onBlur={() => handleChange("address", formatAddress(formData.address))}
									className="!w-full !px-4 !py-3 !border-2"
									placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" 
								/>
								{errors.address &&
									<p className="mt-1 text-sm text-red-600">{errors.address}</p>
								}
							</div>
						</div>
						<div className="flex flex-col sm:flex-row gap-3 justify-end mt-2">
							<motion.button
								type="button"
								whileHover={{ scale: 1.04 }}
								whileTap={{ scale: 0.98 }}
								className="px-3.5 py-1.5 rounded-md border-2 bg-gray-100 border-none font-semibold hover:text-blue-500"
								onClick={() => navigate(-1)}
							>
								Quay lại
							</motion.button>
							<motion.button
								type="submit"
								whileHover={{ scale: 1.04 }}
								whileTap={{ scale: 0.98 }}
								disabled={isLoading}
								className="px-3.5 py-1.5 rounded-md border-2 bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isLoading ? "Đang gửi..." : "Gửi đăng ký"}
							</motion.button>
						</div>
						{message && (
							<div className="text-center text-xl text-red-400">
								<p>Xin cảm ơn đối tác đã tin tưởng và lựa chọn.</p>
								<p>Chúng tôi sẽ gửi qua email quý khách để biết chi tiết thông tin kiểm định.</p>
							</div>
						)}
					</form>
				</Card>
			</main>
		</div>
	)
}

export default RegisterCenter



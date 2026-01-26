import { motion } from "framer-motion" // eslint-disable-line no-unused-vars
import { ArrowLeftOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"

const TermsPage = () => {
  const navigate = useNavigate()

  // Hàm điều hướng về trang Register
  const handleBack = () => {
    navigate("/register")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
        {/* Header */}
        <div className="mb-8 border-b pb-6">
          <button 
            onClick={handleBack} 
            className="flex items-center text-slate-500 hover:text-orange-500 transition-colors mb-4 cursor-pointer"
          >
            <ArrowLeftOutlined className="mr-2" /> Quay lại Đăng ký
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Điều khoản sử dụng</h1>
          <p className="text-slate-500 mt-2">Cập nhật lần cuối: 26/01/2026</p>
        </div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose prose-slate max-w-none text-slate-700 space-y-6 leading-relaxed"
        >
          <section>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">1. Giới thiệu</h3>
            <p>
              Chào mừng bạn đến với nền tảng của chúng tôi. Bằng việc đăng ký và sử dụng dịch vụ, bạn đồng ý tuân thủ các điều khoản và điều kiện dưới đây.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">2. Tài khoản người dùng</h3>
            <p>
              Khi tạo tài khoản, bạn cam kết cung cấp thông tin chính xác, đầy đủ và cập nhật. Bạn chịu trách nhiệm bảo mật mật khẩu của mình.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">3. Quyền và trách nhiệm</h3>
            <p>
              Chúng tôi cung cấp nền tảng kết nối và học tập. Người dùng không được sử dụng dịch vụ vào các mục đích phi pháp.
            </p>
          </section>
        </motion.div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t flex justify-center">
          <button 
            onClick={handleBack}
            className="px-8 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors cursor-pointer"
          >
            Đồng ý và quay lại Đăng ký
          </button>
        </div>
      </div>
    </div>
  )
}

export default TermsPage
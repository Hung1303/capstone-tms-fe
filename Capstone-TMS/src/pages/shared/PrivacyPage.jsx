import { motion } from "framer-motion" // eslint-disable-line no-unused-vars
import { ArrowLeftOutlined, SafetyCertificateOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"

const PrivacyPage = () => {
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
          <div className="flex items-center gap-3">
            <SafetyCertificateOutlined className="text-4xl text-orange-500" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Chính sách bảo mật</h1>
              <p className="text-slate-500 mt-1">Cam kết bảo vệ dữ liệu của bạn</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose prose-slate max-w-none text-slate-700 space-y-6 leading-relaxed"
        >
          <section>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">1. Thu thập thông tin</h3>
            <p>
              Chúng tôi thu thập thông tin cá nhân mà bạn cung cấp trực tiếp cho chúng tôi khi tạo tài khoản, bao gồm: Họ tên, Email, Số điện thoại.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">2. Sử dụng thông tin</h3>
            <p>
              Chúng tôi sử dụng thông tin để cung cấp dịch vụ, gửi thông báo và bảo vệ tài khoản của bạn.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">3. Bảo mật dữ liệu</h3>
            <p>
              Chúng tôi áp dụng các biện pháp kỹ thuật để bảo vệ thông tin cá nhân của bạn khỏi truy cập trái phép.
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

export default PrivacyPage
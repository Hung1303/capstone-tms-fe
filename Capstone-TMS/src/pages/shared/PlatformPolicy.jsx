import { motion } from "framer-motion"
import { ArrowLeftOutlined, BankOutlined, AuditOutlined, TeamOutlined, WarningOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"

const PlatformPolicy = () => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1) // Quay lại trang trước đó
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
            <ArrowLeftOutlined className="mr-2" /> Quay lại
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Chính sách & Quy định nền tảng</h1>
          <p className="text-slate-500 mt-2">Áp dụng cho Trung tâm, Phụ huynh và Học sinh tại TutorLink</p>
        </div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8 text-slate-700 leading-relaxed"
        >
          
          {/* Section 1: Vai trò */}
          <section className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h3 className="text-xl font-bold text-blue-800 flex items-center mb-3">
              <TeamOutlined className="mr-2" /> 1. Vai trò của TutorLink
            </h3>
            <p>
              TutorLink là nền tảng công nghệ trung gian kết nối giữa <strong>Phụ huynh/Học sinh</strong> và các <strong>Trung tâm dạy thêm</strong> được cấp phép. 
              Chúng tôi cung cấp giải pháp đăng ký khóa học, quản lý lịch học và hỗ trợ thanh toán trực tuyến nhằm đảm bảo sự minh bạch và tiện lợi.
            </p>
          </section>

          {/* Section 2: Chính sách Thanh toán & Doanh thu */}
          <section>
            <h3 className="text-xl font-bold text-slate-900 flex items-center mb-4">
              <BankOutlined className="mr-2 text-orange-500" /> 2. Chính sách Thanh toán & Doanh thu
            </h3>
            <div className="pl-4 border-l-4 border-orange-200 space-y-4">
              <div>
                <strong className="block text-slate-900">Quy trình dòng tiền:</strong>
                <p>
                  Khi Phụ huynh đăng ký và thanh toán khóa học trên web, TutorLink sẽ đóng vai trò là đơn vị trung gian tạm thời tiếp nhận khoản thanh toán này để xác nhận ghi danh.
                </p>
              </div>
              
              <div>
                <strong className="block text-slate-900">Phí nền tảng (Dành cho Trung tâm):</strong>
                <p>
                  TutorLink thu phí dịch vụ là <strong>5%</strong> trên tổng giá trị mỗi lượt đăng ký (enrollment) thành công từ phía Trung tâm.
                </p>
              </div>

              <div>
                <strong className="block text-slate-900">Chu kỳ đối soát & Thanh toán cho Trung tâm:</strong>
                <p>
                  Việc đối soát doanh thu được thực hiện dựa trên dữ liệu ghi nhận hệ thống và xử lý thủ công (offline processing). 
                  TutorLink sẽ hoàn trả tiền học phí (sau khi trừ 5% phí dịch vụ) lại cho Trung tâm vào <strong>cuối mỗi tháng</strong>.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Hoàn hủy & Thay đổi nguyện vọng */}
          <section>
            <h3 className="text-xl font-bold text-slate-900 flex items-center mb-4">
              <AuditOutlined className="mr-2 text-orange-500" /> 3. Chính sách Hoàn tiền & Hủy đăng ký
            </h3>
            <p className="mb-3">
              TutorLink <strong>không trực tiếp xử lý các yêu cầu hoàn tiền cá nhân</strong> trên hệ thống sau khi thanh toán đã thành công. Quy trình xử lý như sau:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Thay đổi ý định:</strong> Nếu Phụ huynh đã đăng ký và thanh toán nhưng không muốn cho con theo học nữa (hoặc muốn đổi khóa học), Phụ huynh vui lòng <strong>liên hệ trực tiếp với Trung tâm</strong> để thỏa thuận phương án hoàn tiền hoặc bảo lưu.
              </li>
              <li>
                <strong>Trách nhiệm hoàn tiền:</strong> Việc hoàn tiền (nếu có) sẽ do Trung tâm thực hiện trực tiếp với Phụ huynh theo quy định riêng của từng Trung tâm. TutorLink không can thiệp vào quy trình chuyển trả tiền thừa này.
              </li>
            </ul>
          </section>

          {/* Section 4: Xử lý rủi ro & Tranh chấp */}
          <section className="bg-orange-50 p-6 rounded-lg border border-orange-100">
            <h3 className="text-xl font-bold text-red-700 flex items-center mb-3">
              <WarningOutlined className="mr-2" /> 4. Giải quyết Sự cố & Tranh chấp
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900">Trường hợp Khóa học bị hủy hoặc Giáo viên bị xóa:</h4>
                <p className="text-sm">
                  Nếu khóa học bị hủy bỏ hoặc Giáo viên phụ trách bị xóa khỏi hệ thống khiến lớp học không thể diễn ra:
                  <br/>
                  1. Phụ huynh cần <strong>liên hệ trực tiếp với Trung tâm</strong> để xử lý các vấn đề về tài chính (học phí đã đóng).
                  <br/>
                  2. Sau khi thống nhất phương án xử lý với Trung tâm, Phụ huynh hoặc Trung tâm cần <strong>thông báo lại cho Admin TutorLink</strong> để cập nhật trạng thái trên hệ thống.
                </p>
              </div>

              <div className="border-t border-orange-200 pt-3">
                <h4 className="font-bold text-slate-900">Trường hợp Trung tâm bị xóa hoặc Ngừng hoạt động trên nền tảng:</h4>
                <p className="text-sm">
                  Trong trường hợp một Trung tâm bị xóa khỏi nền tảng (do vi phạm chính sách hoặc ngừng hợp tác):
                  <br/>
                  1. Phụ huynh và Trung tâm có trách nhiệm <strong>tự thỏa thuận và thương lượng</strong> về việc hoàn trả học phí hoặc tiếp tục giảng dạy bên ngoài nền tảng.
                  <br/>
                  2. Nếu hai bên <strong>không đạt được thống nhất</strong>, sự việc sẽ được giải quyết theo quy định của pháp luật hiện hành. TutorLink sẽ hỗ trợ cung cấp dữ liệu giao dịch khi có yêu cầu từ cơ quan chức năng, nhưng không chịu trách nhiệm bồi hoàn tài chính.
                </p>
              </div>
            </div>
          </section>

          {/* Footer Note */}
          <div className="text-center pt-6 text-sm text-slate-500 italic">
            Bằng việc sử dụng nền tảng TutorLink, quý khách hàng xác nhận đã đọc, hiểu và đồng ý với các quy định trên.
          </div>

        </motion.div>

        {/* Footer Button */}
        <div className="mt-10 pt-6 border-t flex justify-center">
          <button 
            onClick={handleBack}
            className="px-8 py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlatformPolicy
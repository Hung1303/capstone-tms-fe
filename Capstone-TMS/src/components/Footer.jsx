import { Link } from "react-router-dom"

const Footer = () => (
  <footer className="border-t border-blue-100 bg-gray-900 text-gray-100 py-8 mt-8">
    <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 className="font-bold mb-2 text-orange-400">Thông tin</h3>
        <ul className="space-y-1 text-sm">
          <li>ketnoitrungtam.com - Nền tảng Kết nối Trung tâm Dạy kèm Được Cấp phép</li>
          <li>7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, Hồ Chí Minh</li>
          <li>0123 123 321</li>
          <li>TT@gmail.com</li>
          <li>Thứ 2 - Chủ nhật 08:00 - 22:00</li>
        </ul>
      </div>
      <div>
        <h3 className="font-bold mb-2 text-orange-400">Chính sách & Quy định</h3>
        <ul className="space-y-1 text-sm">
          <li><Link to="/policy" className="hover:text-orange-400">Chính sách nền tảng</Link></li>
          <li><Link to="/terms" className="hover:text-orange-400">Điều khoản sử dụng</Link></li>
          <li><Link to="/privacy" className="hover:text-orange-400">Chính sách bảo mật</Link></li>
         
        </ul>
      </div>
      <div>
        <h3 className="font-bold mb-2 text-orange-400">Khác</h3>
        <ul className="space-y-1 text-sm">
          <li><Link to="/recruitment" className="hover:text-orange-400">Tuyển dụng</Link></li>
          <li><Link to="/about" className="hover:text-orange-400">Giới thiệu</Link></li>
          <li><Link to="/blog" className="hover:text-orange-400">Blog</Link></li>
          <li><Link to="/faq" className="hover:text-orange-400">Hỏi đáp</Link></li>
          <li><Link to="/contact" className="hover:text-orange-400">Liên hệ</Link></li>
        </ul>
      </div>
    </div>
    <div className="text-center text-xs text-gray-400 mt-8">
      Bản quyền thuộc về TutorLink
    </div>
  </footer>
);

export default Footer;
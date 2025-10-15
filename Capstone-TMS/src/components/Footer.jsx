const Footer = () => (
  <footer className="border-t border-blue-100 bg-gray-900 text-gray-100 py-8 mt-8">
    <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 className="font-bold mb-2 text-orange-400">Thông tin</h3>
        <ul className="space-y-1 text-sm">
          <li>Linkdemo.com - Nền tảng Kết nối Trung tâm Dạy kèm Được Cấp phép</li>
          <li>7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, Hồ Chí Minh</li>
          <li>0123 123 321</li>
          <li>TT@gmail.com</li>
          <li>Thứ 2 - Chủ nhật 08:00 - 22:00</li>
        </ul>
      </div>
      <div>
        <h3 className="font-bold mb-2 text-orange-400">Tài liệu</h3>
        <ul className="space-y-1 text-sm">
          <li>Hợp đồng giao lớp</li>
          <li>Báo cáo</li>
          <li>Định mức dịch vụ</li>
          <li>Thông tin tuyển dụng</li>
        </ul>
      </div>
      <div>
        <h3 className="font-bold mb-2 text-orange-400">Mạng xã hội</h3>
        <div className="flex gap-3 mb-2">
          <a href="#" className="hover:text-orange-400">Facebook</a>
          <a href="#" className="hover:text-orange-400">YouTube</a>
          <a href="#" className="hover:text-orange-400">Zalo</a>
        </div>
        <ul className="space-y-1 text-sm">
          <li><a href="/recruitment" className="hover:text-orange-400">Tuyển dụng</a></li>
          <li><a href="/about" className="hover:text-orange-400">Giới thiệu</a></li>
          <li><a href="/blog" className="hover:text-orange-400">Blog</a></li>
          <li><a href="/faq" className="hover:text-orange-400">Hỏi đáp</a></li>
          <li><a href="/contact" className="hover:text-orange-400">Liên hệ</a></li>
        </ul>
      </div>
    </div>
    <div className="text-center text-xs text-gray-400 mt-8">
      Bản quyền thuộc về TutorLink
    </div>
  </footer>
);

export default Footer;

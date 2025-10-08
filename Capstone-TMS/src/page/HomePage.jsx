import { VerticalAlignTopOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const HomePage = () => {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleScrollToTop = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <div id="top" className="min-h-screen bg-gradient-to-b from-white via-orange-50 to-teal-50 text-slate-800">
      <header className="border-b border-blue-100 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            onClick={() => handleScrollToTop('top')} 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer select-none hover:opacity-90"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white font-bold">T</span>
            <span className="text-lg font-semibold">TutorLink</span>
          </motion.div>

          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <button onClick={() => handleScrollToTop('features')} className="hover:text-blue-700 cursor-pointer">
              Tính năng
            </button>
            <button onClick={() => handleScrollToTop('how')} className="hover:text-blue-700 cursor-pointer">
              Cách hoạt động
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              className="px-3 py-2 text-sm font-medium rounded-md hover:bg-blue-50"
            >
              Đăng nhập
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              className="px-3 py-2 text-sm font-medium rounded-md bg-orange-500 text-white hover:bg-orange-600"
            >
              Đăng ký
            </motion.button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero section */}
        <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">
                Xây dựng Nền tảng Kết nối Trung tâm Dạy kèm Được Cấp phép
                <span className="block text-blue-700">cho Học sinh THCS và THPT</span>
              </h1>
              <p className="mt-5 text-slate-600 text-base sm:text-lg leading-relaxed">
                Tìm và kết nối nhanh chóng với các trung tâm dạy kèm uy tín, đã được cấp phép. 
                Cá nhân hoá lộ trình học cho học sinh THCS và THPT với lịch học linh hoạt, 
                đội ngũ giáo viên chất lượng và phản hồi minh bạch.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2.5 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  Bắt đầu ngay
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2.5 rounded-md border border-orange-300 text-orange-700 font-medium hover:bg-orange-50"
                >
                  Xem trung tâm nổi bật
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[4/3] w-full rounded-xl border border-blue-100 bg-white shadow-sm p-4">
                <div className="h-full w-full rounded-lg bg-gradient-to-br from-blue-50 via-yellow-50 to-teal-50 grid place-items-center text-center p-6">
                  <div>
                    <div className="text-6xl mb-3">🎓</div>
                    <p className="text-slate-700 font-medium">Kết nối học tập an toàn, minh bạch, hiệu quả</p>
                    <p className="text-slate-500 text-sm mt-1">Dành cho học sinh THCS - THPT</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 bg-gradient-to-b from-white to-orange-50 border-y border-orange-100">
          <div className="max-w-6xl mx-auto px-4 py-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Tại sao chọn TutorLink?</h2>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                ["🔎", "Tìm kiếm thông minh", "Lọc theo môn học, khối lớp, lịch học, vị trí và đánh giá."],
                ["🛡️", "Trung tâm được cấp phép", "Chỉ hiển thị trung tâm có giấy phép hợp lệ và hồ sơ minh bạch."],
                ["📆", "Lịch học linh hoạt", "Đăng ký lớp phù hợp thời khoá biểu của học sinh."],
                ["👩‍🏫", "Giáo viên chất lượng", "Hồ sơ giáo viên rõ ràng, đánh giá từ phụ huynh và học sinh."],
                ["💬", "Tư vấn minh bạch", "Trao đổi học thuật, lộ trình và chi phí rõ ràng trước khi đăng ký."],
                ["📈", "Theo dõi tiến bộ", "Báo cáo định kỳ, mục tiêu rõ ràng cho từng giai đoạn."]
              ].map(([icon, title, desc], i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="p-5 rounded-lg border border-teal-200 bg-white hover:shadow-sm transition"
                >
                  <div className="text-2xl">{icon}</div>
                  <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1.5 text-sm text-slate-600">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Cách hoạt động</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              ["1️⃣", "Khám phá & lọc", "Chọn môn học, lớp, địa điểm và thời gian."],
              ["2️⃣", "So sánh & xem đánh giá", "Xem hồ sơ trung tâm, giáo viên và phản hồi."],
              ["3️⃣", "Đăng ký & theo dõi", "Đặt lớp, thanh toán an toàn và theo dõi tiến bộ."]
            ].map(([icon, title, desc], i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="p-5 rounded-lg border border-teal-200 bg-teal-50"
              >
                <div className="text-2xl">{icon}</div>
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={() => handleScrollToTop('top')}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="cursor-pointer fixed bottom-12 right-10 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-orange-400 text-white shadow-lg hover:bg-orange-500 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-amber-400 p-3"
          >
            <VerticalAlignTopOutlined style={{ fontSize: '28px' }} />
          </motion.button>
        )}
      </AnimatePresence>

      <footer className="border-t border-blue-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <div>© {new Date().getFullYear()} TutorLink. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-blue-700">Điều khoản</a>
            <a href="#" className="hover:text-blue-700">Bảo mật</a>
            <a href="#" className="hover:text-blue-700">Liên hệ</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage

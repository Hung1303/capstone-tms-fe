import { VerticalAlignTopOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'

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
          <div 
            onClick={() => handleScrollToTop('top')} 
            className="flex items-center gap-2 cursor-pointer select-none hover:opacity-90"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white font-bold">T</span>
            <span className="text-lg font-semibold">TutorLink</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <button 
              onClick={() => handleScrollToTop('features')} 
              className="hover:text-blue-700 cursor-pointer"
            >
              Tính năng
            </button>
            <button 
              onClick={() => handleScrollToTop('how')} 
              className="hover:text-blue-700 cursor-pointer"
            >
              Cách hoạt động
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <button className="px-3 py-2 text-sm font-medium rounded-md hover:bg-blue-50">Đăng nhập</button>
            <button className="px-3 py-2 text-sm font-medium rounded-md bg-orange-500 text-white hover:bg-orange-600">Đăng ký</button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
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
                <button className="px-4 py-2.5 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700">
                  Bắt đầu ngay
                </button>
                <button className="px-4 py-2.5 rounded-md border border-orange-300 text-orange-700 font-medium hover:bg-orange-50">
                  Xem trung tâm nổi bật
                </button>
              </div>
              <div className="mt-6 flex items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2"><span className="text-yellow-500">★</span> 1000+ học sinh tin dùng</div>
                <div className="flex items-center gap-2"><span className="text-teal-600">✔</span> Trung tâm đã cấp phép</div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] w-full rounded-xl border border-blue-100 bg-white shadow-sm p-4">
                <div className="h-full w-full rounded-lg bg-gradient-to-br from-blue-50 via-yellow-50 to-teal-50 grid place-items-center text-center p-6">
                  <div>
                    <div className="text-6xl mb-3">🎓</div>
                    <p className="text-slate-700 font-medium">Kết nối học tập an toàn, minh bạch, hiệu quả</p>
                    <p className="text-slate-500 text-sm mt-1">Dành cho học sinh THCS - THPT</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 bg-gradient-to-b from-white to-orange-50 border-y border-orange-100">
          <div className="max-w-6xl mx-auto px-4 py-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Tại sao chọn TutorLink?</h2>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-5 rounded-lg border border-teal-200 bg-white hover:shadow-sm transition">
                <div className="text-2xl text-blue-600">🔎</div>
                <h3 className="mt-3 font-semibold text-slate-900">Tìm kiếm thông minh</h3>
                <p className="mt-1.5 text-sm text-slate-600">Lọc theo môn học, khối lớp, lịch học, vị trí và đánh giá.</p>
              </div>
              <div className="p-5 rounded-lg border border-teal-200 bg-white hover:shadow-sm transition">
                <div className="text-2xl text-teal-600">🛡️</div>
                <h3 className="mt-3 font-semibold text-slate-900">Trung tâm được cấp phép</h3>
                <p className="mt-1.5 text-sm text-slate-600">Chỉ hiển thị trung tâm có giấy phép hợp lệ và hồ sơ minh bạch.</p>
              </div>
              <div className="p-5 rounded-lg border border-teal-200 bg-white hover:shadow-sm transition">
                <div className="text-2xl text-yellow-500">📆</div>
                <h3 className="mt-3 font-semibold text-slate-900">Lịch học linh hoạt</h3>
                <p className="mt-1.5 text-sm text-slate-600">Đăng ký lớp phù hợp thời khoá biểu của học sinh.</p>
              </div>
              <div className="p-5 rounded-lg border border-teal-200 bg-white hover:shadow-sm transition">
                <div className="text-2xl text-orange-500">👩‍🏫</div>
                <h3 className="mt-3 font-semibold text-slate-900">Giáo viên chất lượng</h3>
                <p className="mt-1.5 text-sm text-slate-600">Hồ sơ giáo viên rõ ràng, đánh giá từ phụ huynh và học sinh.</p>
              </div>
              <div className="p-5 rounded-lg border border-teal-200 bg-white hover:shadow-sm transition">
                <div className="text-2xl text-blue-600">💬</div>
                <h3 className="mt-3 font-semibold text-slate-900">Tư vấn minh bạch</h3>
                <p className="mt-1.5 text-sm text-slate-600">Trao đổi học thuật, lộ trình và chi phí rõ ràng trước khi đăng ký.</p>
              </div>
              <div className="p-5 rounded-lg border border-teal-200 bg-white hover:shadow-sm transition">
                <div className="text-2xl text-teal-600">📈</div>
                <h3 className="mt-3 font-semibold text-slate-900">Theo dõi tiến bộ</h3>
                <p className="mt-1.5 text-sm text-slate-600">Báo cáo định kỳ, mục tiêu rõ ràng cho từng giai đoạn.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Cách hoạt động</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="p-5 rounded-lg border border-teal-200 bg-teal-50">
              <div className="text-2xl">1️⃣</div>
              <h3 className="mt-3 font-semibold">Khám phá & lọc</h3>
              <p className="mt-1.5 text-sm text-slate-600">Chọn môn học, lớp, địa điểm và thời gian.</p>
            </div>
            <div className="p-5 rounded-lg border border-teal-200 bg-teal-50">
              <div className="text-2xl">2️⃣</div>
              <h3 className="mt-3 font-semibold">So sánh & xem đánh giá</h3>
              <p className="mt-1.5 text-sm text-slate-600">Xem hồ sơ trung tâm, giáo viên và phản hồi.</p>
            </div>
            <div className="p-5 rounded-lg border border-teal-200 bg-teal-50">
              <div className="text-2xl">3️⃣</div>
              <h3 className="mt-3 font-semibold">Đăng ký & theo dõi</h3>
              <p className="mt-1.5 text-sm text-slate-600">Đặt lớp, thanh toán an toàn và theo dõi tiến bộ.</p>
            </div>
          </div>
        </section>

        
      </main>

      {showScrollTop && (
        <button
          onClick={() => handleScrollToTop('top')}
          className="cursor-pointer fixed bottom-12 right-10 z-20 flex items-center justify-center w-12 h-12 rounded-full transition duration-200 bg-orange-400 text-white shadow-lg hover:bg-orange-500 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-amber-400 p-3"
        >
          <VerticalAlignTopOutlined style={{ fontSize: '28px' }}/>
        </button>
      )}

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

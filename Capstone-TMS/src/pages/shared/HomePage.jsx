import { VerticalAlignTopOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom' 
import ParentCentersMap from '../../components/map'
import anhQuangCao from '../../assets/anh-quang-cao.png'

const HomePage = () => {
    // 2. Khai báo hook
    const navigate = useNavigate()

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

    // Dữ liệu Why Us Cards
    const cardData = [
        {
            title: "Phụ huynh / Học sinh",
            items: [
                "Hỗ trợ tìm, đăng ký Lớp học tại Trung tâm miễn phí",
                "Học phí Khóa học tối ưu, tiết kiệm, minh bạch",
                "Được tặng 01 buổi học thử tại Trung tâm miễn phí",
                "Nhanh chóng đăng ký khóa học và bắt đầu học",
                "Báo cáo Tiến độ Học tập từ Trung tâm chi tiết",
            ],
            buttonText: "Tìm Khóa học",
            buttonLink: "/centers",
            color: "text-orange-600",
            buttonStyle: "bg-orange-500 hover:bg-orange-600",
        },
        {
            title: "Cam kết Chính sách",
            items: [
                "Kiểm duyệt Hồ sơ Trung tâm, Giấy phép rõ ràng",
                "Hợp đồng đăng ký Khóa học rõ ràng, minh bạch",
                "Tận tâm, trách nhiệm trong suốt quá trình học",
                "Quy trình tinh gọn, tiết kiệm, hiệu quả",
                "Đội ngũ nhân sự tư vấn tận tâm, tử tế",
            ],
            buttonText: "Liên hệ",
            buttonLink: "/contact",
            color: "text-amber-700",
            buttonStyle: "bg-amber-600 hover:bg-amber-700",
        },
        {
            title: "Trung tâm Dạy kèm",
            items: [
                "Tư vấn quy trình Đăng ký Trung tâm (Onboarding)",
                "Hợp đồng bảo vệ quyền lợi Trung tâm và Học viên",
                "Quản lý Khóa học, Học viên và Lịch học dễ dàng",
                "Thanh toán phí nền tảng sau 35 ngày",
                "Chính sách Sử dụng Nền tảng rõ ràng, minh bạch",
            ],
            buttonText: "Đăng ký",
            buttonLink: "/recruitment",
            color: "text-teal-700",
            buttonStyle: "bg-teal-600 hover:bg-teal-700",
        },
    ];

    // Animation variants
    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.3,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    };

    return (
        <div id="top" className="min-h-screen bg-gradient-to-b from-white via-orange-50 to-teal-50 text-slate-800">
            <main>
                {/* Hero section */}
                <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
                    <div className="grid md:grid-cols-2 gap-10 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight text-slate-900">
                                Xây dựng Nền tảng Kết nối Trung tâm Dạy kèm Được Cấp phép
                                <span className="block text-blue-700">cho Học sinh THCS và THPT</span>
                            </h1>
                            <p className="mt-5 text-slate-600 text-base sm:text-lg leading-relaxed">
                                Tìm và kết nối nhanh chóng với các trung tâm dạy kèm uy tín, đã được cấp phép.
                                Cá nhân hoá lộ trình học cho học sinh THCS và THPT với lịch học linh hoạt,
                                đội ngũ giáo viên chất lượng và phản hồi minh bạch.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                {/* 3. Nút Xem trung tâm nổi bật đã gắn navigate */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => navigate('/centers')}
                                    className="px-4 py-2.5 rounded-md border border-orange-300 text-orange-700 font-medium hover:bg-orange-50 cursor-pointer"
                                >
                                    Xem trung tâm nổi bật
                                </motion.button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="aspect-[16/9] w-full rounded-xl border border-blue-100 bg-white shadow-sm p-4 flex items-center justify-center">
                                <iframe
                                    width="100%"
                                    height="315"
                                    src="https://www.youtube.com/embed/aHcdoObIj20"
                                    title="Đăng ký dạy thêm của các gia sư, giáo viên"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="rounded-lg"
                                ></iframe>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Why Us Cards */}
                <section className="py-20 bg-orange-50/50">
                    <div className="max-w-6xl mx-auto px-4 text-center">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
                            Chúng tôi có thể giúp gì cho bạn?
                        </h2>
                        <p className="mt-2 text-md text-slate-600">
                            Lựa chọn chủ động - Mang lại sự yên tâm
                        </p>

                        <motion.div
                            className="mt-12 grid md:grid-cols-3 gap-8"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                        >
                            {cardData.map((card, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-gradient-to-r from-white via-teal-50 to-orange-50 p-8 rounded-xl flex flex-col items-center"
                                    variants={cardVariants}
                                >
                                    <h3 className={`text-xl font-bold ${card.color} mb-6`}>
                                        {card.title}
                                    </h3>
                                    <ul className="text-left space-y-3 mb-10 text-slate-700 flex-grow">
                                        {card.items.map((item, i) => (
                                            <li key={i} className="flex items-start">
                                                <span className="text-green-500 mr-2 text-xl">✓</span>
                                                <span className="text-sm leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link to={card.buttonLink} className="mt-auto w-full max-w-[180px]">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`cursor-pointer w-full px-6 py-3 text-white font-semibold rounded-lg transition ${card.buttonStyle}`}
                                        >
                                            {card.buttonText} &rarr;
                                        </motion.button>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Quyền lợi */}
                <section className="py-20 bg-white">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-teal-700 mb-2">
                                QUYỀN LỢI KHI HỌC TẠI TUTORLINK
                            </h2>
                            <div className="flex justify-center gap-3 mb-8">
                                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            {/* Left side - Features list */}
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                                className="space-y-3"
                            >
                                {/* Feature 1 - Green */}
                                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                                            <svg className="w-8 h-8" viewBox="0 0 100 100" fill="currentColor">
                                                <path d="M45.233,46.383h3.749l8.141,9.045l0.746-0.886c0.038-0.045,3.728-4.421,7.222-8.159H86.14c4.414,0,8.006-3.591,8.006-8.006 V13.049c0-4.414-3.591-8.006-8.006-8.006H45.233c-4.414,0-8.006,3.591-8.006,8.006v25.329 C37.228,42.792,40.819,46.383,45.233,46.383z" />
                                                <path d="M64.375,17.459c0.411,0,0.786,0.063,1.123,0.189c0.337,0.126,0.623,0.297,0.857,0.514c0.234,0.217,0.414,0.477,0.54,0.78 c0.126,0.303,0.189,0.631,0.189,0.986c0,0.411-0.057,0.786-0.171,1.123c-0.114,0.337-0.286,0.663-0.514,0.977" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base mb-1">KẾT NỐI TRUNG TÂM CÓ GIÁO VIÊN ĐƯỢC CẤP PHÉP</h3>
                                            <p className="text-sm leading-relaxed">Kết nối với các trung tâm dạy kèm được cấp phép theo Thông tư 29, đảm bảo chất lượng giáo dục và an toàn cho học sinh.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Feature 2 - Orange */}
                                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                                            <svg className="w-8 h-8" viewBox="0 0 100 100" fill="currentColor">
                                                <rect x="38.6" y="55.5" width="4.3" height="13.5"></rect>
                                                <rect x="48.5" y="49.9" width="4.3" height="19"></rect>
                                                <rect x="58.3" y="55.3" width="4.3" height="13.6"></rect>
                                                <rect x="68.1" y="51.2" width="4.3" height="17.7"></rect>
                                                <path d="M69.8,33.2c-0.3,0.8-0.7,1.6-1.3,2.2l4.4,6.1c2.2-1.9,3.8-4.5,4.4-7.5L69.8,33.2z"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base mb-1">QUẢN LÝ TIẾN ĐỘ HỌC TẬP MINH BẠCH</h3>
                                            <p className="text-sm leading-relaxed">Theo dõi tiến độ học tập của con em thông qua hệ thống báo cáo chi tiết từ trung tâm, nắm bắt kết quả học tập rõ ràng.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Feature 3 - Blue */}
                                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                                            <svg className="w-8 h-8" viewBox="0 -960 960 960" fill="currentColor">
                                                <path d="M80-160v-95q0-34 18-62.5t50-42.5q60-27 123.18-43.5Q334.37-420 400-420q33 0 66 4.67 33 4.66 66 11.33v53q-45 17-74.5 55T428-210v50H80Zm408 0v-51q0-22.89 11-42.45Q510-273 530-284q36-18.5 74.5-27.75T684-321q41 0 80 9t74 28q20 10 31 29.87T880-211v51H488Zm196-221q-39.48 0-66.74-27.26Q590-435.52 590-475q0-39.48 27.26-66.74Q644.52-569 684-569q39.48 0 66.74 27.26Q778-514.48 778-475q0 39.48-27.26 66.74Q723.48-381 684-381ZM400-481q-63 0-106.5-43.5T250-631q0-63 43.5-106.5T400-781q63 0 106.5 43.5T550-631q0 63-43.5 106.5T400-481Z"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base mb-1">HỖ TRỢ TƯ VẤN 24/7</h3>
                                            <p className="text-sm leading-relaxed">Đội ngũ tư vấn viên luôn sẵn sàng hỗ trợ phụ huynh và học sinh trong quá trình tìm kiếm, đăng ký và học tập.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Feature 4 - Purple */}
                                <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                                            <svg className="w-8 h-8" viewBox="0 0 100 100" fill="currentColor">
                                                <g>
                                                    <path d="M81.8,9.9l0,69.7l-49.3,0l0-69.7L81.8,9.9z M29.9,7.3l0,74.9l54.4,0l0-74.9L29.9,7.3L29.9,7.3z"></path>
                                                    <rect x="38.6" y="55.5" width="4.3" height="13.5"></rect>
                                                    <rect x="48.5" y="49.9" width="4.3" height="19"></rect>
                                                    <rect x="58.3" y="55.3" width="4.3" height="13.6"></rect>
                                                    <rect x="68.1" y="51.2" width="4.3" height="17.7"></rect>
                                                </g>
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base mb-1">HỢP ĐỒNG RÕ RÀNG VÀ MINH BẠCH</h3>
                                            <p className="text-sm leading-relaxed">Hợp đồng đăng ký khóa học rõ ràng, minh bạch, bảo vệ quyền lợi của phụ huynh, học sinh và trung tâm.</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Right side - Image */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                                className="flex justify-center"
                            >
                                <div className="relative w-full max-w-sm">
                                    <div className="aspect-square rounded-full bg-gradient-to-br from-orange-100 via-pink-100 to-blue-100 flex items-center justify-center overflow-hidden shadow-2xl border-4 border-orange-200">
                                        <img
                                            src={anhQuangCao}
                                            alt="TutorLink Benefits"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Vị trí các trung tâm */}
                <section id="centers-map" className="scroll-mt-20 max-w-6xl mx-auto px-4 py-16">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">Vị trí các trung tâm</h2>
                    <div style={{ height: '800px', borderRadius: '12px', overflow: 'auto', position: 'relative', zIndex: 1 }}>
                        <ParentCentersMap />
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
        </div>
    )
}

export default HomePage
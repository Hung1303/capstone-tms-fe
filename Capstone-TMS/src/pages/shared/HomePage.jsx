import { VerticalAlignTopOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import CentersMap from '../../components/CentersMap'

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
            buttonLink: "/search-courses",
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
            buttonText: "Đăng ký học",
            buttonLink: "/register-center",
            color: "text-teal-700",
            buttonStyle: "bg-teal-600 hover:bg-teal-700",
        },
    ];

    // Animation variants cho Why Us Cards
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


                {/* Why Us Cards (Chúng tôi có thể giúp gì cho bạn?) */}
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
                                                <span className="text-green-500 mr-2 text-xl">
                                                    ✓
                                                </span>
                                                <span className="text-sm leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Link to={card.buttonLink} className="mt-auto w-full max-w-[180px]">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`w-full px-6 py-3 text-white font-semibold rounded-lg transition ${card.buttonStyle}`}
                                        >
                                            {card.buttonText} &rarr;
                                        </motion.button>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Vị trí các trung tâm */}
                <section id="centers-map" className="scroll-mt-20 max-w-6xl mx-auto px-4 py-16">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">Vị trí các trung tâm</h2>
                    <CentersMap style={{ height: '500px' }} showHeader={false} />
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
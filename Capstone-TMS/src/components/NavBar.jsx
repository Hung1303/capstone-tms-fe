import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

// ... (menuData và moreMenu giữ nguyên) ...

const menuData = [
    {
        label: 'Trung tâm',
        path: '/centers',
    },
    {
        label: 'Tìm gia sư',
        children: [
            {
                label: 'Phổ thông',
                children: [
                    { name: 'Toán', subject_id: 1 },
                    { name: 'Tiếng Việt', subject_id: 2 },
                    { name: 'Luyện chữ', subject_id: 3 },
                    { name: 'Toán + Tiếng Việt', subject_id: 4 },
                    { name: 'Vật lý', subject_id: 5 },
                    { name: 'Hoá học', subject_id: 6 },
                    { name: 'Ngữ văn', subject_id: 7 },
                    { name: 'Lịch sử', subject_id: 8 },
                    { name: 'Địa lý', subject_id: 9 },
                    { name: 'Sinh học', subject_id: 10 },
                    { name: 'Tin học', subject_id: 11 },
                    { name: 'Khoa học tự nhiên', subject_id: 12 },
                ]
            },
            {
                label: 'Ngoại ngữ',
                children: [
                    { name: 'Tiếng Anh', subject_id: 13 },
                    { name: 'Tiếng Trung', subject_id: 14 },
                    { name: 'Tiếng Nhật', subject_id: 15 },
                    { name: 'Tiếng Pháp', subject_id: 16 },
                    { name: 'Tiếng Nga', subject_id: 17 },
                    { name: 'Tiếng Hàn', subject_id: 18 },
                    { name: 'Tiếng Đức', subject_id: 19 },
                ]
            },
            {
                label: 'Năng khiếu',
                children: [
                    { name: 'Âm nhạc (Đàn)', subject_id: 20 },
                    { name: 'Hội hoạ (Vẽ)', subject_id: 21 },
                    { name: 'Đánh cờ', subject_id: 22 },
                ]
            }
        ]
    },
    {
        label: 'Lớp học mới',
        children: [
            {
                label: 'Phổ thông',
                children: [
                    { name: 'Toán', subject_id: 1 },
                    { name: 'Tiếng Việt', subject_id: 2 },
                    { name: 'Luyện chữ', subject_id: 3 },
                    { name: 'Toán + Tiếng Việt', subject_id: 4 },
                    { name: 'Vật lý', subject_id: 5 },
                    { name: 'Hoá học', subject_id: 6 },
                    { name: 'Ngữ văn', subject_id: 7 },
                    { name: 'Lịch sử', subject_id: 8 },
                    { name: 'Địa lý', subject_id: 9 },
                    { name: 'Sinh học', subject_id: 10 },
                    { name: 'Tin học', subject_id: 11 },
                    { name: 'Khoa học tự nhiên', subject_id: 12 },
                ]
            },
            {
                label: 'Ngoại ngữ',
                children: [
                    { name: 'Tiếng Anh', subject_id: 13 },
                    { name: 'Tiếng Trung', subject_id: 14 },
                    { name: 'Tiếng Nhật', subject_id: 15 },
                    { name: 'Tiếng Pháp', subject_id: 16 },
                    { name: 'Tiếng Nga', subject_id: 17 },
                    { name: 'Tiếng Hàn', subject_id: 18 },
                    { name: 'Tiếng Đức', subject_id: 19 },
                ]
            },
            {
                label: 'Năng khiếu',
                children: [
                    { name: 'Âm nhạc (Đàn)', subject_id: 20 },
                    { name: 'Hội hoạ (Vẽ)', subject_id: 21 },
                    { name: 'Đánh cờ', subject_id: 22 },
                ]
            }
        ]
    }
]

const moreMenu = [
    { label: 'Tuyển dụng', path: '/recruitment' },
    { label: 'Giới thiệu', path: '/about' },
    { label: 'Blog', path: '/blog' },
    { label: 'Hỏi đáp', path: '/faq' },
]

const NavBar = ({ handleScrollToTop }) => {
    const [openMenu, setOpenMenu] = useState(null)
    const [openSubMenu, setOpenSubMenu] = useState(null)

    const handleMenuEnter = (menu) => setOpenMenu(menu)
    const handleMenuLeave = () => {
        // LOẠI BỎ setTimeout: Đóng ngay lập tức khi chuột rời khỏi vùng chứa menu cấp 1
        setOpenMenu(null);
        setOpenSubMenu(null);
    }
    const handleSubMenuEnter = (sub) => setOpenSubMenu(sub)
    const handleSubMenuLeave = () => {
        // LOẠI BỎ setTimeout: Đóng menu cấp 2 ngay lập tức khi chuột rời khỏi vùng chứa menu cấp 2
        setOpenSubMenu(null)
    }

    return (
        <header className="border-b border-blue-100 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                {/* Logo */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 cursor-pointer select-none hover:opacity-90"
                >
                    <Link to="/" className="flex items-center gap-2">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white font-bold">T</span>
                        <span className="text-lg font-semibold">TutorLink</span>
                    </Link>
                </motion.div>

                {/* Main menu */}
                <nav className="flex items-center gap-6 text-sm relative">
                    {/* Dropdown Menu Items */}
                    {menuData.map((menu) => (
                        <div
                            key={menu.label}
                            className="relative"
                            onMouseEnter={() => handleMenuEnter(menu.label)}
                            onMouseLeave={handleMenuLeave}
                        >
                            {menu.path ? (
                                <Link to={menu.path} className={`flex items-center gap-1 px-2 py-1 hover:text-orange-600 ${openMenu === menu.label ? 'text-orange-600' : ''}`}>{menu.label}</Link>
                            ) : (
                                <button className={`flex items-center gap-1 px-2 py-1 hover:text-orange-600 ${openMenu === menu.label ? 'text-orange-600' : ''}`}>
                                    {menu.label}
                                    <span className="ml-1 text-xs">▼</span>
                                </button>
                            )}
                            {/* Dropdown cấp 1 */}
                            <AnimatePresence>
                                {openMenu === menu.label && menu.children && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute left-0 top-full mt-2 bg-white rounded shadow-xl border border-gray-100 min-w-[200px] z-20 flex p-1"
                                    >
                                        <div className="flex flex-col w-full">
                                            {menu.children.map((sub) => (
                                                <div
                                                    key={sub.label}
                                                    className="relative"
                                                    onMouseEnter={() => handleSubMenuEnter(sub.label)}
                                                    onMouseLeave={handleSubMenuLeave}
                                                >
                                                    <button className={`flex items-center justify-between w-full px-3 py-2 text-left rounded hover:bg-orange-50 ${openSubMenu === sub.label ? 'text-orange-600 bg-orange-50' : ''}`}>
                                                        {sub.label}
                                                        <span className="ml-2 text-xs">►</span>
                                                    </button>
                                                    {/* Dropdown cấp 2 */}
                                                    <AnimatePresence>
                                                        {openSubMenu === sub.label && sub.children && (
                                                            <motion.div
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: -10 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="absolute left-full -top-2 bg-white rounded shadow-xl border border-gray-100 min-w-[180px] z-30 py-1"
                                                            >
                                                                {sub.children.map((item) => (
                                                                    <Link to={`/search?subject_id=${item.subject_id}`} key={item.subject_id} className="block w-full text-left px-4 py-2 hover:bg-orange-50">
                                                                        {item.name}
                                                                    </Link>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}

                    {/* Static menu items */}
                    <Link to="/contact" className="px-2 py-1 hover:text-orange-600">Liên hệ</Link>

                    {/* More menu (3 dots) */}
                    <div
                        className="relative"
                        onMouseEnter={() => setOpenMenu('more')}
                        onMouseLeave={handleMenuLeave} // Áp dụng hàm đóng tức thì
                    >
                        <button className={`flex items-center gap-1 px-2 py-1 hover:text-orange-600 ${openMenu === 'more' ? 'text-orange-600' : ''}`}>
                            <span className="text-xl">⋯</span>
                        </button>
                        <AnimatePresence>
                            {openMenu === 'more' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 top-full mt-2 bg-white rounded shadow-xl border border-gray-100 min-w-[150px] z-20 py-1"
                                >
                                    {moreMenu.map((item) => (
                                        <Link to={item.path} key={item.label} className="block w-full text-left px-4 py-2 hover:text-orange-600 hover:bg-orange-50">
                                            {item.label}
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </nav>

                {/* Auth buttons */}
                <div className="flex items-center gap-3">
                    <Link to="/login">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="cursor-pointer px-3 py-2 text-sm font-medium rounded-md hover:bg-blue-50"
                        >
                            Đăng nhập
                        </motion.button>
                    </Link>
                    <Link to="/register">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="cursor-pointer px-3 py-2 text-sm font-medium rounded-md bg-orange-500 text-white hover:bg-orange-600"
                        >
                            Đăng ký
                        </motion.button>
                    </Link>
                </div>
            </div>
        </header>
    )
}

export default NavBar
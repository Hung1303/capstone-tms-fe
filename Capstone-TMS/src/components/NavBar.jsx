import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion' // eslint-disable-line no-unused-vars
import { Link, useNavigate } from 'react-router-dom'
import { DashboardOutlined, LogoutOutlined, ShoppingCartOutlined, UserOutlined, WalletOutlined } from '@ant-design/icons'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../contexts/AuthContext'

// ... (menuData và moreMenu giữ nguyên) ...

const menuData = [
    {
        label: 'Trung tâm',
        path: '/centers',
    },
    {
        label: 'Các khóa học',
        path: '/courses',
    }
]

const moreMenu = [
    { label: 'Tuyển dụng', path: '/recruitment' },
    { label: 'Giới thiệu', path: '/about' },
    { label: 'Blog', path: '/blog' },
    { label: 'Hỏi đáp', path: '/faq' },
]

const NavBar = () => {
    const [openMenu, setOpenMenu] = useState(null)
    const [openSubMenu, setOpenSubMenu] = useState(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const { cartItems } = useCart()
    const { user, logout } = useAuth()

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

    const handleLogout = () => {
        logout()
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(".dropdown-wrapper")) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

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
                    <Link to="/cart" className="relative">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="cursor-pointer px-3 py-2 text-sm font-medium rounded-md hover:bg-blue-50 flex items-center gap-2"
                        >
                            <ShoppingCartOutlined />
                            Giỏ hàng
                            {cartItems.length > 0 && (
                                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-white bg-orange-500 rounded-full">
                                    {cartItems.length}
                                </span>
                            )}
                        </motion.button>
                    </Link>

                    {user ? (
                        <>
                            <div className="relative dropdown-wrapper">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center space-x-2 focus:outline-none rounded-full hover:bg-gray-100 px-2 py-1"
                                >
                                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold text-lg">
                                        {user.fullName.charAt(0)}
                                    </span>
                                    <span className="font-medium text-gray-800">{user.fullName}</span>
                                    <svg
                                        className={`w-4 h-4 ml-1 transition-transform duration-200 ${isDropdownOpen ? "rotate-180 text-blue-600" : "text-gray-500"
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                                        <button
                                            onClick={() => navigate("/parent")}
                                            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        >
                                            <DashboardOutlined className="mr-2 h-4 w-4" />
                                            Dashboard
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100"
                                        >
                                            <LogoutOutlined className="mr-2 h-4 w-4" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
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
                        </>
                    )
                    }
                </div>
            </div>
        </header>
    )
}

export default NavBar
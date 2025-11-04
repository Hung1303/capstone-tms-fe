import { useState } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  DollarOutlined,
  BellOutlined,
  StarOutlined
} from '@ant-design/icons'

// Menu configuration cho từng role
const ROLE_MENUS = {
  admin: [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: '/admin'
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Quản lý người dùng',
      path: '/admin/users'
    },
    {
      key: '/admin/centers',
      icon: <TeamOutlined />,
      label: 'Quản lý trung tâm',
      path: '/admin/centers'
    },
    {
      key: '/admin/students',
      icon: <UserOutlined />,
      label: 'Quản lý học sinh',
      path: '/admin/students'
    },
    {
      key: '/admin/classes',
      icon: <BookOutlined />,
      label: 'Quản lý lớp học',
      path: '/admin/classes'
    },
    {
      key: '/admin/schedule',
      icon: <CalendarOutlined />,
      label: 'Lịch học',
      path: '/admin/schedule'
    },
    {
      key: '/admin/reports',
      icon: <BarChartOutlined />,
      label: 'Báo cáo',
      path: '/admin/reports'
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      path: '/admin/settings'
    }
  ],
  staff: [
    {
      key: '/staff',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: '/staff'
    },
    {
      key: '/staff/centers',
      icon: <TeamOutlined />,
      label: 'Xác thực trung tâm',
      path: '/staff/centers'
    },
    {
      key: '/staff/courses',
      icon: <BookOutlined />,
      label: 'Xác thực khóa học',
      path: '/staff/courses'
    },
    {
      key: '/staff/students',
      icon: <UserOutlined />,
      label: 'Xác thực học sinh',
      path: '/staff/students'
    },
    {
      key: '/staff/schedule',
      icon: <CalendarOutlined />,
      label: 'Lịch làm việc',
      path: '/staff/schedule'
    },
    {
      key: '/staff/reports',
      icon: <BarChartOutlined />,
      label: 'Báo cáo',
      path: '/staff/reports'
    }
  ],
  center: [
    {
      key: '/center',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: '/center'
    },
    {
      key: '/center/courses',
      icon: <BookOutlined />,
      label: 'Quản lý khóa học',
      path: '/center/courses'
    },
    {
      key: '/center/teachers',
      icon: <TeamOutlined />,
      label: 'Quản lý giáo viên',
      path: '/center/teachers'
    },
    {
      key: '/center/students',
      icon: <UserOutlined />,
      label: 'Quản lý học sinh',
      path: '/center/students'
    },
    {
      key: '/center/schedule',
      icon: <CalendarOutlined />,
      label: 'Lịch học',
      path: '/center/schedule'
    },
    {
      key: '/center/revenue',
      icon: <DollarOutlined />,
      label: 'Doanh thu',
      path: '/center/revenue'
    },
    {
      key: '/center/subscription',
      icon: <StarOutlined />,
      label: 'Gói đăng ký',
      path: '/center/subscription'
    }
  ],
  teacher: [
    {
      key: '/teacher',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: '/teacher'
    },
    {
      key: '/teacher/courses',
      icon: <BookOutlined />,
      label: 'Khóa học của tôi',
      path: '/teacher/courses'
    },
    {
      key: '/teacher/students',
      icon: <UserOutlined />,
      label: 'Học sinh',
      path: '/teacher/students'
    },
    {
      key: '/teacher/schedule',
      icon: <CalendarOutlined />,
      label: 'Lịch dạy',
      path: '/teacher/schedule'
    },
    {
      key: '/teacher/attendance',
      icon: <CheckCircleOutlined />,
      label: 'Điểm danh',
      path: '/teacher/attendance'
    },
    {
      key: '/teacher/grading',
      icon: <FileTextOutlined />,
      label: 'Chấm điểm',
      path: '/teacher/grading'
    },
    {
      key: '/teacher/materials',
      icon: <FileTextOutlined />,
      label: 'Tài liệu',
      path: '/teacher/materials'
    }
  ],
  parent: [
    {
      key: '/parent',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: '/parent'
    },
    {
      key: '/parent/children',
      icon: <UserOutlined />,
      label: 'Quản lý con',
      path: '/parent/children'
    },
    {
      key: '/parent/courses',
      icon: <BookOutlined />,
      label: 'Đăng ký khóa học',
      path: '/parent/courses'
    },
    {
      key: '/parent/schedule',
      icon: <CalendarOutlined />,
      label: 'Lịch học',
      path: '/parent/schedule'
    },
    {
      key: '/parent/grades',
      icon: <FileTextOutlined />,
      label: 'Kết quả học tập',
      path: '/parent/grades'
    },
    {
      key: '/parent/payments',
      icon: <DollarOutlined />,
      label: 'Thanh toán',
      path: '/parent/payments'
    },
    {
      key: '/parent/notifications',
      icon: <BellOutlined />,
      label: 'Thông báo',
      path: '/parent/notifications'
    }
  ],
  student: [
    {
      key: '/student',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: '/student'
    },
    {
      key: '/student/courses',
      icon: <BookOutlined />,
      label: 'Khóa học của tôi',
      path: '/student/courses'
    },
    {
      key: '/student/schedule',
      icon: <CalendarOutlined />,
      label: 'Lịch học',
      path: '/student/schedule'
    },
    {
      key: '/student/grades',
      icon: <FileTextOutlined />,
      label: 'Điểm số',
      path: '/student/grades'
    },
    {
      key: '/student/attendance',
      icon: <CheckCircleOutlined />,
      label: 'Điểm danh',
      path: '/student/attendance'
    },
    {
      key: '/student/homework',
      icon: <FileTextOutlined />,
      label: 'Bài tập',
      path: '/student/homework'
    },
    {
      key: '/student/materials',
      icon: <FileTextOutlined />,
      label: 'Tài liệu',
      path: '/student/materials'
    }
  ]
}

const AdminLayout = () => {
  // const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Lấy menu items dựa trên role
  const menuItems = ROLE_MENUS[user?.role] || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-30 w-64">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-lg font-semibold text-gray-800">TutorLink</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.key}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-orange-100 text-orange-700 border-r-2 border-orange-500' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogoutOutlined />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="transition-all duration-300 ml-64">
        {/* Header */}
        {/* <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </button>
              <h1 className="text-xl font-semibold text-gray-800">
                {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <HomeOutlined />
                <span>Về trang chủ</span>
              </Link>
            </div>
          </div>
        </header> */}

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

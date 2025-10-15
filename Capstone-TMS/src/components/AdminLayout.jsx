import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
  HomeOutlined
} from '@ant-design/icons'

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return [
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
      ]
    } else if (user?.role === 'staff') {
      return [
        {
          key: '/staff',
          icon: <DashboardOutlined />,
          label: 'Dashboard',
          path: '/staff'
        },
        {
          key: '/staff/students',
          icon: <UserOutlined />,
          label: 'Quản lý học sinh',
          path: '/staff/students'
        },
        {
          key: '/staff/classes',
          icon: <BookOutlined />,
          label: 'Quản lý lớp học',
          path: '/staff/classes'
        },
        {
          key: '/staff/schedule',
          icon: <CalendarOutlined />,
          label: 'Lịch học',
          path: '/staff/schedule'
        },
        {
          key: '/staff/reports',
          icon: <BarChartOutlined />,
          label: 'Báo cáo',
          path: '/staff/reports'
        }
      ]
    }
    return []
  }

  const menuItems = getMenuItems()

  const filteredMenuItems = menuItems

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            {!collapsed && (
              <span className="text-lg font-semibold text-gray-800">TutorLink</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {filteredMenuItems.map((item) => {
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
                {!collapsed && <span className="font-medium">{item.label}</span>}
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
            {!collapsed && (
              <div>
                <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogoutOutlined />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </button>
              <h1 className="text-xl font-semibold text-gray-800">
                {filteredMenuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
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
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

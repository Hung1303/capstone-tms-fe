import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { 
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  DollarOutlined,
  BellOutlined,
  StarOutlined,
  GiftOutlined,
  EnvironmentOutlined,
  MessageOutlined
} from '@ant-design/icons'

// Menu configuration cho từng role
const ROLE_MENUS = {
  Admin: [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: '/admin'
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Quản lý tài khoản',
      path: '/admin/users'
    },
    {
      key: '/admin/centers',
      icon: <TeamOutlined />,
      label: 'Quản lý trung tâm',
      path: '/admin/centers'
    },
    {
      key: '/admin/courses',
      icon: <BookOutlined />,
      label: 'Quản lý khóa học',
      path: '/admin/courses'
    },
    {
      key: '/admin/classes',
      icon: <BookOutlined />,
      label: 'Quản lý lớp học',
      path: '/admin/classes'
    },
    {
      key: '/admin/subjects',
      icon: <BookOutlined />,
      label: 'Quản lý môn học',
      path: '/admin/subjects'
    },
    {
      key: '/admin/subscriptions',
      icon: <GiftOutlined />,
      label: 'Quản lý gói',
      path: '/admin/subscriptions'
    },
    {
      key: '/admin/feedbacks',
      icon: <MessageOutlined />,
      label: 'Danh sách Feedback',
      path: '/admin/feedbacks'
    },
    // {
    //   key: '/admin/schedule',
    //   icon: <CalendarOutlined />,
    //   label: 'Lịch học',
    //   path: '/admin/schedule'
    // },
    // {
    //   key: '/admin/reports',
    //   icon: <BarChartOutlined />,
    //   label: 'Báo cáo',
    //   path: '/admin/reports'
    // },
    // {
    //   key: '/admin/course-approval',
    //   icon: <CheckCircleOutlined />,
    //   label: 'Duyệt khóa học',
    //   path: '/admin/course-approval'
    // },
  ],
  Staff: [
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
      key: '/staff/course-confirmation',
      icon: <CheckCircleOutlined />,
      label: 'Xác thực khóa học',
      path: '/staff/course-confirmation'
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
  Inspector: [
    {
      key: '/inspector',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: '/inspector'
    },
    {
      key: '/inspector/center',
      icon: <TeamOutlined />,
      label: 'Xác thực trung tâm',
      path: '/inspector/center'
    },
    {
      key: '/inspector/course-approval',
      icon: <CheckCircleOutlined />,
      label: 'Duyệt khóa học',
      path: '/inspector/course-approval'
    },
    {
      key: '/inspector/feedbacks',
      icon: <MessageOutlined />,
      label: 'Danh sách Feedback',
      path: '/inspector/feedbacks'
    },
  ],
  Center: [
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
      key: '/center/subscription',
      icon: <GiftOutlined />,
      label: 'Gói dịch vụ',
      path: '/center/subscription'
    },
    {
      key: '/center/teachers',
      icon: <TeamOutlined />,
      label: 'Quản lý giáo viên',
      path: '/center/teachers'
    },
    {
      key: '/center/enrollments',
      icon: <UserOutlined />,
      label: 'Quản lý học sinh',
      path: '/center/enrollments'
    },
    {
      key: '/center/schedule',
      icon: <CalendarOutlined />,
      label: 'Lên lịch',
      path: '/center/schedule'
    },
    {
      key: '/center/feedbacks',
      icon: <MessageOutlined />,
      label: 'Danh sách Feedback',
      path: '/center/feedbacks'
    }
  ],
  Teacher: [
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
      key: '/teacher/schedule',
      icon: <CalendarOutlined />,
      label: 'Lịch dạy',
      path: '/teacher/schedule'
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
    },
    {
      key: '/teacher/feedbacks',
      icon: <MessageOutlined />,
      label: 'Feedback của tôi',
      path: '/teacher/feedbacks'
    }
  ],
  Parent: [
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
      key: '/parent/centers',
      icon: <TeamOutlined />,
      label: 'Danh sách trung tâm',
      path: '/parent/centers'
    },
    {
      key: '/parent/courses',
      icon: <BookOutlined />,
      label: 'Danh sách khóa học',
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
    }
  ],
  Student: [
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
    // {
    //   key: '/student/attendance',
    //   icon: <CheckCircleOutlined />,
    //   label: 'Điểm danh',
    //   path: '/student/attendance'
    // },
    // {
    //   key: '/student/homework',
    //   icon: <FileTextOutlined />,
    //   label: 'Bài tập',
    //   path: '/student/homework'
    // },
    // {
    //   key: '/student/materials',
    //   icon: <FileTextOutlined />,
    //   label: 'Tài liệu',
    //   path: '/student/materials'
    // }
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
                {user?.fullName?.charAt(0) || 'U'}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800">{user?.fullName}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="cursor-pointer flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogoutOutlined />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="transition-all duration-300 ml-64">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
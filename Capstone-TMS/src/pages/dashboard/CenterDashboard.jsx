import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  BookOutlined, 
  UserOutlined, 
  DollarOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  TeamOutlined
} from '@ant-design/icons'

const CenterDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    pendingCourses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    monthlyRevenue: 0,
    subscriptionPostsLeft: 0,
    subscriptionPackage: ''
  })

  const [recentActivities, setRecentActivities] = useState([])
  const [pendingActions, setPendingActions] = useState([])

  useEffect(() => {
    // Mock data - sẽ thay bằng API call
    setStats({
      totalCourses: 15,
      activeCourses: 12,
      pendingCourses: 3,
      totalStudents: 156,
      totalTeachers: 8,
      monthlyRevenue: 45000000,
      subscriptionPostsLeft: user?.subscription?.postsLimit - user?.subscription?.postsUsed || 75,
      subscriptionPackage: user?.subscription?.package || 'premium'
    })

    setRecentActivities([
      { id: 1, type: 'student', message: 'Học sinh mới đăng ký khóa IELTS Foundation', time: '30 phút trước' },
      { id: 2, type: 'course', message: 'Khóa học "IELTS Advanced" đã được staff verify', time: '2 giờ trước' },
      { id: 3, type: 'teacher', message: 'Giáo viên Nguyễn Thị A đã ký vào khóa học mới', time: '4 giờ trước' },
      { id: 4, type: 'payment', message: 'Nhận thanh toán từ phụ huynh Trần Văn B', time: '5 giờ trước' }
    ])

    setPendingActions([
      { id: 1, type: 'student_verify', message: 'Có 3 học sinh đã được staff verify, cần xác nhận', count: 3 },
      { id: 2, type: 'course_publish', message: 'Có 2 khóa học đã được staff confirm, có thể đăng', count: 2 },
      { id: 3, type: 'teacher_assign', message: 'Có 1 khóa học chưa assign giáo viên', count: 1 }
    ])
  }, [user])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getPackageColor = (pkg) => {
    const colors = {
      basic: 'blue',
      standard: 'green',
      premium: 'purple',
      enterprise: 'orange'
    }
    return colors[pkg] || 'gray'
  }

  const statCards = [
    {
      title: 'Tổng khóa học',
      value: stats.totalCourses,
      icon: <BookOutlined className="text-2xl text-blue-500" />,
      color: 'blue',
      change: '+3 khóa mới'
    },
    {
      title: 'Khóa học đang hoạt động',
      value: stats.activeCourses,
      icon: <CheckCircleOutlined className="text-2xl text-green-500" />,
      color: 'green',
      change: 'Đang diễn ra'
    },
    {
      title: 'Khóa học chờ duyệt',
      value: stats.pendingCourses,
      icon: <ClockCircleOutlined className="text-2xl text-orange-500" />,
      color: 'orange',
      change: 'Cần xử lý'
    },
    {
      title: 'Tổng học sinh',
      value: stats.totalStudents,
      icon: <UserOutlined className="text-2xl text-purple-500" />,
      color: 'purple',
      change: '+12 học sinh mới'
    },
    {
      title: 'Giáo viên',
      value: stats.totalTeachers,
      icon: <TeamOutlined className="text-2xl text-teal-500" />,
      color: 'teal',
      change: 'Đang hoạt động'
    },
    {
      title: 'Doanh thu tháng',
      value: formatCurrency(stats.monthlyRevenue),
      icon: <DollarOutlined className="text-2xl text-indigo-500" />,
      color: 'indigo',
      change: '+18% so với tháng trước'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Chào mừng, {user?.name || 'Trung tâm'}!</h2>
        <p className="text-orange-100 mb-4">
          Quản lý khóa học và học sinh của trung tâm
        </p>
        <div className="flex items-center gap-4 text-sm">
          <div className="bg-white/20 px-4 py-2 rounded-lg">
            <span className="font-semibold">Gói: </span>
            <span className="uppercase">{stats.subscriptionPackage}</span>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-lg">
            <span className="font-semibold">Bài đăng còn lại: </span>
            <span>{stats.subscriptionPostsLeft}</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.change}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${card.color}-50`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending actions alert */}
      {pendingActions.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
            <ClockCircleOutlined className="mr-2" />
            Cần xử lý ({pendingActions.reduce((sum, item) => sum + item.count, 0)})
          </h3>
          <div className="space-y-2">
            {pendingActions.map((action) => (
              <div key={action.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-700 font-semibold text-sm">{action.count}</span>
                  </div>
                  <span className="text-sm text-gray-800">{action.message}</span>
                </div>
                <button className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors">
                  Xử lý
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent activities and quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
              <div className="text-blue-600 font-medium text-sm mb-1">Tạo khóa học</div>
              <div className="text-xs text-gray-600">Thêm khóa học mới</div>
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
              <div className="text-green-600 font-medium text-sm mb-1">Quản lý giáo viên</div>
              <div className="text-xs text-gray-600">Assign giáo viên</div>
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
              <div className="text-purple-600 font-medium text-sm mb-1">Xem học sinh</div>
              <div className="text-xs text-gray-600">Danh sách học sinh</div>
            </button>
            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors">
              <div className="text-orange-600 font-medium text-sm mb-1">Nâng cấp gói</div>
              <div className="text-xs text-gray-600">Upgrade subscription</div>
            </button>
            <button className="p-4 bg-teal-50 hover:bg-teal-100 rounded-lg text-left transition-colors">
              <div className="text-teal-600 font-medium text-sm mb-1">Lịch học</div>
              <div className="text-xs text-gray-600">Quản lý lịch học</div>
            </button>
            <button className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-left transition-colors">
              <div className="text-indigo-600 font-medium text-sm mb-1">Báo cáo</div>
              <div className="text-xs text-gray-600">Xem doanh thu</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CenterDashboard

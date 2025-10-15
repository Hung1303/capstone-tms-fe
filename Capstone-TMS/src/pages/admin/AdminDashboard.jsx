import { useState, useEffect } from 'react'
import { 
  UserOutlined, 
  TeamOutlined, 
  BookOutlined, 
  CalendarOutlined,
  // TrendingUpOutlined,
  DollarOutlined
} from '@ant-design/icons'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCenters: 0,
    totalClasses: 0,
    totalRevenue: 0,
    activeStudents: 0,
    completedClasses: 0
  })

  const [recentActivities, setRecentActivities] = useState([])

  useEffect(() => {
    // Mock data - trong thực tế sẽ gọi API
    setStats({
      totalUsers: 1247,
      totalCenters: 89,
      totalClasses: 156,
      totalRevenue: 12500000,
      activeStudents: 892,
      completedClasses: 2341
    })

    setRecentActivities([
      { id: 1, type: 'registration', message: 'Trung tâm ABC đăng ký mới', time: '2 giờ trước' },
      { id: 2, type: 'class', message: 'Lớp Toán 12A bắt đầu', time: '4 giờ trước' },
      { id: 3, type: 'payment', message: 'Thanh toán từ học sinh Nguyễn Văn A', time: '6 giờ trước' },
      { id: 4, type: 'review', message: 'Đánh giá mới cho trung tâm XYZ', time: '8 giờ trước' }
    ])
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const statCards = [
    {
      title: 'Tổng người dùng',
      value: stats.totalUsers.toLocaleString(),
      icon: <UserOutlined className="text-2xl text-blue-500" />,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Trung tâm đăng ký',
      value: stats.totalCenters.toLocaleString(),
      icon: <TeamOutlined className="text-2xl text-green-500" />,
      color: 'green',
      change: '+8%'
    },
    {
      title: 'Lớp học hoạt động',
      value: stats.totalClasses.toLocaleString(),
      icon: <BookOutlined className="text-2xl text-orange-500" />,
      color: 'orange',
      change: '+15%'
    },
    {
      title: 'Doanh thu tháng',
      value: formatCurrency(stats.totalRevenue),
      icon: <DollarOutlined className="text-2xl text-purple-500" />,
      color: 'purple',
      change: '+23%'
    },
    {
      title: 'Học sinh hoạt động',
      value: stats.activeStudents.toLocaleString(),
      icon: <CalendarOutlined className="text-2xl text-teal-500" />,
      color: 'teal',
      change: '+18%'
    },
    {
      title: 'Lớp đã hoàn thành',
      value: stats.completedClasses.toLocaleString(),
      // icon: <TrendingUpOutlined className="text-2xl text-indigo-500" />,
      color: 'indigo',
      change: '+25%'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-orange-500 to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Chào mừng trở lại!</h2>
        <p className="text-orange-100">
          Tổng quan về hoạt động của nền tảng TutorLink
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-green-600 mt-1">{card.change} so với tháng trước</p>
              </div>
              <div className={`p-3 rounded-lg bg-${card.color}-50`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activities and quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
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
              <div className="text-blue-600 font-medium text-sm">Thêm trung tâm</div>
              <div className="text-xs text-gray-600 mt-1">Đăng ký trung tâm mới</div>
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
              <div className="text-green-600 font-medium text-sm">Tạo lớp học</div>
              <div className="text-xs text-gray-600 mt-1">Thêm lớp học mới</div>
            </button>
            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors">
              <div className="text-orange-600 font-medium text-sm">Xem báo cáo</div>
              <div className="text-xs text-gray-600 mt-1">Báo cáo chi tiết</div>
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
              <div className="text-purple-600 font-medium text-sm">Quản lý người dùng</div>
              <div className="text-xs text-gray-600 mt-1">Danh sách người dùng</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

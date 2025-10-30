import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  UserOutlined, 
  BookOutlined, 
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  BellOutlined,
  FileTextOutlined,
  TeamOutlined
} from '@ant-design/icons'

const ParentDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalChildren: 0,
    enrolledCourses: 0,
    upcomingClasses: 0,
    totalPayments: 0,
    pendingPayments: 0,
    notifications: 0
  })

  const [children, setChildren] = useState([])
  const [upcomingSchedule, setUpcomingSchedule] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Mock data - sẽ thay bằng API call
    const childrenData = user?.parentInfo?.children || []
    const enrolledCourses = user?.parentInfo?.enrolledCourses || []
    
    setStats({
      totalChildren: childrenData.length,
      enrolledCourses: enrolledCourses.length,
      upcomingClasses: 8,
      totalPayments: 15000000,
      pendingPayments: 2500000,
      notifications: 3
    })

    setChildren(childrenData.map(child => ({
      ...child,
      courses: enrolledCourses.filter(c => c.studentId === child.id),
      attendance: 92,
      averageGrade: 8.5
    })))

    setUpcomingSchedule([
      { id: 1, childName: 'Nguyễn Văn Con', course: 'IELTS Foundation', date: 'Thứ 2, 15/01', time: '18:00 - 20:00', teacher: 'Cô Hoa' },
      { id: 2, childName: 'Nguyễn Văn Con', course: 'IELTS Foundation', date: 'Thứ 4, 17/01', time: '18:00 - 20:00', teacher: 'Cô Hoa' },
      { id: 3, childName: 'Nguyễn Thị Con Gái', course: 'Toán Tư Duy', date: 'Thứ 3, 16/01', time: '14:00 - 16:00', teacher: 'Thầy Minh' }
    ])

    setRecentActivities([
      { id: 1, message: 'Nguyễn Văn Con đã hoàn thành bài kiểm tra giữa kỳ - Điểm: 8.5', time: '2 giờ trước' },
      { id: 2, message: 'Thanh toán học phí khóa IELTS Foundation thành công', time: '1 ngày trước' },
      { id: 3, message: 'Giáo viên Cô Hoa gửi nhận xét về Nguyễn Văn Con', time: '2 ngày trước' },
      { id: 4, message: 'Nguyễn Thị Con Gái vắng mặt có phép ngày 10/01', time: '5 ngày trước' }
    ])

    setNotifications([
      { id: 1, type: 'payment', message: 'Học phí khóa IELTS Foundation sắp đến hạn', priority: 'high', time: '1 giờ trước' },
      { id: 2, type: 'grade', message: 'Điểm kiểm tra mới của Nguyễn Văn Con đã được cập nhật', priority: 'normal', time: '3 giờ trước' },
      { id: 3, type: 'schedule', message: 'Lịch học tuần sau có thay đổi', priority: 'normal', time: '1 ngày trước' }
    ])
  }, [user])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'red',
      normal: 'blue',
      low: 'gray'
    }
    return colors[priority] || 'gray'
  }

  const statCards = [
    {
      title: 'Tổng số con',
      value: stats.totalChildren,
      icon: <UserOutlined className="text-2xl text-blue-500" />,
      color: 'blue',
      change: 'Đang quản lý'
    },
    {
      title: 'Khóa học đã đăng ký',
      value: stats.enrolledCourses,
      icon: <BookOutlined className="text-2xl text-green-500" />,
      color: 'green',
      change: 'Đang học'
    },
    {
      title: 'Lớp học sắp tới',
      value: stats.upcomingClasses,
      icon: <CalendarOutlined className="text-2xl text-purple-500" />,
      color: 'purple',
      change: 'Tuần này'
    },
    {
      title: 'Tổng chi phí',
      value: formatCurrency(stats.totalPayments),
      icon: <DollarOutlined className="text-2xl text-orange-500" />,
      color: 'orange',
      change: 'Đã thanh toán'
    },
    {
      title: 'Học phí chờ thanh toán',
      value: formatCurrency(stats.pendingPayments),
      icon: <DollarOutlined className="text-2xl text-red-500" />,
      color: 'red',
      change: 'Cần thanh toán'
    },
    {
      title: 'Thông báo mới',
      value: stats.notifications,
      icon: <BellOutlined className="text-2xl text-teal-500" />,
      color: 'teal',
      change: 'Chưa đọc'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Chào mừng, {user?.name || 'Phụ huynh'}!</h2>
        <p className="text-purple-100 mb-3">
          Theo dõi quá trình học tập của con bạn
        </p>
        <div className="flex items-center gap-4 text-sm">
          <div className="bg-white/20 px-4 py-2 rounded-lg">
            <span className="font-semibold">Số con: </span>
            <span>{stats.totalChildren}</span>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-lg">
            <span className="font-semibold">Khóa học: </span>
            <span>{stats.enrolledCourses}</span>
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

      {/* Notifications alert */}
      {notifications.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <BellOutlined className="mr-2" />
            Thông báo quan trọng ({notifications.length})
          </h3>
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div key={notif.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-2 h-2 bg-${getPriorityColor(notif.priority)}-500 rounded-full`}></div>
                  <div className="flex-1">
                    <span className="text-sm text-gray-800 block">{notif.message}</span>
                    <span className="text-xs text-gray-500">{notif.time}</span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
                  Xem
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Children overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TeamOutlined className="mr-2 text-purple-500" />
          Thông tin con em
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {children.map((child) => (
            <div key={child.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{child.name}</h4>
                  <p className="text-sm text-gray-600">{child.grade} • {child.school}</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                  {child.courses?.length || 0} khóa học
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white p-2 rounded">
                  <div className="text-gray-600 text-xs">Điểm danh</div>
                  <div className="font-semibold text-green-600">{child.attendance}%</div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="text-gray-600 text-xs">Điểm TB</div>
                  <div className="font-semibold text-blue-600">{child.averageGrade}/10</div>
                </div>
              </div>
              <button className="mt-3 w-full py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors">
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming schedule and recent activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming schedule */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarOutlined className="mr-2 text-green-500" />
            Lịch học sắp tới
          </h3>
          <div className="space-y-3">
            {upcomingSchedule.map((schedule) => (
              <div key={schedule.id} className="p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-100">
                <div className="font-semibold text-gray-900 text-sm">{schedule.childName}</div>
                <div className="text-sm text-gray-700 mt-1">{schedule.course}</div>
                <div className="flex items-center gap-3 text-xs text-gray-600 mt-2">
                  <span>📅 {schedule.date}</span>
                  <span>🕐 {schedule.time}</span>
                  <span>👨‍🏫 {schedule.teacher}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
            <div className="text-blue-600 font-medium text-sm mb-1">Đăng ký khóa học</div>
            <div className="text-xs text-gray-600">Tìm khóa học mới</div>
          </button>
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
            <div className="text-green-600 font-medium text-sm mb-1">Thanh toán</div>
            <div className="text-xs text-gray-600">Thanh toán học phí</div>
          </button>
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
            <div className="text-purple-600 font-medium text-sm mb-1">Xem điểm</div>
            <div className="text-xs text-gray-600">Kết quả học tập</div>
          </button>
          <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors">
            <div className="text-orange-600 font-medium text-sm mb-1">Lịch học</div>
            <div className="text-xs text-gray-600">Xem lịch đầy đủ</div>
          </button>
          <button className="p-4 bg-teal-50 hover:bg-teal-100 rounded-lg text-left transition-colors">
            <div className="text-teal-600 font-medium text-sm mb-1">Liên hệ GV</div>
            <div className="text-xs text-gray-600">Nhắn tin giáo viên</div>
          </button>
          <button className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-left transition-colors">
            <div className="text-indigo-600 font-medium text-sm mb-1">Điểm danh</div>
            <div className="text-xs text-gray-600">Xem điểm danh</div>
          </button>
          <button className="p-4 bg-pink-50 hover:bg-pink-100 rounded-lg text-left transition-colors">
            <div className="text-pink-600 font-medium text-sm mb-1">Lịch sử TT</div>
            <div className="text-xs text-gray-600">Xem thanh toán</div>
          </button>
          <button className="p-4 bg-red-50 hover:bg-red-100 rounded-lg text-left transition-colors">
            <div className="text-red-600 font-medium text-sm mb-1">Thêm con</div>
            <div className="text-xs text-gray-600">Thêm học sinh</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ParentDashboard

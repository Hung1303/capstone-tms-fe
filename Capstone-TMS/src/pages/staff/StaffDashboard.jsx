import { useState, useEffect } from 'react'
import { 
  UserOutlined, 
  BookOutlined, 
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'

const StaffDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeClasses: 0,
    completedClasses: 0,
    pendingTasks: 0,
    todaySchedule: 0,
    thisWeekSchedule: 0
  })

  const [recentActivities, setRecentActivities] = useState([])
  const [todaySchedule, setTodaySchedule] = useState([])

  useEffect(() => {
    // Mock data - trong thực tế sẽ gọi API
    setStats({
      totalStudents: 45,
      activeClasses: 12,
      completedClasses: 8,
      pendingTasks: 3,
      todaySchedule: 5,
      thisWeekSchedule: 18
    })

    setRecentActivities([
      { id: 1, type: 'class', message: 'Lớp Toán 12A đã hoàn thành', time: '1 giờ trước' },
      { id: 2, type: 'student', message: 'Học sinh Nguyễn Văn A đăng ký mới', time: '2 giờ trước' },
      { id: 3, type: 'schedule', message: 'Lịch học tuần tới đã được cập nhật', time: '4 giờ trước' },
      { id: 4, type: 'task', message: 'Nhiệm vụ kiểm tra bài tập đã hoàn thành', time: '6 giờ trước' }
    ])

    setTodaySchedule([
      { id: 1, time: '08:00', subject: 'Toán 12A', teacher: 'Cô Lan', students: 15, status: 'completed' },
      { id: 2, time: '10:00', subject: 'Lý 11B', teacher: 'Thầy Minh', students: 12, status: 'in-progress' },
      { id: 3, time: '14:00', subject: 'Hóa 10C', teacher: 'Cô Hương', students: 18, status: 'upcoming' },
      { id: 4, time: '16:00', subject: 'Anh 12D', teacher: 'Thầy John', students: 20, status: 'upcoming' }
    ])
  }, [])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleOutlined className="text-green-500" />
      case 'in-progress': return <ClockCircleOutlined className="text-blue-500" />
      case 'upcoming': return <ExclamationCircleOutlined className="text-orange-500" />
      default: return <ClockCircleOutlined />
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      'completed': 'Hoàn thành',
      'in-progress': 'Đang diễn ra',
      'upcoming': 'Sắp tới'
    }
    return labels[status] || status
  }

  const statCards = [
    {
      title: 'Tổng học sinh',
      value: stats.totalStudents,
      icon: <UserOutlined className="text-2xl text-blue-500" />,
      color: 'blue'
    },
    {
      title: 'Lớp đang hoạt động',
      value: stats.activeClasses,
      icon: <BookOutlined className="text-2xl text-green-500" />,
      color: 'green'
    },
    {
      title: 'Lớp đã hoàn thành',
      value: stats.completedClasses,
      icon: <CheckCircleOutlined className="text-2xl text-purple-500" />,
      color: 'purple'
    },
    {
      title: 'Nhiệm vụ chờ xử lý',
      value: stats.pendingTasks,
      icon: <ClockCircleOutlined className="text-2xl text-orange-500" />,
      color: 'orange'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Chào mừng trở lại!</h2>
        <p className="text-blue-100">
          Quản lý học sinh và lớp học của bạn
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${card.color}-50`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's schedule and recent activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's schedule */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch học hôm nay</h3>
          <div className="space-y-3">
            {todaySchedule.map((schedule) => (
              <div key={schedule.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900 w-16">{schedule.time}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{schedule.subject}</div>
                  <div className="text-xs text-gray-500">
                    {schedule.teacher} • {schedule.students} học sinh
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(schedule.status)}
                  <span className="text-xs text-gray-600">{getStatusLabel(schedule.status)}</span>
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
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
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
            <div className="text-blue-600 font-medium text-sm">Thêm học sinh</div>
            <div className="text-xs text-gray-600 mt-1">Đăng ký học sinh mới</div>
          </button>
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
            <div className="text-green-600 font-medium text-sm">Tạo lớp học</div>
            <div className="text-xs text-gray-600 mt-1">Thêm lớp học mới</div>
          </button>
          <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors">
            <div className="text-orange-600 font-medium text-sm">Xem lịch học</div>
            <div className="text-xs text-gray-600 mt-1">Quản lý lịch học</div>
          </button>
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
            <div className="text-purple-600 font-medium text-sm">Báo cáo</div>
            <div className="text-xs text-gray-600 mt-1">Xem báo cáo tiến độ</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard

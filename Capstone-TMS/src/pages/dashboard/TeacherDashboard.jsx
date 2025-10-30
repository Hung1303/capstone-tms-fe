import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  BookOutlined, 
  UserOutlined, 
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  StarOutlined,
  TeamOutlined
} from '@ant-design/icons'

const TeacherDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    assignedCourses: 0,
    activeCourses: 0,
    totalStudents: 0,
    todayClasses: 0,
    weekClasses: 0,
    pendingGrading: 0,
    rating: 0,
    completedClasses: 0
  })

  const [todaySchedule, setTodaySchedule] = useState([])
  const [pendingTasks, setPendingTasks] = useState([])
  const [recentActivities, setRecentActivities] = useState([])

  useEffect(() => {
    // Mock data - sẽ thay bằng API call
    setStats({
      assignedCourses: user?.teacherInfo?.assignedCourses?.length || 2,
      activeCourses: user?.teacherInfo?.assignedCourses?.filter(c => c.status === 'active').length || 1,
      totalStudents: user?.teacherInfo?.totalStudents || 45,
      todayClasses: 3,
      weekClasses: 12,
      pendingGrading: 8,
      rating: user?.teacherInfo?.rating || 4.8,
      completedClasses: 156
    })

    setTodaySchedule([
      { id: 1, time: '08:00 - 10:00', course: 'IELTS Foundation', class: 'Lớp A1', students: 15, room: 'Phòng 201', status: 'upcoming' },
      { id: 2, time: '14:00 - 16:00', course: 'IELTS Advanced', class: 'Lớp B2', students: 12, room: 'Phòng 305', status: 'upcoming' },
      { id: 3, time: '18:00 - 20:00', course: 'IELTS Foundation', class: 'Lớp A2', students: 18, room: 'Phòng 201', status: 'upcoming' }
    ])

    setPendingTasks([
      { id: 1, type: 'grading', message: 'Chấm bài kiểm tra giữa kỳ - IELTS Foundation', count: 15, deadline: 'Hôm nay' },
      { id: 2, type: 'attendance', message: 'Điểm danh buổi học hôm qua chưa hoàn thành', count: 2, deadline: 'Hôm nay' },
      { id: 3, type: 'course_sign', message: 'Khóa học mới cần ký xác nhận', count: 1, deadline: '2 ngày nữa' }
    ])

    setRecentActivities([
      { id: 1, message: 'Đã hoàn thành buổi học IELTS Foundation - Lớp A1', time: '2 giờ trước' },
      { id: 2, message: 'Phụ huynh Nguyễn Văn A gửi tin nhắn', time: '3 giờ trước' },
      { id: 3, message: 'Đã chấm xong bài tập tuần 5', time: '5 giờ trước' },
      { id: 4, message: 'Học sinh Trần Thị B vắng mặt có phép', time: '1 ngày trước' }
    ])
  }, [user])

  const getStatusColor = (status) => {
    const colors = {
      upcoming: 'blue',
      in_progress: 'green',
      completed: 'gray'
    }
    return colors[status] || 'gray'
  }

  const getStatusLabel = (status) => {
    const labels = {
      upcoming: 'Sắp tới',
      in_progress: 'Đang diễn ra',
      completed: 'Hoàn thành'
    }
    return labels[status] || status
  }

  const statCards = [
    {
      title: 'Khóa học được giao',
      value: stats.assignedCourses,
      icon: <BookOutlined className="text-2xl text-blue-500" />,
      color: 'blue',
      change: `${stats.activeCourses} đang hoạt động`
    },
    {
      title: 'Tổng học sinh',
      value: stats.totalStudents,
      icon: <UserOutlined className="text-2xl text-purple-500" />,
      color: 'purple',
      change: 'Đang dạy'
    },
    {
      title: 'Lớp học hôm nay',
      value: stats.todayClasses,
      icon: <CalendarOutlined className="text-2xl text-green-500" />,
      color: 'green',
      change: `${stats.weekClasses} lớp tuần này`
    },
    {
      title: 'Bài chưa chấm',
      value: stats.pendingGrading,
      icon: <FileTextOutlined className="text-2xl text-orange-500" />,
      color: 'orange',
      change: 'Cần xử lý'
    },
    {
      title: 'Đánh giá',
      value: `${stats.rating}/5.0`,
      icon: <StarOutlined className="text-2xl text-yellow-500" />,
      color: 'yellow',
      change: 'Từ học sinh'
    },
    {
      title: 'Buổi học hoàn thành',
      value: stats.completedClasses,
      icon: <CheckCircleOutlined className="text-2xl text-teal-500" />,
      color: 'teal',
      change: 'Tổng cộng'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Chào mừng, {user?.name || 'Giáo viên'}!</h2>
        <p className="text-green-100 mb-3">
          {user?.teacherInfo?.centerName || 'Trung tâm'} • {user?.teacherInfo?.subjects?.join(', ') || 'Giáo viên'}
        </p>
        <div className="flex items-center gap-4 text-sm">
          <div className="bg-white/20 px-4 py-2 rounded-lg">
            <span className="font-semibold">Kinh nghiệm: </span>
            <span>{user?.teacherInfo?.experience || 0} năm</span>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-lg">
            <span className="font-semibold">Rating: </span>
            <span>⭐ {stats.rating}/5.0</span>
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

      {/* Pending tasks alert */}
      {pendingTasks.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-orange-900 mb-3 flex items-center">
            <ClockCircleOutlined className="mr-2" />
            Nhiệm vụ cần hoàn thành ({pendingTasks.reduce((sum, item) => sum + item.count, 0)})
          </h3>
          <div className="space-y-2">
            {pendingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-700 font-semibold text-sm">{task.count}</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-gray-800 block">{task.message}</span>
                    <span className="text-xs text-gray-500">Deadline: {task.deadline}</span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors">
                  Xử lý
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's schedule and recent activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's schedule */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarOutlined className="mr-2 text-blue-500" />
            Lịch dạy hôm nay
          </h3>
          <div className="space-y-3">
            {todaySchedule.map((schedule) => (
              <div key={schedule.id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">{schedule.course}</div>
                    <div className="text-sm text-gray-600">{schedule.class} • {schedule.students} học sinh</div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full bg-${getStatusColor(schedule.status)}-100 text-${getStatusColor(schedule.status)}-700`}>
                    {getStatusLabel(schedule.status)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>🕐 {schedule.time}</span>
                  <span>📍 {schedule.room}</span>
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
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
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
            <div className="text-blue-600 font-medium text-sm mb-1">Điểm danh</div>
            <div className="text-xs text-gray-600">Điểm danh học sinh</div>
          </button>
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
            <div className="text-green-600 font-medium text-sm mb-1">Chấm điểm</div>
            <div className="text-xs text-gray-600">Chấm bài kiểm tra</div>
          </button>
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
            <div className="text-purple-600 font-medium text-sm mb-1">Xem lớp học</div>
            <div className="text-xs text-gray-600">Danh sách học sinh</div>
          </button>
          <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors">
            <div className="text-orange-600 font-medium text-sm mb-1">Lịch dạy</div>
            <div className="text-xs text-gray-600">Xem lịch tuần</div>
          </button>
          <button className="p-4 bg-teal-50 hover:bg-teal-100 rounded-lg text-left transition-colors">
            <div className="text-teal-600 font-medium text-sm mb-1">Tài liệu</div>
            <div className="text-xs text-gray-600">Upload tài liệu</div>
          </button>
          <button className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-left transition-colors">
            <div className="text-indigo-600 font-medium text-sm mb-1">Tin nhắn</div>
            <div className="text-xs text-gray-600">Liên lạc phụ huynh</div>
          </button>
          <button className="p-4 bg-pink-50 hover:bg-pink-100 rounded-lg text-left transition-colors">
            <div className="text-pink-600 font-medium text-sm mb-1">Báo cáo</div>
            <div className="text-xs text-gray-600">Báo cáo tiến độ</div>
          </button>
          <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-left transition-colors">
            <div className="text-yellow-600 font-medium text-sm mb-1">Ký khóa học</div>
            <div className="text-xs text-gray-600">Xác nhận dạy</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard

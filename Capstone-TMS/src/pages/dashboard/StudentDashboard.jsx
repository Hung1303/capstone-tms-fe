import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  BookOutlined, 
  CalendarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  BellOutlined,
  UserOutlined
} from '@ant-design/icons'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    attendanceRate: 0,
    averageGrade: 0,
    upcomingClasses: 0,
    pendingHomework: 0,
    totalClasses: 0,
    notifications: 0
  })

  const [todaySchedule, setTodaySchedule] = useState([])
  const [courses, setCourses] = useState([])
  const [recentGrades, setRecentGrades] = useState([])
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Mock data - sẽ thay bằng API call
    const enrolledCourses = user?.studentInfo?.enrolledCourses || []
    const attendance = user?.studentInfo?.attendance || {}
    const grades = user?.studentInfo?.grades || []
    
    setStats({
      enrolledCourses: enrolledCourses.length,
      completedCourses: enrolledCourses.filter(c => c.status === 'completed').length,
      attendanceRate: attendance.attendanceRate || 0,
      averageGrade: grades.length > 0 ? grades.reduce((sum, g) => sum + g.average, 0) / grades.length : 0,
      upcomingClasses: 5,
      pendingHomework: 3,
      totalClasses: attendance.totalClasses || 0,
      notifications: 2
    })

    setCourses(enrolledCourses.map(course => ({
      ...course,
      progress: 65,
      nextClass: 'Thứ 2, 18:00'
    })))

    setTodaySchedule([
      { id: 1, time: '18:00 - 20:00', course: 'IELTS Foundation', teacher: 'Cô Hoa', room: 'Phòng 201', status: 'upcoming' },
      { id: 2, time: '20:00 - 21:00', course: 'Self-study', teacher: 'Tự học', room: 'Online', status: 'upcoming' }
    ])

    setRecentGrades([
      { id: 1, subject: 'IELTS Foundation', type: 'Kiểm tra giữa kỳ', grade: 8.5, date: '10/01/2024', teacher: 'Cô Hoa' },
      { id: 2, subject: 'IELTS Foundation', type: 'Bài tập tuần 5', grade: 9.0, date: '08/01/2024', teacher: 'Cô Hoa' },
      { id: 3, subject: 'IELTS Foundation', type: 'Speaking Test', grade: 7.5, date: '05/01/2024', teacher: 'Cô Hoa' }
    ])

    setNotifications([
      { id: 1, type: 'homework', message: 'Bài tập tuần 6 sắp đến hạn nộp', priority: 'high', time: '2 giờ trước' },
      { id: 2, type: 'grade', message: 'Điểm kiểm tra giữa kỳ đã được cập nhật', priority: 'normal', time: '1 ngày trước' }
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

  const getGradeColor = (grade) => {
    if (grade >= 9) return 'green'
    if (grade >= 8) return 'blue'
    if (grade >= 6.5) return 'orange'
    return 'red'
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
      title: 'Khóa học đang học',
      value: stats.enrolledCourses,
      icon: <BookOutlined className="text-2xl text-blue-500" />,
      color: 'blue',
      change: `${stats.completedCourses} đã hoàn thành`
    },
    {
      title: 'Điểm trung bình',
      value: stats.averageGrade.toFixed(1),
      icon: <TrophyOutlined className="text-2xl text-yellow-500" />,
      color: 'yellow',
      change: 'Tất cả môn học'
    },
    {
      title: 'Tỷ lệ điểm danh',
      value: `${stats.attendanceRate}%`,
      icon: <CheckCircleOutlined className="text-2xl text-green-500" />,
      color: 'green',
      change: `${stats.totalClasses} buổi học`
    },
    {
      title: 'Lớp học sắp tới',
      value: stats.upcomingClasses,
      icon: <CalendarOutlined className="text-2xl text-purple-500" />,
      color: 'purple',
      change: 'Tuần này'
    },
    {
      title: 'Bài tập chưa nộp',
      value: stats.pendingHomework,
      icon: <FileTextOutlined className="text-2xl text-orange-500" />,
      color: 'orange',
      change: 'Cần hoàn thành'
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
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Chào {user?.name || 'Học sinh'}!</h2>
        <p className="text-teal-100 mb-3">
          {user?.studentInfo?.grade || 'Học sinh'} • {user?.studentInfo?.school || 'Trường học'}
        </p>
        <div className="flex items-center gap-4 text-sm">
          <div className="bg-white/20 px-4 py-2 rounded-lg">
            <span className="font-semibold">Điểm TB: </span>
            <span>{stats.averageGrade.toFixed(1)}/10</span>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-lg">
            <span className="font-semibold">Điểm danh: </span>
            <span>{stats.attendanceRate}%</span>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-lg">
            <span className="font-semibold">Phụ huynh: </span>
            <span>{user?.studentInfo?.parentName || 'N/A'}</span>
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
            Thông báo ({notifications.length})
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

      {/* My courses */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BookOutlined className="mr-2 text-blue-500" />
          Khóa học của tôi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div key={course.courseId} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{course.courseName}</h4>
                  <p className="text-sm text-gray-600">{course.centerName}</p>
                  <p className="text-xs text-gray-500 mt-1">Giáo viên: {course.teacherName}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full bg-${getStatusColor(course.status)}-100 text-${getStatusColor(course.status)}-700`}>
                  {getStatusLabel(course.status)}
                </span>
              </div>
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Tiến độ</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>📅 Buổi học tiếp theo: {course.nextClass}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's schedule and recent grades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's schedule */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarOutlined className="mr-2 text-green-500" />
            Lịch học hôm nay
          </h3>
          <div className="space-y-3">
            {todaySchedule.map((schedule) => (
              <div key={schedule.id} className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-100">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">{schedule.course}</div>
                    <div className="text-sm text-gray-600">{schedule.teacher}</div>
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

        {/* Recent grades */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrophyOutlined className="mr-2 text-yellow-500" />
            Điểm số gần đây
          </h3>
          <div className="space-y-3">
            {recentGrades.map((grade) => (
              <div key={grade.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-sm">{grade.subject}</div>
                    <div className="text-xs text-gray-600">{grade.type}</div>
                  </div>
                  <div className={`text-2xl font-bold text-${getGradeColor(grade.grade)}-600`}>
                    {grade.grade}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>👨‍🏫 {grade.teacher}</span>
                  <span>📅 {grade.date}</span>
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
            <div className="text-blue-600 font-medium text-sm mb-1">Xem lịch học</div>
            <div className="text-xs text-gray-600">Lịch học đầy đủ</div>
          </button>
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
            <div className="text-green-600 font-medium text-sm mb-1">Xem điểm</div>
            <div className="text-xs text-gray-600">Tất cả điểm số</div>
          </button>
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
            <div className="text-purple-600 font-medium text-sm mb-1">Điểm danh</div>
            <div className="text-xs text-gray-600">Lịch sử điểm danh</div>
          </button>
          <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors">
            <div className="text-orange-600 font-medium text-sm mb-1">Bài tập</div>
            <div className="text-xs text-gray-600">Nộp bài tập</div>
          </button>
          <button className="p-4 bg-teal-50 hover:bg-teal-100 rounded-lg text-left transition-colors">
            <div className="text-teal-600 font-medium text-sm mb-1">Tài liệu</div>
            <div className="text-xs text-gray-600">Tài liệu học tập</div>
          </button>
          <button className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-left transition-colors">
            <div className="text-indigo-600 font-medium text-sm mb-1">Thông báo</div>
            <div className="text-xs text-gray-600">Xem tất cả</div>
          </button>
          <button className="p-4 bg-pink-50 hover:bg-pink-100 rounded-lg text-left transition-colors">
            <div className="text-pink-600 font-medium text-sm mb-1">Hồ sơ</div>
            <div className="text-xs text-gray-600">Thông tin cá nhân</div>
          </button>
          <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-left transition-colors" disabled>
            <div className="text-gray-400 font-medium text-sm mb-1">Đăng ký khóa học</div>
            <div className="text-xs text-gray-400">Chỉ phụ huynh</div>
          </button>
        </div>
      </div>

      {/* Important note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-yellow-600 text-xl">ℹ️</div>
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Lưu ý quan trọng</h4>
            <p className="text-sm text-yellow-800">
              Học sinh không thể tự đăng ký khóa học. Vui lòng nhờ phụ huynh đăng ký khóa học cho bạn.
              Bạn chỉ có thể xem lịch học, điểm số và nộp bài tập.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard

import { useState, useEffect } from 'react'
import { 
  CalendarOutlined, 
  ClockCircleOutlined,
  UserOutlined,
  BookOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons'

const ScheduleManagement = () => {
  const [schedule, setSchedule] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState('day') // day, week, month

  useEffect(() => {
    // Mock data - trong thực tế sẽ gọi API
    setSchedule([
      {
        id: 1,
        title: 'Toán 12A',
        teacher: 'Cô Lan',
        students: 15,
        startTime: '08:00',
        endTime: '10:00',
        date: '2024-01-22',
        status: 'scheduled',
        room: 'Phòng 101',
        subject: 'Toán học'
      },
      {
        id: 2,
        title: 'Lý 11B',
        teacher: 'Thầy Minh',
        students: 12,
        startTime: '10:00',
        endTime: '12:00',
        date: '2024-01-22',
        status: 'in-progress',
        room: 'Phòng 102',
        subject: 'Vật lý'
      },
      {
        id: 3,
        title: 'Hóa 10C',
        teacher: 'Cô Hương',
        students: 18,
        startTime: '14:00',
        endTime: '16:00',
        date: '2024-01-22',
        status: 'scheduled',
        room: 'Phòng 103',
        subject: 'Hóa học'
      },
      {
        id: 4,
        title: 'Anh 12D',
        teacher: 'Thầy John',
        students: 20,
        startTime: '16:00',
        endTime: '18:00',
        date: '2024-01-22',
        status: 'scheduled',
        room: 'Phòng 104',
        subject: 'Tiếng Anh'
      }
    ])
  }, [])

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { 
        label: 'Sắp diễn ra', 
        className: 'bg-blue-100 text-blue-800'
      },
      'in-progress': { 
        label: 'Đang diễn ra', 
        className: 'bg-green-100 text-green-800'
      },
      completed: { 
        label: 'Đã hoàn thành', 
        className: 'bg-gray-100 text-gray-800'
      },
      cancelled: { 
        label: 'Đã hủy', 
        className: 'bg-red-100 text-red-800'
      }
    }
    
    const config = statusConfig[status]
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const getSubjectIcon = (subject) => {
    const icons = {
      'Toán học': '📐',
      'Vật lý': '⚡',
      'Hóa học': '🧪',
      'Sinh học': '🧬',
      'Tiếng Anh': '🇺🇸',
      'Ngữ văn': '📚'
    }
    return icons[subject] || '📖'
  }

  const filteredSchedule = schedule.filter(item => item.date === selectedDate)

  const formatTime = (time) => {
    return time.slice(0, 5) // Remove seconds if present
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý lịch học</h2>
          <p className="text-gray-600">Xem và quản lý lịch học của học sinh</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
          <PlusOutlined />
          <span>Thêm lịch học</span>
        </button>
      </div>

      {/* Date picker and view controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Chọn ngày:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'day' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ngày
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'week' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tuần
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'month' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tháng
            </button>
          </div>
        </div>
      </div>

      {/* Schedule for selected date */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Lịch học ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}
          </h3>
        </div>
        
        {filteredSchedule.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CalendarOutlined className="text-4xl mb-4 mx-auto text-gray-300" />
            <p>Không có lịch học nào trong ngày này</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredSchedule.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getSubjectIcon(item.subject)}</span>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{item.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <UserOutlined />
                            <span>{item.teacher}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOutlined />
                            <span>{item.students} học sinh</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ClockCircleOutlined />
                            <span>{formatTime(item.startTime)} - {formatTime(item.endTime)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Phòng {item.room}</div>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <EditOutlined />
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <DeleteOutlined />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {filteredSchedule.filter(s => s.status === 'scheduled').length}
          </div>
          <div className="text-sm text-gray-600">Sắp diễn ra</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {filteredSchedule.filter(s => s.status === 'in-progress').length}
          </div>
          <div className="text-sm text-gray-600">Đang diễn ra</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {filteredSchedule.reduce((sum, s) => sum + s.students, 0)}
          </div>
          <div className="text-sm text-gray-600">Tổng học sinh</div>
        </div>
      </div>
    </div>
  )
}

export default ScheduleManagement

import { useState, useEffect } from 'react'
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  EyeOutlined,
  BookOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'

const ClassManagement = () => {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSubject, setFilterSubject] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    // Mock data - trong thực tế sẽ gọi API
    setClasses([
      {
        id: 1,
        name: 'Toán 12A',
        subject: 'Toán học',
        grade: '12',
        teacher: 'Cô Lan',
        center: 'Trung tâm ABC',
        schedule: 'Thứ 2, 4, 6 - 8:00-10:00',
        status: 'active',
        students: 15,
        maxStudents: 20,
        price: 500000,
        startDate: '2024-01-15',
        endDate: '2024-06-15'
      },
      {
        id: 2,
        name: 'Lý 11B',
        subject: 'Vật lý',
        grade: '11',
        teacher: 'Thầy Minh',
        center: 'Trung tâm XYZ',
        schedule: 'Thứ 3, 5, 7 - 14:00-16:00',
        status: 'active',
        students: 12,
        maxStudents: 15,
        price: 450000,
        startDate: '2024-01-20',
        endDate: '2024-06-20'
      },
      {
        id: 3,
        name: 'Hóa 10C',
        subject: 'Hóa học',
        grade: '10',
        teacher: 'Cô Hương',
        center: 'Trung tâm DEF',
        schedule: 'Thứ 2, 4 - 16:00-18:00',
        status: 'completed',
        students: 18,
        maxStudents: 20,
        price: 400000,
        startDate: '2024-01-10',
        endDate: '2024-05-10'
      }
    ])
  }, [])

  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.center.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = filterSubject === 'all' || classItem.subject === filterSubject
    const matchesStatus = filterStatus === 'all' || classItem.status === filterStatus
    return matchesSearch && matchesSubject && matchesStatus
  })

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { 
        label: 'Đang hoạt động', 
        className: 'bg-green-100 text-green-800'
      },
      completed: { 
        label: 'Đã hoàn thành', 
        className: 'bg-blue-100 text-blue-800'
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý lớp học</h2>
          <p className="text-gray-600">Quản lý các lớp học trong hệ thống</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
          <PlusOutlined />
          <span>Thêm lớp học</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{classes.length}</div>
          <div className="text-sm text-gray-600">Tổng lớp học</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {classes.filter(c => c.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Đang hoạt động</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {classes.filter(c => c.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Đã hoàn thành</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {classes.reduce((sum, c) => sum + c.students, 0)}
          </div>
          <div className="text-sm text-gray-600">Tổng học sinh</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên lớp, giáo viên hoặc trung tâm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Tất cả môn học</option>
            <option value="Toán học">Toán học</option>
            <option value="Vật lý">Vật lý</option>
            <option value="Hóa học">Hóa học</option>
            <option value="Sinh học">Sinh học</option>
            <option value="Tiếng Anh">Tiếng Anh</option>
            <option value="Ngữ văn">Ngữ văn</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Classes table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lớp học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giáo viên & Trung tâm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lịch học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học sinh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học phí
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClasses.map((classItem) => (
                <tr key={classItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getSubjectIcon(classItem.subject)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{classItem.name}</div>
                        <div className="text-sm text-gray-500">{classItem.subject} - Lớp {classItem.grade}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{classItem.teacher}</div>
                    <div className="text-sm text-gray-500">{classItem.center}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{classItem.schedule}</div>
                    <div className="text-xs text-gray-500">
                      {classItem.startDate} - {classItem.endDate}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {classItem.students}/{classItem.maxStudents} học sinh
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(classItem.students / classItem.maxStudents) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {classItem.price.toLocaleString('vi-VN')} VNĐ
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(classItem.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <EyeOutlined />
                      </button>
                      <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                        <EditOutlined />
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <DeleteOutlined />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Hiển thị {filteredClasses.length} trong tổng số {classes.length} lớp học
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
            Trước
          </button>
          <span className="px-3 py-1 bg-orange-500 text-white rounded text-sm">1</span>
          <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
            Sau
          </button>
        </div>
      </div>
    </div>
  )
}

export default ClassManagement

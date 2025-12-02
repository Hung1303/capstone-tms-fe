import { useState, useEffect } from 'react'
import { 
  SearchOutlined, 
  BookOutlined,
  TeamOutlined,
  DollarOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StarOutlined,
  LoadingOutlined
} from '@ant-design/icons'
import api from '../../config/axios'

const ParentCourses = () => {
  const [courses, setCourses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterGrade, setFilterGrade] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const response = await api.get('/Course')
        if (response.data && response.data.data) {
          setCourses(response.data.data)
        } else if (Array.isArray(response.data)) {
          setCourses(response.data)
        }
      } catch (error) {
        console.error('Error fetching courses:', error)
        setCourses([])
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  const filteredCourses = courses.filter(course => {
    const matchSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       course.centerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchSubject = !filterSubject || course.subject === filterSubject
    const matchGrade = !filterGrade || course.gradeLevel.toString() === filterGrade
    const matchStatus = !filterStatus || course.status === filterStatus
    return matchSearch && matchSubject && matchGrade && matchStatus
  })

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getStatusColor = (status) => {
    return status === 'Active' ? 'green' : 'orange'
  }

  const getStatusIcon = (status) => {
    return status === 'Active' ? <CheckCircleOutlined /> : <ClockCircleOutlined />
  }

  const getStatusText = (status) => {
    return status === 'Active' ? 'Hoạt động' : 'Chờ duyệt'
  }

  const subjects = [...new Set(courses.map(c => c.subject))]
  const grades = [...new Set(courses.map(c => c.gradeLevel))].sort((a, b) => a - b)
  const statuses = ['Active', 'Pending']

  const getCapacityPercentage = (enrolled, capacity) => {
    return Math.round((enrolled / capacity) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Danh sách khóa học</h1>
        <p className="text-gray-600 mt-2">Tìm và đăng ký khóa học phù hợp cho con bạn</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <div className="relative">
              <SearchOutlined className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Tên khóa học, trung tâm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả môn học</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lớp</label>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả lớp</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>Lớp {grade}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'Active' ? 'Hoạt động' : 'Chờ duyệt'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterSubject('')
                setFilterGrade('')
                setFilterStatus('')
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Courses grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOutlined className="text-4xl text-gray-300 mb-3" />
            <p className="text-gray-600">Không tìm thấy khóa học nào</p>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header with status */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{course.title}</h3>
                    <p className="text-blue-100 text-sm mt-1">{course.subject}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium flex items-center gap-1 bg-white text-${getStatusColor(course.status)}-600`}>
                    {getStatusIcon(course.status)}
                    {getStatusText(course.status)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Description */}
                <p className="text-sm text-gray-700 line-clamp-2">{course.description}</p>

                {/* Center and location */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <TeamOutlined className="text-blue-500" />
                    <span>{course.centerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <EnvironmentOutlined className="text-blue-500" />
                    <span className="truncate">{course.location}</span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <StarOutlined
                        key={i}
                        className={`text-sm ${i < Math.floor(course.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {course.rating} ({course.reviews} đánh giá)
                  </span>
                </div>

                {/* Key info grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-xs text-gray-600">Lớp</p>
                    <p className="font-semibold text-blue-600">{course.gradeLevel}</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-xs text-gray-600">Học phí</p>
                    <p className="font-semibold text-blue-600 text-sm">{formatCurrency(course.tuitionFee)}</p>
                  </div>
                </div>

                {/* Capacity */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Sức chứa</span>
                    <span className="font-medium">{course.enrolled}/{course.capacity}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${getCapacityPercentage(course.enrolled, course.capacity)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">{getCapacityPercentage(course.enrolled, course.capacity)}% đã đăng ký</p>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t border-gray-200">
                  <CalendarOutlined className="text-blue-500" />
                  <span>{formatDate(course.startDate)} - {formatDate(course.endDate)}</span>
                </div>
              </div>

              {/* Footer button */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button className="w-full py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors font-medium">
                  Đăng ký khóa học
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ParentCourses
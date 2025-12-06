import { useState, useEffect } from 'react'
import {
  SearchOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  FileTextOutlined,
  TeamOutlined,
  LoadingOutlined // Import icon loading
} from '@ant-design/icons'
import { Spin } from 'antd' // Import Spin từ antd để hiển thị loading đẹp hơn (tùy chọn)
import api from '../../config/axios'

const ParentCenters = () => {
  const [centers, setCenters] = useState([])
  const [selectedCenter, setSelectedCenter] = useState(null)
  const [centerCourses, setCenterCourses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCity, setFilterCity] = useState('')
  // const [filterStatus, setFilterStatus] = useState('') // Bỏ filterStatus vì chỉ hiện Active
  const [loading, setLoading] = useState(false)
  const [coursesLoading, setCoursesLoading] = useState(false)

  // Fetch centers from API
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setLoading(true)
        const response = await api.get('/Users/Centers')
        if (response.data && response.data.centers) {
          setCenters(response.data.centers)
        } else if (Array.isArray(response.data)) {
          setCenters(response.data)
        }
      } catch (error) {
        console.error('Error fetching centers:', error)
        setCenters([])
      } finally {
        setLoading(false)
      }
    }
    fetchCenters()
  }, [])

  // Fetch courses for selected center
  const fetchCoursesByCenter = async (centerId) => {
    try {
      setCoursesLoading(true)
      const response = await api.get(`/Course?centerProfileId=${centerId}`)
      if (response.data && response.data.data) {
        setCenterCourses(response.data.data)
      } else if (Array.isArray(response.data)) {
        setCenterCourses(response.data)
      } else {
        setCenterCourses([])
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      setCenterCourses([])
    } finally {
      setCoursesLoading(false)
    }
  }

  const handleSelectCenter = (center) => {
    setSelectedCenter(center)
    fetchCoursesByCenter(center.id)
  }

  const handleBackToList = () => {
    setSelectedCenter(null)
    setCenterCourses([])
  }

  const filteredCenters = centers.filter(center => {
    // Chỉ lấy trung tâm có status là Active
    const isActive = center.status === 'Active';

    const matchSearch = center.centerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCity = !filterCity || center.city === filterCity
    // const matchStatus = !filterStatus || center.status === filterStatus // Bỏ dòng này

    return isActive && matchSearch && matchCity // && matchStatus
  })

  const getStatusColor = (status) => {
    return status === 'Active' ? 'green' : 'orange'
  }

  const getStatusIcon = (status) => {
    return status === 'Active' ? <CheckCircleOutlined /> : <ClockCircleOutlined />
  }

  const getStatusText = (status) => {
    return status === 'Active' ? 'Hoạt động' : 'Chờ duyệt'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const cities = [...new Set(centers.map(c => c.city))]
  // const statuses = ['Active', 'Pending'] // Bỏ danh sách status

  // Hiển thị Loading khi đang tải danh sách trung tâm
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="Đang tải danh sách trung tâm..." />
      </div>
    );
  }

  if (selectedCenter) {
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <ArrowLeftOutlined />
            Quay lại
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{selectedCenter.centerName}</h1>
            <p className="text-gray-600 mt-1">Khóa học tại trung tâm này</p>
          </div>
        </div>

        {/* Center info card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin trung tâm</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <UserOutlined className="text-orange-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Chủ sở hữu</p>
                    <p className="font-medium text-gray-900">{selectedCenter.ownerName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <EnvironmentOutlined className="text-orange-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Địa chỉ</p>
                    <p className="font-medium text-gray-900">{selectedCenter.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <PhoneOutlined className="text-orange-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Điện thoại</p>
                    <p className="font-medium text-gray-900">{selectedCenter.contactPhone}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MailOutlined className="text-orange-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{selectedCenter.contactEmail}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileTextOutlined className="text-orange-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Số giấy phép</p>
                    <p className="font-medium text-gray-900">{selectedCenter.licenseNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleOutlined className={`text-${getStatusColor(selectedCenter.status)}-500 mt-1`} />
                  <div>
                    <p className="text-sm text-gray-600">Trạng thái</p>
                    <p className={`font-medium text-${getStatusColor(selectedCenter.status)}-600`}>
                      {getStatusText(selectedCenter.status)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Courses section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BookOutlined className="mr-2 text-blue-500" />
            Khóa học ({centerCourses.length})
          </h3>

          {/* Hiển thị Loading khi đang tải khóa học */}
          {coursesLoading ? (
            <div className="flex justify-center items-center h-32">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="Đang tải khóa học..." />
            </div>
          ) : centerCourses.length === 0 ? (
            <div className="text-center py-8">
              <BookOutlined className="text-4xl text-gray-300 mb-3" />
              <p className="text-gray-600">Trung tâm này chưa có khóa học nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {centerCourses.map((course) => (
                <div key={course.id} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-base">{course.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{course.subject}</p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                      Lớp {course.gradeLevel}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{course.description}</p>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div className="bg-white p-2 rounded">
                      <p className="text-gray-600 text-xs">Học phí</p>
                      <p className="font-semibold text-blue-600">{formatCurrency(course.tuitionFee)}</p>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <p className="text-gray-600 text-xs">Sức chứa</p>
                      <p className="font-semibold text-blue-600">{course.capacity} học sinh</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 mb-3 space-y-1">
                    <p>📅 Từ {formatDate(course.startDate)} đến {formatDate(course.endDate)}</p>
                    <p>📍 {course.location}</p>
                  </div>

                  <button className="w-full py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors font-medium">
                    Đăng ký khóa học
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Danh sách trung tâm</h1>
        <p className="text-gray-600 mt-2">Chọn trung tâm để xem khóa học</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Đã xóa div chứa filterStatus và chỉnh lại grid cols */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <div className="relative">
              <SearchOutlined className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Tên trung tâm, chủ sở hữu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thành phố</label>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Tất cả thành phố</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterCity('')
                // setFilterStatus('') // Bỏ reset status
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium h-[42px]" // Chỉnh height cho khớp với input
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Centers grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCenters.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <TeamOutlined className="text-4xl text-gray-300 mb-3" />
            <p className="text-gray-600">Không tìm thấy trung tâm nào</p>
          </div>
        ) : (
          filteredCenters.map((center) => (
            <div
              key={center.id}
              onClick={() => handleSelectCenter(center)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-orange-300 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{center.centerName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{center.ownerName}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full font-medium flex items-center gap-1 bg-${getStatusColor(center.status)}-100 text-${getStatusColor(center.status)}-700`}>
                  {getStatusIcon(center.status)}
                  {getStatusText(center.status)}
                </span>
              </div>

              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <EnvironmentOutlined className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{center.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneOutlined className="text-orange-500 flex-shrink-0" />
                  <span>{center.contactPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MailOutlined className="text-orange-500 flex-shrink-0" />
                  <span className="truncate">{center.contactEmail}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-3">Giấy phép: {center.licenseNumber}</p>
                <button className="w-full py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors font-medium">
                  Xem khóa học
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ParentCenters
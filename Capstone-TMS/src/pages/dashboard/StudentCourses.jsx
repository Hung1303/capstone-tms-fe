import { useState, useEffect, useCallback } from 'react'
import { SearchOutlined, BookOutlined, CalendarOutlined, EnvironmentOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, TeamOutlined, DollarOutlined, ReloadOutlined,
  FilterOutlined, EyeOutlined, UserAddOutlined } from '@ant-design/icons'
import api from '../../config/axios'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-toastify'
import { Select, Spin, Tag, Card, Modal, Descriptions, Divider, Input, Space, Typography } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'

dayjs.locale('vi')

const { Option } = Select
const { Title, Text } = Typography

const StudentCourses = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [studentProfileId, setStudentProfileId] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [filteredEnrollments, setFilteredEnrollments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)

  // Cache cho courses
  const courseCache = {}

  const getCourse = async (courseId) => {
    if (!courseId) return null
    if (courseCache[courseId]) return courseCache[courseId]

    try {
      const response = await api.get(`/Course/${courseId}`)
      const data = response.data.data
      courseCache[courseId] = data
      return data
    } catch (error) {
      console.error('Error fetching course:', courseId, error)
      return null
    }
  }

  // Lấy studentProfileId từ token hoặc API
  const fetchStudentProfileId = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const { jwtDecode } = await import('jwt-decode')
        const decoded = jwtDecode(token)
        
        const profileId = decoded.StudentProfileId || decoded.studentProfileId || decoded.StudentId || decoded.studentId
        
        if (profileId) {
          setStudentProfileId(profileId)
          return profileId
        }

        if (user?.userId) {
          try {
            const response = await api.get(`/Users/${user.userId}/Profile`)
            const profileId = response.data?.data?.studentProfileId || response.data?.data?.profileId
            if (profileId) {
              setStudentProfileId(profileId)
              return profileId
            }
          } catch (apiError) {
            console.error('Error fetching user profile:', apiError)
          }
        }
      }

      console.warn('StudentProfileId not found in token or API')
      return null
    } catch (error) {
      console.error('Error fetching student profile ID:', error)
      return null
    }
  }, [user?.userId])

  // Lấy enrollments của học sinh
  const fetchEnrollments = useCallback(async () => {
    if (!studentProfileId) {
      if (!user?.userId) {
        setEnrollments([])
        return
      }
      console.warn('studentProfileId not available, trying with userId')
    }

    setLoading(true)
    try {
      let studentEnrollments = []
      const profileIdToUse = studentProfileId || user?.userId
      
      if (!profileIdToUse) {
        toast.error('Không tìm thấy thông tin học sinh')
        setEnrollments([])
        setLoading(false)
        return
      }
      
      try {
        const response = await api.get(`/Enrollments/Student/${profileIdToUse}/Enrollments?pageNumber=1&pageSize=100`)
        console.log("response fetchEnrollments:", response.data)
        studentEnrollments = response.data.data || response.data || []
        
        if (response.data?.data?.[0]?.studentProfileId && !studentProfileId) {
          setStudentProfileId(response.data.data[0].studentProfileId)
        }
      } catch (error) {
        console.error("error response in fetchEnrollments:", error)
        if (error.response?.status === 404) {
          toast.error('Không tìm thấy thông tin đăng ký khóa học')
        } else {
          toast.error('Không thể tải danh sách đăng ký khóa học')
        }
        setEnrollments([])
        setLoading(false)
        return
      }
      
      // Lấy thông tin course cho mỗi enrollment
      const enrollmentsWithCourses = []
      for (const enrollment of studentEnrollments) {
        const course = await getCourse(enrollment.courseId)
        enrollmentsWithCourses.push({
          ...enrollment,
          course: course
        })
      }
      
      setEnrollments(enrollmentsWithCourses)
      setFilteredEnrollments(enrollmentsWithCourses)
    } catch (error) {
      console.error('Error fetching enrollments:', error)
      toast.error('Không thể tải danh sách đăng ký khóa học. Vui lòng thử lại sau.')
      setEnrollments([])
      setFilteredEnrollments([])
    } finally {
      setLoading(false)
    }
  }, [studentProfileId, user?.userId])

  // Filter enrollments
  useEffect(() => {
    let result = [...enrollments]

    if (searchTerm) {
      result = result.filter(e => 
        e.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.course?.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      if (filterStatus === 'active') {
        result = result.filter(e => {
          const status = e.status
          return status === 1 || status === 2 || status === 'Accepted' || status === 'Confirmed' || status === 'Active'
        })
      } else if (filterStatus === 'pending') {
        result = result.filter(e => {
          const status = e.status
          return status === 0 || status === 'Pending' || status === 'Waiting'
        })
      } else if (filterStatus === 'rejected') {
        result = result.filter(e => {
          const status = e.status
          return status === 3 || status === 'Rejected' || status === 'Declined'
        })
      } else {
        result = result.filter(e => e.status?.toString() === filterStatus)
      }
    }

    setFilteredEnrollments(result)
  }, [enrollments, searchTerm, filterStatus])

  // Load dữ liệu
  useEffect(() => {
    const init = async () => {
      const profileId = await fetchStudentProfileId()
      if (profileId) {
        setStudentProfileId(profileId)
      }
    }
    init()
  }, [fetchStudentProfileId])

  useEffect(() => {
    if (studentProfileId) {
      fetchEnrollments()
    }
  }, [studentProfileId, fetchEnrollments])

  // Helper functions
  const getEnrollmentStatus = (status) => {
    const statusNum = typeof status === 'string' && !isNaN(status) ? parseInt(status) : status
    switch (statusNum) {
      case 0:
      case 'Pending':
        return { color: 'orange', icon: <ClockCircleOutlined />, text: 'Chờ duyệt', bg: 'bg-orange-100 text-orange-600' }
      case 1:
      case 'Confirmed':
        return { color: 'blue', icon: <UserAddOutlined />, text: 'Đang học', bg: 'bg-blue-100 text-blue-600' }
      case 2:
      case 'Cancelled':
        return { color: 'red', icon: <CheckCircleOutlined />, text: 'Đã hủy', bg: 'bg-red-100 text-red-600' }
      case 3:
      case 'Completed':
        return { color: 'red', icon: <CloseCircleOutlined />, text: 'Đã từ chối', bg: 'bg-red-100 text-red-600' }
      case 4:
      case 'Paid':
        return { color: 'green', icon: <CheckCircleOutlined />, text: 'Đã thanh toán', bg: 'bg-green-100 text-green-600' }
      default:
        return { color: 'gray', icon: <BookOutlined />, text: 'Không xác định', bg: 'bg-gray-100 text-gray-600' }
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return '0 đ'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return dayjs(dateString).format('DD/MM/YYYY')
  }

  const getTeachingMethod = (method) => {
    switch (method) {
      case 1: return 'Trực tiếp'
      case 2: return 'Trực tuyến'
      case 3: return 'Kết hợp'
      default: return 'Khác'
    }
  }

  // Xử lý khi click vào card
  const handleCardClick = (enrollment) => {
    setSelectedEnrollment(enrollment)
    setIsModalVisible(true)
  }

  // Đóng modal
  const handleCloseModal = () => {
    setIsModalVisible(false)
    setSelectedEnrollment(null)
  }

  // Thống kê
  const stats = {
    total: enrollments.length,
    active: enrollments.filter(e => {
      const status = e.status
      return status === 1 || status === 2 || status === 'Accepted' || status === 'Confirmed' || status === 'Active'
    }).length,
    pending: enrollments.filter(e => {
      const status = e.status
      return status === 0 || status === 'Pending' || status === 'Waiting'
    }).length
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {/* Header */}
      <Card className="!bg-gradient-to-r !from-[#e03db7] !to-[#fb58d2] !rounded-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Title level={2} className="!text-white !m-0 !font-bold">
              <BookOutlined /> Khóa học của tôi
            </Title>
            <Text className="!text-white/90 !text-base">
              Xem danh sách các khóa học đã đăng ký.
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (studentProfileId) {
                  fetchEnrollments()
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ReloadOutlined />
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      {enrollments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600 mt-1">Tổng khóa học</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600 mt-1">Đang học</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <div className="text-sm text-gray-600 mt-1">Chờ duyệt</div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FilterOutlined className="text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SearchOutlined className="mr-2" />
              Tìm kiếm
            </label>
            <Input
              className="search-input"
              placeholder="Tìm kiếm theo tên khóa học, môn học..."
              prefix={<SearchOutlined className="search-icon"/>}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BookOutlined className="mr-2" />
              Trạng thái
            </label>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              className="w-full"
              placeholder="Tất cả trạng thái"
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Đang học</Option>
              <Option value="pending">Chờ duyệt</Option>
              <Option value="rejected">Đã từ chối</Option>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      ) : !studentProfileId ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BookOutlined className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy thông tin học sinh</h3>
          <p className="text-gray-600 mb-4">
            Vui lòng liên hệ quản trị viên để được hỗ trợ.
          </p>
        </div>
      ) : filteredEnrollments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BookOutlined className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {enrollments.length === 0 ? 'Chưa có khóa học' : 'Không tìm thấy khóa học'}
          </h3>
          <p className="text-gray-600 mb-4">
            {enrollments.length === 0 
              ? 'Bạn chưa đăng ký khóa học nào. Hãy tìm và đăng ký khóa học phù hợp với bạn.'
              : 'Không tìm thấy khóa học phù hợp với bộ lọc đã chọn.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((enrollment) => {
            const course = enrollment.course || {}
            const statusInfo = getEnrollmentStatus(enrollment.status)
            
            return (
              <Card
                key={enrollment.id}
                className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
                style={{ borderLeft: `4px solid ${statusInfo.color === 'green' ? '#10b981' : statusInfo.color === 'orange' ? '#f59e0b' : statusInfo.color === 'red' ? '#ef4444' : '#6b7280'}` }}
                onClick={() => handleCardClick(enrollment)}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white rounded-t-lg -m-6 mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 mr-2">
                      <h3 className="text-lg font-semibold line-clamp-1" title={course.title}>
                        {course.title || 'Khóa học'}
                      </h3>
                      <p className="text-blue-100 text-sm mt-1 uppercase font-bold">{course.subject || 'N/A'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium flex items-center gap-1 shrink-0 ${statusInfo.bg}`}>
                      {statusInfo.icon}
                      {statusInfo.text}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="space-y-3 flex-1">
                  {/* Description */}
                  {course.description && (
                    <div className="min-h-[40px]">
                      <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                    </div>
                  )}

                  {/* Location */}
                  {course.location && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <EnvironmentOutlined className="text-blue-500 mt-1 shrink-0" />
                      <span className="line-clamp-2">{course.location}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-100 my-2"></div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-blue-50 p-2 rounded text-center">
                      <p className="text-xs text-gray-500">Lớp</p>
                      <p className="font-bold text-blue-700">Lớp {course.gradeLevel || 'N/A'}</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded text-center">
                      <p className="text-xs text-gray-500">Học phí</p>
                      <p className="font-bold text-green-700">{formatCurrency(course.tuitionFee)}</p>
                    </div>
                  </div>

                  {/* Dates */}
                  {course.startDate && course.endDate && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 justify-center">
                      <CalendarOutlined />
                      <span>{formatDate(course.startDate)} - {formatDate(course.endDate)}</span>
                    </div>
                  )}

                  {/* Enrollment Date */}
                  {enrollment.enrollmentDate && (
                    <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
                      <span>Đăng ký: {formatDate(enrollment.enrollmentDate)}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <TeamOutlined />
                      {course.capacity || 0} học viên
                    </span>
                    <span className="text-blue-600 flex items-center gap-1 cursor-pointer hover:text-blue-700">
                      <EyeOutlined />
                      Xem chi tiết
                    </span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal chi tiết khóa học */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <BookOutlined className="text-orange-500" />
            <span>Chi tiết khóa học</span>
          </div>
        }
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={700}
        className="course-detail-modal"
      >
        {selectedEnrollment && selectedEnrollment.course && (
          <div className="mt-4">
            <Descriptions bordered column={1} size="middle">
              {/* Thông tin khóa học */}
              <Descriptions.Item label={
                <span className="flex items-center gap-2">
                  <BookOutlined className="text-blue-500" />
                  <strong>Khóa học</strong>
                </span>
              }>
                <div>
                  <div className="font-semibold text-lg text-gray-900 mb-1">
                    {selectedEnrollment.course.title || 'Chưa có thông tin'}
                  </div>
                  {selectedEnrollment.course.subject && (
                    <Tag color="orange" className="mt-1">{selectedEnrollment.course.subject}</Tag>
                  )}
                </div>
              </Descriptions.Item>

              {/* Mô tả */}
              {selectedEnrollment.course.description && (
                <Descriptions.Item label={<strong>Mô tả</strong>}>
                  <p className="text-gray-700">{selectedEnrollment.course.description}</p>
                </Descriptions.Item>
              )}

              <Divider />

              {/* Trạng thái đăng ký */}
              <Descriptions.Item label={<strong>Trạng thái đăng ký</strong>}>
                <Tag 
                  color={getEnrollmentStatus(selectedEnrollment.status).color}
                  className="!flex items-center gap-1"
                >
                  {getEnrollmentStatus(selectedEnrollment.status).icon}
                  {getEnrollmentStatus(selectedEnrollment.status).text}
                </Tag>
              </Descriptions.Item>

              {/* Ngày đăng ký */}
              {selectedEnrollment.enrollmentDate && (
                <Descriptions.Item label={<strong>Ngày đăng ký</strong>}>
                  <span className="text-gray-700">{formatDate(selectedEnrollment.enrollmentDate)}</span>
                </Descriptions.Item>
              )}

              <Divider />

              {/* Thông tin lớp */}
              <Descriptions.Item label={
                <span className="flex items-center gap-2">
                  <TeamOutlined className="text-purple-500" />
                  <strong>Thông tin lớp</strong>
                </span>
              }>
                <div className="space-y-2">
                  {selectedEnrollment.course.gradeLevel && (
                    <div>
                      <span className="font-medium">Lớp: </span>
                      <span className="text-gray-700">Lớp {selectedEnrollment.course.gradeLevel}</span>
                    </div>
                  )}
                  {selectedEnrollment.course.capacity && (
                    <div>
                      <span className="font-medium">Sĩ số: </span>
                      <span className="text-gray-700">{selectedEnrollment.course.capacity} học viên</span>
                    </div>
                  )}
                  {selectedEnrollment.course.teacherName && (
                    <div>
                      <span className="font-medium">Giáo viên: </span>
                      <span className="text-gray-700">{selectedEnrollment.course.teacherName}</span>
                    </div>
                  )}
                  {selectedEnrollment.course.teachingMethod && (
                    <div>
                      <span className="font-medium">Phương pháp: </span>
                      <span className="text-gray-700">{getTeachingMethod(selectedEnrollment.course.teachingMethod)}</span>
                    </div>
                  )}
                </div>
              </Descriptions.Item>

              {/* Thời gian */}
              {selectedEnrollment.course.startDate && selectedEnrollment.course.endDate && (
                <Descriptions.Item label={
                  <span className="flex items-center gap-2">
                    <CalendarOutlined className="text-green-500" />
                    <strong>Thời gian khóa học</strong>
                  </span>
                }>
                  <span className="text-gray-700">
                    {formatDate(selectedEnrollment.course.startDate)} - {formatDate(selectedEnrollment.course.endDate)}
                  </span>
                </Descriptions.Item>
              )}

              {/* Địa điểm */}
              {selectedEnrollment.course.location && (
                <Descriptions.Item label={
                  <span className="flex items-center gap-2">
                    <EnvironmentOutlined className="text-red-500" />
                    <strong>Địa điểm</strong>
                  </span>
                }>
                  <span className="text-gray-700">{selectedEnrollment.course.location}</span>
                </Descriptions.Item>
              )}

              {/* Học phí */}
              {selectedEnrollment.course.tuitionFee && (
                <Descriptions.Item label={
                  <span className="flex items-center gap-2">
                    <DollarOutlined className="text-yellow-500" />
                    <strong>Học phí</strong>
                  </span>
                }>
                  <span className="text-gray-700 font-semibold">
                    {formatCurrency(selectedEnrollment.course.tuitionFee)}
                  </span>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </Space>
  )
}

export default StudentCourses


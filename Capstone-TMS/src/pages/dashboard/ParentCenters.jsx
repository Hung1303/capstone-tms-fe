import { useState, useEffect, useCallback } from 'react'
import { SearchOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, BookOutlined, CheckCircleOutlined, ClockCircleOutlined,
         ArrowLeftOutlined, UserOutlined, FileTextOutlined, TeamOutlined, LoadingOutlined } from '@ant-design/icons'
import { Spin, Modal, Select, message, Space, Typography, Card } from 'antd' 
import api from '../../config/axios'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const { Text, Title } = Typography

const ParentCenters = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [centers, setCenters] = useState([])
  const [selectedCenter, setSelectedCenter] = useState(null)
  const [centerCourses, setCenterCourses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCity, setFilterCity] = useState('')
  // const [filterStatus, setFilterStatus] = useState('') // Bỏ filterStatus vì chỉ hiện Active
  const [loading, setLoading] = useState(false)
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [students, setStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [registrationData, setRegistrationData] = useState({
    courseId: '',
    studentProfileId: ''
  })

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 5,
    total: 0
  })

  // Fetch centers from API
  const fetchCenters = useCallback(async (status, pageNumber, pageSize) => {
    try {
      setLoading(true)
      const response = await api.get(`Users/Centers/Status/${status}?pageNumber=${pageNumber}&pageSize=${pageSize}`)
      setCenters(response.data.centers)  
      setPagination(prev => ({
        ...prev,
        total: response.data.totalCount
      }))     
    } catch (error) {
      console.error('Error fetching centers:', error)

      if (error.code === 'ERR_NETWORK') {
        logout();
        navigate("/login")
      }

      setCenters([])
    } finally {
      setLoading(false)
    }
  }, [logout, navigate])

  useEffect(() => {
    fetchCenters(4, pagination.pageNumber, pagination.pageSize)
  }, [fetchCenters, pagination.pageNumber, pagination.pageSize])

  // Fetch courses for selected center
  const fetchCoursesByCenter = async (centerId) => {
    try {
      setCoursesLoading(true)
      const response = await api.get(`/Course?centerProfileId=${centerId}`)
      if (response.data && response.data.data) {
        setCenterCourses(response.data.data)
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

  const fetchStudents = async () => {
    if (!user?.parentProfileId) {
      toast.error('Không tìm thấy thông tin phụ huynh')
      return
    }
    
    try {
      setStudentsLoading(true)
      const response = await api.get(`/Users/${user.parentProfileId}/Students?pageNumber=1&pageSize=100`)
      if (response.data && response.data.students) {
        setStudents(response.data.students)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Không thể tải danh sách học sinh')
      setStudents([])
    } finally {
      setStudentsLoading(false)
    }
  }

  const handleOpenRegistrationModal = (course) => {
    setSelectedCourse(course)
    setRegistrationData({
      courseId: course.id,
      studentProfileId: ''
    })
    setIsModalVisible(true)
    fetchStudents()
  }

  const handleCloseModal = () => {
    setIsModalVisible(false)
    setSelectedCourse(null)
    setRegistrationData({
      courseId: '',
      studentProfileId: ''
    })
  }

  const handleRegistrationSubmit = async () => {
    if (!registrationData.studentProfileId) {
      message.error('Vui lòng chọn học sinh')
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        courseId: registrationData.courseId,
        studentProfileId: registrationData.studentProfileId
      }
      console.log("payload:", payload)

      const apiResponse = await api.post("/Enrollments", payload)
      console.log("apiResponse:", apiResponse)

      const apiSuccess = apiResponse.status
      if (apiSuccess === 200) {
        console.log("selectedCourse:", selectedCourse)
        const payload = {
          amount: selectedCourse.tuitionFee,
          description: `${selectedCourse.title} - ${selectedCourse.centerName}`,
          userId: user.userId,
          centerSubscriptionId: null,
          enrollmentId: apiResponse.data.data.id
        }
        console.log("checkout payload:", payload)
        try {
          const apiResPayment = await api.post("/Payment", payload)
          console.log("apiResPayment:", apiResPayment.data)

          if (apiResPayment.data.success) {
            const paymentId = apiResPayment.data.data.id
            console.log("paymentId:", paymentId)

            try {
              const apiResponse = await api.get(`Payment/VNPAY?paymentId=${paymentId}`)
              console.log("apiResponse:", apiResponse)

              const paymentUrl = apiResponse.data.data
              window.open(paymentUrl, "_blank")

            } catch (error) {
              console.log("lỗi Payment/VNPAY:", error)
            }
          }
        } catch (error) {
          console.log("lỗi payment:", error)
        }
      }
      
      toast.success('Đăng ký khóa học thành công!')
      handleCloseModal()
    } catch (error) {
      console.error('Error registering course:', error)

      if (error.response.data.message.includes("Student is already enrolled or pending payment for this course")) {
        toast.error('Đã đăng ký khóa học này rồi.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Lắng nghe thông điệp từ tab VNPay
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.payment === "success") {
        navigate("/payment/success");
      } else if (event.data.payment === "failed") {
        navigate("/payment/failure");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  const cities = [...new Set(centers.map(c => c.city))]

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
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
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

                  <button 
                    onClick={() => handleOpenRegistrationModal(course)}
                    className="cursor-pointer w-full py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Đăng ký khóa học
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Registration Modal */}
        <Modal
          title="Đăng ký khóa học"
          open={isModalVisible}
          onOk={handleRegistrationSubmit}
          onCancel={handleCloseModal}
          okText="Đăng ký"
          cancelText="Hủy"
          confirmLoading={submitting}
          width={600}
        >
          <div className="space-y-4 py-4">
            {/* Course Info */}
            {selectedCourse && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedCourse.title}</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Môn học:</span> {selectedCourse.subject}</p>
                  <p><span className="font-medium">Lớp:</span> {selectedCourse.gradeLevel}</p>
                  <p><span className="font-medium">Học phí:</span> {formatCurrency(selectedCourse.tuitionFee)}</p>
                </div>
              </div>
            )}

            {/* Course ID (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã khóa học (Course ID)
              </label>
              <input
                type="text"
                value={registrationData.courseId}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Student Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn học sinh <span className="text-red-500">*</span>
              </label>
              {studentsLoading ? (
                <div className="flex justify-center py-4">
                  <Spin size="small" />
                </div>
              ) : (
                <Select
                  placeholder="Chọn học sinh để đăng ký"
                  value={registrationData.studentProfileId || undefined}
                  onChange={(value) => setRegistrationData(prev => ({ ...prev, studentProfileId: value }))}
                  className="w-full"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={students.map(student => ({
                    value: student.profileId,
                    label: `${student.fullName}${student.gradeLevel ? ` - Lớp ${student.gradeLevel}` : ''}`
                  }))}
                />
              )}
              {students.length === 0 && !studentsLoading && (
                <p className="text-sm text-gray-500 mt-2">
                  Bạn chưa có học sinh nào. Vui lòng thêm học sinh trước khi đăng ký khóa học.
                </p>
              )}
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {/* Header */}
      <Card className="!bg-gradient-to-r !from-orange-500 !to-purple-600 !rounded-xl shadow-xl">
        <Title level={2} className="!text-white !m-0 !font-bold">
          <TeamOutlined /> Danh sách trung tâm
        </Title>
        <Text className="!text-white/90 !text-base">
          Chọn trung tâm để xem khóa học.
        </Text>
      </Card>    

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
                <button className="cursor-pointer w-full py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors font-medium">
                  Xem khóa học
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Space>
  )
}

export default ParentCenters
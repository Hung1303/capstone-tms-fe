import { useState, useEffect } from 'react'
import { SearchOutlined, BookOutlined, CalendarOutlined, EnvironmentOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
        StopOutlined, EditOutlined, FileZipOutlined, LaptopOutlined, UsergroupAddOutlined } from '@ant-design/icons'
import api from '../../config/axios'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-toastify'
import { Card, Modal, Select, Space, Spin, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Text, Title } = Typography

const ParentCourses = () => {
  const [courses, setCourses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterGrade, setFilterGrade] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [students, setStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const [registrationData, setRegistrationData] = useState({
    courseId: '',
    studentProfileId: ''
  })

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const response = await api.get('/Course/Published/Courses')
        // Xử lý response theo đúng cấu trúc JSON bạn cung cấp
        if (response.data && response.data.success && response.data.data) {
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

  // Logic lọc
  const filteredCourses = courses.filter(course => {
    // 1. Tìm kiếm theo Tên hoặc Môn học (Bỏ tìm theo CenterName vì API không trả về)
    const matchSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        course.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // 2. Các bộ lọc khác
    const matchSubject = !filterSubject || course.subject === filterSubject
    const matchGrade = !filterGrade || course.gradeLevel?.toString() === filterGrade
    
    const matchStatus = filterStatus === '' || 
        (filterStatus === 'Approved' && (course.status === 2 || course.status === 'Approved')) ||
        (filterStatus === 'PendingApproval' && (course.status === 1 || course.status === 'PendingApproval')) ||
        // ... (các status khác nếu cần)
        (course.status?.toString() === filterStatus)

    return matchSearch && matchSubject && matchGrade && matchStatus
  })

  // Helper: Mapping Teaching Method
  const getTeachingMethod = (method) => {
    switch (method) {
      case 1: return 'Trực tiếp';
      case 2: return 'Trực tuyến';
      case 3: return 'Kết hợp';
      default: return 'Khác';
    }
  }

  // Helper: Status Badge
  const getStatusInfo = (status) => {
    const statusNum = typeof status === 'string' && !isNaN(status) ? parseInt(status) : status;
    switch (statusNum) {
      case 0: return { color: 'gray', icon: <EditOutlined />, text: 'Bản nháp', bg: 'bg-gray-100 text-gray-600' };
      case 1: return { color: 'orange', icon: <ClockCircleOutlined />, text: 'Chờ duyệt', bg: 'bg-orange-100 text-orange-600' };
      case 2: return { color: 'green', icon: <CheckCircleOutlined />, text: 'Đang hoạt động', bg: 'bg-green-100 text-green-600' };
      case 3: return { color: 'red', icon: <CloseCircleOutlined />, text: 'Từ chối', bg: 'bg-red-100 text-red-600' };
      case 4: return { color: 'yellow', icon: <StopOutlined />, text: 'Tạm ngưng', bg: 'bg-yellow-100 text-yellow-700' };
      case 5: return { color: 'purple', icon: <FileZipOutlined />, text: 'Lưu trữ', bg: 'bg-purple-100 text-purple-600' };
      default: return { color: 'blue', icon: <BookOutlined />, text: 'Không xác định', bg: 'bg-blue-100 text-blue-600' };
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  // Get unique values for filters
  const subjects = [...new Set(courses.map(c => c.subject).filter(Boolean))]
  const grades = [...new Set(courses.map(c => c.gradeLevel).filter(Boolean))].sort((a, b) => a - b)

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
      toast.error('Vui lòng chọn học sinh')
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

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {/* Header */}
      <Card className="!bg-gradient-to-r !from-orange-500 !to-purple-600 !rounded-xl shadow-xl">
        <Title level={2} className="!text-white !m-0 !font-bold">
          <BookOutlined /> Danh sách khóa học
        </Title>
        <Text className="!text-white/90 !text-base">
          Tìm và đăng ký khóa học phù hợp cho con bạn.
        </Text>
      </Card>  

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <div className="relative">
              <SearchOutlined className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Tên khóa học, môn học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Subject Filter */}
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

          {/* Grade Filter */}
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

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Approved">Đang hoạt động</option>
              <option value="PendingApproval">Chờ duyệt</option>
            </select>
          </div>

          {/* Clear Filter */}
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

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
             <div className="col-span-full text-center py-12">Đang tải dữ liệu...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOutlined className="text-4xl text-gray-300 mb-3" />
            <p className="text-gray-600">Không tìm thấy khóa học nào</p>
          </div>
        ) : (
          filteredCourses.map((course) => {
            const statusInfo = getStatusInfo(course.status);
            
            return (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 mr-2">
                      <h3 className="text-lg font-semibold line-clamp-1" title={course.title}>{course.title}</h3>
                      <p className="text-blue-100 text-sm mt-1 uppercase font-bold">{course.subject}</p>
                    </div>
                    {/* Status Badge */}
                    <span className={`px-2 py-1 text-xs rounded-full font-medium flex items-center gap-1 shrink-0 ${statusInfo.bg}`}>
                      {statusInfo.icon}
                      {statusInfo.text}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3 flex-1">
                  
                  {/* Description */}
                  <div className="min-h-[40px]">
                    <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                  </div>

                  {/* Location (Thay thế cho CenterName vì API không có CenterName) */}
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <EnvironmentOutlined className="text-blue-500 mt-1 shrink-0" />
                    <span className="line-clamp-2">{course.location}</span>
                  </div>

                  <div className="border-t border-gray-100 my-2"></div>

                  {/* Info Grid: Phương pháp, Sĩ số */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <LaptopOutlined className="text-purple-500" />
                      <span>{getTeachingMethod(course.teachingMethod)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <UsergroupAddOutlined className="text-orange-500" />
                      <span>Sĩ số: {course.capacity}</span>
                    </div>
                  </div>

                  {/* Info Grid: Lớp, Học phí */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-blue-50 p-2 rounded text-center">
                      <p className="text-xs text-gray-500">Lớp</p>
                      <p className="font-bold text-blue-700">Lớp {course.gradeLevel}</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded text-center">
                      <p className="text-xs text-gray-500">Học phí</p>
                      <p className="font-bold text-green-700">{formatCurrency(course.tuitionFee)}</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 justify-center">
                    <CalendarOutlined />
                    <span>{formatDate(course.startDate)} - {formatDate(course.endDate)}</span>
                  </div>
                </div>

                {/* Footer Button */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 mt-auto">
                  <button
                    onClick={() => handleOpenRegistrationModal(course)} 
                    className="cursor-pointer w-full py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                  >
                    Đăng ký ngay
                  </button>
                </div>
              </div>
            )
          })
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
    </Space>
  )
}

export default ParentCourses
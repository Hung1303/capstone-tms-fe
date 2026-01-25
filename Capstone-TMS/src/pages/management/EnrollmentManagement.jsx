import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../config/axios'
import { SearchOutlined, BookOutlined, CheckCircleOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Space, Table, Tag, Tooltip, Modal, Spin, Descriptions, Input, Select, Typography } from 'antd'
import { toast } from 'react-toastify'

const { Title, Text } = Typography

const EnrollmentManagement = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [enrollments, setEnrollments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSubject, setFilterSubject] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)
  const [courseDetails, setCourseDetails] = useState(null)
  const [loadingCourse, setLoadingCourse] = useState(false)
  const [processingAction, setProcessingAction] = useState(false)

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 1000,
    total: 0
  })

  const getStatusEnrollment = (status) => {
    const statusMap = {
      0: { color: 'orange', text: 'Chờ duyệt' },
      1: { color: 'yellow', text: 'Đã xác nhận' },
      2: { color: 'red', text: 'Đã hủy' },
      3: { color: 'blue', text: 'Đã hoàn tất' },
      4: { color: 'green', text: 'Đã thanh toán' }
    }

    const statusInfo = statusMap[status] || { color: 'default', text: status }
    return (
      <Tag color={statusInfo.color}>
        {statusInfo.text}
      </Tag>
    )
  }

  const getStatusCourse = (status) => {
    const statusMap = {
      0: { color: 'gray', text: 'Bản Nháp' },
      1: { color: 'orange', text: 'Chờ chấp nhận' },
      2: { color: 'yellow', text: 'Đã chấp nhận' },
      3: { color: 'red', text: 'Đã từ chối' },
      4: { color: 'blue', text: 'Đã cấm' },
      5: { color: 'green', text: 'Đã lưu trữ' }
    }

    const statusInfo = statusMap[status] || { color: 'default', text: status }
    return (
      <Tag color={statusInfo.color}>
        {statusInfo.text}
      </Tag>
    )
  }

  const courseCache = {}

  const getCourse = async (courseId) => {
    if (!courseId) return null;

    // Nếu có trong cache thì dùng luôn
    if (courseCache[courseId]) {
      return courseCache[courseId];
    }

    try {
      const response = await api.get(`/Course/${courseId}`);
      const data = response.data.data;

      // Lưu cache
      courseCache[courseId] = data;

      return data;
    } catch (error) {
      console.error("Error fetching course:", courseId, error);
      return null;
    }
  };

  const fetchEnrollments = useCallback(async (pageNumber, pageSize) => {
    if (!user?.centerProfileId) return

    setLoading(true)
    try {
      const apiResponse = await api.get(`/Enrollments/Center/${user.centerProfileId}/Enrollments?pageNumber=${pageNumber}&pageSize=${pageSize}`)
      console.log("apiResponse:", apiResponse)

      const enrollmentDraft = apiResponse.data.data;

      // Lấy danh sách course kèm enrollment
      const enrollments = await Promise.all(
        enrollmentDraft.map(async (enrollment) => {
          const courseObj = await getCourse(enrollment.courseId);

          return {
            ...enrollment,
            course: courseObj
              ? {
                  capacity: courseObj.capacity,
                  description: courseObj.description,
                  teacherName: courseObj.teacherName,
                  title: courseObj.title,
                  tuitionFee: courseObj.tuitionFee,
                }
              : null,
          };
        })
      );

      setEnrollments(enrollments)
      setPagination(prev => ({
        ...prev,
        pageNumber: apiResponse.data.pagination.pageNumber || pageNumber,
        pageSize: apiResponse.data.pagination.pageSize || pageSize,
        total: apiResponse.data.pagination.totalItems || 0
      }))
    } catch (error) {
      console.log("error:", error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchEnrollments(pagination.pageNumber, pagination.pageSize)
  }, [fetchEnrollments, pagination.pageNumber, pagination.pageSize])

  console.log("enrollments:", enrollments)

  const filteredTeachers = enrollments.filter(enroll => {
    const matchesSearch =
      enroll.parentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enroll.studentName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSubject = !filterSubject || filterSubject === 'all' || enroll.subject === filterSubject
    const matchesStatus = !filterStatus || filterStatus === 'all' || enroll.status === Number(filterStatus)

    return matchesSearch && matchesSubject && matchesStatus
  })

  const fetchCourseDetails = async (courseId) => {
    if (!courseId) return

    setLoadingCourse(true)
    try {
      const response = await api.get(`/Course/${courseId}`)
      console.log("response fetchCourseDetails:", response.data.data)
      setCourseDetails(response.data.data)
    } catch (error) {
      console.error('Error fetching course details:', error)
      toast.error('Không thể tải thông tin khóa học')
      setCourseDetails(null)
    } finally {
      setLoadingCourse(false)
    }
  }

  const handleConfirmEnrolled = (enroll) => {
    console.log("handleConfirmEnrolled:", enroll)
    setSelectedEnrollment(enroll)
    setIsModalVisible(true)
    fetchCourseDetails(enroll.courseId)
  }

  const handleCloseModal = () => {
    setIsModalVisible(false)
    setSelectedEnrollment(null)
    setCourseDetails(null)
    setProcessingAction(false)
  }

  const handleApprove = async () => {
    if (!selectedEnrollment?.id || !user?.centerProfileId) {
      toast.error('Thiếu thông tin cần thiết')
      return
    }

    setProcessingAction(true)
    try {
      const apiRes = await api.put(`/Enrollments/${selectedEnrollment.id}/approve?approverProfileId=${user.centerProfileId}`)
      console.log("apiRes:", apiRes)
      toast.success('Đã chấp nhận đăng ký khóa học thành công!')
      handleCloseModal()

      fetchEnrollments(pagination.pageNumber, pagination.pageSize)
    } catch (error) {
      console.error('Error approving enrollment:', error)
      toast.error(error.response?.data?.message || 'Chấp nhận đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setProcessingAction(false)
    }
  }

  const handleReject = async () => {
    if (!selectedEnrollment?.id || !user?.centerProfileId) {
      toast.error('Thiếu thông tin cần thiết')
      return
    }

    setProcessingAction(true)
    try {
      const apiRes = await api.put(`/Enrollments/${selectedEnrollment.id}/reject?approverProfileId=${user.centerProfileId}`)
      console.log("apiRes:", apiRes)
      toast.success('Đã từ chối đăng ký khóa học!')
      handleCloseModal()

      fetchEnrollments(pagination.pageNumber, pagination.pageSize)
    } catch (error) {
      console.error('Error rejecting enrollment:', error)
      toast.error(error.response?.data?.message || 'Từ chối đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setProcessingAction(false)
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getTeachingMethodLabel = (method) => {
    let methodMap = {}

    if (typeof method === "string") {
      methodMap = {
        'InPerson': 'Trực tiếp',
        'Online': 'Trực tuyến',
        'Hybrid': 'Kết hợp'
      }
    } else {
      methodMap = {
        1: 'Trực tiếp',
        2: 'Trực tuyến',
        3: 'Kết hợp'
      }
    }
    return methodMap[method] || method || 'N/A'
  }

  // Lấy danh sách môn học duy nhất từ danh sách enrollment
  const getUniqueSubjects = () => {
    const subjects = new Set()
    enrollments.forEach(enroll => {
      if (enroll.subject) {
        subjects.add(enroll.subject)
      }
    })
    return Array.from(subjects).sort()
  }

  const getPriceDisplay = (price) => {
    if (!price) return "0 ₫";

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(price);
  };

  const columns = [
    {
      title: 'Tên phụ huynh',
      key: 'parent',
      render: (enroll) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm font-medium">
              {enroll.parentName?.charAt(0)}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{enroll.parentName}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tên học sinh',
      key: 'student',
      render: (student) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
          <div className="text-xs text-gray-400">{student.schoolName}</div>
        </div>
      )
    },
    {
      title: 'Khóa học',
      key: 'course',
      render: (enroll) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{enroll.course.title}</div>
          <div className="text-xs text-gray-400">GV: {enroll.course.teacherName}</div>
        </div>
      )
    },
    {
      title: 'Học phí',
      key: 'tuitionFee',
      render: (enroll) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{getPriceDisplay(enroll.course.tuitionFee)}</div>
        </div>
      )
    },
    {
      title: 'Tình trạng',
      key: 'status',
      render: (status) => getStatusEnrollment(status.status)
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, enroll) => (
        <Space size="small">
          <Tooltip title="Xác nhận">
            <Button
              type="link"
              icon={<CheckCircleOutlined className="!text-xl !text-green-500" />}
              onClick={() => handleConfirmEnrolled(enroll)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {/* Header */}
      <Card className="!bg-gradient-to-br !from-[#d92736] !to-[#f04b4b] !rounded-xl shadow-xl">
        <Title level={2} className="!text-white !m-0 !font-bold">
          <UserOutlined /> Quản lý học sinh
        </Title>
        <Text className="!text-white/90 !text-base">
          Quản lý học sinh tham gia.
        </Text>
      </Card>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Tìm kiếm theo tên phụ huynh, tên học sinh..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </div>
          <Select
            value={filterSubject}
            onChange={(value) => setFilterSubject(value)}
            placeholder="Tất cả môn học"
            style={{ width: 200 }}
            allowClear
          >
            <Select.Option value="all">Tất cả môn học</Select.Option>
            {getUniqueSubjects().map(subject => (
              <Select.Option key={subject} value={subject}>{subject}</Select.Option>
            ))}
          </Select>
          <Select
            value={filterStatus}
            onChange={(value) => setFilterStatus(value)}
            placeholder="Tất cả trạng thái"
            style={{ width: 200 }}
            allowClear
          >
            <Select.Option value="all">Tất cả trạng thái</Select.Option>
            <Select.Option value="0">Chờ duyệt</Select.Option>
            <Select.Option value="1">Đã xác nhận</Select.Option>
            <Select.Option value="2">Đã hủy</Select.Option>
            <Select.Option value="3">Đã hoàn tất</Select.Option>
            <Select.Option value="4">Đã thanh toán</Select.Option>
          </Select>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        title="Xác nhận đăng ký khóa học"
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal} disabled={processingAction}>
            Đóng
          </Button>,
          <Button
            key="reject"
            danger
            onClick={handleReject}
            loading={processingAction}
            disabled={processingAction || selectedEnrollment?.status !== 4}
          >
            Từ Chối
          </Button>,
          <Button
            key="approve"
            type="primary"
            onClick={handleApprove}
            loading={processingAction}
            disabled={processingAction || selectedEnrollment?.status !== 4}
          >
            Chấp Nhận
          </Button>
        ]}
        width={800}
      >
        {selectedEnrollment && (
          <div className="space-y-6">
            {/* Enrollment Information */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BookOutlined className="mr-2 text-blue-500" />
                Thông tin đăng ký
              </h3>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Tên phụ huynh">
                  {selectedEnrollment.parentName}
                </Descriptions.Item>
                <Descriptions.Item label="Tên học sinh">
                  {selectedEnrollment.studentName}
                </Descriptions.Item>
                <Descriptions.Item label="Trường học">
                  {selectedEnrollment.schoolName}
                </Descriptions.Item>
                <Descriptions.Item label="Lớp">
                  {selectedEnrollment.gradelevel}
                </Descriptions.Item>
                <Descriptions.Item label="Môn học">
                  {selectedEnrollment.subject}
                </Descriptions.Item>
                <Descriptions.Item label="Phương thức dạy">
                  {getTeachingMethodLabel(selectedEnrollment.teachingMethod)}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {getStatusEnrollment(selectedEnrollment.status)}
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* Course Details */}
            {loadingCourse ? (
              <div className="flex justify-center py-8">
                <Spin size="large" tip="Đang tải thông tin khóa học..." />
              </div>
            ) : courseDetails
              ? (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOutlined className="mr-2 !text-green-500" />
                    Thông tin khóa học
                  </h3>
                  {console.log("courseDetails:", courseDetails)}
                  <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="Tên khóa học">
                      {courseDetails.title || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Môn học">
                      {courseDetails.subject || selectedEnrollment.subject}
                    </Descriptions.Item>
                    <Descriptions.Item label="Lớp">
                      {courseDetails.gradeLevel || selectedEnrollment.gradelevel}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mô tả" span={2}>
                      {courseDetails.description || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Học phí">
                      {formatCurrency(courseDetails.tuitionFee)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Sức chứa">
                      {courseDetails.capacity ? `${courseDetails.capacity} học sinh` : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày bắt đầu">
                      {formatDate(courseDetails.startDate)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày kết thúc">
                      {formatDate(courseDetails.endDate)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa điểm" span={2}>
                      {courseDetails.location || selectedEnrollment.location}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phương thức dạy">
                      {getTeachingMethodLabel(courseDetails.teachingMethod)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái khóa học">
                      {courseDetails.status !== undefined ? (
                        getStatusCourse(courseDetails.status)
                      ) : 'N/A'}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
                  <p className="text-yellow-700">Không thể tải thông tin khóa học</p>
                </div>
              )}
          </div>
        )}
      </Modal>

      {/* Teachers table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredTeachers}
          loading={loading}
          rowKey={(record) => record.profileId || record.id}
          pagination={{ pageSize: 10 }}
          // pagination={{
          //   current: pagination.pageNumber,
          //   pageSize: pagination.pageSize,
          //   total: searchTerm || filterSubject !== 'all' || filterStatus !== 'all' 
          //     ? filteredTeachers.length 
          //     : pagination.total,
          //   showSizeChanger: true,
          //   showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} giáo viên`,
          //   onChange: (page, pageSize) => {
          //     setPagination(prev => ({ ...prev, pageNumber: page, pageSize }))
          //     if (!searchTerm && filterSubject === 'all' && filterStatus === 'all') {
          //       fetchEnrollments(page, pageSize)
          //     }
          //   },
          //   onShowSizeChange: (current, size) => {
          //     setPagination(prev => ({ ...prev, pageNumber: 1, pageSize: size }))
          //     if (!searchTerm && filterSubject === 'all' && filterStatus === 'all') {
          //       fetchEnrollments(1, size)
          //     }
          //   }
          // }}
          scroll={{ x: "max-content", ...(filteredTeachers.length > 5) ? { y: 75 * 5 } : "" }}
          locale={{
            emptyText: 'Không tìm thấy giáo viên nào'
          }}
        />
      </Card>
    </Space>
  )
}

export default EnrollmentManagement

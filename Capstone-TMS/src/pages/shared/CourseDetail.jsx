import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
// Import message để dùng hook useMessage
import { Card, Button, Spin, Empty, message, Divider, Typography, Tag, List, Rate, Avatar } from 'antd'
import { ArrowLeftOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import api from '../../config/axios'
import { useAuth } from '../../contexts/AuthContext'

const { Title, Text, Paragraph } = Typography

const teachingMethodLabel = {
  1: "Offline",
  2: "Online",
  3: "Trực tuyến + Offline"
}

const statusLabel = {
  0: { text: "Nháp", color: "default" },
  1: { text: "Chờ duyệt", color: "gold" },
  2: { text: "Đang mở", color: "green" },
  3: { text: "Tạm dừng", color: "red" }
}

const formatCurrency = (value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)

const CourseDetail = () => {
  const { courseId } = useParams() 
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // --- THAY ĐỔI 1: Khởi tạo message hook ---
  const [messageApi, contextHolder] = message.useMessage();

  const [course, setCourse] = useState(null)
  const [loadingCourse, setLoadingCourse] = useState(false)

  const [feedbacks, setFeedbacks] = useState([])
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [feedbackPagination, setFeedbackPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0
  })

  // 1. Lấy chi tiết khóa học
  const fetchCourseDetail = async () => {
    if (!courseId) return
    setLoadingCourse(true)
    try {
      const response = await api.get(`/Course/${courseId}`)
      const courseData = response.data?.data || response.data
      setCourse(courseData)
    } catch (error) {
      console.error('Lỗi khi tải chi tiết khóa học:', error)
      // Dùng messageApi thay vì message thường
      messageApi.error('Không thể tải thông tin khóa học') 
    } finally {
      setLoadingCourse(false)
    }
  }

  // 2. Lấy danh sách Feedback
  const fetchFeedbacks = async (pageNumber = 1) => {
    if (!courseId) return
    setLoadingFeedback(true)
    try {
      const response = await api.get(`/CourseFeedbacks/course/${courseId}`, {
        params: {
          pageNumber: pageNumber,
          pageSize: feedbackPagination.pageSize,
        }
      })
      const { data, totalCount } = response.data
      console.log("Feedback data:", data)
      const approvedFeedbacks = data.filter(
        feedback => feedback.status === 1
      )
      setFeedbacks(approvedFeedbacks || [])
      setFeedbackPagination(prev => ({
        ...prev,
        current: pageNumber,
        total: totalCount
      }))
    } catch (error) {
      console.error("Lỗi tải feedback:", error)
    } finally {
      setLoadingFeedback(false)
    }
  }

  useEffect(() => {
    fetchCourseDetail()
    fetchFeedbacks(1)
  }, [courseId])

  // --- XỬ LÝ NÚT THANH TOÁN ---
  const handlePaymentClick = () => {
    if (user && user.role === "Parent") {
      navigate("/parent/courses")
    } else {
      // --- THAY ĐỔI 2: Dùng messageApi để hiện thông báo ---
      messageApi.warning("Vui lòng đăng nhập tài khoản Phụ huynh để thanh toán!");
    }
  }

  const handleFeedbackPageChange = (page) => {
    fetchFeedbacks(page)
  }

  if (loadingCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {/* Nhớ chèn contextHolder vào cả màn hình loading để đề phòng lỗi */}
        {contextHolder}
        <Spin size="large" tip="Đang tải thông tin khóa học..." />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        {contextHolder}
        <div className="max-w-7xl mx-auto px-4">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/courses')}
            className="mb-4"
          >
            Quay lại
          </Button>
          <Empty description="Không tìm thấy khóa học" />
        </div>
      </div>
    )
  }

  const status = statusLabel[course.status] || { text: "Không xác định", color: "default" }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      {/* --- THAY ĐỔI 3: Đặt contextHolder ở đây để hiển thị Toast --- */}
      {contextHolder}

      <div className="max-w-7xl mx-auto px-4">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/courses')}
          className="mb-4"
        >
          Quay lại danh sách
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CỘT TRÁI */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm rounded-lg border-gray-200">
              <div className="mb-6">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <Title level={2} className="!mb-2">{course.title}</Title>
                    <Text type="secondary" className="text-lg">{course.subject}</Text>
                  </div>
                  <Tag color={status.color} className="text-base px-3 py-1">
                    {status.text}
                  </Tag>
                </div>
              </div>
              <Divider />
              {course.description && (
                <div className="mb-6">
                  <Title level={4}>Mô tả khóa học</Title>
                  <Paragraph className="text-base leading-relaxed text-gray-700">
                    {course.description}
                  </Paragraph>
                </div>
              )}
              <div className="mb-6">
                <Title level={4} className="mb-4">Thông tin chi tiết</Title>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoBox label="Địa điểm" value={course.location} />
                  <InfoBox label="Khối lớp" value={`Lớp ${course.gradeLevel}`} />
                  <InfoBox label="Học kỳ" value={course.semester} />
                  <InfoBox label="Hình thức" value={teachingMethodLabel[course.teachingMethod]} />
                  <InfoBox label="Ngày bắt đầu" value={dayjs(course.startDate).format("DD/MM/YYYY")} />
                  <InfoBox label="Ngày kết thúc" value={dayjs(course.endDate).format("DD/MM/YYYY")} />
                  <InfoBox label="Sĩ số" value={`${course.capacity} học viên`} />
                </div>
              </div>
            </Card>

            <Card className="shadow-sm rounded-lg border-gray-200" title={`Đánh giá từ học viên (${feedbacks.length})`}>
              <List
                loading={loadingFeedback}
                itemLayout="vertical"
                dataSource={feedbacks}
                locale={{ emptyText: <Empty description="Chưa có đánh giá nào" /> }}
                pagination={feedbackPagination.total > feedbackPagination.pageSize ? {
                  onChange: handleFeedbackPageChange,
                  current: feedbackPagination.current,
                  pageSize: feedbackPagination.pageSize,
                  total: feedbackPagination.total,
                  align: 'center'
                } : false}
                renderItem={(item) => (
                  <List.Item key={item.id} className="border-b last:border-0">
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          src={item.studentAvatar} 
                          icon={<UserOutlined />} 
                          size="large" 
                          className="bg-blue-100 text-blue-600"
                        />
                      }
                      title={
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <Text strong className="text-base mr-2 block">
                              {item.studentName || "Học viên ẩn danh"}
                            </Text>
                            <Rate disabled allowHalf defaultValue={item.rating} className="text-sm text-yellow-500" />
                          </div>
                          <Text type="secondary" className="text-xs flex items-center">
                            <ClockCircleOutlined className="mr-1" />
                            {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                          </Text>
                        </div>
                      }
                      description={
                        <Paragraph className="text-gray-700 mt-2 mb-0 text-base">
                          {item.comment}
                        </Paragraph>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>

          {/* CỘT PHẢI */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm rounded-lg border-gray-200 sticky top-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg mb-6">
                <Text type="secondary" className="block mb-1 text-gray-500">Học phí trọn gói</Text>
                <Title level={2} className="!mb-0 text-blue-600">
                  {formatCurrency(course.tuitionFee)}
                </Title>
              </div>

              <div className="space-y-4">
                <Button 
                  type="primary" 
                  size="large" 
                  block 
                  className="h-12 text-lg font-semibold shadow-md"
                  onClick={handlePaymentClick}
                >
                  Đăng ký & Thanh toán
                </Button>
                
                <div className="text-center">
                  <Text type="secondary" className="text-xs">
                    * Chỉ tài khoản <strong>Phụ huynh</strong> mới có thể thực hiện thanh toán.
                  </Text>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}

const InfoBox = ({ label, value }) => (
  <div className="border border-gray-100 bg-gray-50 rounded-lg p-3">
    <Text type="secondary" className="block mb-1 text-xs uppercase font-medium">{label}</Text>
    <Text strong className="text-sm md:text-base text-gray-800">{value || "---"}</Text>
  </div>
)

export default CourseDetail
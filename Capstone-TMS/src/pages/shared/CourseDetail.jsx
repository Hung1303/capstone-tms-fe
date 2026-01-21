import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Spin, Empty, message, Divider, Typography, Space, Tag, List, Modal } from 'antd'
import { ArrowLeftOutlined, ShoppingCartOutlined, LockOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import api from '../../config/axios'
import { useCart } from '../../hooks/useCart'
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
  const { addItem, cartItems, removeItem, totalTuition } = useCart()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(false)

  // Lấy chi tiết khóa học
  const fetchCourseDetail = async () => {
    if (!courseId) return
    setLoading(true)
    try {
      const response = await api.get(`/Course/${courseId}`)
      const courseData = response.data?.data || response.data
      setCourse(courseData)
    } catch (error) {
      console.error('Lỗi khi tải chi tiết khóa học:', error)
      message.error('Không thể tải thông tin khóa học')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourseDetail()
  }, [courseId])

  const handleAddToCart = (course) => {
    if (!user) {
      Modal.confirm({
        title: "Yêu cầu đăng nhập",
        content: "Bạn cần đăng nhập để thêm khóa học vào giỏ hàng. Bạn có muốn đăng nhập ngay không?",
        okText: "Đăng nhập",
        cancelText: "Hủy",
        onOk() {
          navigate("/login")
        },
      })
      return
    }

    if (user.role !== "Parent") {
      message.error("Chỉ phụ huynh mới có thể thêm khóa học vào giỏ hàng")
      return
    }

    const added = addItem(course)
    if (added) {
      message.success("Đã thêm vào giỏ hàng")
    } else {
      message.info("Khóa học đã có trong giỏ")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin size="large" tip="Đang tải thông tin khóa học..." />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
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
  const inCart = cartItems.some((item) => item.id === course.id)

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Nút quay lại */}
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/courses')}
          className="mb-4"
        >
          Quay lại
        </Button>

        <div className="grid grid-cols-3 gap-6">
          {/* Cột trái: Chi tiết khóa học (2/3) */}
          <div className="col-span-2">
            <Card className="shadow-sm rounded-lg border-gray-200">
              {/* Header */}
              <div className="mb-6">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <Title level={2} className="!mb-2">
                      {course.title}
                    </Title>
                    <Text type="secondary" className="text-lg">
                      {course.subject}
                    </Text>
                  </div>
                  <Tag color={status.color} className="text-base px-3 py-1">
                    {status.text}
                  </Tag>
                </div>
              </div>

              <Divider />

              {/* Mô tả */}
              {course.description && (
                <div className="mb-6">
                  <Title level={4}>Mô tả</Title>
                  <Paragraph className="text-base leading-relaxed">
                    {course.description}
                  </Paragraph>
                </div>
              )}

              {/* Thông tin chi tiết */}
              <div className="mb-6">
                <Title level={4}>Thông tin chi tiết</Title>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <Text type="secondary" className="block mb-2">Địa điểm</Text>
                    <Text strong className="text-base">{course.location}</Text>
                  </div>
                  <div className="border rounded-lg p-4">
                    <Text type="secondary" className="block mb-2">Khối lớp</Text>
                    <Text strong className="text-base">Lớp {course.gradeLevel}</Text>
                  </div>
                  <div className="border rounded-lg p-4">
                    <Text type="secondary" className="block mb-2">Học kỳ</Text>
                    <Text strong className="text-base">{course.semester}</Text>
                  </div>
                  <div className="border rounded-lg p-4">
                    <Text type="secondary" className="block mb-2">Hình thức dạy</Text>
                    <Text strong className="text-base">{teachingMethodLabel[course.teachingMethod] || "Khác"}</Text>
                  </div>
                  <div className="border rounded-lg p-4">
                    <Text type="secondary" className="block mb-2">Ngày bắt đầu</Text>
                    <Text strong className="text-base">{dayjs(course.startDate).format("DD/MM/YYYY")}</Text>
                  </div>
                  <div className="border rounded-lg p-4">
                    <Text type="secondary" className="block mb-2">Ngày kết thúc</Text>
                    <Text strong className="text-base">{dayjs(course.endDate).format("DD/MM/YYYY")}</Text>
                  </div>
                  <div className="border rounded-lg p-4">
                    <Text type="secondary" className="block mb-2">Sĩ số</Text>
                    <Text strong className="text-base">{course.capacity} học viên</Text>
                  </div>
                  <div className="border rounded-lg p-4">
                    <Text type="secondary" className="block mb-2">Học phí</Text>
                    <Text strong className="text-base text-green-600">{formatCurrency(course.tuitionFee)}</Text>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Nút hành động */}
              <Button 
                type="primary" 
                size="large"
                block
                icon={user?.role === "Parent" ? <ShoppingCartOutlined /> : <LockOutlined />}
                onClick={() => handleAddToCart(course)} 
                disabled={inCart || (user && user.role !== "Parent")}
                danger={user && user.role !== "Parent"}
                className="h-auto whitespace-normal py-3 text-base"
              >
                {inCart ? "Đã trong giỏ" : user?.role === "Parent" ? "Thêm vào giỏ hàng" : "Chỉ phụ huynh mới có thể thêm khóa học vào giỏ"}
              </Button>
            </Card>
          </div>

          {/* Cột phải: Giỏ hàng (1/3) */}
          <div className="col-span-1">
            <Card className="shadow-sm rounded-lg border-gray-200 sticky top-6">
              <Title level={5} className="!mb-4">
                <ShoppingCartOutlined className="mr-2" />
                Giỏ hàng
              </Title>

              {cartItems.length === 0 ? (
                <Empty description="Chưa có khóa học trong giỏ" size="small" />
              ) : (
                <div className="space-y-3">
                  <List
                    dataSource={cartItems}
                    renderItem={(item) => (
                      <List.Item
                        className="!px-0 !py-2 border-b"
                        actions={[
                          <Button
                            type="text"
                            danger
                            size="small"
                            onClick={() => removeItem(item.id)}
                            key="remove"
                          >
                            Xóa
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          title={<span className="font-medium text-sm">{item.title}</span>}
                          description={
                            <Space direction="vertical" size={0} className="text-xs">
                              <span>Môn: {item.subject}</span>
                              <span className="text-green-600 font-medium">{formatCurrency(item.tuitionFee)}</span>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />

                  <Divider className="!my-3" />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Text strong>Tổng học phí</Text>
                      <Title level={4} className="!mb-0 text-green-600">
                        {formatCurrency(totalTuition)}
                      </Title>
                    </div>
                    <Button 
                      type="primary" 
                      block 
                      onClick={() => navigate("/cart")}
                    >
                      Đến trang giỏ hàng
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetail
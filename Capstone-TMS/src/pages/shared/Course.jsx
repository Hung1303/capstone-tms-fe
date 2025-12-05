import { useEffect, useState } from "react"
import { Button, Card, Col, Divider, Empty, List, Row, Space, Tag, Typography, message } from "antd"
import { DeleteOutlined, ShoppingCartOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import dayjs from "dayjs"
import api from "../../config/axios"
import { useCart } from "../../hooks/useCart"

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

const Course = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const { cartItems, addItem, removeItem, totalTuition } = useCart()
  const navigate = useNavigate()

  const fetchCourses = async (pageNumber = 1, pageSize = 8) => {
    setLoading(true)
    try {
      const apiResponse = await api.get(`/Course/Published/Courses?pageNumber=${pageNumber}&pageSize=${pageSize}`)
      setCourses(apiResponse?.data?.data || [])
    } catch (error) {
      console.log("error:", error)
      message.error("Không thể tải danh sách khóa học. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses(1, 8)
  }, [])

  const handleAddToCart = (course) => {
    const added = addItem(course)
    if (added) {
      message.success("Đã thêm vào giỏ hàng")
    } else {
      message.info("Khóa học đã có trong giỏ")
    }
  }

  const courseCards = (
    <Row gutter={[24, 24]}>
      {courses.map((course) => {
        const status = statusLabel[course.status] || { text: "Không xác định", color: "default" }
        const inCart = cartItems.some((item) => item.id === course.id)
        return (
          <Col key={course.id} xs={24} sm={12} lg={8}>
            <Card
              title={
                <Space direction="vertical" size={4}>
                  <Typography.Text strong className="text-base">{course.title}</Typography.Text>
                  <Typography.Text type="secondary">{course.subject}</Typography.Text>
                </Space>
              }
              extra={<Tag color={status.color}>{status.text}</Tag>}
              loading={loading}
              className="shadow-sm hover:shadow-md transition-shadow h-full"
            >
              <Space direction="vertical" size={10} className="w-full">
                <Typography.Paragraph ellipsis={{ rows: 2 }}>{course.description || "Chưa có mô tả"}</Typography.Paragraph>
                <Space direction="vertical" size={6} className="w-full text-sm">
                  <div><Typography.Text strong>Địa điểm:</Typography.Text> {course.location}</div>
                  <div><Typography.Text strong>Khối:</Typography.Text> Lớp {course.gradeLevel}</div>
                  <div><Typography.Text strong>Học kỳ:</Typography.Text> {course.semester}</div>
                  <div><Typography.Text strong>Thời gian:</Typography.Text> {dayjs(course.startDate).format("DD/MM/YYYY")} - {dayjs(course.endDate).format("DD/MM/YYYY")}</div>
                  <div><Typography.Text strong>Hình thức:</Typography.Text> {teachingMethodLabel[course.teachingMethod] || "Khác"}</div>
                  <div><Typography.Text strong>Học phí:</Typography.Text> {formatCurrency(course.tuitionFee)}</div>
                  <div><Typography.Text strong>Sĩ số:</Typography.Text> {course.capacity} học viên</div>
                </Space>
                <Button type="primary" block icon={<ShoppingCartOutlined />} onClick={() => handleAddToCart(course)} disabled={inCart}>
                  {inCart ? "Đã trong giỏ" : "Thêm vào giỏ"}
                </Button>
              </Space>
            </Card>
          </Col>
        )
      })}
    </Row>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <Space direction="vertical" size={16} className="w-full">
        <Typography.Title level={2} className="!mb-0">Danh sách khóa học</Typography.Title>
        <Typography.Text type="secondary">
          Chọn khóa học, thêm vào giỏ và thanh toán/đăng ký một lần.
        </Typography.Text>

        {courses.length === 0 && !loading ? (
          <Empty description="Chưa có khóa học đang mở" />
        ) : courseCards}

        <Card
          title={<Space><ShoppingCartOutlined />Giỏ hàng</Space>}
          extra={<Tag color={cartItems.length ? "green" : "default"}>{cartItems.length} khóa</Tag>}
        >
          {cartItems.length === 0 ? (
            <Empty description="Chưa có khóa học trong giỏ" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <Space direction="vertical" className="w-full">
              <List
                dataSource={cartItems}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeItem(item.id)}
                        key="remove"
                      >
                        Xóa
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={<span className="font-medium">{item.title}</span>}
                      description={
                        <Space direction="vertical" size={2}>
                          <span>Môn: {item.subject}</span>
                          <span>Học phí: {formatCurrency(item.tuitionFee)}</span>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
              <Divider className="!my-2" />
              <Space align="center" className="justify-between w-full">
                <Typography.Text strong>Tổng học phí</Typography.Text>
                <Typography.Title level={4} className="!mb-0">{formatCurrency(totalTuition)}</Typography.Title>
              </Space>
              <Button type="primary" size="large" block onClick={() => navigate("/cart")}>
                Đến trang giỏ hàng
              </Button>
            </Space>
          )}
        </Card>
      </Space>

    </div>
  )
}

export default Course

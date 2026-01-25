import { useEffect, useState } from "react"
import { Card, Col, Empty, Row, Space, Tag, Typography, message } from "antd"
import { useNavigate } from "react-router-dom"
import dayjs from "dayjs"
import api from "../../config/axios"

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

  const courseCards = (
    <Row gutter={[24, 24]}>
      {courses.map((course) => {
        const status = statusLabel[course.status] || { text: "Không xác định", color: "default" }
        
        return (
          <Col key={course.id} xs={24} sm={12} lg={8}>
            <Card
              title={
                <Space direction="vertical" size={4} className="w-full">
                  <Typography.Text 
                    strong 
                    className="text-base cursor-pointer hover:text-blue-600 hover:underline"
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    {course.title}
                  </Typography.Text>
                  <Typography.Text type="secondary">{course.subject}</Typography.Text>
                </Space>
              }
              extra={<Tag color={status.color}>{status.text}</Tag>}
              loading={loading}
              className="shadow-sm hover:shadow-md transition-shadow h-full cursor-pointer"
              onClick={() => navigate(`/courses/${course.id}`)}
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
                {/* Đã xóa nút "Thêm vào giỏ / Chỉ phụ huynh..." tại đây */}
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
        
        {courses.length === 0 && !loading ? (
          <Empty description="Chưa có khóa học đang mở" />
        ) : courseCards}
        
      </Space>
    </div>
  )
}

export default Course
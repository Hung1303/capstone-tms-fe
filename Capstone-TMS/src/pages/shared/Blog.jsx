import { useEffect, useState } from 'react'
import { Input, Typography, Spin, Empty, message, Card, Tag, Button, Space } from 'antd'
import { SearchOutlined, ShoppingCartOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import api from '../../config/axios'
import BlogPostCard from '../../components/BlogPostCard'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../contexts/AuthContext'

const { Title, Text } = Typography

const statusLabel = {
  0: { text: "Nháp", color: "default" },
  1: { text: "Chờ duyệt", color: "gold" },
  2: { text: "Đang mở", color: "green" },
  3: { text: "Tạm dừng", color: "red" }
}

const formatCurrency = (value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)

const Blog = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addItem, cartItems } = useCart()

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      const response = await api.get('/BlogPost', {
        params: {
          pageNumber: 1,
          pageSize: 100,
        }
      })
      const blogData = response.data?.blogs || response.data || []
      
      // Filter bài đã published
      const publishedBlogs = Array.isArray(blogData) 
        ? blogData.filter(blog => blog.status === 'Published')
        : []
        
      setBlogs(publishedBlogs)
    } catch (error) {
      console.error('Lỗi khi tải blog:', error)
      message.error('Không thể tải bản tin')
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    setCoursesLoading(true)
    try {
      const response = await api.get('/Course/Published/Courses', {
        params: {
          pageNumber: 1,
          pageSize: 5,
        }
      })
      const courseData = response.data?.data || []
      setCourses(Array.isArray(courseData) ? courseData : [])
    } catch (error) {
      console.error('Lỗi khi tải khóa học:', error)
    } finally {
      setCoursesLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
    fetchCourses()
  }, [])

  const filteredBlogs = blogs.filter(blog => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (blog.title && blog.title.toLowerCase().includes(searchLower)) ||
      (blog.content && blog.content.toLowerCase().includes(searchLower)) ||
      (blog.centerName && blog.centerName.toLowerCase().includes(searchLower))
    )
  })

  const handleAddToCart = (course) => {
    if (!user) {
      message.error('Vui lòng đăng nhập để thêm khóa học vào giỏ hàng')
      navigate('/login')
      return
    }

    if (user.role !== 'Parent') {
      message.error('Chỉ phụ huynh mới có thể thêm khóa học vào giỏ hàng')
      return
    }

    const added = addItem(course)
    if (added) {
      message.success('Đã thêm vào giỏ hàng')
    } else {
      message.info('Khóa học đã có trong giỏ')
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] py-6">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="mb-6 text-center">
            <Title level={2} className="!mb-1 text-gray-800">Bảng tin Giáo dục</Title>
            <Text type="secondary">Cập nhật tin tức mới nhất từ cộng đồng TutorLink</Text>
        </div>

        {/* Search Bar - Sticky style */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 sticky top-4 z-10 border border-gray-100">
            <Input
                placeholder="Bạn đang tìm kiếm thông tin gì?"
                prefix={<SearchOutlined className="text-gray-400 text-lg mr-2" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="large"
                allowClear
                className="hover:border-blue-400 focus:border-blue-500 rounded-full bg-gray-50 border-transparent hover:bg-white transition-all"
                bordered={false}
                style={{ backgroundColor: '#f0f2f5' }}
            />
        </div>

        {/* Main Content - 2 Columns */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column: Blogs (2/3) */}
          <div className="col-span-2">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" tip="Đang tải bản tin..." />
              </div>
            ) : filteredBlogs.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={searchTerm ? 'Không tìm thấy bài viết phù hợp' : 'Chưa có bài viết nào'}
                className="bg-white p-8 rounded-lg shadow-sm"
              />
            ) : (
              <div className="space-y-4">
                {filteredBlogs.map((blog) => (
                  <BlogPostCard key={blog.blogId} blog={blog} onBlogUpdate={fetchBlogs} showCenterLink={true} />
                ))}
                
                <div className="text-center py-6">
                    <Text type="secondary">Bạn đã xem hết tin tức</Text>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Courses (1/3) */}
          <div className="col-span-1">
            <Card className="shadow-sm rounded-lg border-gray-200 sticky top-24">
              <Title level={5} className="!mb-4">Khóa học mới</Title>

              {coursesLoading ? (
                <Spin />
              ) : courses.length === 0 ? (
                <Empty description="Chưa có khóa học" size="small" />
              ) : (
                <div className="space-y-3">
                  {courses.map((course) => {
                    const status = statusLabel[course.status] || { text: "Không xác định", color: "default" }
                    const inCart = cartItems.some((item) => item.id === course.id)
                    
                    return (
                      <div
                        key={course.id}
                        className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                      >
                        {/* Course Header */}
                        <div className="mb-2">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <Text strong className="line-clamp-2 text-sm flex-1">
                              {course.title}
                            </Text>
                            <Tag color={status.color} className="text-xs whitespace-nowrap">
                              {status.text}
                            </Tag>
                          </div>
                          <Text type="secondary" className="text-xs">
                            {course.subject}
                          </Text>
                        </div>

                        {/* Course Info */}
                        <div className="space-y-1 mb-3 text-xs text-gray-600">
                          <div>🗺 {course.location}</div>
                          <div> Lớp {course.gradeLevel}</div>
                          <div> {formatCurrency(course.tuitionFee)}</div>
                          <div> {dayjs(course.startDate).format("DD/MM/YYYY")}</div>
                        </div>

                        {/* Action Buttons */}
                        <Space className="w-full" size={6}>
                          <Button
                            type="primary"
                            size="small"
                            block
                            onClick={() => navigate('/courses')}
                            className="flex-1"
                          >
                            Xem chi tiết
                          </Button>
                      
                        </Space>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* View All Courses Button */}
              <Button
                type="default"
                block
                className="mt-4"
                onClick={() => navigate('/courses')}
              >
                Xem tất cả khóa học
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Blog
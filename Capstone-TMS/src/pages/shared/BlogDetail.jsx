import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Spin, Empty, message, Divider, Typography, Avatar, Form, Input } from 'antd'
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons'
import api from '../../config/axios'
import { useAuth } from '../../contexts/AuthContext'
import { commentBlogPost, getBlogComments } from '../../services/blogService'

const { Title, Text } = Typography

const BlogDetail = () => {
  const { blogId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(false)
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [otherBlogs, setOtherBlogs] = useState([])
  const [commentForm] = Form.useForm()
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  // Xử lý ngày tháng an toàn
  const formatDate = (dateString) => {
    if (!dateString) return 'Vừa xong'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Ngày không xác định'
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch (e) {
      return 'Vừa xong'
    }
  }

  // Tạo màu ngẫu nhiên cho Avatar dựa trên tên
  const stringToColor = (string) => {
    let hash = 0
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash)
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase()
    return '#' + '00000'.substring(0, 6 - c.length) + c
  }

  // Lấy chi tiết blog
  const fetchBlogDetail = async () => {
    if (!blogId) return
    setLoading(true)
    try {
      const response = await api.get(`/BlogPost/${blogId}`)
      // API trả về { success: true, message: {...} }
      const blogData = response.data?.message || response.data?.data || response.data
      setBlog(blogData)
      
      // Lấy comments
      fetchComments()
      
      // Lấy các bài viết khác của trung tâm
      if (blogData?.centerProfileId) {
        fetchOtherBlogs(blogData.centerProfileId, blogId)
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết blog:', error)
      message.error('Không thể tải bài viết')
    } finally {
      setLoading(false)
    }
  }

  // Lấy danh sách comments
  const fetchComments = async () => {
    if (!blogId) return
    setCommentsLoading(true)
    try {
      const response = await getBlogComments(blogId, 1, 100)
      const commentsData = response?.comments || response?.data || []
      setComments(Array.isArray(commentsData) ? commentsData : [])
    } catch (error) {
      console.error('Lỗi khi lấy comments:', error)
    } finally {
      setCommentsLoading(false)
    }
  }

  // Lấy các bài viết khác của trung tâm
  const fetchOtherBlogs = async (centerProfileId, currentBlogId) => {
    try {
      const response = await api.get(`/BlogPost/Center/${centerProfileId}`)
      const blogData = response.data?.blogs || []
      
      // Filter bài đã published và không phải bài hiện tại
      const otherBlogsList = Array.isArray(blogData)
        ? blogData.filter(b => b.status === 'Published' && b.blogId !== currentBlogId)
        : []
      
      setOtherBlogs(otherBlogsList.slice(0, 1)) // Lấy 1 bài viết khác
    } catch (error) {
      console.error('Lỗi khi tải bài viết khác:', error)
    }
  }

  // Xử lý submit comment
  const handleSubmitComment = async (values) => {
    if (!user) {
      message.error('Vui lòng đăng nhập để bình luận')
      navigate('/login')
      return
    }

    if (!values.content || !values.content.trim()) {
      message.error('Vui lòng nhập nội dung bình luận')
      return
    }

    setIsSubmittingComment(true)
    try {
      await commentBlogPost(blogId, values.content)
      message.success('Bình luận thành công')
      commentForm.resetFields()
      fetchComments()
    } catch (error) {
      console.error('Lỗi khi comment:', error)
      const errorMsg = error.response?.data?.message || 'Không thể bình luận bài viết này'
      message.error(errorMsg)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  useEffect(() => {
    fetchBlogDetail()
  }, [blogId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin size="large" tip="Đang tải bài viết..." />
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/blog')}
            className="mb-4"
          >
            Quay lại
          </Button>
          <Empty description="Không tìm thấy bài viết" />
        </div>
      </div>
    )
  }

  const avatarColor = stringToColor(blog.centerName || 'Center')

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Nút quay lại */}
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/blog')}
          className="mb-4"
        >
          Quay lại
        </Button>

        <div className="grid grid-cols-3 gap-6">
          {/* Cột trái: Chi tiết bài viết và bình luận (2/3) */}
          <div className="col-span-2">
            {/* Thông tin bài viết */}
            <Card className="mb-6 shadow-sm rounded-lg border-gray-200">
              {/* Header */}
              <div className="flex gap-3 mb-4">
                <Avatar 
                  size={50} 
                  style={{ backgroundColor: avatarColor, verticalAlign: 'middle' }}
                  icon={<UserOutlined />}
                >
                  {blog.centerName ? blog.centerName.charAt(0).toUpperCase() : 'C'}
                </Avatar>
                <div className="flex flex-col justify-center">
                  <Text strong className="text-base">
                    {blog.centerName || 'Trung tâm giáo dục'}
                  </Text>
                  <Text type="secondary" className="text-xs">
                    {formatDate(blog.publishAt || blog.createdAt)}
                  </Text>
                </div>
              </div>

              {/* Tiêu đề */}
              {blog.title && (
                <Title level={3} className="!mb-4 !font-bold">
                  {blog.title}
                </Title>
              )}

              {/* Hình ảnh */}
              {blog.imageUrl && (
                <div className="mb-4 -mx-6 -mt-4">
                  <img
                    src={blog.imageUrl}
                    alt="Blog content"
                    className="w-full h-96 object-cover"
                  />
                </div>
              )}

              {/* Nội dung */}
              <div className="text-gray-800 text-base whitespace-pre-wrap leading-relaxed mb-4">
                {blog.content}
              </div>

              <Divider />

              {/* Thống kê */}
              <div className="flex gap-6 text-sm text-gray-600">
                <span>👍 {blog.likeCount || 0} lượt thích</span>
                <span>💬 {blog.commentCount || 0} bình luận</span>
              </div>
            </Card>

            {/* Bình luận */}
            <Card className="shadow-sm rounded-lg border-gray-200">
              <Title level={4} className="!mb-4">Bình luận</Title>

              {/* Form nhập bình luận */}
              {user ? (
                <Form
                  form={commentForm}
                  layout="vertical"
                  onFinish={handleSubmitComment}
                  className="mb-6"
                >
                  <Form.Item
                    name="content"
                    rules={[{ required: true, message: 'Vui lòng nhập bình luận' }]}
                  >
                    <Input.TextArea
                      placeholder="Viết bình luận của bạn..."
                      rows={3}
                      maxLength={500}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      loading={isSubmittingComment}
                    >
                      Gửi bình luận
                    </Button>
                  </Form.Item>
                </Form>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <Text>
                    <a href="/login" className="text-blue-600 font-medium">Đăng nhập</a> để bình luận
                  </Text>
                </div>
              )}

              <Divider />

              {/* Danh sách bình luận */}
              {commentsLoading ? (
                <Spin />
              ) : comments.length === 0 ? (
                <Empty description="Chưa có bình luận nào" />
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.commentId || comment.id} className="border-l-4 border-blue-300 pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar size={32} icon={<UserOutlined />} />
                        <div>
                          <Text strong>{comment.parentName || comment.userName || comment.fullName || 'Người dùng'}</Text>
                          <br />
                          <Text type="secondary" className="text-xs">
                            {formatDate(comment.createdAt)}
                          </Text>
                        </div>
                      </div>
                      <Text className="block text-gray-700">{comment.content}</Text>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Cột phải: Bài viết khác của trung tâm (1/3) */}
          <div className="col-span-1">
            <Card className="shadow-sm rounded-lg border-gray-200 sticky top-6">
              <Title level={5} className="!mb-4">Bài viết khác của trung tâm </Title>

              {otherBlogs.length === 0 ? (
                <Empty description="Không có bài viết khác" size="small" />
              ) : (
                <div className="space-y-3">
                  {otherBlogs.map((otherBlog) => (
                    <div
                      key={otherBlog.blogId}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/blog/${otherBlog.blogId}`)}
                    >
                      {otherBlog.imageUrl && (
                        <img
                          src={otherBlog.imageUrl}
                          alt={otherBlog.title}
                          className="w-full h-32 object-cover"
                        />
                      )}
                      <div className="p-3">
                        <Text strong className="line-clamp-2 text-sm block mb-2">
                          {otherBlog.title}
                        </Text>
                        <Text type="secondary" className="text-xs">
                          {formatDate(otherBlog.publishAt || otherBlog.createdAt)}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogDetail
import { useState, useEffect } from 'react'
import { Card, Typography, Avatar, Button, Divider, message, Modal, Form, Input, Empty, Spin, Dropdown } from 'antd'
import { 
  LikeOutlined, 
  LikeFilled,
  MessageOutlined, 
  MoreOutlined, 
  UserOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { Image } from 'antd'
import { likeBlogPost, unlikeBlogPost, commentBlogPost, getBlogComments } from '../services/blogService'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const { Title, Text, Paragraph } = Typography

const BlogPostCard = ({ blog, showCenterLink = true }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Khởi tạo state từ dữ liệu blog
  const [isLiked, setIsLiked] = useState(blog.isLikedByCurrentUser || false)
  const [likeCount, setLikeCount] = useState(blog.likeCount || 0)
  const [commentCount, setCommentCount] = useState(blog.commentCount || 0)
  
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false)
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentForm] = Form.useForm()
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  // Cập nhật state nếu props blog thay đổi (ví dụ khi load lại list)
  useEffect(() => {
    setIsLiked(blog.isLikedByCurrentUser || false)
    setLikeCount(blog.likeCount || 0)
    setCommentCount(blog.commentCount || 0)
  }, [blog])

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
    } catch (error) {
      console.error("Lỗi định dạng ngày:", error)
      return 'Vừa xong'
    }
  }

  const stringToColor = (string) => {
    let hash = 0
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash)
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase()
    return '#' + '00000'.substring(0, 6 - c.length) + c
  }

  const avatarColor = stringToColor(blog.centerName || 'Center')

  const handleLike = async () => {
    if (!user) {
      setIsLoginModalVisible(true)
      return
    }

    if (user.role?.toLowerCase() !== 'parent') {
      message.error('Chỉ phụ huynh mới có thể thực hiện hành động này')
      return
    }

    if (isLiking) return

    try {
      setIsLiking(true)
      if (isLiked) {
        // Gọi API DELETE để unlike
        await unlikeBlogPost(blog.blogId)
        setIsLiked(false)
        setLikeCount(prev => Math.max(0, prev - 1))
        message.success('Bỏ thích bài viết')
      } else {
        // Gọi API POST để like
        await likeBlogPost(blog.blogId)
        setIsLiked(true)
        setLikeCount(prev => prev + 1)
        message.success('Thích bài viết')
      }
    } catch (error) {
      console.error('Lỗi khi like/unlike blog:', error)
      message.error('Không thể thực hiện hành động này')
    } finally {
      setIsLiking(false)
    }
  }

  const fetchComments = async () => {
    setCommentsLoading(true)
    try {
      const response = await getBlogComments(blog.blogId, 1, 100)
      const commentsData = response?.comments || response?.data || []
      setComments(Array.isArray(commentsData) ? commentsData : [])
    } catch (error) {
      console.error('Lỗi khi lấy comments:', error)
      message.error('Không thể tải bình luận')
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleOpenCommentModal = () => {
    setIsCommentModalVisible(true)
    fetchComments()
  }

  const handleSubmitComment = async (values) => {
    if (!values.content || !values.content.trim()) {
      message.error('Vui lòng nhập nội dung bình luận')
      return
    }

    setIsSubmittingComment(true)
    try {
      await commentBlogPost(blog.blogId, values.content)
      message.success('Bình luận thành công')
      commentForm.resetFields()
      setCommentCount(prev => prev + 1)
      fetchComments()
    } catch (error) {
      console.error('Lỗi khi comment:', error)
      const errorMsg = error.response?.data?.message || 'Không thể bình luận bài viết này'
      message.error(errorMsg)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  return (
    <>
      <Card
        className="mb-4 shadow-sm hover:shadow-md transition-shadow rounded-lg border-gray-200"
        bodyStyle={{ padding: '12px 16px 4px 16px' }}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-3">
            <Avatar 
              size={40} 
              style={{ backgroundColor: avatarColor, verticalAlign: 'middle' }}
              icon={<UserOutlined />}
            >
              {blog.centerName ? blog.centerName.charAt(0).toUpperCase() : 'C'}
            </Avatar>
            <div className="flex flex-col">
              {showCenterLink ? (
                <Text 
                  strong 
                  className="text-base leading-tight cursor-pointer hover:underline text-blue-600"
                  onClick={() => navigate(`/blog/center/${blog.centerProfileId}`)}
                >
                  {blog.centerName || 'Trung tâm giáo dục'}
                </Text>
              ) : (
                <Text strong className="text-base leading-tight">
                  {blog.centerName || 'Trung tâm giáo dục'}
                </Text>
              )}
              <Text type="secondary" className="text-xs">
                {formatDate(blog.publishAt || blog.createdAt)}
              </Text>
            </div>
          </div>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'view',
                  icon: <EyeOutlined />,
                  label: 'Xem chi tiết',
                  onClick: () => navigate(`/blog/${blog.blogId}`),
                },
              ],
            }}
            trigger={['click']}
          >
            <Button type="text" shape="circle" icon={<MoreOutlined />} />
          </Dropdown>
        </div>

        {blog.courseTitle && blog.courseId && (
          <div className="mb-3 p-4 rounded-xl border border-blue-300 bg-gradient-to-r from-blue-50 to-white hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Text strong className="text-sm text-blue-700">
                  Khóa học liên quan
                </Text>
              </div>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-[2px] rounded-full">
                Đang tuyển sinh
              </span>
            </div>

            <div
              className="text-base font-semibold text-gray-800 cursor-pointer hover:text-blue-600 leading-snug"
              onClick={() => window.open(`/courses/${blog.courseId}`, '_blank')}
            >
              {blog.courseTitle}
            </div>

            <div className="mt-2 flex items-center justify-between">
              <Text type="secondary" className="text-xs">
                Nhấn để xem chi tiết khóa học
              </Text>
              <Button
                type="primary"
                size="small"
                className="rounded-full"
                onClick={() => window.open(`/courses/${blog.courseId}`, '_blank')}
              >
                Xem khóa học
              </Button>
            </div>
          </div>
        )}

        <div className="mb-3">
          {blog.title && (
            <Title level={5} className="!mb-2 !font-bold">
              {blog.title}
            </Title>
          )}
          
          <div className="text-gray-800 text-[15px] whitespace-pre-wrap leading-relaxed">
            {isExpanded ? (
              blog.content
            ) : (
              <Paragraph 
                ellipsis={{ 
                  rows: 3, 
                  expandable: false, 
                }} 
                className="!mb-0"
              >
                {blog.content}
              </Paragraph>
            )}
            
            {blog.content && blog.content.length > 150 && (
              <span 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="text-blue-600 font-medium cursor-pointer hover:underline ml-1"
              >
                {isExpanded ? 'Thu gọn' : 'Xem thêm'}
              </span>
            )}
          </div>
        </div>

        {blog.images && blog.images.length > 0 ? (
          <div className="-mx-4 mb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-4">
              {blog.images.map((item, index) => {
                const isVideo = item.img_url?.includes('/video/upload/') || 
                               item.name?.toLowerCase().endsWith('.mp4') ||
                               item.name?.toLowerCase().endsWith('.webm') ||
                               item.name?.toLowerCase().endsWith('.mov')
                
                return (
                  <div key={`media-${index}`} className="relative bg-gray-100 rounded overflow-hidden">
                    {isVideo ? (
                      <video
                        width="100%"
                        height={200}
                        controls
                        className="w-full h-[200px] object-cover"
                        src={item.img_url}
                      >
                        Trình duyệt của bạn không hỗ trợ video
                      </video>
                    ) : (
                      <Image
                        width="100%"
                        height={200}
                        src={item.img_url}
                        alt={item.name || `Image ${index + 1}`}
                        className="object-cover"
                        fallback="https://via.placeholder.com/300x200?text=No+Image"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : blog.imageUrl ? (
          <div className="-mx-4 mb-2">
            <Image
              width="100%"
              height={300}
              src={blog.imageUrl}
              alt="Post content"
              className="object-cover"
              fallback="https://via.placeholder.com/600x300?text=TutorLink+Education"
            />
          </div>
        ) : null}

        <Divider className="!my-2" />

        <div className="flex justify-around items-center py-1">
          <Button 
            type="text" 
            icon={isLiked ? <LikeFilled /> : <LikeOutlined />}
            className={`flex-1 font-medium hover:bg-gray-100 ${isLiked ? 'text-blue-500' : 'text-gray-600'}`}
            onClick={handleLike}
          >
             <span className="ml-1">
               {likeCount > 0 ? `${likeCount} Thích` : 'Thích'}
             </span>
          </Button>
          <Button 
            type="text" 
            icon={<MessageOutlined />} 
            className="flex-1 text-gray-600 font-medium hover:bg-gray-100"
            onClick={handleOpenCommentModal}
          >
             <span className="ml-1">
               {commentCount > 0 ? `${commentCount} Bình luận` : 'Bình luận'}
             </span>
          </Button>
        </div>
      </Card>

      <Modal
        title="Vui lòng đăng nhập"
        open={isLoginModalVisible}
        onCancel={() => setIsLoginModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsLoginModalVisible(false)}>
            Hủy
          </Button>,
          <Button 
            key="login" 
            type="primary" 
            onClick={() => {
              setIsLoginModalVisible(false)
              navigate('/login')
            }}
          >
            Đăng nhập
          </Button>,
        ]}
      >
        <p className="text-center text-gray-600">
          Vui lòng đăng nhập để thực hiện hành động này
        </p>
      </Modal>

      <Modal
        title={`Bình luận (${commentCount})`}
        open={isCommentModalVisible}
        onCancel={() => setIsCommentModalVisible(false)}
        footer={null}
        width={600}
      >
        <div className="space-y-4">
          {user?.role?.toLowerCase() === 'parent' ? (
            <Form
              form={commentForm}
              layout="vertical"
              onFinish={handleSubmitComment}
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
                  block
                >
                  Gửi bình luận
                </Button>
              </Form.Item>
            </Form>
          ) : (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <Text type="secondary">
                {user ? 'Chỉ phụ huynh mới có thể gửi bình luận' : 'Vui lòng đăng nhập để gửi bình luận'}
              </Text>
            </div>
          )}

          <Divider />
          
          <div>
            <Text strong className="text-sm">Tất cả bình luận:</Text>
            <div className="max-h-96 overflow-y-auto mt-3">
              {commentsLoading ? (
                <Spin />
              ) : comments.length === 0 ? (
                <Empty description="Chưa có bình luận nào" />
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.commentId || comment.id} className="border-l-2 border-gray-200 pl-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar size={24} icon={<UserOutlined />} />
                        <Text strong>{comment.parentName || comment.userName || comment.fullName || 'Người dùng'}</Text>
                        <Text type="secondary" className="text-xs">
                          {formatDate(comment.createdAt)}
                        </Text>
                      </div>
                      <Text>{comment.content}</Text>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default BlogPostCard
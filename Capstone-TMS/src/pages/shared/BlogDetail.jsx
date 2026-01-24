import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Spin, Empty, message, Divider, Typography, Avatar, Form, Input, Image } from 'antd' // Thêm Image vào import
import { 
  ArrowLeftOutlined, 
  UserOutlined, 
  LikeOutlined, 
  LikeFilled, 
  MessageOutlined 
} from '@ant-design/icons'
import api from '../../config/axios'
import { useAuth } from '../../contexts/AuthContext'
import { commentBlogPost, getBlogComments, likeBlogPost, unlikeBlogPost } from '../../services/blogService'

const { Title, Text } = Typography

const BlogDetail = () => {
  const { blogId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(false)
  const [comments, setComments] = useState([])
  const [otherBlogs, setOtherBlogs] = useState([])
  
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const [isLiking, setIsLiking] = useState(false)
  
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentForm] = Form.useForm()
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  const commentInputRef = useRef(null)

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
      console.error("Lỗi format date:", error)
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

  const fetchComments = useCallback(async () => {
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
  }, [blogId])

  const fetchOtherBlogs = useCallback(async (centerProfileId, currentBlogId) => {
    try {
      const response = await api.get(`/BlogPost/Center/${centerProfileId}`)
      const blogData = response.data?.blogs || []
      
      const otherBlogsList = Array.isArray(blogData)
        ? blogData.filter(b => b.status === 'Published' && b.blogId !== currentBlogId)
        : []
      
      setOtherBlogs(otherBlogsList.slice(0, 1))
    } catch (error) {
      console.error('Lỗi khi tải bài viết khác:', error)
    }
  }, [])

  const fetchBlogDetail = useCallback(async () => {
    if (!blogId) return
    setLoading(true)
    try {
      const response = await api.get(`/BlogPost/${blogId}`, {
        params: user?.parentProfileId ? { parentProfileId: user.parentProfileId } : {}
      })
      const blogData = response.data?.message || response.data?.data || response.data
      setBlog(blogData)
      
      setLikeCount(blogData.likeCount || 0)
      setCommentCount(blogData.commentCount || 0)
      setIsLiked(blogData.isLikedByCurrentUser || false)

      fetchComments()
      
      if (blogData?.centerProfileId) {
        fetchOtherBlogs(blogData.centerProfileId, blogId)
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết blog:', error)
      message.error('Không thể tải bài viết')
    } finally {
      setLoading(false)
    }
  }, [blogId, fetchComments, fetchOtherBlogs, user?.parentProfileId])

  const handleLike = async () => {
    if (!user) {
      message.error('Vui lòng đăng nhập để thực hiện hành động này')
      navigate('/login')
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
        await unlikeBlogPost(blogId)
        setIsLiked(false)
        setLikeCount(prev => Math.max(0, prev - 1))
        message.success('Bỏ thích bài viết')
      } else {
        await likeBlogPost(blogId)
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

  const handleScrollToComment = () => {
    if (commentInputRef.current) {
      commentInputRef.current.focus();
      commentInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

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

  useEffect(() => {
    fetchBlogDetail()
  }, [fetchBlogDetail])

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
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/blog')}
          className="mb-4"
        >
          Quay lại
        </Button>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
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

              {blog.title && (
                <Title level={3} className="!mb-4 !font-bold">
                  {blog.title}
                </Title>
              )}

              {/* Phần hiển thị Media (Ảnh/Video) - SỬA LẠI PHẦN NÀY */}
              {blog.images && blog.images.length > 0 ? (
                <div className="-mx-6 mb-4">
                  <div className="grid grid-cols-1 gap-2 p-4">
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
                              controls
                              className="w-full max-h-[500px] object-contain"
                              src={item.img_url}
                            >
                              Trình duyệt của bạn không hỗ trợ video
                            </video>
                          ) : (
                            <Image
                              width="100%"
                              src={item.img_url}
                              alt={item.name || `Image ${index + 1}`}
                              className="object-contain max-h-[500px]"
                              fallback="https://via.placeholder.com/600x400?text=No+Image"
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : blog.imageUrl ? (
                <div className="-mx-6 mb-4">
                  <Image
                    width="100%"
                    src={blog.imageUrl}
                    alt="Blog content"
                    className="object-cover max-h-[500px]"
                    fallback="https://via.placeholder.com/600x400?text=No+Image"
                  />
                </div>
              ) : null}

              <div className="text-gray-800 text-base whitespace-pre-wrap leading-relaxed mb-4">
                {blog.content}
              </div>

              <Divider className="!my-2" />

              <div className="flex justify-around items-center py-1">
                <Button 
                  type="text" 
                  icon={isLiked ? <LikeFilled /> : <LikeOutlined />}
                  className={`flex-1 font-medium hover:bg-gray-100 ${isLiked ? 'text-blue-500' : 'text-gray-600'}`}
                  onClick={handleLike}
                  size="large"
                >
                  <span className="ml-1">
                     {likeCount > 0 ? `${likeCount} Thích` : 'Thích'}
                  </span>
                </Button>
                
                <Button 
                  type="text" 
                  icon={<MessageOutlined />} 
                  className="flex-1 text-gray-600 font-medium hover:bg-gray-100"
                  onClick={handleScrollToComment}
                  size="large"
                >
                  <span className="ml-1">
                    {commentCount > 0 ? `${commentCount} Bình luận` : 'Bình luận'}
                  </span>
                </Button>
              </div>
            </Card>

            <Card className="shadow-sm rounded-lg border-gray-200">
              <Title level={4} className="!mb-4">Bình luận</Title>

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
                      ref={commentInputRef}
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
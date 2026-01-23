import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Space, message, Tag, Popconfirm, Drawer, Select, Upload, Card, Row, Col } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined, CloseOutlined } from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../config/axios'
import BlogPostCard from '../../components/BlogPostCard'
import { createBlogPost, updateBlogPost } from '../../services/blogService'

const BlogManagement = () => {
  const { user } = useAuth()
  const [blogs, setBlogs] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isDrawerVisible, setIsDrawerVisible] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)
  const [viewingBlog, setViewingBlog] = useState(null)
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // State cho quản lý ảnh/video
  const [mediaFiles, setMediaFiles] = useState([]) // { id, file, preview, type, isThumbnail }
  const [selectedThumbnailId, setSelectedThumbnailId] = useState(null)
  const [mediaIdCounter, setMediaIdCounter] = useState(0)

  const fetchCourses = async () => {
    setCoursesLoading(true)
    try {
      const response = await api.get('/Course/Published/Courses')
      setCourses(response.data?.data || [])
    } catch (error) {
      console.error('Lỗi khi tải khóa học:', error)
      message.error('Không thể tải danh sách khóa học')
    } finally {
      setCoursesLoading(false)
    }
  }

  // Hàm thêm file media (ảnh/video)
  const handleAddMedia = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const newMedia = {
        id: mediaIdCounter,
        file: file,
        preview: e.target.result,
        type: file.type.startsWith('video') ? 'video' : 'image',
        isThumbnail: mediaFiles.length === 0 // File đầu tiên mặc định là thumbnail
      }
      
      setMediaFiles([...mediaFiles, newMedia])
      setMediaIdCounter(mediaIdCounter + 1)
      
      // Nếu là file đầu tiên, tự động chọn làm thumbnail
      if (mediaFiles.length === 0) {
        setSelectedThumbnailId(newMedia.id)
      }
    }
    reader.readAsDataURL(file)
    return false
  }

  // Hàm xóa file media
  const handleRemoveMedia = (mediaId) => {
    const updatedMedia = mediaFiles.filter(m => m.id !== mediaId)
    setMediaFiles(updatedMedia)
    
    // Nếu xóa thumbnail, chọn file đầu tiên làm thumbnail mới
    if (selectedThumbnailId === mediaId) {
      if (updatedMedia.length > 0) {
        setSelectedThumbnailId(updatedMedia[0].id)
      } else {
        setSelectedThumbnailId(null)
      }
    }
  }

  // Hàm chọn thumbnail
  const handleSelectThumbnail = (mediaId) => {
    setSelectedThumbnailId(mediaId)
  }

  const fetchBlogs = async () => {
    if (!user?.centerProfileId) return
    setLoading(true)
    try {
      const response = await api.get(`/BlogPost/Center/${user.centerProfileId}`)
      console.log('Blog response full:', response)
      console.log('Blog response.data:', response.data)
      
      // API trả về { blogs: [...], totalCount: ... }
      // axios tự động unwrap vào response.data
      // Vậy response.data = { blogs: [...], totalCount: ... }
      const blogData = response.data?.blogs || []
      console.log('Final blogData:', blogData)
      setBlogs(Array.isArray(blogData) ? blogData : [])
    } catch (error) {
      console.error('Lỗi tải blog:', error)
      message.error('Không thể tải danh sách blog')
      setBlogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.centerProfileId) {
      fetchBlogs()
      fetchCourses()
    }
  }, [user?.centerProfileId])

  const handleOpenModal = (blog = null) => {
    if (blog) {
      setEditingBlog(blog)
      form.setFieldsValue({
        title: blog.title,
        content: blog.content,
        courseId: blog.courseId,
      })
    } else {
      setEditingBlog(null)
      form.resetFields()
    }
    
    // Reset media files
    setMediaFiles([])
    setSelectedThumbnailId(null)
    setMediaIdCounter(0)
    setIsModalVisible(true)
  }

  const handleCloseModal = () => {
    setIsModalVisible(false)
    setEditingBlog(null)
    form.resetFields()
    setMediaFiles([])
    setSelectedThumbnailId(null)
    setMediaIdCounter(0)
  }

  const handleSubmit = async (values) => {
    console.log('=== handleSubmit START ===')
    console.log('handleSubmit called with values:', values)
    console.log('mediaFiles:', mediaFiles)
    console.log('mediaFiles.length:', mediaFiles.length)
    
    try {
      setIsSubmitting(true)
      console.log('✅ setIsSubmitting(true)')
      
      // Kiểm tra có ít nhất một file media
      if (mediaFiles.length === 0) {
        console.log('❌ No media files')
        message.error('Vui lòng thêm ít nhất một ảnh hoặc video')
        setIsSubmitting(false)
        return
      }
      
      console.log('✅ Media files check passed')
      
      // Tách ảnh và video
      const images = mediaFiles.filter(m => m.type === 'image').map(m => m.file)
      const videos = mediaFiles.filter(m => m.type === 'video').map(m => m.file)
      
      console.log('✅ Images count:', images.length)
      console.log('✅ Videos count:', videos.length)
      
      // Lấy file thumbnail được chọn (nếu có)
      const thumbnailMedia = mediaFiles.find(m => m.id === selectedThumbnailId)
      
      console.log('✅ Thumbnail media found:', !!thumbnailMedia)
      console.log('Preparing blog data...')
      const blogData = {
        title: values.title,
        content: values.content,
        courseId: values.courseId || '',
        images: images,
        videos: videos
      }
      
      console.log('✅ Blog data prepared:', blogData)
      
      if (editingBlog) {
        // Cập nhật blog
        console.log('🔄 Updating blog...')
        await updateBlogPost(editingBlog.blogId, blogData)
        message.success('Cập nhật blog thành công')
      } else {
        // Tạo blog mới
        console.log('🆕 Creating new blog...')
        console.log('centerProfileId:', user.centerProfileId)
        const result = await createBlogPost(user.centerProfileId, blogData)
        console.log('✅ Blog created successfully:', result)
        message.success('Tạo blog thành công')
      }
      
      console.log('✅ Closing modal and fetching blogs')
      handleCloseModal()
      fetchBlogs()
    } catch (error) {
      console.error('❌ Lỗi chi tiết:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra'
      message.error(editingBlog ? `Cập nhật blog thất bại: ${errorMsg}` : `Tạo blog thất bại: ${errorMsg}`)
    } finally {
      console.log('=== handleSubmit END ===')
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (blogId) => {
    try {
      await api.delete(`/BlogPost/${blogId}`)
      message.success('Xóa blog thành công')
      if (user?.centerProfileId) {
        fetchBlogs()
      }
    } catch (error) {
      console.error('Lỗi xóa blog:', error)
      message.error('Xóa blog thất bại')
    }
  }

  const handleViewBlog = (blog) => {
    setViewingBlog(blog)
    setIsDrawerVisible(true)
  }


  const getStatusTag = (status) => {
    const statusMap = {
      'Draft': { color: 'gold', text: 'Chờ duyệt' },
      'Published': { color: 'green', text: 'Đã đăng' },
      'Rejected': { color: 'red', text: 'Bị từ chối' },
    }
    const statusInfo = statusMap[status] || { color: 'default', text: status }
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
  }

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 180,
      ellipsis: true,
    },
    {
      title: 'Khóa học',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
      width: 150,
      ellipsis: true,
      render: (courseTitle) => courseTitle || '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Thích',
      dataIndex: 'likeCount',
      key: 'likeCount',
      width: 60,
      align: 'center',
      render: (likeCount) => likeCount || 0,
    },
    {
      title: 'Bình luận',
      dataIndex: 'commentCount',
      key: 'commentCount',
      width: 80,
      align: 'center',
      render: (commentCount) => commentCount || 0,
    },
    {
      title: 'Ngày đăng',
      dataIndex: 'publishAt',
      key: 'publishAt',
      width: 130,
      render: (date) => {
        if (!date) return '-'
        try {
          return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        } catch (e) {
          return '-'
        }
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewBlog(record)}
          >
            Xem
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
            disabled={record.status !== 'Published'}
            title={record.status !== 'Published' ? 'Chỉ có thể sửa bài đã đăng' : ''}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa blog"
            description="Bạn có chắc chắn muốn xóa blog này?"
            onConfirm={() => handleDelete(record.blogId)}
            okText="Có"
            cancelText="Không"
            disabled={record.status !== 'Published'}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              disabled={record.status !== 'Published'}
              title={record.status !== 'Published' ? 'Chỉ có thể xóa bài đã đăng' : ''}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Blog</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Tạo Blog Mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={blogs}
        loading={loading}
        rowKey="blogId"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingBlog ? 'Chỉnh sửa Blog' : 'Tạo Blog Mới'}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề blog" />
          </Form.Item>

          <Form.Item
            label="Khóa học"
            name="courseId"
            rules={[{ required: false }]}
          >
            <Select
              placeholder="Chọn khóa học (tùy chọn)"
              loading={coursesLoading}
              optionLabelProp="label"
              allowClear
            >
              {courses.map((course) => (
                <Select.Option key={course.id} value={course.id}>
                  {course.title} - {course.subject}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Ảnh và Video">
            <div className="space-y-4">
              {/* Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <Upload
                  multiple
                  accept="image/*,video/*"
                  beforeUpload={handleAddMedia}
                  showUploadList={false}
                  maxCount={10}
                >
                  <Button icon={<UploadOutlined />} block>
                    Chọn ảnh hoặc video (tối đa 10 file)
                  </Button>
                </Upload>
                <p className="text-xs text-gray-500 mt-2">
                  Hỗ trợ: JPG, PNG, GIF, MP4, WebM, v.v.
                </p>
              </div>

              {/* Media List */}
              {mediaFiles.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-3">
                    Ảnh/Video đã chọn ({mediaFiles.length})
                  </p>
                  <Row gutter={[16, 16]}>
                    {mediaFiles.map((media) => (
                      <Col key={media.id} xs={24} sm={12} md={8}>
                        <Card
                          hoverable
                          className="relative"
                          style={{
                            cursor: 'pointer',
                          }}
                        >
                          {/* Media Preview */}
                          <div className="relative bg-gray-100 rounded overflow-hidden">
                            {media.type === 'image' ? (
                              <img
                                src={media.preview}
                                alt="preview"
                                style={{
                                  width: '100%',
                                  height: '150px',
                                  objectFit: 'cover',
                                }}
                              />
                            ) : (
                              <video
                                src={media.preview}
                                style={{
                                  width: '100%',
                                  height: '150px',
                                  objectFit: 'cover',
                                }}
                              />
                            )}

                            {/* Delete Button */}
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<CloseOutlined />}
                              className="absolute top-1 right-1 bg-white"
                              onClick={(event) => {
                                event.stopPropagation()
                                handleRemoveMedia(media.id)
                              }}
                            />
                          </div>

                          {/* File Info */}
                          <div className="mt-2">
                            <p className="text-xs text-gray-600 truncate">
                              {media.file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(media.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              {mediaFiles.length === 0 && (
                <p className="text-center text-gray-400 py-4">
                  Chưa có ảnh/video nào. Hãy thêm ít nhất một file.
                </p>
              )}
            </div>
          </Form.Item>

          <Form.Item
            label="Nội dung"
            name="content"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <Input.TextArea
              placeholder="Nhập nội dung blog"
              rows={6}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {editingBlog ? 'Cập nhật' : 'Tạo'}
              </Button>
              <Button onClick={handleCloseModal} disabled={isSubmitting}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="Chi tiết Blog"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        width={700}
      >
        {viewingBlog && (
          <BlogPostCard 
            blog={viewingBlog} 
            onBlogUpdate={fetchBlogs}
            showCenterLink={false}
          />
        )}
      </Drawer>
    </div>
  )
}

export default BlogManagement
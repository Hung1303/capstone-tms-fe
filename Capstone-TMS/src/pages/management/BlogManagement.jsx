import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Space, message, Tag, Popconfirm, Drawer, Select, Upload } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../config/axios'
import BlogPostCard from '../../components/BlogPostCard'

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
  const [selectedImageFile, setSelectedImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      setImagePreview(blog.imageUrl || null)
    } else {
      setEditingBlog(null)
      form.resetFields()
      setSelectedImageFile(null)
      setImagePreview(null)
    }
    setIsModalVisible(true)
  }

  const handleCloseModal = () => {
    setIsModalVisible(false)
    setEditingBlog(null)
    form.resetFields()
    setSelectedImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true)
      const formData = new FormData()
      
      formData.append('title', values.title)
      formData.append('content', values.content)
      formData.append('courseId', values.courseId || '')
      
      // Thêm file ảnh nếu có
      if (selectedImageFile) {
        formData.append('img', selectedImageFile)
      }

      if (editingBlog) {
        // Cập nhật blog
        await api.put(`/BlogPost/Update/${editingBlog.blogId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        message.success('Cập nhật blog thành công')
      } else {
        // Tạo blog mới
        await api.post(`/BlogPost/${user.centerProfileId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        message.success('Tạo blog thành công')
      }
      
      handleCloseModal()
      fetchBlogs()
    } catch (error) {
      console.error('Lỗi chi tiết:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra'
      message.error(editingBlog ? `Cập nhật blog thất bại: ${errorMsg}` : `Tạo blog thất bại: ${errorMsg}`)
    } finally {
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

  // Hàm chọn ảnh (chỉ lưu tạm thời, không upload ngay)
  const handleImageSelect = (file) => {
    setSelectedImageFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target.result)
    }
    reader.readAsDataURL(file)
    
    return false
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
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 100,
      render: (imageUrl) => (
        imageUrl ? (
          <img
            src={imageUrl}
            alt="thumbnail"
            style={{
              width: '80px',
              height: '60px',
              objectFit: 'cover',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onClick={() => window.open(imageUrl, '_blank')}
          />
        ) : (
          <span className="text-gray-400">Không có ảnh</span>
        )
      ),
    },
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
        width={700}
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

          <Form.Item label="Hình ảnh Thumbnail">
            <div className="space-y-3">
              <Upload
                maxCount={1}
                accept="image/*"
                beforeUpload={handleImageSelect}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />} block>
                  Chọn ảnh
                </Button>
              </Upload>
              
              {imagePreview && (
                <div className="border rounded-lg p-2">
                  <p className="text-sm text-gray-600 mb-2">Ảnh đã chọn:</p>
                  <img
                    src={imagePreview}
                    alt="Thumbnail preview"
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  {selectedImageFile && (
                    <p className="text-xs text-gray-500 mt-2">
                      {selectedImageFile.name}
                    </p>
                  )}
                </div>
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
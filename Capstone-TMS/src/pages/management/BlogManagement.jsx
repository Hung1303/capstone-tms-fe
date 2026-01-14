import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Space, message, Tag, Popconfirm, Drawer, Select, Upload, Image as AntImage } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined, LoadingOutlined } from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../config/axios'

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
  const [selectedImageFile, setSelectedImageFile] = useState(null) // Lưu file ảnh tạm thời
  const [imagePreview, setImagePreview] = useState(null) // Lưu preview URL

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
        description: blog.description,
        content: blog.content,
        courseId: blog.courseId,
        thumbnailUrl: blog.thumbnailUrl,
      })
    } else {
      setEditingBlog(null)
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  const handleCloseModal = () => {
    setIsModalVisible(false)
    setEditingBlog(null)
    form.resetFields()
  }

  const handleSubmit = async (values) => {
    try {
      const blogData = {
        title: values.title,
        content: values.content,
        courseId: values.courseId,
        thumbnailUrl: values.thumbnailUrl || '',
      }

      if (editingBlog) {
        await api.put(`/BlogPost/Update/${editingBlog.blogId}`, blogData)
        message.success('Cập nhật blog thành công')
      } else {
        await api.post(`/BlogPost/${user.centerProfileId}`, blogData)
        message.success('Tạo blog thành công')
      }
      handleCloseModal()
      fetchBlogs()
    } catch (error) {
      console.error('Lỗi chi tiết:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra'
      message.error(editingBlog ? `Cập nhật blog thất bại: ${errorMsg}` : `Tạo blog thất bại: ${errorMsg}`)
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
    // Lưu file tạm thời
    setSelectedImageFile(file)
    
    // Tạo preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target.result)
    }
    reader.readAsDataURL(file)
    
    message.success('Ảnh đã chọn, sẽ upload khi bấm "Tạo"')
    return false // Prevent default upload behavior
  }

  // Hàm upload ảnh khi submit form
  const uploadImageAndCreateBlog = async (values) => {
    try {
      let thumbnailUrl = values.thumbnailUrl || ''

      // Nếu có file ảnh được chọn, upload trước
      if (selectedImageFile) {
        const formData = new FormData()
        formData.append('img', selectedImageFile)

        const response = await api.post('/Image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        // API trả về URL của ảnh
        thumbnailUrl = response.data?.data || response.data?.url || response.data
        console.log('Image upload response:', response.data)
        console.log('Image URL:', thumbnailUrl)
      }

      // Sau đó tạo/cập nhật blog với URL ảnh
      const blogData = {
        title: values.title,
        content: values.content,
        courseId: values.courseId,
        thumbnailUrl: thumbnailUrl,
      }

      if (editingBlog) {
        await api.put(`/BlogPost/Update/${editingBlog.blogId}`, blogData)
        message.success('Cập nhật blog thành công')
      } else {
        await api.post(`/BlogPost/${user.centerProfileId}`, blogData)
        message.success('Tạo blog thành công')
      }

      handleCloseModal()
      fetchBlogs()
    } catch (error) {
      console.error('Lỗi chi tiết:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra'
      message.error(editingBlog ? `Cập nhật blog thất bại: ${errorMsg}` : `Tạo blog thất bại: ${errorMsg}`)
    }
  }

  const getStatusTag = (status) => {
    const statusMap = {
      'Draft': { color: 'default', text: 'Nháp' },
      'Pending': { color: 'gold', text: 'Chờ duyệt' },
      'Approved': { color: 'green', text: 'Đã duyệt' },
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
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
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
            disabled={record.status === 'Approved' || record.status === 'Pending'}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa blog"
            description="Bạn có chắc chắn muốn xóa blog này?"
            onConfirm={() => handleDelete(record.blogId)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              disabled={record.status === 'Approved' || record.status === 'Pending'}
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
          onFinish={uploadImageAndCreateBlog}
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

          <Form.Item
            label="Hình ảnh Thumbnail"
            name="thumbnailUrl"
            rules={[{ required: false }]}
          >
            <div className="space-y-3">
              <Upload
                maxCount={1}
                accept="image/*"
                beforeUpload={handleImageSelect}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />} block>
                  Chọn ảnh để upload
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
                </div>
              )}
              
              {form.getFieldValue('thumbnailUrl') && !imagePreview && (
                <div className="border rounded-lg p-2">
                  <p className="text-sm text-gray-600 mb-2">URL ảnh:</p>
                  <AntImage
                    width="100%"
                    height={200}
                    src={form.getFieldValue('thumbnailUrl')}
                    alt="Thumbnail preview"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}
              
              <Input 
                placeholder="Hoặc nhập URL hình ảnh trực tiếp" 
                value={form.getFieldValue('thumbnailUrl')}
                onChange={(e) => form.setFieldValue('thumbnailUrl', e.target.value)}
              />
            </div>
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea
              placeholder="Nhập mô tả blog"
              rows={3}
            />
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
              <Button type="primary" htmlType="submit">
                {editingBlog ? 'Cập nhật' : 'Tạo'}
              </Button>
              <Button onClick={handleCloseModal}>
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
        width={600}
      >
        {viewingBlog && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-2">{viewingBlog.title}</h2>
              <p className="text-gray-600 mb-4">{viewingBlog.description}</p>
              <div className="mb-4">
                {getStatusTag(viewingBlog.status)}
              </div>
              <p className="text-sm text-gray-500">
                Ngày tạo: {new Date(viewingBlog.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-bold mb-2">Nội dung</h3>
              <p className="whitespace-pre-wrap">{viewingBlog.content}</p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default BlogManagement
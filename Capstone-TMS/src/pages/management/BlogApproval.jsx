import { useEffect, useState } from 'react'
import { Table, Button, Space, message, Tag, Drawer, Tabs } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons'
import api from '../../config/axios'

const BlogApproval = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [isDrawerVisible, setIsDrawerVisible] = useState(false)
  const [viewingBlog, setViewingBlog] = useState(null)
  const [activeTab, setActiveTab] = useState('pending')

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      // API hỗ trợ pageNumber, pageSize, titleSearch, courseSearch, status
      const response = await api.get('/BlogPost', {
        params: {
          pageNumber: 1,
          pageSize: 100, // Lấy tối đa 100 blog
        }
      })
      console.log('Blog approval response full:', response)
      console.log('Blog approval response.data:', response.data)
      console.log('Blog approval response.data.blogs:', response.data?.blogs)
      
      // API trả về { blogs: [...], totalCount: ... }
      const blogData = response.data?.blogs || []
      console.log('Final blog data:', blogData)
      setBlogs(blogData)
    } catch (error) {
      console.error('Lỗi tải blog:', error)
      message.error('Không thể tải danh sách blog')
      setBlogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const handleApproveBlog = async (blogId) => {
    try {
      await api.put(`/BlogPost/Approve/${blogId}`)
      message.success('Duyệt blog thành công')
      fetchBlogs()
    } catch (error) {
      console.error('Lỗi duyệt blog:', error)
      message.error('Duyệt blog thất bại')
    }
  }

  const handleRejectBlog = async (blogId, rejectReason = '') => {
    try {
      await api.put(`/BlogPost/Reject/${blogId}`, {
        reason: rejectReason
      })
      message.success('Từ chối blog thành công')
      fetchBlogs()
    } catch (error) {
      console.error('Lỗi từ chối blog:', error)
      message.error('Từ chối blog thất bại')
    }
  }

  const handleViewBlog = (blog) => {
    setViewingBlog(blog)
    setIsDrawerVisible(true)
  }

  const getStatusTag = (status) => {
    const statusMap = {
      'Draft': { color: 'default', text: 'Chờ duyệt' },
      'Published': { color: 'green', text: 'Đã duyệt' },
      'Rejected': { color: 'red', text: 'Bị từ chối' },
    }
    const statusInfo = statusMap[status] || { color: 'default', text: status }
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
  }

  const getFilteredBlogs = (status) => {
    return blogs.filter(blog => blog.status === status)
  }

  const pendingBlogs = getFilteredBlogs('Draft')
  const publishedBlogs = getFilteredBlogs('Published')
  const rejectedBlogs = getFilteredBlogs('Rejected')

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Trung tâm',
      dataIndex: 'centerName',
      key: 'centerName',
      width: 150,
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
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 250,
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
          {record.status === 'Draft' && (
            <>
              <Button
                type="primary"
                success
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApproveBlog(record.blogId)}
              >
                Duyệt
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleRejectBlog(record.blogId)}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ]

  const tabItems = [
    {
      key: 'pending',
      label: `Chờ duyệt (${pendingBlogs.length})`,
      children: (
        <Table
          columns={columns}
          dataSource={pendingBlogs}
          loading={loading}
          rowKey="blogId"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'published',
      label: `Đã duyệt (${publishedBlogs.length})`,
      children: (
        <Table
          columns={columns}
          dataSource={publishedBlogs}
          loading={loading}
          rowKey="blogId"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'rejected',
      label: `Bị từ chối (${rejectedBlogs.length})`,
      children: (
        <Table
          columns={columns}
          dataSource={rejectedBlogs}
          loading={loading}
          rowKey="blogId"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Duyệt Blog</h1>
        <p className="text-gray-600 mt-2">Quản lý và duyệt các bài blog từ các trung tâm</p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />

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
              <p className="text-gray-600 mb-2">
                <strong>Trung tâm:</strong> {viewingBlog.centerName}
              </p>
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
            {viewingBlog.status === 'Draft' && (
              <div className="border-t pt-4 mt-4">
                <Space>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => {
                      handleApproveBlog(viewingBlog.blogId)
                      setIsDrawerVisible(false)
                    }}
                  >
                    Duyệt
                  </Button>
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => {
                      handleRejectBlog(viewingBlog.blogId)
                      setIsDrawerVisible(false)
                    }}
                  >
                    Từ chối
                  </Button>
                </Space>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default BlogApproval
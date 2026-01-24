import { useEffect, useState } from 'react'
import { Table, Button, Space, message, Tag, Drawer, Tabs, Card, Typography } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, FileMarkdownOutlined } from '@ant-design/icons'
import { toast } from 'react-toastify'
import api from '../../config/axios'
import BlogPostCardAdmin from '../../components/BlogPostCardAdmin'

const { Title, Text } = Typography

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
      toast.success('✓ Duyệt blog thành công', {
        position: 'top-right',
        autoClose: 3000,
      })
      fetchBlogs()
    } catch (error) {
      console.error('Lỗi duyệt blog:', error)
      toast.error('✗ Duyệt blog thất bại', {
        position: 'top-right',
        autoClose: 3000,
      })
    }
  }

  const handleRejectBlog = async (blogId, rejectReason = '') => {
    try {
      await api.put(`/BlogPost/Reject/${blogId}`, {
        reason: rejectReason
      })
      toast.success('✓ Từ chối blog thành công', {
        position: 'top-right',
        autoClose: 3000,
      })
      fetchBlogs()
    } catch (error) {
      console.error('Lỗi từ chối blog:', error)
      toast.error('✗ Từ chối blog thất bại', {
        position: 'top-right',
        autoClose: 3000,
      })
    }
  }

  const handleViewBlog = (blog) => {
    setViewingBlog(blog)
    setIsDrawerVisible(true)
  }

  const getStatusTag = (status) => {
    const statusMap = {
      'Draft': { color: 'gold', text: 'Chờ duyệt' },
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

  // Cột cho tab "Chờ duyệt" và "Bị từ chối" (không có ngày tạo)
  const columnsWithoutDate = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      ellipsis: true,
    },
    {
      title: 'Trung tâm',
      dataIndex: 'centerName',
      key: 'centerName',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 200,
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

  // Cột cho tab "Đã duyệt" (có ngày tạo)
  const columnsWithDate = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Trung tâm',
      dataIndex: 'centerName',
      key: 'centerName',
      width: 180,
      ellipsis: true,
    },
    {
      title: 'Ngày đăng',
      dataIndex: 'publishAt',
      key: 'publishAt',
      width: 150,
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
      width: 100,
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
          columns={columnsWithoutDate}
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
          columns={columnsWithDate}
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
          columns={columnsWithoutDate}
          dataSource={rejectedBlogs}
          loading={loading}
          rowKey="blogId"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
  ]

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {/* Header */}
      <Card className="!bg-gradient-to-r !from-[#64cc24] !to-[#90f252] !rounded-xl shadow-xl">
        <Title level={2} className="!text-white !m-0 !font-bold">
              <FileMarkdownOutlined /> Duyệt Blog
            </Title>
            <Text className="!text-white/90 !text-base">
              Quản lý và duyệt các bài blog từ các trung tâm.
            </Text>
      </Card>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      <Drawer
        title="Chi tiết Blog"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        width={700}
      >
        {viewingBlog && (
          <div className="space-y-4">
            {/* Hiển thị blog card (không có like/comment) */}
            <BlogPostCardAdmin 
              blog={viewingBlog}
              showCenterLink={false}
            />
            
            {/* Nút hành động */}
            {viewingBlog.status === 'Draft' && (
              <div className="border-t pt-4 mt-4 flex gap-2">
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => {
                    handleApproveBlog(viewingBlog.blogId)
                    setIsDrawerVisible(false)
                  }}
                  block
                >
                  Duyệt bài viết
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => {
                    handleRejectBlog(viewingBlog.blogId)
                    setIsDrawerVisible(false)
                  }}
                  block
                >
                  Từ chối
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </Space>
  )
}

export default BlogApproval
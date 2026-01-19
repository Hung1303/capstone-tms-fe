import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Input, Typography, Button, Spin, Empty, message } from 'antd'
import { SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import api from '../../config/axios'
import BlogPostCard from '../../components/BlogPostCard'

const { Title, Text } = Typography

const CenterBlog = () => {
  const { centerProfileId } = useParams()
  const navigate = useNavigate()
  const [blogs, setBlogs] = useState([])
  const [centerName, setCenterName] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchCenterBlogs = async () => {
    if (!centerProfileId) return
    setLoading(true)
    try {
      const response = await api.get(`/BlogPost/Center/${centerProfileId}`)
      const blogData = response.data?.blogs || []
      
      // Filter bài đã published
      const publishedBlogs = Array.isArray(blogData) 
        ? blogData.filter(blog => blog.status === 'Published')
        : []
      
      setBlogs(publishedBlogs)
      
      // Lấy tên trung tâm từ bài viết đầu tiên
      if (publishedBlogs.length > 0) {
        setCenterName(publishedBlogs[0].centerName)
      }
    } catch (error) {
      console.error('Lỗi khi tải blog của trung tâm:', error)
      message.error('Không thể tải danh sách blog')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCenterBlogs()
  }, [centerProfileId])

  const filteredBlogs = blogs.filter(blog => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (blog.title && blog.title.toLowerCase().includes(searchLower)) ||
      (blog.content && blog.content.toLowerCase().includes(searchLower))
    )
  })

  return (
    <div className="min-h-screen bg-[#f0f2f5] py-6">
      <div className="max-w-2xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="mb-6">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/blog')}
            className="mb-4"
          >
            Quay lại
          </Button>
          <div className="text-center">
            <Title level={2} className="!mb-1 text-gray-800">{centerName || 'Trung tâm giáo dục'}</Title>
            <Text type="secondary">Tất cả bài viết từ trung tâm này</Text>
          </div>
        </div>

        {/* Search Bar - Sticky style */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 sticky top-4 z-10 border border-gray-100">
          <Input
            placeholder="Tìm kiếm bài viết..."
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

        {/* Content Stream */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" tip="Đang tải bài viết..." />
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
              <BlogPostCard key={blog.blogId} blog={blog} onBlogUpdate={fetchCenterBlogs} showCenterLink={false} />
            ))}
            
            <div className="text-center py-6">
              <Text type="secondary">Bạn đã xem hết bài viết</Text>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CenterBlog
import { useEffect, useState } from 'react'
import { Card, Input, Typography, Avatar, Button, Spin, Empty, Tooltip, Image, Divider, message } from 'antd'
import { 
  SearchOutlined, 
  LikeOutlined, 
  MessageOutlined, 
  ShareAltOutlined, 
  MoreOutlined, 
  UserOutlined 
} from '@ant-design/icons'
import api from '../../config/axios'

const { Title, Text, Paragraph } = Typography

// Component con để hiển thị từng bài post (giúp code gọn hơn)
const BlogPost = ({ blog }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Xử lý ngày tháng an toàn
  const formatDate = (dateString) => {
    if (!dateString) return 'Vừa xong';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Ngày không xác định';
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Vừa xong';
    }
  };

  // Tạo màu ngẫu nhiên cho Avatar dựa trên tên
  const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };

  const avatarColor = stringToColor(blog.centerName || 'Center');

  return (
    <Card
      className="mb-4 shadow-sm hover:shadow-md transition-shadow rounded-lg border-gray-200"
      bodyStyle={{ padding: '12px 16px 4px 16px' }} // Tinh chỉnh padding cho giống FB
    >
      {/* Header: Avatar + Tên + Ngày */}
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
            <Text strong className="text-base leading-tight cursor-pointer hover:underline">
              {blog.centerName || 'Trung tâm giáo dục'}
            </Text>
            <Tooltip title={new Date(blog.createdAt).toLocaleString('vi-VN')}>
              <Text type="secondary" className="text-xs cursor-pointer hover:underline">
                {formatDate(blog.createdAt)}
              </Text>
            </Tooltip>
          </div>
        </div>
        <Button type="text" shape="circle" icon={<MoreOutlined />} />
      </div>

      {/* Nội dung bài viết */}
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
          
          {/* Nút Xem thêm / Thu gọn thông minh */}
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

      {/* Hình ảnh (Nếu có) hoặc Placeholder nếu muốn giao diện đẹp hơn */}
      <div className="-mx-4 mb-2">
        {blog.thumbnailUrl ? (
          <Image
            width="100%"
            height={300}
            src={blog.thumbnailUrl}
            alt="Post content"
            className="object-cover"
            fallback="https://via.placeholder.com/600x300?text=TutorLink+Education"
          />
        ) : (
            // Nếu không có ảnh, có thể ẩn đi hoặc hiển thị một dải màu nhẹ để phân cách
            null
        )}
      </div>

      <Divider className="!my-2" />

      {/* Thanh hành động (Like/Comment/Share) */}
      <div className="flex justify-around items-center py-1">
        <Button type="text" icon={<LikeOutlined />} className="flex-1 text-gray-600 font-medium hover:bg-gray-100">
          Thích
        </Button>
        <Button type="text" icon={<MessageOutlined />} className="flex-1 text-gray-600 font-medium hover:bg-gray-100">
          Bình luận
        </Button>
        <Button type="text" icon={<ShareAltOutlined />} className="flex-1 text-gray-600 font-medium hover:bg-gray-100">
          Chia sẻ
        </Button>
      </div>
    </Card>
  )
}

const Blog = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      const response = await api.get('/BlogPost', {
        params: {
          pageNumber: 1,
          pageSize: 100,
        }
      })
      // Xử lý linh hoạt cấu trúc trả về
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

  useEffect(() => {
    fetchBlogs()
  }, [])

  const filteredBlogs = blogs.filter(blog => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (blog.title && blog.title.toLowerCase().includes(searchLower)) ||
      (blog.content && blog.content.toLowerCase().includes(searchLower)) ||
      (blog.centerName && blog.centerName.toLowerCase().includes(searchLower))
    )
  })

  return (
    <div className="min-h-screen bg-[#f0f2f5] py-6">
      <div className="max-w-2xl mx-auto px-4">
        
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

        {/* Content Stream */}
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
              <BlogPost key={blog.blogId} blog={blog} />
            ))}
            
            <div className="text-center py-6">
                <Text type="secondary">Bạn đã xem hết tin tức</Text>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Blog
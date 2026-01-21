import { useState } from 'react'
import { Card, Typography, Avatar, Button, Divider, Image } from 'antd'
import { MoreOutlined, UserOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

const BlogPostCardAdmin = ({ blog, showCenterLink = false }) => {
  const [isExpanded, setIsExpanded] = useState(false)

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

  const avatarColor = stringToColor(blog.centerName || 'Center')

  return (
    <Card
      className="mb-4 shadow-sm hover:shadow-md transition-shadow rounded-lg border-gray-200"
      bodyStyle={{ padding: '12px 16px 4px 16px' }}
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
            <Text strong className="text-base leading-tight">
              {blog.centerName || 'Trung tâm giáo dục'}
            </Text>
            <Text type="secondary" className="text-xs">
              {formatDate(blog.publishAt || blog.createdAt)}
            </Text>
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

      {/* Hình ảnh (Nếu có) */}
      <div className="-mx-4 mb-2">
        {blog.imageUrl ? (
          <Image
            width="100%"
            height={300}
            src={blog.imageUrl}
            alt="Post content"
            className="object-cover"
            fallback="https://via.placeholder.com/600x300?text=TutorLink+Education"
          />
        ) : null}
      </div>

      <Divider className="!my-2" />
    </Card>
  )
}

export default BlogPostCardAdmin
import { useState } from 'react'
import { Card, Typography, Avatar, Button, Divider, Image, Row, Col, Empty } from 'antd'
import { MoreOutlined, UserOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

const BlogPostCardAdmin = ({ blog = false }) => {
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
    } catch (error) {
      // Sửa lỗi đỏ: Log lỗi ra để biến error được sử dụng
      console.error("Lỗi format ngày:", error)
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

  // Lấy danh sách ảnh và video từ images array
  const getMediaItems = () => {
    const mediaItems = []
    
    // Thêm ảnh/video từ mảng images
    if (blog.images && Array.isArray(blog.images) && blog.images.length > 0) {
      blog.images.forEach((item) => {
        // Kiểm tra xem có phải video không (dựa vào URL hoặc tên file)
        const isVideo = item.img_url?.includes('/video/upload/') || 
                        item.name?.toLowerCase().endsWith('.mp4') ||
                        item.name?.toLowerCase().endsWith('.webm') ||
                        item.name?.toLowerCase().endsWith('.mov')
        
        mediaItems.push({
          url: item.img_url,
          type: isVideo ? 'video' : 'image',
          name: item.name
        })
      })
    }
    
    return mediaItems
  }

  const mediaItems = getMediaItems()
  const images = mediaItems.filter(m => m.type === 'image')
  const videos = mediaItems.filter(m => m.type === 'video')
  const hasMedia = mediaItems.length > 0

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

      {/* Hiển thị Ảnh và Video */}
      {hasMedia && (
        <div className="-mx-4 mb-2">
          {/* Ảnh */}
          {images.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 px-4 mb-2">
                📸 Ảnh ({images.length})
              </p>
              <Row gutter={[8, 8]} className="px-4">
                {images.map((image, index) => (
                  <Col key={index} xs={24} sm={12} md={8}>
                    <Image
                      width="100%"
                      height={150}
                      src={image.url}
                      alt={image.name || `Image ${index + 1}`}
                      className="object-cover rounded"
                      fallback="https://via.placeholder.com/300x150?text=No+Image"
                    />
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* Video */}
          {videos.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 px-4 mb-2">
                🎥 Video ({videos.length})
              </p>
              <Row gutter={[8, 8]} className="px-4">
                {videos.map((video, index) => (
                  <Col key={index} xs={24} sm={12} md={8}>
                    <div className="relative bg-gray-900 rounded overflow-hidden" style={{ height: '150px' }}>
                      <video
                        width="100%"
                        height="150"
                        controls
                        className="object-cover"
                        src={video.url}
                      >
                        Trình duyệt của bạn không hỗ trợ video
                      </video>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </div>
      )}

      {/* Nếu không có media */}
      {!hasMedia && (
        <div className="-mx-4 mb-2 px-4">
          <Empty 
            description="Không có ảnh hoặc video" 
            style={{ margin: '20px 0' }}
          />
        </div>
      )}

      <Divider className="!my-2" />
    </Card>
  )
}

export default BlogPostCardAdmin
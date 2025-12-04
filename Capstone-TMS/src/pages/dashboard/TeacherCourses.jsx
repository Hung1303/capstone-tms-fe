import React, { useEffect, useState } from 'react'
import { 
  Table, Spin, Empty, Tag, Card, Alert, 
  Input, Select, Row, Col, Statistic, 
  Typography, Space, Tooltip, Button 
} from 'antd'
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseOutlined, 
  StopOutlined, 
  FileSyncOutlined,
  SearchOutlined,
  BookOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  DollarOutlined,
  EyeOutlined
} from '@ant-design/icons'
import api from '../../config/axios'
import { useAuth } from '../../contexts/AuthContext'

const { Title, Text } = Typography
const { Option } = Select

const TeacherCourses = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // State cho bộ lọc
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchCourses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Effect để lọc dữ liệu khi search hoặc filter thay đổi
  useEffect(() => {
    let result = [...courses]

    if (searchText) {
      result = result.filter(c => 
        c.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        c.subject?.toLowerCase().includes(searchText.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === parseInt(statusFilter))
    }

    setFilteredCourses(result)
  }, [courses, searchText, statusFilter])

  // --- Logic lấy ID và API (Giữ nguyên logic chuẩn) ---
  const getTeacherProfileId = () => {
    if (user?.teacherProfileId || user?.TeacherProfileId) {
      return user.teacherProfileId || user.TeacherProfileId
    }
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        const decoded = JSON.parse(jsonPayload)
        return decoded.TeacherProfileId || decoded.teacherProfileId
      } catch (e) { console.error(e) }
    }
    return null
  }

  const fetchCourses = async () => {
    setLoading(true)
    setError(null)
    const teacherId = getTeacherProfileId()

    if (!teacherId) {
      setError('Không tìm thấy thông tin giảng viên. Vui lòng đăng nhập lại.')
      setLoading(false)
      return
    }

    try {
      const response = await api.get(`/Course/${teacherId}/Courses`)
      if (response.data && response.data.success) {
        const data = response.data.data || []
        setCourses(data)
        setFilteredCourses(data)
      } else {
        const data = Array.isArray(response.data) ? response.data : []
        setCourses(data)
        setFilteredCourses(data)
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ.')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  // --- Helper giao diện ---
  const getStatusTag = (status) => {
    const config = {
      0: { label: 'Bản nháp', color: 'default', icon: <StopOutlined /> },
      1: { label: 'Chờ duyệt', color: 'processing', icon: <ClockCircleOutlined /> },
      2: { label: 'Đang hoạt động', color: 'success', icon: <CheckCircleOutlined /> },
      3: { label: 'Từ chối', color: 'error', icon: <CloseOutlined /> },
      4: { label: 'Tạm ngưng', color: 'warning', icon: <StopOutlined /> },
      5: { label: 'Lưu trữ', color: 'purple', icon: <FileSyncOutlined /> }
    }
    const item = config[status] || { label: 'N/A', color: 'default' }
    return <Tag icon={item.icon} color={item.color} className="m-0 px-2 py-1 text-sm rounded">{item.label}</Tag>
  }

  const columns = [
    { 
      title: 'Thông tin khóa học', 
      key: 'info',
      width: 300,
      render: (_, record) => (
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <BookOutlined style={{ fontSize: '20px' }} />
          </div>
          <div>
            <div className="font-bold text-gray-800 text-base">{record.title}</div>
            <div className="text-gray-500 text-sm">{record.subject} • Lớp {record.gradeLevel}</div>
          </div>
        </div>
      )
    },
    { 
      title: 'Thời gian & Địa điểm', 
      key: 'schedule',
      width: 250,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center text-gray-600 text-sm">
            <CalendarOutlined className="mr-2 text-orange-500" />
            <span>
              {record.startDate ? new Date(record.startDate).toLocaleDateString('vi-VN') : '?'} 
              {' - '} 
              {record.endDate ? new Date(record.endDate).toLocaleDateString('vi-VN') : '?'}
            </span>
          </div>
          <div className="flex items-start text-gray-600 text-sm">
            <EnvironmentOutlined className="mr-2 text-green-500 mt-1" />
            <span className="line-clamp-2">{record.location || 'Chưa cập nhật'}</span>
          </div>
        </div>
      )
    },
    { 
      title: 'Chi tiết', 
      key: 'stats',
      width: 180,
      render: (_, record) => (
        <div className="space-y-1">
           <Tooltip title="Sĩ số lớp">
            <Tag color="cyan" className="flex items-center w-fit gap-1">
                <TeamOutlined /> {record.capacity} Học viên
            </Tag>
           </Tooltip>
           <div className="font-semibold text-gray-700 flex items-center gap-1">
             <DollarOutlined className="text-yellow-600"/>
             {record.tuitionFee?.toLocaleString('vi-VN')} đ
           </div>
        </div>
      )
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status', 
      width: 150,
      render: (status) => getStatusTag(status) 
    },
    // Cột hành động (để mở rộng sau này)
    {
      key: 'action',
      width: 80,
      render: () => (
        <Tooltip title="Xem chi tiết">
          <Button type="text" shape="circle" icon={<EyeOutlined />} />
        </Tooltip>
      )
    }
  ]

  // Tính toán thống kê
  const stats = {
    total: courses.length,
    active: courses.filter(c => c.status === 2).length,
    pending: courses.filter(c => c.status === 1).length
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Space direction="vertical" size="large" className="w-full">
        
        {/* Header & Stats */}
        <div>
          <Title level={2} className="!mb-4">Lịch giảng dạy</Title>
          <Row gutter={16}>
            <Col span={8}>
              <Card bordered={false} className="shadow-sm">
                <Statistic 
                  title="Tổng khóa học" 
                  value={stats.total} 
                  prefix={<BookOutlined />} 
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card bordered={false} className="shadow-sm">
                <Statistic 
                  title="Đang hoạt động" 
                  value={stats.active} 
                  prefix={<CheckCircleOutlined />} 
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card bordered={false} className="shadow-sm">
                <Statistic 
                  title="Chờ duyệt" 
                  value={stats.pending} 
                  prefix={<ClockCircleOutlined />} 
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* Toolbar: Search & Filter */}
        <Card bordered={false} className="shadow-sm">
          <Row gutter={16} align="middle">
            <Col xs={24} md={12}>
              <Input 
                placeholder="Tìm kiếm khóa học hoặc môn học..." 
                prefix={<SearchOutlined className="text-gray-400" />}
                size="large"
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} md={6}>
              <Select 
                defaultValue="all" 
                size="large" 
                className="w-full"
                onChange={setStatusFilter}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="1">Chờ duyệt</Option>
                <Option value="2">Đang hoạt động</Option>
                <Option value="4">Tạm ngưng</Option>
                <Option value="0">Bản nháp</Option>
              </Select>
            </Col>
            <Col xs={24} md={6} className="text-right">
                <Button icon={<FileSyncOutlined />} onClick={fetchCourses}>Làm mới</Button>
            </Col>
          </Row>
        </Card>

        {/* Main Table */}
        {error && <Alert message={error} type="error" showIcon />}
        
        <Card bordered={false} className="shadow-sm p-0 overflow-hidden" bodyStyle={{ padding: 0 }}>
          <Table 
            loading={loading}
            dataSource={filteredCourses} 
            columns={columns} 
            rowKey="id" 
            pagination={{ 
              pageSize: 8, 
              showTotal: (total) => `Tổng ${total} khóa học`,
              position: ['bottomCenter']
            }}
            locale={{ emptyText: <Empty description="Không tìm thấy khóa học nào" /> }}
            scroll={{ x: 1000 }} // Đảm bảo scroll ngang trên mobile
          />
        </Card>
      </Space>
    </div>
  )
}

export default TeacherCourses
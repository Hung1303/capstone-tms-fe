import { useEffect, useState } from 'react'
import { Table, Empty, Tag, Card, Alert, Input, Select, Row, Col, Statistic, Typography, Space, Tooltip, Button } from 'antd'
import { CheckCircleOutlined, ClockCircleOutlined, CloseOutlined, StopOutlined, FileSyncOutlined, SearchOutlined, BookOutlined,
        CalendarOutlined, EnvironmentOutlined, TeamOutlined, DollarOutlined, EyeOutlined, UserOutlined} from '@ant-design/icons'
import api from '../../config/axios'
import { useAuth } from '../../contexts/AuthContext'

const { Title } = Typography
const { Option } = Select

const TeacherCourses = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [isView, setIsView] = useState(false)
  const [error, setError] = useState(null)
  const [enrollmentCourses, setEnrollmentCourses] = useState()
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const [studentPagination, setStudentPagination] = useState({
    page: 1,
    pageSize: 1000,
    total: 0
  })
  
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
    } catch (error) {
      console.log("error in fetchCourses:", error)
      setError('Lỗi kết nối máy chủ.')
      setCourses([])
    } finally {
      setLoading(false)
      setEnrollmentCourses([])
      setIsView(false)
    }
  }

  const fetchEnrollmentCourses = async (page, pageSize, courseId = selectedCourseId) => {
    setLoading(true)

    try {
      const res = await api.get(`/Enrollments/Course/${courseId}/Enrollments?pageNumber=${page}&pageSize=${pageSize}`) 
      console.log("api response handleViewList:", res)
      setEnrollmentCourses(res.data.data)
      setStudentPagination({
        page: page,
        pageSize: pageSize,
        total: res.data.pagination.totalItems
      })
    } catch (error) {
      console.error("error response handleViewList:", error)
      setEnrollmentCourses([])
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

  const handleViewList = async (courseId) => {
    setIsView(true)
    setSelectedCourseId(courseId)
    fetchEnrollmentCourses(1, studentPagination.pageSize, courseId)
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
    {
      key: 'action',
      width: 80,
      render: (record) => (
        <>
          
            <Button 
              type="default" 
              onClick={() => handleViewList(record.id)}
              icon={<EyeOutlined />} 
              className="!bg-cyan-400 !border-cyan-500 !text-white hover:!bg-cyan-500"
            >
              Danh sách HS
            </Button>
        </>
      )
    }
  ]

  const StudentListColums = [
    {
      title: "Tên học sinh",
      key: "studentName",
      render: (record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <UserOutlined className="text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{record.studentName}</div>
          </div>
        </div>
      )
    },
    {
      title: "Tên trường",
      key: "schoolName",
      render: (record) => (
        <div>
          {console.log("record:", record)}
          <div className="font-semibold text-gray-900">{record.schoolName}</div>
        </div>
      )
    },
    {
      title: "Môn đăng ký",
      key: "subject",
      render: (record) => (
        <div>
          <div className="font-semibold text-gray-900">
            <BookOutlined /> {record.subject}
          </div>
        </div>
      )
    },
    {
      title: "Địa điểm học",
      key: "location",
      render: (record) => (
        <div>
          <div className="font-semibold text-gray-900">
            <EnvironmentOutlined /> {record.location}
          </div>
        </div>
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
    <Space direction="vertical" style={{ width: '100%' }}>
      {/* Header */}
      {/* <Card className="!bg-gradient-to-r !from-orange-500 !to-purple-600 !rounded-xl shadow-xl"> */}
        <div>
          <Card className="!bg-gradient-to-r !from-[#2ecc8f] !to-[#44f3b0] !rounded-xl shadow-xl !mb-4">
            <Title level={2} className="!text-white !m-0 !font-bold">
              <BookOutlined /> Các khóa học
            </Title>
          </Card>
          <Row gutter={16}>
            <Col span={8}>
              <Card className="shadow-sm">
                <Statistic 
                  title="Tổng khóa học" 
                  value={stats.total} 
                  prefix={<BookOutlined />} 
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card className="shadow-sm">
                <Statistic 
                  title="Đang hoạt động" 
                  value={stats.active} 
                  prefix={<CheckCircleOutlined />} 
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card className="shadow-sm">
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
        <Card className="shadow-sm">
          <Row gutter={16} align="middle">
            <Col xs={24} md={12}>
              <Input 
                className="search-input"
                size="large"
                placeholder="Tìm kiếm khóa học hoặc môn học..." 
                prefix={<SearchOutlined className="search-icon" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
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
        
        <Card className="shadow-sm p-0 overflow-hidden">
          <Table 
            loading={loading}
            dataSource={filteredCourses} 
            columns={columns} 
            rowKey="id" 
            pagination={{ 
              pageSize: 10, 
              showTotal: (total) => `Tổng ${total} khóa học`,
              position: ['bottomRight']
            }}
            locale={{ emptyText: <Empty description="Không tìm thấy khóa học nào" /> }}
            scroll={{ x: "max-content", ...(filteredCourses.length > 5 ? {y: 75 * 5} : "") }}
          />
        </Card>

        {/* Danh sách học sinh */}
        {isView && (
          <Card>
            <Table
              columns={StudentListColums}
              dataSource={enrollmentCourses}
              rowKey="id"
              loading={loading}
              pagination={{
                current: studentPagination.page,
                pageSize: studentPagination.pageSize,
                total: studentPagination.total,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '50'],
                showTotal: (total) => `Tổng ${total} học sinh`,
                position: ['bottomRight'],
                onChange: (page, pageSize) => {
                  fetchEnrollmentCourses(page, pageSize)
                }
              }}
            />
          </Card>
        )}
      {/* </Card> */}
    </Space>
  )
}

export default TeacherCourses
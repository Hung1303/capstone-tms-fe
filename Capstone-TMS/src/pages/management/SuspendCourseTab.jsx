import { useState, useEffect } from 'react'
import { SearchOutlined, StopOutlined, BookOutlined, DollarOutlined, TeamOutlined, ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import { toast } from 'react-toastify'
import api from '../../config/axios'
import { Modal, Table, Input, Button, Tag, Space, Typography, Form, DatePicker, Card } from 'antd'
import dayjs from 'dayjs'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const { Text, Title } = Typography
const { TextArea } = Input

const SuspendCourseTab = () => {
  const [form] = Form.useForm()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    total: 0
  })

  useEffect(() => {
    fetchActiveCourses(pagination.pageNumber, pagination.pageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchActiveCourses = async (pageNumber = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const response = await api.get('/Course/Published/Courses', {
        params: {
          pageNumber,
          pageSize
        }
      })
      
      // Handle different response structures
      const data = response?.data?.data || []
      
      // Filter only active courses (not suspended)
      // const activeCourses = Array.isArray(data) 
      //   ? data.filter(c => c.status !== 'Suspended' && c.status !== 'SUSPENDED' && !c.isSuspended)
      //   : []
      
      setCourses(data)
      setPagination(prev => ({
        ...prev,
        pageNumber,
        pageSize,
        total: data.length
      }))
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Lỗi khi tải danh sách khóa học')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage, newPageSize) => {
    fetchActiveCourses(newPage, newPageSize)
  }

  const handleSuspendClick = (course) => {
    setSelectedCourse(course)
    form.resetFields()
    setShowSuspendModal(true)
  }

  const handleConfirmSuspend = async () => {
    if (!selectedCourse?.id) return

    try {
      const values = await form.validateFields()
      setLoading(true)

      const payload = {
        reason: values.reason || 'Không có lý do',
        suspendedFrom: dayjs(values.suspendedFrom).startOf('day').toISOString(),
        suspendedTo: dayjs(values.suspendedTo).endOf('day').toISOString()
      }
      console.log('Payload for suspending course:', payload)
      
      const res = await api.post(`/Suspensions/Course/${selectedCourse.id}`, payload, {
        params: {
          supervisorId: user.userId
        }})
      console.log('Suspend course response:', res)

      toast.success('Đã thu hồi khóa học thành công!')
      setShowSuspendModal(false)
      setSelectedCourse(null)
      form.resetFields()
      fetchActiveCourses(pagination.pageNumber, pagination.pageSize)
    } catch (error) {
      console.error('Error suspending course:', error)
      if (error.errorFields) {
        return
      }

      if (error.code === "ERR_NETWORK") {
        logout()
        navigate('/login')
      }

      if (error.response?.data) {
        toast.error('Khóa học này đã được thu hồi rồi')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSuspend = () => {
    setShowSuspendModal(false)
    setSelectedCourse(null)
    form.resetFields()
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.centerName?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Table columns configuration
  const columns = [
    {
      title: 'Tên khóa học',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (text, record) => (
        <Space>
          <BookOutlined style={{ color: '#1890ff' }} />
          <Text strong>{text || record.title}</Text>
        </Space>
      ),
    },
    {
      title: 'Môn học',
      dataIndex: 'subject',
      key: 'subject',
      width: 150,
      render: (text, record) => (
        <Tag color="blue">{text || record.subjectName}</Tag>
      ),
    },
    {
      title: 'Trung tâm',
      dataIndex: 'centerName',
      key: 'centerName',
      width: 200,
      render: (text, record) => (
        <Space>
          <TeamOutlined style={{ color: '#52c41a' }} />
          <Text>{text || record.centerProfileName}</Text>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (_, record) => {
        console.log('Course status record:', record)
        const isSuspended = record.status === 4
        return (
          <Tag color={isSuspended ? 'red' : 'green'} style={{ fontSize: '12px', padding: '4px 12px' }}>
            {isSuspended ? 'Đã thu hồi' : 'Đang hoạt động'}
          </Tag>
        )
      },
    },
    {
      title: 'Học phí',
      dataIndex: 'tuitionFee',
      key: 'tuitionFee',
      width: 150,
      render: (fee) => (
        <Space>
          <DollarOutlined style={{ color: '#faad14' }} />
          <Text strong style={{ color: '#fa8c16' }}>
            {fee ? new Intl.NumberFormat('vi-VN').format(fee) : '0'} đ
          </Text>
        </Space>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            danger
            icon={<StopOutlined />}
            onClick={() => handleSuspendClick(record)}
            style={{
              background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
              border: 'none',
              boxShadow: '0 2px 8px rgba(255, 77, 79, 0.3)'
            }}
          >
            Thu hồi
          </Button>
        </Space>
      ),
    },
  ]

  // Prepare table data
  const tableData = filteredCourses.map((course, index) => ({
    key: course.id || index,
    ...course,
    title: course.title || course.courseTitle,
    subject: course.subject || course.subjectName,
    centerName: course.centerName || course.centerProfileName,
  }))

  return (
    <>
      <div className="flex gap-2 items-center">
        <Input
          className="search-input"
          size="large"
          placeholder="Tìm kiếm khóa học cần thu hồi..."
          prefix={<SearchOutlined className="search-icon" />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            setSearchTerm('')
            fetchActiveCourses(pagination.pageNumber, pagination.pageSize)
          }}
        >
          Làm mới
        </Button>
      </div>
      <div className="mt-6 rounded-lg shadow-sm">
        <Table
          columns={columns}
          dataSource={tableData}
          loading={loading}
          pagination={{
            current: pagination.pageNumber,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} khóa học`,
            onChange: (page, pageSize) => {
              handlePageChange(page, pageSize)
            },
            pageSizeOptions: ['10', '20', '50', '100'],
            className: "!mr-2"
          }}
          locale={{
            emptyText: (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  Không có khóa học nào cần thu hồi
                </Text>
              </div>
            )
          }}
          scroll={{ x: 1000 }}
        />
      </div>

      {/* Suspend Modal */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
            <Title level={4} style={{ margin: 0, color: '#ff4d4f' }}>
              Xác nhận thu hồi khóa học
            </Title>
          </Space>
        }
        open={showSuspendModal}
        onOk={handleConfirmSuspend}
        onCancel={handleCancelSuspend}
        okText="Thu hồi"
        cancelText="Hủy"
        okButtonProps={{
          danger: true,
        }}
        confirmLoading={loading}
        width={600}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', marginTop: '16px' }}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%)',
              border: '1px solid #ffccc7',
              borderRadius: '8px'
            }}
          >
            <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
              Khóa học sẽ bị thu hồi:
            </Text>
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              <BookOutlined style={{ marginRight: '8px' }} />
              {selectedCourse?.title || selectedCourse?.courseTitle}
            </Title>
          </Card>
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="reason"
              label={<Text strong style={{ fontSize: '14px' }}>Lý do thu hồi:</Text>}
            >
              <TextArea
                rows={4}
                placeholder="Nhập lý do thu hồi khóa học..."
                style={{
                  borderRadius: '8px',
                  border: '2px solid #ffccc7'
                }}
              />
            </Form.Item>
            <Form.Item
              label={<Text strong style={{ fontSize: '14px' }}>Thời gian thu hồi:</Text>}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="suspendedFrom"
                  label={<Text type="secondary" style={{ fontSize: '12px' }}>Từ ngày:</Text>}
                  rules={[
                    { required: true, message: 'Vui lòng chọn ngày bắt đầu thu hồi' }
                  ]}
                  dependencies={['suspendedTo']}
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày bắt đầu thu hồi"
                    style={{ width: '100%', borderRadius: '8px' }}
                    disabledDate={(current) => {
                      // Disable ngày quá khứ (nhỏ hơn ngày hôm nay)
                      if (current && current < dayjs().startOf('day')) {
                        return true
                      }
                      // Disable ngày sau suspendedTo nếu có
                      const suspendedToValue = form.getFieldValue('suspendedTo')
                      if (suspendedToValue) {
                        return current && current > suspendedToValue
                      }
                      return false
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="suspendedTo"
                  label={<Text type="secondary" style={{ fontSize: '12px' }}>Đến ngày:</Text>}
                  rules={[
                    { required: true, message: 'Vui lòng chọn ngày kết thúc thu hồi' }
                  ]}
                  dependencies={['suspendedFrom']}
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày kết thúc thu hồi"
                    style={{ width: '100%', borderRadius: '8px' }}
                    disabledDate={(current) => {
                      // Disable ngày quá khứ (nhỏ hơn ngày hôm nay)
                      if (current && current < dayjs().startOf('day')) {
                        return true
                      }
                      // Disable ngày trước suspendedFrom nếu có
                      const suspendedFromValue = form.getFieldValue('suspendedFrom')
                      if (suspendedFromValue) {
                        return current && current < suspendedFromValue
                      }
                      return false
                    }}
                  />
                </Form.Item>
              </Space>
            </Form.Item>
          </Form>
        </Space>
      </Modal>
    </>
  )
}

export default SuspendCourseTab


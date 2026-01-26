import { useState, useEffect } from 'react'
import { Table, Card, Select, Input, Button, Modal, Form, InputNumber, Space, Typography, Row, Col, Statistic, message, Empty } from 'antd'
import { BookOutlined, UserOutlined, SearchOutlined, EditOutlined, CheckCircleOutlined, FileTextOutlined, TrophyOutlined, SaveOutlined } from '@ant-design/icons'
import api from '../../config/axios'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-toastify'

const { Title, Text } = Typography
const { Option } = Select

const TeacherGrading = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [students, setStudents] = useState([])
  const [gradingRecords, setGradingRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [gradingModalVisible, setGradingModalVisible] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 5,
    total: 0
  })

  // Fetch danh sách khóa học
  useEffect(() => {
    fetchCourses()
  }, [])

  // Fetch học sinh và điểm khi chọn khóa học
  useEffect(() => {
    if (selectedCourse) {
      fetchStudentEnrollments(pagination.pageNumber, pagination.pageSize)
      fetchGradingRecords(1, 100)
    }
  }, [selectedCourse, pagination.pageNumber, pagination.pageSize])

  const fetchCourses = async () => {
    setLoading(true)
    const teacherId = user.teacherProfileId

    if (!teacherId) {
      message.error('Không tìm thấy thông tin giảng viên. Vui lòng đăng nhập lại.')
      setLoading(false)
      return
    }

    try {
      const response = await api.get(`/Course/${teacherId}/Courses?pageNumber=1&pageSize=1000`)
      console.log("response fetchCourses:", response)
      if (response.data && response.data.success) {
        const data = response.data.data || []
        setCourses(data.filter(c => c.status === 2))
      } else {
        const data = Array.isArray(response.data) ? response.data : []
        setCourses(data.filter(c => c.status === 2))
      }
    } catch (err) {
      console.error('Error fetching courses:', err)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentEnrollments = async (page, pageSize) => {
    if (!selectedCourse) return

    setLoading(true)
    try {
      const response = await api.get(`/Enrollments/Course/${selectedCourse.id}/Enrollments?pageNumber=${page}&pageSize=${pageSize}`)
      console.log("response fetchStudentEnrollments:", response)
      setStudents(response.data.data)
      setPagination({
        pageNumber: page,
        pageSize: pageSize,
        total: response.data.pagination.totalItems
      })
    } catch (err) {
      console.error('Error fetching students:', err)
      const message = err.response?.data.message || 'Lỗi khi tải danh sách học sinh'

      if (message.includes('Không tìm thấy đăng kí khóa học.')) {
        toast.error('khóa học này chưa có học sinh.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchGradingRecords = async (page, pageSize) => {
    if (!selectedCourse) return

    setLoading(true)
    try {
      const res = await api.get(`CourseResult?pageNumber=${page}&pageSize=${pageSize}`)
      console.log("response api in fetchGradingRecords:", res.data)
      setGradingRecords(res.data.data)
    } catch (err) {
      console.error('Error fetching grading records:', err)
    } finally {
      setLoading(false)
    }
  }

  console.log("selectedCourse:", selectedCourse)

  const handleGrading = (student) => {
    console.log("student:", student)
    const markTotal = getMarkTotal(student.studentProfileId)

    setSelectedStudent({
      ...student,
      gradingRecord: markTotal || null
    })
    setGradingModalVisible(true)

    if (markTotal) {
      form.setFieldsValue({
        mark: markTotal.mark,
        comment: markTotal.comment
      })
    } else {
      form.resetFields()
    }
  }

  const handleSaveGrading = async (values) => {
    setLoading(true)

    try {
      const payload = {
        mark: values.mark,
        comment: values.comment,
        studentId: selectedStudent.studentProfileId,
        teacherId: selectedCourse.teacherProfileId,
        courseId: selectedCourse.id
      }
      console.log("payload:", payload)
      console.log("selectedStudent:", selectedStudent)

      const gradingRecordId = selectedStudent?.gradingRecord?.id

      let res
      if (gradingRecordId) {
        res = await api.put(`/CourseResult/${gradingRecordId}`, payload)
      } else {
        res = await api.post('/CourseResult', payload)
      }
      console.log("api response handleSaveGrading:", res)

      toast.success(gradingRecordId ? 'Cập nhật điểm thành công!' : 'Chấm điểm thành công!')
      setGradingModalVisible(false)
      form.resetFields()
    } catch (error) {
      console.error('Error saving grading:', error)
      toast.error(error.response.data || 'Lỗi khi lưu điểm')
    } finally {
      setLoading(false)
      fetchStudentEnrollments(pagination.pageNumber, pagination.pageSize)
      fetchGradingRecords(1, 100)
    }
  }

  const getMarkTotal = (studentId) => {
    console.log("gradingRecords in getMarkTotal:", gradingRecords)
    return gradingRecords.find(r => r.studentId === studentId)
  }

  // Filter học sinh
  const filteredStudents = students.filter(student =>
    student.studentName?.toLowerCase().includes(searchText.toLowerCase())
  )

  const studentColumns = [
    {
      title: 'Học sinh',
      key: 'student',
      width: 250,
      render: (record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <UserOutlined className="text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{record.studentName}</div>
            <div className="text-sm text-gray-500">{record.schoolName}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Thông tin liên hệ',
      key: 'contact',
      width: 200,
      render: (record) => (
        <div className="space-y-1">
          <div className="font-semibold text-gray-900">{record.parentName}</div>
        </div>
      )
    },
    {
      title: 'Tổng điểm',
      key: 'markTotal',
      width: 150,
      render: (record) => {
        const studentMark = getMarkTotal(record.studentProfileId)
        if (!studentMark) return <Text type="secondary">Chưa có điểm</Text>
        const scoreColor = parseFloat(studentMark.mark) >= 8 ? 'green' : parseFloat(studentMark.mark) >= 6.5
          ? 'blue' : parseFloat(studentMark.mark) >= 5
            ? 'orange' : 'red'
        return (
          <div className="flex items-center gap-2">
            <TrophyOutlined className={`!text-${scoreColor}-500`} />
            <span className={`font-bold text-${scoreColor}-600`}>{studentMark.mark}/10</span>
          </div>
        )
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => {
        const markTotal = getMarkTotal(record.studentProfileId)
        const isGraded = !!markTotal

        return (
          <Button
            type={isGraded ? "default" : "primary"}
            icon={<EditOutlined />}
            onClick={() => handleGrading(record)}
            className={isGraded ? "!bg-yellow-500 !border-yellow-400 !text-white hover:!bg-yellow-400" : ""}
          >
            {isGraded ? "Sửa điểm" : "Chấm điểm"}
          </Button>
        )
      }
    }
  ]

  // Tính thống kê
  const stats = {
    totalStudents: students.length,
    gradedStudents: new Set(gradingRecords.map(r => r.studentId)).size,
    totalGradings: gradingRecords.length,
  }

  const handleCancelGrading = () => {
    setGradingModalVisible(false)
    form.resetFields()
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {/* Header */}
      <Card className="!bg-gradient-to-r !from-[#3651e6] !to-[#4b65f8] !rounded-xl shadow-xl">
        <Title level={2} className="!text-white !m-0 !font-bold">
          <FileTextOutlined /> Xem lịch
        </Title>
        <Text className="!text-white/90 !text-base">
          Quản lý và chấm điểm các học sinh trong khóa học.
        </Text>
      </Card>

      {/* Chọn khóa học */}
      <Card className="shadow-sm">
        <Row gutter={16} align="middle">
          <Col xs={24} md={8}>
            <Text strong className="block mb-2">Chọn khóa học:</Text>
            <Select
              placeholder="Chọn khóa học để chấm điểm"
              size="large"
              className="w-full"
              value={selectedCourse?.id}
              onChange={(courseId) => {
                const course = courses.find(c => c.id === courseId)
                setSelectedCourse(course)
              }}
              loading={loading}
            >
              {courses.map(course => (
                <Option key={course.id} value={course.id}>
                  {course.title} - {course.subject} (Lớp {course.gradeLevel})
                </Option>
              ))}
            </Select>
          </Col>
          {selectedCourse && (
            <Col xs={24} md={16}>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <BookOutlined className="text-2xl text-blue-600" />
                  <div>
                    <div className="font-semibold text-gray-900">{selectedCourse.title}</div>
                    <div className="text-sm text-gray-600">
                      {selectedCourse.subject} • Lớp {selectedCourse.gradeLevel}
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          )}
        </Row>
      </Card>

      {!selectedCourse ? (
        <Card className="shadow-sm">
          <Empty
            description="Vui lòng chọn khóa học để bắt đầu chấm điểm"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <>
          {/* Thống kê */}
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-sm">
                <Statistic
                  title="Tổng học sinh"
                  value={stats.totalStudents}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-sm">
                <Statistic
                  title="Đã chấm điểm"
                  value={stats.gradedStudents}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-sm">
                <Statistic
                  title="Tổng bài chấm"
                  value={stats.totalGradings}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          <Card className="shadow-sm">
            <div className="mb-4">
              <Input
                className="search-input"
                placeholder="Tìm kiếm học sinh..."
                prefix={<SearchOutlined className="search-icon" />}
                size="large"
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <Table
              dataSource={filteredStudents}
              columns={studentColumns}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.pageNumber,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '50'],
                showTotal: (total) => `Tổng ${total} học sinh`,
                position: ['bottomRight'],
                onChange: (page, pageSize) => {
                  fetchStudentEnrollments(page, pageSize)
                }
              }}
              locale={{
                emptyText: <Empty description="Không có học sinh nào" />
              }}
            />
          </Card>
        </>
      )}

      {/* Modal chấm điểm */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-blue-600">
            <EditOutlined />
            <span>Chấm điểm cho học sinh</span>
          </div>
        }
        open={gradingModalVisible}
        onCancel={handleCancelGrading}
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={form.submit}
            icon={<SaveOutlined />}
            size="large"
            loading={loading}
          >
            Lưu điểm
          </Button>,
          <Button
            key="cancel"
            onClick={handleCancelGrading}
            size="large"
          >
            Hủy
          </Button>
        ]}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveGrading}
        >
          <Form.Item label="Học sinh">
            <Input
              value={selectedStudent?.studentName}
              readOnly
              prefix={<UserOutlined />}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="mark"
                label="Điểm số"
                rules={[
                  { required: true, message: 'Vui lòng nhập điểm số' },
                  { type: 'number', min: 0, message: 'Điểm số phải >= 0' }
                ]}
              >
                <InputNumber
                  placeholder="Điểm"
                  size="large"
                  className="w-full"
                  min={0}
                  step={0.1}
                  precision={1}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="comment"
            label="Nhận xét"
          >
            <Input.TextArea
              placeholder="Nhận xét về bài làm của học sinh..."
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}

export default TeacherGrading


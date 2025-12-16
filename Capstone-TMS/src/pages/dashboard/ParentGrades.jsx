import { useCallback, useEffect, useState } from 'react'
import { TrophyOutlined, StarOutlined, MessageOutlined, BookOutlined, UserOutlined, ReloadOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons'
import { Card, Table, Tag, Button, Modal, Form, Input, Rate, Spin, Empty, Select } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import { toast } from 'react-toastify'
import api from '../../config/axios'
import { useAuth } from '../../contexts/AuthContext'

dayjs.locale('vi')

const { TextArea } = Input
const { Option } = Select

const ParentGrades = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [children, setChildren] = useState([])
  const [courseResults, setCourseResults] = useState([])
  const [filteredResults, setFilteredResults] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('all')
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false)
  const [selectedResult, setSelectedResult] = useState(null)
  const [form] = Form.useForm()
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  const fetchChildren = useCallback(async () => {
    if (!user?.parentProfileId) {
      toast.error('Không tìm thấy thông tin phụ huynh')
      return []
    }

    try {
      const response = await api.get(`/Users/${user.parentProfileId}/Students?pageNumber=1&pageSize=100`)
      console.log('response fetching students:', response.data)
      setChildren(response.data.students)
      return response.data.students || []
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Không thể tải danh sách học sinh')
      setChildren([])
      return []
    }
  }, [user?.parentProfileId])

  const fetchCourseResults = useCallback(async (studentsList) => {
      if (!user?.parentProfileId) {
        setCourseResults([])
        setFilteredResults([])
        return
      }
      console.log(`studentsList in fetchCourseResults:`, studentsList)

      setLoading(true)
      const map = new Map(
        (studentsList || []).map((s) => [s.profileId, s])
      )

      try {
        const response = await api.get(`/CourseResult/ParentId/${user.parentProfileId}?pageNumber=1&pageSize=100`)
        const results = response.data?.data

        const resultsWithDetails = await Promise.all(
          results.map(async (result) => {
            let course = null
            try {
              const courseResponse = await api.get(`/Course/${result.courseId}`)
              course = courseResponse.data?.data || courseResponse.data || null
            } catch (error) {
              console.error(`Error fetching course ${result.courseId}:`, error)
            }

            return {
              ...result,
              course,
              student: map.get(result.studentId) || null
            }
          })
        )

        setCourseResults(resultsWithDetails)
        setFilteredResults(resultsWithDetails)
      } catch (error) {
        console.error('Error fetching course results:', error)
        if (error.response?.status === 404) {
          toast.info('Chưa có điểm số nào')
        } else {
          toast.error('Không thể tải danh sách điểm số')
        }
        setCourseResults([])
        setFilteredResults([])
      } finally {
        setLoading(false)
      }
    },
    [user?.parentProfileId]
  )

  useEffect(() => {
    const loadData = async () => {
      const students = await fetchChildren()
      await fetchCourseResults(students)
    }

    if (user.parentProfileId) {
      loadData()
    }
  }, [user?.parentProfileId, fetchChildren, fetchCourseResults])

  useEffect(() => {
    let result = [...courseResults]

    if (selectedStudentId !== 'all') {
      result = result.filter((r) => r.studentProfileId === selectedStudentId)
    }

    if (searchTerm) {
      result = result.filter((r) => {
        const courseTitle = r.course?.title?.toLowerCase() || ''
        const subject = r.course?.subject?.toLowerCase() || ''
        const teacher = r.course?.teacherName?.toLowerCase() || ''
        const studentName =
          r.student?.fullName?.toLowerCase() ||
          r.student?.name?.toLowerCase() ||
          ''
        const term = searchTerm.toLowerCase()
        return (
          courseTitle.includes(term) ||
          subject.includes(term) ||
          teacher.includes(term) ||
          studentName.includes(term)
        )
      })
    }

    setFilteredResults(result)
  }, [courseResults, searchTerm, selectedStudentId])

  const getGradeColor = (mark) => {
    const score = parseFloat(mark) || 0
    if (score >= 8) return 'green'
    if (score >= 6.5) return 'blue'
    if (score >= 5) return 'orange'
    return 'red'
  }

  const getGradeLabel = (mark) => {
    const score = parseFloat(mark) || 0
    if (score >= 8) return 'Giỏi'
    if (score >= 6.5) return 'Khá'
    if (score >= 5) return 'Trung bình'
    return 'Yếu'
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return dayjs(dateString).format('DD/MM/YYYY')
  }

  const handleFeedbackClick = (result) => {
    setSelectedResult(result)
    form.resetFields()
    form.setFieldsValue({
      courseRating: result.courseRating || 0,
      teacherRating: result.teacherRating || 0,
      courseFeedback: result.courseFeedback || '',
      teacherFeedback: result.teacherFeedback || ''
    })
    setFeedbackModalVisible(true)
  }

  const handleSubmitFeedback = async (values) => {
    if (!selectedResult || !selectedResult.courseId) {
      toast.error('Thông tin khóa học không hợp lệ')
      return
    }

    setSubmittingFeedback(true)
    const errors = []

    try {
      const courseFeedbackPayload = {
        rating: Number(values.courseRating),
        comment: values.courseFeedback || ''
      }

      const courseParams = { reviewerId: user?.userId }

      try {
        await api.post(
          `/CourseFeedbacks/${selectedResult.courseId}`,
          courseFeedbackPayload,
          { params: courseParams }
        )
      } catch (error) {
        console.error('Error submitting course feedback:', error)
        errors.push('Không thể gửi feedback khóa học')
        if (error.response?.data?.message) {
          errors[errors.length - 1] += `: ${error.response.data.message}`
        }
      }

      const teacherProfileId =
        selectedResult.teacherProfileId ||
        selectedResult.course?.teacherProfileId ||
        selectedResult.course?.teacherId

      if (teacherProfileId) {
        const teacherFeedbackPayload = {
          rating: Number(values.teacherRating),
          comment: values.teacherFeedback || ''
        }

        const teacherParams = {
          teacherProfileId,
          reviewerId: user?.userId
        }

        try {
          await api.post('/TeacherFeedbacks', teacherFeedbackPayload, {
            params: teacherParams
          })
        } catch (error) {
          console.error('Error submitting teacher feedback:', error)
          errors.push('Không thể gửi feedback giáo viên')
          if (error.response?.data?.message) {
            errors[errors.length - 1] += `: ${error.response.data.message}`
          }
        }
      } else {
        errors.push('Không tìm thấy thông tin giáo viên')
      }

      if (errors.length === 0) {
        toast.success('Gửi feedback thành công!')
        setFeedbackModalVisible(false)
        form.resetFields()
        setSelectedResult(null)
        await fetchCourseResults()
      } else if (errors.length === 2) {
        toast.error('Không thể gửi feedback. Vui lòng thử lại.')
      } else {
        toast.warning(`Đã gửi một phần feedback. ${errors.join('. ')}`)
        setFeedbackModalVisible(false)
        form.resetFields()
        setSelectedResult(null)
        await fetchCourseResults()
      }
    } catch (error) {
      console.error('Unexpected error submitting feedback:', error)
      toast.error('Có lỗi xảy ra khi gửi feedback. Vui lòng thử lại.')
    } finally {
      setSubmittingFeedback(false)
    }
  }

  const handleCancelFeedback = () => {
    setFeedbackModalVisible(false)
    form.resetFields()
    setSelectedResult(null)
  }

  const columns = [
    {
      title: 'Học sinh',
      key: 'student',
      width: 220,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
            <TeamOutlined className="text-orange-600 text-lg" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {record.student?.fullName || 'Không xác định'}
            </div>
            <div className="text-xs text-gray-500">
              {record.student?.schoolName || 'N/A'}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Khóa học',
      key: 'course',
      width: 250,
      render: (_, record) => (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <BookOutlined className="text-blue-600 text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {record.course?.title || 'Khóa học không xác định'}
            </div>
            <div className="text-sm text-gray-500 truncate">
              {record.course?.subject || 'N/A'}
            </div>
            {record.course?.teacherName && (
              <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <UserOutlined />
                <span>{record.course.teacherName}</span>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Điểm số',
      key: 'mark',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const mark = parseFloat(record.mark) || 0
        const color = getGradeColor(mark)
        return (
          <div className="flex flex-col items-center gap-1">
            <div className={`text-2xl font-bold text-${color}-600`}>
              {mark.toFixed(1)}
            </div>
            <Tag color={color} className="!m-0">
              {getGradeLabel(mark)}
            </Tag>
          </div>
        )
      }
    },
    {
      title: 'Nhận xét',
      key: 'comment',
      width: 200,
      render: (_, record) => (
        <div className="text-sm text-gray-600">
          {record.comment ? (
            <div className="line-clamp-2">{record.comment}</div>
          ) : (
            <span className="text-gray-400">Chưa có nhận xét</span>
          )}
        </div>
      )
    },
    {
      title: 'Ngày chấm',
      key: 'createdDate',
      width: 120,
      render: (_, record) => (
        <div className="text-sm text-gray-600">
          {formatDate(record.createdDate || record.createdAt)}
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            type="primary"
            icon={<MessageOutlined />}
            onClick={() => handleFeedbackClick(record)}
            size="small"
          >
            Feedback
          </Button>
        </div>
      )
    }
  ]

  const stats = {
    total: filteredResults.length,
    average:
      filteredResults.length > 0
        ? (
            filteredResults.reduce(
              (sum, r) => sum + (parseFloat(r.mark) || 0),
              0
            ) / filteredResults.length
          ).toFixed(1)
        : 0,
    excellent: filteredResults.filter((r) => parseFloat(r.mark) >= 8).length,
    good: filteredResults.filter(
      (r) => parseFloat(r.mark) >= 6.5 && parseFloat(r.mark) < 8
    ).length
  }

  const handleRefresh = async () => {
    const students = await fetchChildren()
    await fetchCourseResults(students)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <TrophyOutlined className="text-orange-500" />
            Kết quả học tập của con
          </h1>
          <p className="text-gray-600 mt-2">
            Phụ huynh xem điểm từng con và gửi feedback về khóa học, giáo viên
          </p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading}
        >
          Làm mới
        </Button>
      </div>

      {children.length > 0 && filteredResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600 mt-1">Tổng kết quả</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.average}
            </div>
            <div className="text-sm text-gray-600 mt-1">Điểm trung bình</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.excellent}
            </div>
            <div className="text-sm text-gray-600 mt-1">Điểm giỏi (≥8)</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.good}
            </div>
            <div className="text-sm text-gray-600 mt-1">Điểm khá (6.5-8)</div>
          </Card>
        </div>
      )}

      <Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <SearchOutlined className="text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">Tìm kiếm</h3>
            </div>
            <Input
              placeholder="Tìm theo khóa học, môn, giáo viên, học sinh..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              size="large"
            />
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900 mb-3">
              Chọn học sinh
            </div>
            <Select
              value={selectedStudentId}
              onChange={setSelectedStudentId}
              size="large"
              className="w-full"
            >
              <Option value="all">Tất cả</Option>
              {children.map((child) => (
                <Option
                  key={
                    child.id || child.studentProfileId || child.profileId || child.userId
                  }
                  value={child.id || child.studentProfileId || child.profileId}
                >
                  {child.fullName || child.name || 'Không xác định'}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      ) : !user?.parentProfileId ? (
        <Card>
          <Empty
            description="Không tìm thấy thông tin phụ huynh"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : children.length === 0 ? (
        <Card>
          <Empty
            description="Bạn chưa thêm thông tin học sinh"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : filteredResults.length === 0 ? (
        <Card>
          <Empty
            description={
              courseResults.length === 0
                ? 'Chưa có điểm số nào'
                : 'Không tìm thấy kết quả phù hợp'
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <Card>
          <Table
            columns={columns}
            dataSource={filteredResults}
            rowKey={(record) => `${record.studentProfileId}-${record.courseId}`}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} kết quả`
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      )}

      <Modal
        title={
          <div className="flex items-center gap-2 text-blue-600">
            <MessageOutlined />
            <span>Gửi feedback về khóa học và giáo viên</span>
          </div>
        }
        open={feedbackModalVisible}
        onCancel={handleCancelFeedback}
        footer={null}
        width={700}
      >
        {selectedResult && (
          <div className="mt-4">
            <Card className="mb-4" size="small">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOutlined className="text-blue-600 text-xl" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-lg">
                    {selectedResult.course?.title || 'Khóa học không xác định'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {selectedResult.course?.subject || 'N/A'}
                  </div>
                  {selectedResult.course?.teacherName && (
                    <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <UserOutlined />
                      <span>Giáo viên: {selectedResult.course.teacherName}</span>
                    </div>
                  )}
                  <div className="mt-2">
                    <Tag color="blue">
                      Học sinh:{' '}
                      {selectedResult.student?.fullName ||
                        selectedResult.student?.name ||
                        'Không xác định'}
                    </Tag>
                    <Tag color="blue" className="ml-2">
                      Điểm: {parseFloat(selectedResult.mark || 0).toFixed(1)}/10
                    </Tag>
                  </div>
                </div>
              </div>
            </Card>

            <Form form={form} layout="vertical" onFinish={handleSubmitFeedback}>
              <Form.Item
                name="courseRating"
                label={
                  <span className="text-base font-semibold">
                    <StarOutlined className="text-yellow-500 mr-1" />
                    Đánh giá khóa học
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng đánh giá khóa học' }]}
              >
                <Rate />
              </Form.Item>

              <Form.Item name="courseFeedback" label="Nhận xét về khóa học">
                <TextArea
                  rows={4}
                  placeholder="Chia sẻ cảm nhận của bạn về khóa học..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <div className="border-t border-gray-200 my-4"></div>

              <Form.Item
                name="teacherRating"
                label={
                  <span className="text-base font-semibold">
                    <StarOutlined className="text-yellow-500 mr-1" />
                    Đánh giá giáo viên
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng đánh giá giáo viên' }]}
              >
                <Rate />
              </Form.Item>

              <Form.Item name="teacherFeedback" label="Nhận xét về giáo viên">
                <TextArea
                  rows={4}
                  placeholder="Chia sẻ cảm nhận của bạn về giáo viên..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item className="mb-0 mt-6">
                <div className="flex justify-end gap-2">
                  <Button onClick={handleCancelFeedback} size="large">
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={submittingFeedback}
                    icon={<MessageOutlined />}
                  >
                    Gửi feedback
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ParentGrades


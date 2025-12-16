import { useState, useEffect, useCallback } from 'react'
import { TrophyOutlined, StarOutlined, MessageOutlined, BookOutlined, UserOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { Card, Table, Tag, Button, Modal, Form, Input, Rate, Spin, Empty, InputNumber } from 'antd'
import api from '../../config/axios'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'

dayjs.locale('vi')

const { TextArea } = Input

const StudentGrades = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [courseResults, setCourseResults] = useState([])
  const [filteredResults, setFilteredResults] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false)
  const [selectedResult, setSelectedResult] = useState(null)
  const [form] = Form.useForm()
  const [submittingFeedback, setSubmittingFeedback] = useState(false)


  // Lấy danh sách điểm từ API
  const fetchCourseResults = useCallback(async () => {
    if (!user.studentProfileId) {
      setCourseResults([])
      return
    }

    setLoading(true)
    try {
      const response = await api.get(`/CourseResult/${user.studentProfileId}/CourseResults`)
      console.log('CourseResults response:', response.data)
      
      const results = response.data?.data || response.data || []
      
      // Lấy thông tin khóa học cho mỗi kết quả
      const resultsWithCourses = await Promise.all(
        results.map(async (result) => {
          try {
            const courseResponse = await api.get(`/Course/${result.courseId}`)
            return {
              ...result,
              course: courseResponse.data?.data || courseResponse.data
            }
          } catch (error) {
            console.error(`Error fetching course ${result.courseId}:`, error)
            return {
              ...result,
              course: null
            }
          }
        })
      )
      
      setCourseResults(resultsWithCourses)
      setFilteredResults(resultsWithCourses)
    } catch (error) {
      console.error('Error fetching course results:', error)
      if (error.response?.status === 404) {
        toast.info('Chưa có điểm số nào')
        setCourseResults([])
        setFilteredResults([])
      } else {
        toast.error('Không thể tải danh sách điểm số')
        setCourseResults([])
        setFilteredResults([])
      }
    } finally {
      setLoading(false)
    }
  }, [user.studentProfileId])

  // Filter kết quả
  useEffect(() => {
    let result = [...courseResults]

    if (searchTerm) {
      result = result.filter(r => 
        r.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.course?.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.course?.teacherName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredResults(result)
  }, [courseResults, searchTerm])

  useEffect(() => {
    if (user.studentProfileId) {
      fetchCourseResults()
    }
  }, [user.studentProfileId, fetchCourseResults])

  // Helper functions
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

  // Xử lý feedback
  const handleFeedbackClick = (result) => {
    console.log('Selected result for feedback:', result)
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

  console.log("user:", user)
  const handleSubmitFeedback = async (values) => {
    if (!selectedResult || !selectedResult.courseId) {
      toast.error('Thông tin khóa học không hợp lệ')
      return
    }

    setSubmittingFeedback(true)
    const errors = []

    try {
      // 1. Gửi feedback khóa học: POST /api/CourseFeedbacks/{courseId}
      const courseFeedbackPayload = {
        rating: Number(values.courseRating),
        comment: values.courseFeedback || ''
      }

      const params = {
        reviewerId: user?.userId
      };

      try {
        const res = await api.post(`/CourseFeedbacks/${selectedResult.courseId}`, courseFeedbackPayload, { params })
        console.log('Course feedback submitted successfully:', res)
      } catch (error) {
        console.error('Error submitting course feedback:', error)
        errors.push('Không thể gửi feedback khóa học')
        if (error.response?.data?.message) {
          errors[errors.length - 1] += `: ${error.response.data.message}`
        }
      }

      // 2. Gửi feedback giáo viên: POST /api/TeacherFeedbacks
      const teacherProfileId = selectedResult.course?.teacherProfileId || selectedResult.course?.teacherId
      
      if (teacherProfileId) {
        const teacherFeedbackPayload = {
          rating: Number(values.teacherRating),
          comment: values.teacherFeedback || ''
        }

        const params = {
          teacherProfileId: teacherProfileId,
          reviewerId: user?.userId
        }

        try {
          const res = await api.post('/TeacherFeedbacks', teacherFeedbackPayload, { params })
          console.log('Teacher feedback submitted successfully:', res)
        } catch (error) {
          console.error('Error submitting teacher feedback:', error)
          errors.push('Không thể gửi feedback giáo viên')
          if (error.response?.data?.message) {
            errors[errors.length - 1] += `: ${error.response.data.message}`
          }
        }
      } else {
        console.warn('TeacherProfileId not found, skipping teacher feedback')
        errors.push('Không tìm thấy thông tin giáo viên')
      }

      // Hiển thị kết quả
      if (errors.length === 0) {
        toast.success('Gửi feedback thành công!')
        setFeedbackModalVisible(false)
        form.resetFields()
        setSelectedResult(null)
        // Refresh data
        await fetchCourseResults()
      } else if (errors.length === 2) {
        // Cả 2 đều lỗi
        toast.error('Không thể gửi feedback. Vui lòng thử lại.')
        console.error('All feedback submissions failed:', errors)
      } else {
        // Một trong hai thành công
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

  // Columns cho table
  const columns = [
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

  // Thống kê
  const stats = {
    total: courseResults.length,
    average: courseResults.length > 0
      ? (courseResults.reduce((sum, r) => sum + (parseFloat(r.mark) || 0), 0) / courseResults.length).toFixed(1)
      : 0,
    excellent: courseResults.filter(r => parseFloat(r.mark) >= 8).length,
    good: courseResults.filter(r => parseFloat(r.mark) >= 6.5 && parseFloat(r.mark) < 8).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <TrophyOutlined className="text-orange-500" />
            Điểm số
          </h1>
          <p className="text-gray-600 mt-2">Xem điểm các khóa học đã học và gửi feedback</p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            if (user.studentProfileId) {
              fetchCourseResults()
            }
          }}
          loading={loading}
        >
          Làm mới
        </Button>
      </div>

      {/* Stats */}
      {courseResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600 mt-1">Tổng khóa học</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.average}</div>
            <div className="text-sm text-gray-600 mt-1">Điểm trung bình</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.excellent}</div>
            <div className="text-sm text-gray-600 mt-1">Điểm giỏi (≥8)</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.good}</div>
            <div className="text-sm text-gray-600 mt-1">Điểm khá (6.5-8)</div>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <SearchOutlined className="text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Tìm kiếm</h3>
        </div>
        <Input
          placeholder="Tìm kiếm theo tên khóa học, môn học, giáo viên..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          size="large"
        />
      </Card>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      ) : !user.studentProfileId ? (
        <Card>
          <Empty
            description="Không tìm thấy thông tin học sinh"
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
            rowKey="courseId"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} kết quả`
            }}
            scroll={{ x: 800 }}
          />
        </Card>
      )}

      {/* Feedback Modal */}
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
            {/* Thông tin khóa học */}
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
                    <Tag color="blue">Điểm: {parseFloat(selectedResult.mark || 0).toFixed(1)}/10</Tag>
                  </div>
                </div>
              </div>
            </Card>

            {/* Form feedback */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmitFeedback}
            >
              {/* Đánh giá khóa học */}
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

              <Form.Item
                name="courseFeedback"
                label="Nhận xét về khóa học"
              >
                <TextArea
                  rows={4}
                  placeholder="Chia sẻ cảm nhận của bạn về khóa học..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <div className="border-t border-gray-200 my-4"></div>

              {/* Đánh giá giáo viên */}
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

              <Form.Item
                name="teacherFeedback"
                label="Nhận xét về giáo viên"
              >
                <TextArea
                  rows={4}
                  placeholder="Chia sẻ cảm nhận của bạn về giáo viên..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              {/* Buttons */}
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

export default StudentGrades


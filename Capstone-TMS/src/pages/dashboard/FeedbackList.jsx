import { useState, useEffect, useCallback } from 'react'
import { MessageOutlined, BookOutlined, UserOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { Card, Table, Tag, Button, Input, Empty, Tabs, Rate, Select, Space, Typography } from 'antd'
import api from '../../config/axios'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import * as signalR from "@microsoft/signalr";

dayjs.locale('vi')

const { TabPane } = Tabs
const { Option } = Select
const { Title, Text } = Typography

const FeedbackList = () => {
  const { user } = useAuth()

  // Course Feedback State
  const [courseFeedbackLoading, setCourseFeedbackLoading] = useState(false)
  const [courseFeedbacks, setCourseFeedbacks] = useState([])
  const [coursePagination, setCoursePagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [courseSearchTerm, setCourseSearchTerm] = useState('')
  const [availableCourses, setAvailableCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(false)

  // Teacher Feedback State
  const [teacherFeedbackLoading, setTeacherFeedbackLoading] = useState(false)
  const [teacherFeedbacks, setTeacherFeedbacks] = useState([])
  const [teacherPagination, setTeacherPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [selectedTeacherProfileId, setSelectedTeacherProfileId] = useState(null)
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('')
  const [availableTeachers, setAvailableTeachers] = useState([])
  const [loadingTeachers, setLoadingTeachers] = useState(false)

  const [activeTab, setActiveTab] = useState('course')
  const [feedbackViolations, setFeedbackViolations] = useState([])

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://tms-api-tcgn.onrender.com/hubs/moderation", {
        accessTokenFactory: () => localStorage.getItem("token")
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => console.log("Inspector connected"))
      .catch(err => console.error("SignalR error", err));

    connection.on("feedbackModerated", (data) => {
      toast.error("Có feedback mới cần duyệt!");
      setFeedbackViolations(p => [data, ...p]);
    })

    connection.on("newViolationReview", (data) => {
      console.log('New violation review received:', data);
      toast.info("Bạn đã thay đổi trạng thái của feedback.")
    })

    return () => connection.stop();
  }, []);

  console.log('feedbackViolations:', feedbackViolations)
  console.log('user:', user)
  // Lấy danh sách khóa học
  const fetchAvailableCourses = useCallback(async () => {
    if (user?.role === 'Teacher') {
      const teacherId = user?.teacherProfileId || user?.TeacherProfileId
      if (!teacherId) return

      setLoadingCourses(true)
      try {
        const response = await api.get(`/Course/${teacherId}/Courses?pageNumber=1&pageSize=1000`)
        const courses = response.data?.data || []
        setAvailableCourses(Array.isArray(courses) ? courses : [])
      } catch (error) {
        console.error('Error fetching courses:', error)
        setAvailableCourses([])
      } finally {
        setLoadingCourses(false)
      }
    } else if (user?.role === 'Center') {
      const centerId = user?.centerProfileId
      if (!centerId) return

      setLoadingCourses(true)
      try {
        const response = await api.get(`/Course/${centerId}/PublishedCourses?pageNumber=1&pageSize=1000`)
        console.log('response.data:', response.data)
        const courses = response.data?.data || response.data || []
        setAvailableCourses(Array.isArray(courses) ? courses : [])
      } catch (error) {
        console.error('Error fetching courses:', error)
        setAvailableCourses([])
      } finally {
        setLoadingCourses(false)
      }
    } else if (user?.role === 'Inspector' || user?.role === 'Admin') {
      setLoadingCourses(true)
      try {
        const response = await api.get(`/Course/Published/Courses?pageNumber=1&pageSize=1000`)
        const courses = response.data?.data || response.data || []
        setAvailableCourses(Array.isArray(courses) ? courses : [])
      } catch (error) {
        console.error('Error fetching courses:', error)
        setAvailableCourses([])
      } finally {
        setLoadingCourses(false)
      }
    }
  }, [user])

  // Lấy danh sách giáo viên
  const fetchAvailableTeachers = useCallback(async () => {
    if (user?.role === 'Center') {
      const centerId = user?.centerProfileId
      if (!centerId) return

      setLoadingTeachers(true)
      try {
        const response = await api.get(`/Users/${centerId}/Teachers?pageNumber=1&pageSize=1000`)
        const teachers = response.data?.teachers || response.data || []
        setAvailableTeachers(Array.isArray(teachers) ? teachers : [])
      } catch (error) {
        console.error('Error fetching teachers:', error)
        setAvailableTeachers([])
      } finally {
        setLoadingTeachers(false)
      }
    } else if (user?.role === 'Inspector' || user?.role === 'Admin') {
      setLoadingTeachers(true)
      try {
        const response = await api.get(`/Users/Teachers?pageNumber=1&pageSize=1000`)
        console.log('Teachers response:', response.data)
        const teachers = response.data?.teachers || []
        setAvailableTeachers(Array.isArray(teachers) ? teachers : [])
      } catch (error) {
        console.error('Error fetching teachers:', error)
        setAvailableTeachers([])
      } finally {
        setLoadingTeachers(false)
      }
    }
  }, [user])

  // Lấy feedback khóa học
  const fetchCourseFeedbacks = useCallback(async (pageNumber = 1, pageSize = 10) => {
    if (!selectedCourseId) {
      setCourseFeedbacks([])
      return
    }

    setCourseFeedbackLoading(true)
    try {
      const response = await api.get(`/CourseFeedbacks/course/${selectedCourseId}`, {
        params: {
          pageNumber,
          pageSize
        }
      })

      const data = response.data?.data || response.data
      if (data) {
        const feedbacks = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : [])
        const total = data.totalCount || data.total || feedbacks.length

        setCourseFeedbacks(feedbacks)
        setCoursePagination(prev => ({
          ...prev,
          current: pageNumber,
          pageSize,
          total
        }))
      } else {
        setCourseFeedbacks([])
        setCoursePagination(prev => ({ ...prev, total: 0 }))
      }
    } catch (error) {
      console.error('Error fetching course feedbacks:', error)
      if (error.response?.status === 404) {
        toast.info('Chưa có feedback nào cho khóa học này')
        setCourseFeedbacks([])
      } else {
        toast.error('Không thể tải danh sách feedback khóa học')
        setCourseFeedbacks([])
      }
      setCoursePagination(prev => ({ ...prev, total: 0 }))
    } finally {
      setCourseFeedbackLoading(false)
    }
  }, [selectedCourseId])

  // Lấy feedback giáo viên
  const fetchTeacherFeedbacks = useCallback(async (pageNumber = 1, pageSize = 10) => {
    let teacherId = selectedTeacherProfileId

    // khi là Teacher, dùng teacherProfileId của user
    if (!teacherId && user?.role === 'Teacher') {
      teacherId = user?.teacherProfileId || user?.TeacherProfileId
      setSelectedTeacherProfileId(teacherId)
    }

    if (!teacherId) {
      setTeacherFeedbacks([])
      return
    }

    setTeacherFeedbackLoading(true)
    try {
      const response = await api.get(`/TeacherFeedbacks/teacher/${teacherId}`, {
        params: {
          pageNumber,
          pageSize
        }
      })

      const data = response.data?.data || response.data
      if (data) {
        const feedbacks = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : [])
        const total = data.totalCount || data.total || feedbacks.length

        setTeacherFeedbacks(feedbacks)
        setTeacherPagination(prev => ({
          ...prev,
          current: pageNumber,
          pageSize,
          total
        }))
      } else {
        setTeacherFeedbacks([])
        setTeacherPagination(prev => ({ ...prev, total: 0 }))
      }
    } catch (error) {
      console.error('Error fetching teacher feedbacks:', error)
      if (error.response?.status === 404) {
        toast.info('Chưa có feedback nào cho giáo viên này')
        setTeacherFeedbacks([])
      } else {
        toast.error('Không thể tải danh sách feedback giáo viên')
        setTeacherFeedbacks([])
      }
      setTeacherPagination(prev => ({ ...prev, total: 0 }))
    } finally {
      setTeacherFeedbackLoading(false)
    }
  }, [selectedTeacherProfileId, user])

  // Auto-select teacherProfileId nếu là Teacher
  useEffect(() => {
    if (user?.role === 'Teacher' && !selectedTeacherProfileId) {
      const teacherId = user?.teacherProfileId || user?.TeacherProfileId
      if (teacherId) {
        setSelectedTeacherProfileId(teacherId)
      }
    }
  }, [user, selectedTeacherProfileId])

  // Load available courses/teachers
  useEffect(() => {
    fetchAvailableCourses()
    fetchAvailableTeachers()
  }, [fetchAvailableCourses, fetchAvailableTeachers])

  // Fetch feedbacks khi selectedCourseId hoặc selectedTeacherProfileId thay đổi
  useEffect(() => {
    if (activeTab === 'course' && selectedCourseId) {
      fetchCourseFeedbacks(1, coursePagination.pageSize)
    }
  }, [selectedCourseId, activeTab])

  useEffect(() => {
    if (activeTab === 'teacher') {
      fetchTeacherFeedbacks(1, teacherPagination.pageSize)
    }
  }, [selectedTeacherProfileId, activeTab])

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return dayjs(dateString).format('DD/MM/YYYY HH:mm')
  }

  const getStatusFeedback = (status) => {
    const statusMap = {
      0: { label: 'Chờ duyệt', color: 'orange' },
      1: { label: 'Đã hiện', color: 'green' },
      2: { label: 'Cảnh báo', color: 'yellow' },
      3: { label: 'Đã ẩn', color: 'red' },
      4: { label: 'Từ chối', color: 'blue' },
    }
    return (
      <Tag color={statusMap[status]?.color || 'gray'}>
        {statusMap[status]?.label || 'Không xác định'}
      </Tag>
    )
  }

  const getStatusViolation = (status) => {
    const statusMap = {
      'Warning': { label: 'Cảnh báo', color: 'yellow' },
      'Hidden': { label: 'Đã ẩn', color: 'red' },
    }
    return (
      <Tag color={statusMap[status]?.color || 'gray'}>
        {statusMap[status]?.label || 'Không xác định'}
      </Tag>
    )
  }

  const STATUS_LIST = ['Chờ duyệt', 'Đã hiện', 'Cảnh báo', 'Đã ẩn']

  const handleChangeStatus = async (courseFeedbackId, teacherFeedbackId, newStatus) => {

    try {
      const statusValue = STATUS_LIST.indexOf(newStatus)
      const moderationNotes = statusValue === 1 ? "Chúng tui đã xem xét lại." : "Bạn đã vi phạm quy định cộng đồng."

      const payload = {
        status: statusValue,
        moderationNotes: moderationNotes || ''
      }

      if (courseFeedbackId) {
        setCourseFeedbackLoading(true)
        const apiResponse = await api.put(`/CourseFeedbacks/Status/${courseFeedbackId}?moderatorId=${user.userId}`, payload)
        console.log('Change status response:', apiResponse.data)
        fetchCourseFeedbacks(coursePagination.current, coursePagination.pageSize)
      } else if (teacherFeedbackId) {
        setTeacherFeedbackLoading(true)
        const apiResponse = await api.put(`/TeacherFeedbacks/Status/${teacherFeedbackId}?moderatorId=${user.userId}`, payload)
        console.log('Change status response:', apiResponse.data)
        fetchTeacherFeedbacks(teacherPagination.current, teacherPagination.pageSize)
      }
      toast.success('Cập nhật trạng thái thành công')
    } catch (error) {
      console.error('Change status failed:', error)
      toast.error('Cập nhật trạng thái thất bại')
    } finally {
      setTeacherFeedbackLoading(false)
      setCourseFeedbackLoading(false)
    }
  }

  // Course Feedback Columns
  const courseFeedbackColumns = [
    {
      title: 'Đánh giá',
      key: 'rating',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div className="flex flex-col items-center gap-1">
          <Rate disabled value={record.rating || 0} />
          <span className="text-sm text-gray-600">{record.rating || 0}/5</span>
        </div>
      )
    },
    {
      title: 'Nhận xét',
      key: 'comment',
      render: (_, record) => (
        <div className="text-sm text-gray-700">
          {record.comment || <span className="text-gray-400">Không có nhận xét</span>}
        </div>
      )
    },
    {
      title: 'Người đánh giá',
      key: 'reviewer',
      width: 200,
      render: (_, record) => (
        <div className="text-sm text-gray-600">
          {record.studentName || record.parentName || "N/A"}
        </div>
      )
    },
    {
      title: 'Ngày đánh giá',
      key: 'createdDate',
      width: 150,
      render: (_, record) => (
        console.log('record:', record),
        <div className="text-sm text-gray-600">
          {formatDate(record.createdAt)}
        </div>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      align: 'center',
      render: (_, record) => getStatusFeedback(record.status)
    },
    {
      title: 'Cập nhật trạng thái',
      key: 'updateStatus',
      width: 200,
      align: 'center',
      render: (_, record) => {
        return (
          <Select
            value={STATUS_LIST[record.status]}
            onChange={(val) => handleChangeStatus(record.id, null, val)}
            style={{ width: 155, textAlign: "center" }}
            options={[
              { value: 'Đã hiện', label: 'Đã hiện' },
              { value: 'Cảnh báo', label: 'Cảnh báo' },
              { value: 'Đã ẩn', label: 'Đã ẩn' },
            ]}
          />
        )
      }
    },
  ]

  // Course Feedback Columns For Center And Teacher (No Update Status)
  const courseFeedbackCeTeColumns = [
    {
      title: 'Đánh giá',
      key: 'rating',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div className="flex flex-col items-center gap-1">
          <Rate disabled value={record.rating || 0} />
          <span className="text-sm text-gray-600">{record.rating || 0}/5</span>
        </div>
      )
    },
    {
      title: 'Nhận xét',
      key: 'comment',
      render: (_, record) => (
        <div className="text-sm text-gray-700">
          {record.comment || <span className="text-gray-400">Không có nhận xét</span>}
        </div>
      )
    },
    {
      title: 'Người đánh giá',
      key: 'reviewer',
      width: 200,
      render: (_, record) => (
        <div className="text-sm text-gray-600">
          {record.studentName || record.parentName || "N/A"}
        </div>
      )
    },
    {
      title: 'Ngày đánh giá',
      key: 'createdDate',
      width: 150,
      render: (_, record) => (
        console.log('record:', record),
        <div className="text-sm text-gray-600">
          {formatDate(record.createdAt)}
        </div>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      align: 'center',
      render: (_, record) => getStatusFeedback(record.status)
    }
  ]

  // Teacher Feedback Columns
  const teacherFeedbackColumns = [
    {
      title: 'Đánh giá',
      key: 'rating',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div className="flex flex-col items-center gap-1">
          <Rate disabled value={record.rating || 0} />
          <span className="text-sm text-gray-600">{record.rating || 0}/5</span>
        </div>
      )
    },
    {
      title: 'Nhận xét',
      key: 'comment',
      render: (_, record) => (
        <div className="text-sm text-gray-700">
          {record.comment || <span className="text-gray-400">Không có nhận xét</span>}
        </div>
      )
    },
    {
      title: 'Người đánh giá',
      key: 'reviewer',
      width: 200,
      render: (_, record) => (
        <div className="text-sm text-gray-600">
          {record.studentName || record.parentName || "N/A"}
        </div>
      )
    },
    {
      title: 'Ngày đánh giá',
      key: 'createdDate',
      width: 150,
      render: (_, record) => (
        <div className="text-sm text-gray-600">
          {formatDate(record.createdAt)}
        </div>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      align: 'center',
      render: (_, record) => getStatusFeedback(record.status)
    },
    {
      title: 'Cập nhật trạng thái',
      key: 'updateStatus',
      width: 200,
      align: 'center',
      render: (_, record) => {
        return (
          <Select
            value={STATUS_LIST[record.status]}
            onChange={(val) => handleChangeStatus(null, record.id, val)}
            style={{ width: 155, textAlign: "center" }}
            options={[
              { value: 'Đã hiện', label: 'Đã hiện' },
              { value: 'Cảnh báo', label: 'Cảnh báo' },
              { value: 'Đã ẩn', label: 'Đã ẩn' },
            ]}
          />
        )
      }
    },
  ]

  // Teacher Feedback Columns For Center And Teacher (No Update Status)
  const teacherFeedbackCeTeColumns = [
    {
      title: 'Đánh giá',
      key: 'rating',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div className="flex flex-col items-center gap-1">
          <Rate disabled value={record.rating || 0} />
          <span className="text-sm text-gray-600">{record.rating || 0}/5</span>
        </div>
      )
    },
    {
      title: 'Nhận xét',
      key: 'comment',
      render: (_, record) => (
        <div className="text-sm text-gray-700">
          {record.comment || <span className="text-gray-400">Không có nhận xét</span>}
        </div>
      )
    },
    {
      title: 'Người đánh giá',
      key: 'reviewer',
      width: 200,
      render: (_, record) => (
        <div className="text-sm text-gray-600">
          {record.studentName || record.parentName || "N/A"}
        </div>
      )
    },
    {
      title: 'Ngày đánh giá',
      key: 'createdDate',
      width: 150,
      render: (_, record) => (
        <div className="text-sm text-gray-600">
          {formatDate(record.createdAt)}
        </div>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      align: 'center',
      render: (_, record) => getStatusFeedback(record.status)
    }
  ]

  const isCeTeRole = (role) => ['Center', 'Teacher'].includes(role)

  const courseColumns = isCeTeRole(user?.role)
    ? courseFeedbackCeTeColumns
    : courseFeedbackColumns

  const teacherColumns = isCeTeRole(user?.role)
    ? teacherFeedbackCeTeColumns
    : teacherFeedbackColumns

  // Filter course feedbacks
  const filteredCourseFeedbacks = courseFeedbacks.filter(feedback => {
    console.log('feedback:', feedback)
    if (!courseSearchTerm) return true
    const searchLower = courseSearchTerm.toLowerCase()
    return (
      (feedback.comment || '').toLowerCase().includes(searchLower) ||
      (feedback.studentName || '').toLowerCase().includes(searchLower) ||
      (feedback.parentName || '').toLowerCase().includes(searchLower)
    )
  })

  // Filter teacher feedbacks
  const filteredTeacherFeedbacks = teacherFeedbacks.filter(feedback => {
    if (!teacherSearchTerm) return true
    const searchLower = teacherSearchTerm.toLowerCase()
    return (
      (feedback.comment || '').toLowerCase().includes(searchLower) ||
      (feedback.studentName || '').toLowerCase().includes(searchLower) ||
      (feedback.parentName || '').toLowerCase().includes(searchLower)
    )
  })

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {/* Header */}
      <Card className="!bg-gradient-to-r !from-[#a00aea] !to-[#bb44f7] !rounded-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Title level={2} className="!text-white !m-0 !font-bold">
              <MessageOutlined /> Danh sách Feedback
            </Title>
            <Text className="!text-white/90 !text-base">
              Xem và quản lý feedback về khóa học và giáo viên.
            </Text>
          </div>
          <Button
            type="default"
            onClick={() => {
              if (activeTab === 'course' && selectedCourseId) {
                fetchCourseFeedbacks(coursePagination.current, coursePagination.pageSize)
              } else if (activeTab === 'teacher') {
                fetchTeacherFeedbacks(teacherPagination.current, teacherPagination.pageSize)
              }
            }}
            className="group !bg-white/50 !border-none !text-white !transition-colors"
          >
            <ReloadOutlined className="group-hover:animate-spin" />
            Làm mới
          </Button>
        </div>
      </Card>

      {/* Feedback Violations Section */}
      {user?.role === 'Inspector' &&
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Feedback List */}
          <Card
            title={
              <span className="flex items-center gap-2">
                <MessageOutlined />
                Feedback vi phạm sau khi kiểm duyệt ({feedbackViolations.length})
              </span>
            }
            size="small"
          >
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {feedbackViolations.map((violation, index) => (
                <div
                  key={index}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-sm text-gray-700 mb-1">
                    <strong>{violation.name}:</strong> {violation.comment || 'Không có comment'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(violation.moderatedAt)} --- Trạng thái: {getStatusViolation(violation.status)} --- Loại: {violation.targetType === 0 ? 'Khóa học' : 'Giáo viên'}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Right: User Names List */}
          <Card
            title={
              <span className="flex items-center gap-2">
                <UserOutlined />
                Người dùng vi phạm ({new Set(feedbackViolations.map(v => v.name).filter(Boolean)).size})
              </span>
            }
            size="small"
          >
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Array.from(new Set(
                feedbackViolations
                  .map(v => v.name)
                  .filter(Boolean)
              )).map((userName, index) => (
                <div
                  key={index}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <UserOutlined className="text-blue-500" />
                  <span className="text-sm text-gray-700">{userName}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      }

      {/* Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Course Feedback Tab */}
          <TabPane
            tab={
              <span><BookOutlined /> Feedback Khóa học</span>
            }
            key="course"
          >
            <div className="space-y-4">
              {/* Course Selection */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="flex items-center gap-2 w-full">
                  <label className="block text-sm font-medium text-gray-700 text-nowrap">
                    Chọn khóa học:
                  </label>
                  {availableCourses.length > 0 ? (
                    <Select
                      style={{ width: '50%' }}
                      placeholder="Chọn khóa học để xem feedback"
                      value={selectedCourseId}
                      onChange={(value) => {
                        setSelectedCourseId(value)
                        setCoursePagination(prev => ({ ...prev, current: 1 }))
                      }}
                      loading={loadingCourses}
                      showSearch
                      optionFilterProp="children"
                      allowClear
                      listHeight={160}
                    >
                      {availableCourses.map(course => (
                        console.log('course:', course),
                        <Option key={course.id} value={course.id}>
                          {course.title} - {course.subject} - {course.teacherName}
                        </Option>
                      ))}
                    </Select>
                  ) : (
                    <p>Tạm thời chưa có khóa học nào</p>
                  )}
                </div>
              </div>

              {/* Search */}
              {selectedCourseId && (
                <Input
                  className="search-input"
                  placeholder="Tìm kiếm feedback..."
                  prefix={<SearchOutlined className="search-icon"/>}
                  value={courseSearchTerm}
                  onChange={(e) => setCourseSearchTerm(e.target.value)}
                  allowClear
                  size="large"
                />
              )}

              {/* Table */}
              {!selectedCourseId ? (
                <Empty
                  description="Vui lòng chọn khóa học để xem feedback"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : filteredCourseFeedbacks.length === 0 ? (
                <Empty
                  description="Chưa có feedback nào cho khóa học này"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <div className="rounded-lg shadow-sm">
                  <Table
                    columns={courseColumns}
                    dataSource={filteredCourseFeedbacks}
                    rowKey={(record) => record.feedbackId || record.id || Math.random()}
                    pagination={{
                      current: coursePagination.current,
                      pageSize: coursePagination.pageSize,
                      total: coursePagination.total,
                      showSizeChanger: true,
                      showTotal: (total) => `Tổng ${total} feedback`,
                      onChange: (page, pageSize) => {
                        setCoursePagination(prev => ({ ...prev, current: page, pageSize }))
                        fetchCourseFeedbacks(page, pageSize)
                      },
                      onShowSizeChange: (current, size) => {
                        setCoursePagination(prev => ({ ...prev, current: 1, pageSize: size }))
                        fetchCourseFeedbacks(1, size)
                      },
                      className: "!mr-2"
                    }}
                    scroll={{ x: "max-content", ...(filteredCourseFeedbacks.length > 5 ? {y: 75 * 5} : "") }}
                    loading={courseFeedbackLoading}
                  />
                </div>
              )}
            </div>
          </TabPane>

          {/* Teacher Feedback Tab */}
          <TabPane
            tab={
              <span><UserOutlined /> Feedback Giáo viên</span>
            }
            key="teacher"
          >
            <div className="space-y-4">
              {/* Teacher Selection */}
              {user?.role !== 'Teacher' && (
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                  <div className="flex items-center gap-2 w-full">
                    <label className="block text-sm font-medium text-gray-700 text-nowrap">
                      Chọn giáo viên:
                    </label>
                    {availableTeachers.length > 0 ? (
                      <Select
                        style={{ width: '50%' }}
                        placeholder="Chọn giáo viên để xem feedback"
                        value={selectedTeacherProfileId}
                        onChange={(value) => {
                          setSelectedTeacherProfileId(value)
                          setTeacherPagination(prev => ({ ...prev, current: 1 }))
                        }}
                        loading={loadingTeachers}
                        showSearch
                        optionFilterProp="children"
                        allowClear
                        listHeight={160} 
                      >
                        {availableTeachers.map(teacher => (
                          console.log('teacher:', teacher),
                          <Option key={teacher.profileId} value={teacher.profileId}>
                            {teacher.fullName}
                          </Option>
                        ))}
                      </Select>
                    ) : (
                      <p>Tạm thời chưa có giáo viên nào</p>
                    )}
                  </div>
                </div>
              )}

              {user?.role === 'Teacher' && selectedTeacherProfileId && (
                <Card size="small" className="!bg-blue-50 !mb-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <UserOutlined />
                    <span>Các feedback về bạn</span>
                  </div>
                </Card>
              )}

              {/* Search */}
              {selectedTeacherProfileId && (
                <Input
                  className="search-input"
                  placeholder="Tìm kiếm feedback..."
                  prefix={<SearchOutlined className="search-icon"/>}
                  value={teacherSearchTerm}
                  onChange={(e) => setTeacherSearchTerm(e.target.value)}
                  allowClear
                  size="large"
                />
              )}

              {/* Table */}
              {!selectedTeacherProfileId ? (
                <Empty
                  description={
                    user?.role === 'Teacher'
                      ? 'Đang tải thông tin...'
                      : 'Vui lòng chọn giáo viên để xem feedback'
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : filteredTeacherFeedbacks.length === 0 ? (
                <Empty
                  description="Chưa có feedback nào cho giáo viên này"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <div className="rounded-lg shadow-sm">
                  <Table
                    columns={teacherColumns}
                    dataSource={filteredTeacherFeedbacks}
                    rowKey={(record) => record.feedbackId || record.id || Math.random()}
                    pagination={{
                      current: teacherPagination.current,
                      pageSize: teacherPagination.pageSize,
                      total: teacherPagination.total,
                      showSizeChanger: true,
                      showTotal: (total) => `Tổng ${total} feedback`,
                      onChange: (page, pageSize) => {
                        setTeacherPagination(prev => ({ ...prev, current: page, pageSize }))
                        fetchTeacherFeedbacks(page, pageSize)
                      },
                      onShowSizeChange: (current, size) => {
                        setTeacherPagination(prev => ({ ...prev, current: 1, pageSize: size }))
                        fetchTeacherFeedbacks(1, size)
                      },
                      className: "!mr-2"
                    }}
                    scroll={{ x: "max-content", ...(filteredTeacherFeedbacks.length > 5 ? {y: 75 * 5} : "") }}
                    loading={teacherFeedbackLoading}
                  />
                </div>
              )}
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </Space>
  )
}

export default FeedbackList


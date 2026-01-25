import { useState, useEffect, useCallback } from 'react'
import { CalendarOutlined, ClockCircleOutlined, BookOutlined, EnvironmentOutlined, TeamOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons'
import api from '../../config/axios'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-toastify'
import { Select, Spin, Tag, Card, Modal, Descriptions, Divider, Space, Typography } from 'antd'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import rrulePlugin from '@fullcalendar/rrule'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { RRule } from 'rrule'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('vi')

const { Option } = Select
const { Title, Text } = Typography

const TeacherSchedule = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState([])
  const [schedules, setSchedules] = useState([])
  const [calendarEvents, setCalendarEvents] = useState([])
  const [viewMode, setViewMode] = useState('calendar') // 'calendar' or 'list'
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState(null)

  const [pagination] = useState({
    pageNumber: 1,
    pageSize: 100,
    total: 0,
  })

  // Lấy danh sách courses của teacher
  const fetchCourses = useCallback(async () => {

    if (!user.teacherProfileId) {
      toast.error('Không tìm thấy thông tin giáo viên')
      return
    }

    setLoading(true)
    try {
      const response = await api.get(`/Course/${user.teacherProfileId}/Courses`)
      console.log("response fetchCourses:", response.data)
      
      let courseList = []
      if (response.data && response.data.success) {
        courseList = response.data.data || []
      } else if (Array.isArray(response.data)) {
        courseList = response.data
      } else if (response.data?.data) {
        courseList = response.data.data
      }

      setCourses(courseList)
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Không thể tải danh sách khóa học')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [user.teacherProfileId])

  // Lấy lịch dạy cho các courses
  const fetchSchedules = useCallback(async (page, pageSize) => {
    if (courses.length === 0) {
      setSchedules([])
      setCalendarEvents([])
      return
    }

    const weekdays = [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA]

    setLoading(true)
    try {
      const courseIds = courses.map(c => c.id).filter(Boolean)
      const allSchedules = []

      for (const courseId of courseIds) {
        try {
          // Lấy schedules của course
          let courseSchedules = []
          
          try {
            const response = await api.get(`/ClassSchedule/Course/${courseId}?pageNumber=${page}&pageSize=${pageSize}`)
            console.log("response of courseSchedules:", response)
            courseSchedules = response.data.data || []
          } catch (error) {
            console.error(`Error fetching schedules for course ${courseId}:`, error)
          }
          
          // Tìm course tương ứng
          const course = courses.find(c => c.id === courseId)
          
          courseSchedules.forEach(schedule => {
            allSchedules.push({
              ...schedule,
              course: course
            })
          })
        } catch (error) {
          console.error(`Error processing schedules for course ${courseId}:`, error)
        }
      }

      setSchedules(allSchedules)

      // Chuyển đổi sang format cho FullCalendar
      const events = allSchedules.map(schedule => {
        const course = schedule.course || {}
        
        console.log("schedule:", schedule)

        // Tính duration từ startTime đến endTime
        const startDateTime = dayjs(`${schedule.startDate}T${schedule.startTime}`)
        const endDateTime = dayjs(`${schedule.startDate}T${schedule.endTime}`)
        const durationMinutes = endDateTime.diff(startDateTime, 'minute')

        return {
          id: schedule.id?.toString(),
          title: course.title || 'Khóa học',
          rrule: {
            freq: 'weekly',
            byweekday: [weekdays[schedule.dayOfWeek]],
            dtstart: `${schedule.startDate}T${schedule.startTime}`,
            until: `${schedule.endDate}T${schedule.endTime}`
          },
          duration: { minutes: durationMinutes },
          backgroundColor: getCourseColor(course.subject),
          borderColor: getCourseColor(course.subject),
          extendedProps: {
            schedule: schedule,
            course: course,
            room: schedule.roomOrLink,
            description: course.description,
            classDescription: schedule.classDescription
          }
        }
      })

      setCalendarEvents(events)
    } catch (error) {
      console.error('Error fetching schedules:', error)
      toast.error('Không thể tải lịch dạy')
      setSchedules([])
      setCalendarEvents([])
    } finally {
      setLoading(false)
    }
  }, [courses])

  // Màu sắc cho từng course
  const getCourseColor = (subject) => {
    const colors = {
      "Physics": "#10b981",
      "Math": "#3b82f6",
      "Chemistry": "#8b5cf6",
      "English": "#ef4444",
      "Biology": "#06b6d4",
      "History": "#f59e0b",
      "Literature": "#ec4899"
    }
    return colors[subject] || '#6b7280'
  }

  // Load dữ liệu
  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  useEffect(() => {
    if (courses.length > 0) {
      fetchSchedules(pagination.pageNumber, pagination.pageSize)
    }
  }, [courses, fetchSchedules, pagination.pageNumber, pagination.pageSize])

  // Filter schedules
  const filteredSchedules = schedules.filter(schedule => {
    const matchCourse = selectedCourse === 'all' || schedule.course?.id === selectedCourse
    return matchCourse
  })

  // Filter calendar events
  const filteredCalendarEvents = calendarEvents.filter(event => {
    const schedule = event.extendedProps.schedule
    const matchCourse = selectedCourse === 'all' || schedule.course?.id === selectedCourse
    return matchCourse
  })

  // Format thời gian
  const formatTime = (time) => {
    if (!time) return ''
    return time.slice(0, 5)
  }

  // Format ngày
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return dayjs(dateString).format('DD/MM/YYYY')
  }

  // Lấy tên thứ trong tuần
  const getDayName = (dayOfWeek) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
    return days[dayOfWeek] || ''
  }

  // Xử lý khi click vào event trên calendar
  const handleEventClick = (clickInfo) => {
    const { extendedProps } = clickInfo.event
    setSelectedSchedule(extendedProps.schedule)
    setIsModalVisible(true)
  }

  // Xử lý khi click vào card trong list view
  const handleCardClick = (schedule) => {
    setSelectedSchedule(schedule)
    setIsModalVisible(true)
  }

  // Đóng modal
  const handleCloseModal = () => {
    setIsModalVisible(false)
    setSelectedSchedule(null)
  }

  // Danh sách courses unique
  const uniqueCourses = courses
    .filter(c => c.id)
    .map(c => ({ id: c.id, title: c.title, course: c }))
    .filter((course, index, self) => 
      index === self.findIndex(c => c.id === course.id)
    )

  const renderEventContent = (eventInfo) => {
    console.log("Rendering event:", eventInfo)
    const { title, extendedProps } = eventInfo.event
    const { room, schedule, course } = extendedProps

    return (
      <div className="fc-event-main-frame hover:cursor-pointer">
        <div className="fc-event-title-container">
          <div className="fc-event-title fc-sticky font-semibold">
            {title}
          </div>

          <div style={{ fontSize: "0.75rem", lineHeight: "1.5" }}>
            {course?.subject && (
              <div><strong>Môn: </strong>{course.subject}</div>
            )}
            <div><strong>Phòng/Link: </strong>{room || 'Chưa có'}</div>
            <div><strong>Giờ: </strong>{dayjs(schedule.startTime, "HH:mm:ss").format("HH:mm")} - {dayjs(schedule.endTime, "HH:mm:ss").format("HH:mm")}</div>
            {schedule.classDescription && (
              <div><strong>Mô tả: </strong>{schedule.classDescription}</div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {/* Header */}
      <Card className="!bg-gradient-to-r !from-orange-500 !to-purple-600 !rounded-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Title level={2} className="!text-white !m-0 !font-bold">
              <CalendarOutlined /> Xem lịch
            </Title>
            <Text className="!text-white/90 !text-base">
              Xem lịch dạy của các khóa học được phân công.
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchCourses()
                fetchSchedules(pagination.pageNumber, pagination.pageSize)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ReloadOutlined />
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FilterOutlined className="text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filter by Course */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BookOutlined className="mr-2" />
              Chọn khóa học
            </label>
            <Select
              value={selectedCourse}
              onChange={setSelectedCourse}
              className="w-full"
              placeholder="Tất cả khóa học"
            >
              <Option value="all">Tất cả khóa học</Option>
              {uniqueCourses.map(course => (
                <Option key={course.id} value={course.id.toString()}>
                  {course.title}
                </Option>
              ))}
            </Select>
          </div>

          {/* View Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarOutlined className="mr-2" />
              Chế độ xem
            </label>
            <Select
              value={viewMode}
              onChange={setViewMode}
              className="w-full"
            >
              <Option value="calendar">Lịch</Option>
              <Option value="list">Danh sách</Option>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading && courses.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <CalendarOutlined className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có khóa học</h3>
          <p className="text-gray-600 mb-4">
            Bạn chưa được phân công khóa học nào hoặc chưa có lịch dạy được sắp xếp.
          </p>
        </div>
      ) : viewMode === 'calendar' ? (
        /* Calendar View */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={filteredCalendarEvents}
            eventContent={renderEventContent}
            eventClick={handleEventClick}
            height="auto"
            locale="vi"
            allDaySlot={false}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            weekends={true}
            editable={false}
            selectable={false}
            eventDisplay="block"
          />
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredSchedules.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <CalendarOutlined className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có lịch dạy</h3>
              <p className="text-gray-600">
                Không tìm thấy lịch dạy phù hợp với bộ lọc đã chọn.
              </p>
            </div>
          ) : (
            filteredSchedules.map((schedule, index) => {
              const course = schedule.course || {}
              
              return (
                <Card
                  key={schedule.id || index}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  style={{ borderLeft: `4px solid ${getCourseColor(course.subject)}` }}
                  onClick={() => handleCardClick(schedule)}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: getCourseColor(course.subject) }}
                          >
                            <BookOutlined className="text-xl" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {course.title || 'Khóa học'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                            {schedule.roomOrLink ? (
                              <span className="flex items-center gap-1">
                                <EnvironmentOutlined />
                                {schedule.roomOrLink}
                              </span>
                            ) : null}
                            {course.capacity ? (
                              <span className="flex items-center gap-1">
                                <TeamOutlined />
                                {course.capacity} học viên
                              </span>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            {schedule.dayOfWeek !== undefined && (
                              <Tag color="blue" className="!flex items-center gap-1">
                                <CalendarOutlined />
                                {getDayName(schedule.dayOfWeek)}
                              </Tag>
                            )}
                            {schedule.startTime && schedule.endTime ? (
                              <Tag color="green" className="!flex items-center gap-1">
                                <ClockCircleOutlined />
                                {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                              </Tag>
                            ) : null}
                            {course.subject ? (
                              <Tag color="orange">{course.subject}</Tag>
                            ) : null}
                            {schedule.startDate && schedule.endDate ? (
                              <Tag color="purple">
                                {formatDate(schedule.startDate)} - {formatDate(schedule.endDate)}
                              </Tag>
                            ) : null}
                          </div>
                          {schedule.classDescription ? (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Mô tả: </strong>{schedule.classDescription}
                            </p>
                          ) : null}
                          {course.description ? (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {course.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      )}

      {/* Summary Stats */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
            <div className="text-sm text-gray-600 mt-1">Khóa học được phân công</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">{filteredSchedules.length}</div>
            <div className="text-sm text-gray-600 mt-1">Buổi dạy trong tuần</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {courses.reduce((sum, c) => sum + (c.capacity || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Tổng số học viên</div>
          </Card>
        </div>
      )}

      {/* Modal chi tiết lịch dạy */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <BookOutlined className="text-orange-500" />
            <span>Chi tiết buổi dạy</span>
          </div>
        }
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={700}
        className="schedule-detail-modal"
      >
        {selectedSchedule && (
          <div className="mt-4">
            <Descriptions bordered column={1} size="middle">
              {/* Thông tin khóa học */}
              <Descriptions.Item label={
                <span className="flex items-center gap-2">
                  <BookOutlined className="text-blue-500" />
                  <strong>Khóa học</strong>
                </span>
              }>
                <div>
                  <div className="font-semibold text-lg text-gray-900 mb-1">
                    {selectedSchedule.course?.title || 'Chưa có thông tin'}
                  </div>
                  {selectedSchedule.course?.subject && (
                    <Tag color="orange" className="mt-1">{selectedSchedule.course.subject}</Tag>
                  )}
                </div>
              </Descriptions.Item>

              {/* Mô tả khóa học */}
              {selectedSchedule.course?.description && (
                <Descriptions.Item label={<strong>Mô tả khóa học</strong>}>
                  <p className="text-gray-700">{selectedSchedule.course.description}</p>
                </Descriptions.Item>
              )}

              <Divider />

              {/* Thời gian */}
              <Descriptions.Item label={
                <span className="flex items-center gap-2">
                  <ClockCircleOutlined className="text-green-500" />
                  <strong>Thời gian</strong>
                </span>
              }>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Thứ trong tuần: </span>
                    <Tag color="blue">{getDayName(selectedSchedule.dayOfWeek)}</Tag>
                  </div>
                  <div>
                    <span className="font-medium">Giờ học: </span>
                    <Tag color="green">
                      {formatTime(selectedSchedule.startTime)} - {formatTime(selectedSchedule.endTime)}
                    </Tag>
                  </div>
                  {selectedSchedule.startDate && selectedSchedule.endDate && (
                    <div>
                      <span className="font-medium">Thời gian khóa học: </span>
                      <span className="text-gray-700">
                        {formatDate(selectedSchedule.startDate)} - {formatDate(selectedSchedule.endDate)}
                      </span>
                    </div>
                  )}
                </div>
              </Descriptions.Item>

              {/* Địa điểm */}
              <Descriptions.Item label={
                <span className="flex items-center gap-2">
                  <EnvironmentOutlined className="text-red-500" />
                  <strong>Phòng/Link</strong>
                </span>
              }>
                {selectedSchedule.roomOrLink ? (
                  <div>
                    {selectedSchedule.roomOrLink.startsWith('http') ? (
                      <a 
                        href={selectedSchedule.roomOrLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedSchedule.roomOrLink}
                      </a>
                    ) : (
                      <span className="text-gray-700">{selectedSchedule.roomOrLink}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400">Chưa có thông tin</span>
                )}
              </Descriptions.Item>

              {/* Mô tả buổi học */}
              {selectedSchedule.classDescription && (
                <Descriptions.Item label={<strong>Mô tả buổi học</strong>}>
                  <p className="text-gray-700">{selectedSchedule.classDescription}</p>
                </Descriptions.Item>
              )}

              <Divider />

              {/* Thông tin khác */}
              <Descriptions.Item label={
                <span className="flex items-center gap-2">
                  <TeamOutlined className="text-purple-500" />
                  <strong>Thông tin lớp</strong>
                </span>
              }>
                <div className="space-y-2">
                  {selectedSchedule.course?.capacity && (
                    <div>
                      <span className="font-medium">Sĩ số: </span>
                      <span className="text-gray-700">{selectedSchedule.course.capacity} học viên</span>
                    </div>
                  )}
                  {selectedSchedule.course?.gradeLevel && (
                    <div>
                      <span className="font-medium">Lớp: </span>
                      <span className="text-gray-700">Lớp {selectedSchedule.course.gradeLevel}</span>
                    </div>
                  )}
                  {selectedSchedule.course?.tuitionFee && (
                    <div>
                      <span className="font-medium">Học phí: </span>
                      <span className="text-gray-700">
                        {selectedSchedule.course.tuitionFee.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  )}
                </div>
              </Descriptions.Item>

              {/* Địa điểm khóa học */}
              {selectedSchedule.course?.location && (
                <Descriptions.Item label={
                  <span className="flex items-center gap-2">
                    <EnvironmentOutlined className="text-orange-500" />
                    <strong>Địa điểm khóa học</strong>
                  </span>
                }>
                  <span className="text-gray-700">{selectedSchedule.course.location}</span>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </Space>
  )
}

export default TeacherSchedule


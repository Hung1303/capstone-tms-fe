import { useState, useEffect, useCallback } from 'react'
import { CalendarOutlined, ClockCircleOutlined, UserOutlined, BookOutlined, EnvironmentOutlined, TeamOutlined, FilterOutlined,
        ReloadOutlined } from '@ant-design/icons'
import api from '../../config/axios'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-toastify'
import { Select, Spin, Tag, Card } from 'antd'
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

const ParentSchedule = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [schedules, setSchedules] = useState([])
  const [calendarEvents, setCalendarEvents] = useState([])
  const [viewMode, setViewMode] = useState('calendar') // 'calendar' or 'list'
  const [selectedStudent, setSelectedStudent] = useState('all')
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [selectedDate, setSelectedDate] = useState(null)

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 5,
    total: 0,
  });

  const weekdays = [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA]

  // Cache cho courses
  const courseCache = {}

  const getCourse = async (courseId) => {
    if (!courseId) return null
    if (courseCache[courseId]) return courseCache[courseId]

    try {
      const response = await api.get(`/Course/${courseId}`)
      const data = response.data.data
      courseCache[courseId] = data
      return data
    } catch (error) {
      console.error('Error fetching course:', courseId, error)
      return null
    }
  }

  // Lấy danh sách học sinh của parent
  const fetchStudents = useCallback(async (pageNumber, pageSize) => {
    if (!user?.parentProfileId) {
      toast.error('Không tìm thấy thông tin phụ huynh')
      return
    }

    try {
      const response = await api.get(`/Users/${user.parentProfileId}/Students?pageNumber=${pageNumber}&pageSize=${pageSize}`)
      console.log("response fetchStudents:", response.data)
      setStudents(response.data.students)
      setPagination(prev => ({
        ...prev,
        total: response.data.totalCount
      }))
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Không thể tải danh sách học sinh')
      setStudents([])
    }
  }, [user.parentProfileId])

  // Lấy enrollments của các học sinh
  const fetchEnrollments = useCallback(async () => {
    if (!user?.parentProfileId || students.length === 0) {
      setEnrollments([])
      return
    }

    setLoading(true)
    try {
      // Lấy enrollments cho từng học sinh
      const allEnrollments = []
      
      for (const student of students) {
        console.log("student in fetchEnrollments:", student)
        try {
          let studentEnrollments = []
          
          try {
            const response = await api.get(`/Enrollments/Student/${student.profileId}/Enrollments?pageNumber=1&pageSize=100`)
            console.log("response in fetchEnrollments:", response.data)
            studentEnrollments = response.data.data
          } catch (error) {
            console.error("error response in fetchEnrollments:", error)
          }
          
          // Lấy thông tin course cho mỗi enrollment
          for (const enrollment of studentEnrollments) {
            const course = await getCourse(enrollment.courseId)
            allEnrollments.push({
              ...enrollment,
              studentName: student.fullName,
              course: course
            })
          }
        } catch (error) {
          console.error(`Error processing enrollments for student ${student.profileId}:`, error)
        }
      }

      // Chỉ lấy enrollments đã được chấp nhận (status = 1, 2, 'Accepted', 'Confirmed')
      const activeEnrollments = allEnrollments.filter(
        e => {
          const status = e.status
          return status === 1 || status === 2 || status === 'Accepted' || status === 'Confirmed' || status === 'Active'
        }
      )
      
      setEnrollments(activeEnrollments)
    } catch (error) {
      console.error('Error fetching enrollments:', error)
      toast.error('Không thể tải danh sách đăng ký khóa học. Vui lòng thử lại sau.')
      setEnrollments([])
    } finally {
      setLoading(false)
    }
  }, [students, user?.parentProfileId])

  console.log("enrollments:", enrollments)

  // Lấy lịch học cho các courses đã đăng ký
  const fetchSchedules = useCallback(async (page, pageSize) => {
    if (enrollments.length === 0) {
      setSchedules([])
      setCalendarEvents([])
      return
    }

    setLoading(true)
    try {
      const courseIds = [...new Set(enrollments.map(e => e.courseId).filter(Boolean))]
      const allSchedules = []

      for (const courseId of courseIds) {
        try {
          // Lấy schedules của course
          let courseSchedules = []
          
          try {
            const response = await api.get(`/ClassSchedule/Course/${courseId}?pageNumber=${page}&pageSize=${pageSize}`)
            console.log("response of courseSchedules:", response)
            courseSchedules = response.data.data
          } catch (error) {
            console.error(`Error fetching schedules for course ${courseId}:`, error)
          }
          
          // Tìm enrollment tương ứng
          const enrollment = enrollments.find(e => e.courseId === courseId)
          
          courseSchedules.forEach(schedule => {
            allSchedules.push({
              ...schedule,
              course: enrollment?.course,
              studentName: enrollment?.studentName,
              studentProfileId: enrollment?.studentProfileId,
              enrollment: enrollment
            })
          })
        } catch (error) {
          console.error(`Error processing schedules for course ${courseId}:`, error)
        }
      }

      setSchedules(allSchedules)

      // Chuyển đổi sang format cho FullCalendar
      const events = allSchedules.map(schedule => {
        const enrollment = schedule.enrollment
        const course = schedule.course || {}
        
        console.log("schedule:", schedule)

        // Tính duration từ startTime đến endTime
        const startDateTime = dayjs(`${schedule.startDate}T${schedule.startTime}`)
        const endDateTime = dayjs(`${schedule.startDate}T${schedule.endTime}`)
        const durationMinutes = endDateTime.diff(startDateTime, 'minute')

        return {
          id: schedule.id?.toString(),
          title: course.title,
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
            studentName: enrollment.studentName,
            teacherName: schedule.course.teacherName,
            room: schedule.roomOrLink,
            description: course.description,
            classDescription: schedule.classDescription
          }
        }
      })

      setCalendarEvents(events)
    } catch (error) {
      console.error('Error fetching schedules:', error)
      toast.error('Không thể tải lịch học')
      setSchedules([])
      setCalendarEvents([])
    } finally {
      setLoading(false)
    }
  }, [enrollments])

  // Màu sắc cho từng course
  const getCourseColor = (subject) => {
    const colors = {
      // "Physics", // blue
      "Physics": "#10b981", // green
      // 'Physics', // orange
      // '#ef4444', // red
      // '#8b5cf6', // purple
      // '#ec4899', // pink
      // '#06b6d4', // cyan
      // '#84cc16'  // lime
    }
    return colors[subject] || '#6b7280'
  }

  // Load dữ liệu
  useEffect(() => {
    fetchStudents(pagination.pageNumber, pagination.pageSize)
  }, [fetchStudents, pagination.pageNumber, pagination.pageSize])

  useEffect(() => {
    if (students.length > 0) {
      fetchEnrollments()
    }
  }, [students, fetchEnrollments])

  useEffect(() => {
    if (enrollments.length > 0) {
      fetchSchedules(1, 100)
    }
  }, [enrollments, fetchSchedules])

  // Filter schedules
  const filteredSchedules = schedules.filter(schedule => {
    const matchStudent = selectedStudent === 'all' || schedule.studentProfileId === selectedStudent
    const matchCourse = selectedCourse === 'all' || schedule.course.id === selectedCourse
    return matchStudent && matchCourse
  })

  // Filter calendar events
  const filteredCalendarEvents = calendarEvents.filter(event => {
    const schedule = event.extendedProps.schedule
    const matchStudent = selectedStudent === 'all' || schedule.studentProfileId === selectedStudent
    const matchCourse = selectedCourse === 'all' || schedule.course.id === selectedCourse
    return matchStudent && matchCourse
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
    setSelectedDate(clickInfo.event.start)
    // Có thể mở modal chi tiết ở đây
  }

  // Danh sách courses unique
  const uniqueCourses = enrollments
    .filter(e => e.course)
    .map(e => ({ id: e.courseId, title: e.course.title, course: e.course }))
    .filter((course, index, self) => 
      index === self.findIndex(c => c.id === course.id)
    )

  const renderEventContent = (eventInfo) => {
    console.log("Rendering event:", eventInfo)
    const { title, extendedProps } = eventInfo.event;
    const { room, schedule, studentName, teacherName } = extendedProps;

    return (
      <div className="fc-event-main-frame">
        <div className="fc-event-title-container">
          <div className="fc-event-title fc-sticky font-semibold">
            {title}
          </div>

          <div style={{ fontSize: "0.75rem", lineHeight: "1.5" }}>
            <div><strong>GV: </strong>{teacherName}</div>
            <div><strong>HS: </strong>{studentName}</div>
            <div><strong>{room}</strong></div>
            <div><strong>Giờ: </strong>{dayjs(schedule.startTime, "HH:mm:ss").format("HH:mm")} - {dayjs(schedule.endTime, "HH:mm:ss").format("HH:mm")}</div>
            {schedule.classDescription && (
              <div><strong>Mô tả: </strong>{schedule.classDescription}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lịch học</h1>
          <p className="text-gray-600 mt-2">Xem lịch học của các khóa học đã đăng ký</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchStudents()
              fetchEnrollments()
              fetchSchedules(1, 100)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ReloadOutlined />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FilterOutlined className="text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filter by Student */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UserOutlined className="mr-2" />
              Chọn học sinh
            </label>
            <Select
              value={selectedStudent}
              onChange={setSelectedStudent}
              className="w-full"
              placeholder="Tất cả học sinh"
            >
              <Option value="all">Tất cả học sinh</Option>
              {students.map(student => (
                <Option key={student.profileId} value={student.profileId}>
                  {student.fullName} {student.gradeLevel ? `- Lớp ${student.gradeLevel}` : ''}
                </Option>
              ))}
            </Select>
          </div>

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
                <Option key={course.id} value={course.id}>
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
      {loading && enrollments.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      ) : enrollments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <CalendarOutlined className="text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có lịch học</h3>
          <p className="text-gray-600 mb-4">
            Bạn chưa đăng ký khóa học nào hoặc chưa có lịch học được sắp xếp.
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có lịch học</h3>
              <p className="text-gray-600">
                Không tìm thấy lịch học phù hợp với bộ lọc đã chọn.
              </p>
            </div>
          ) : (
            filteredSchedules.map((schedule, index) => {
              const course = schedule.course || {}
              const enrollment = schedule.enrollment || {}
              
              return (
                <Card
                  key={schedule.id || index}
                  className="hover:shadow-md transition-shadow"
                  style={{ borderLeft: `4px solid ${getCourseColor(course.subject)}` }}
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
                            <span className="flex items-center gap-1">
                              <UserOutlined />
                              {enrollment.studentName || 'Học sinh'}
                            </span>
                            {schedule.teacherName || course.teacherName ? (
                              <span className="flex items-center gap-1">
                                <TeamOutlined />
                                {schedule.teacherName || course.teacherName}
                              </span>
                            ) : null}
                            {schedule.room ? (
                              <span className="flex items-center gap-1">
                                <EnvironmentOutlined />
                                {schedule.room}
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
                          </div>
                          {schedule.description || course.description ? (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {schedule.description || course.description}
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
      {enrollments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">{enrollments.length}</div>
            <div className="text-sm text-gray-600 mt-1">Khóa học đã đăng ký</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">{filteredSchedules.length}</div>
            <div className="text-sm text-gray-600 mt-1">Buổi học trong tuần</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-purple-600">{students.length}</div>
            <div className="text-sm text-gray-600 mt-1">Học sinh</div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ParentSchedule


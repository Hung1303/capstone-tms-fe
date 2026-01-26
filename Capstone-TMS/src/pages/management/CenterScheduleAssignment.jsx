import { useState, useEffect, useRef, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import rrulePlugin from '@fullcalendar/rrule'
import { RRule } from 'rrule'
import { Modal, Form, Select, Input, Button, message, Card, Space, Tag, Popconfirm, DatePicker, Typography } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, BookOutlined, ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { useAuth } from '../../contexts/AuthContext'
import api from '../../config/axios'
import { toast } from 'react-toastify'

const { Option } = Select
const { TextArea } = Input
const { Title, Text } = Typography

const CenterScheduleAssignment = () => {
  const [events, setEvents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [courses, setCourses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [form] = Form.useForm()
  const calendarRef = useRef(null)
  const { user, loading } = useAuth()
  const weekdays = [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA]

  const fetchAllTeacherOfCenter = async (centerId) => {
    let page = 1
    const pageSize = 20
    let allTeachers = []
    let total = 0

    while (true) {
      const apiResponse = await api.get(`/Users/${centerId}/Teachers?pageNumber=${page}&pageSize=${pageSize}`)
      console.log(apiResponse.data);
      allTeachers = [...allTeachers, ...apiResponse.data.teachers]
      total = apiResponse.data.totalCount

      if (allTeachers.length >= total) {
        break
      }
      page++
    }
    setTeachers(allTeachers)
  }

  const fetchAllCourse = async (searchTerm, TeacherProfileId, CenterProfileId, page, pageSize) => {
    const params = new URLSearchParams();

    if (searchTerm) params.append("searchTerm", searchTerm);
    if (TeacherProfileId) params.append("TeacherProfileId", TeacherProfileId);
    if (CenterProfileId) params.append("CenterProfileId", CenterProfileId);

    params.append("pageNumber", page);
    params.append("pageSize", pageSize);

    const apiResponse = await api.get(`/Course?${params.toString()}`)

    console.log("fetchAllCourse", apiResponse.data);
    setCourses(apiResponse.data.data)
  }

  const fetchSubjects = async (page, pageSize) => {
    try {
      const response = await api.get(`/Subject?pageNumber=${page}&pageSize=${pageSize}`)
      console.log("response fetchSubjects:", response.data)
      setSubjects(response.data.data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
      setSubjects([])
    }
  }

  const fetchAllScheduledClass = useCallback(async (page, pageSize) => {
    // Kiểm tra nếu courses chưa được tải
    if (!courses || courses.length === 0) {
      setEvents([])
      return
    }

    try {
      setIsLoading(true)

      const fetchSchedulesForCourse = async (courseId) => {
        if (!courseId) return []

        const courseSchedules = []
        let pageNum = 1
        let hasMore = true
        let courseEventsCount = 0
        let totalCountForCourse = 0

        while (hasMore) {
          try {
            const response = await api.get(`/ClassSchedule/Course/${courseId}?pageNumber=${pageNum}&pageSize=${pageSize}`)
            
            if (response.data && response.data.data) {
              const schedules = response.data.data
              courseSchedules.push(...schedules)
              courseEventsCount += schedules.length

              // Lấy totalCount từ response đầu tiên
              if (pageNum === 1) {
                totalCountForCourse = response.data.totalCount || 0
              }

              // Kiểm tra xem còn trang nào không
              if (schedules.length < pageSize || (totalCountForCourse > 0 && courseEventsCount >= totalCountForCourse)) {
                hasMore = false
              } else {
                pageNum++
              }
            } else {
              hasMore = false
            }
          } catch (error) {
            console.error(`Error fetching schedules for course ${courseId} at page ${pageNum}:`, error)
            hasMore = false
          }
        }

        return courseSchedules
      }

      // Lọc và tạo mảng các promises để fetch schedules cho tất cả courses song song
      const validCourses = courses.filter(course => course.id)
      const coursePromises = validCourses.map(course => fetchSchedulesForCourse(course.id))

      // Dùng Promise.all để fetch tất cả courses song song
      const results = await Promise.all(coursePromises)

      // Gộp tất cả schedules từ các courses
      const allEvents = results.flatMap(schedules => schedules)

      console.log("All scheduled events:", allEvents)
      setEvents(allEvents)
    } catch (error) {
      console.error('Error fetching scheduled classes:', error)
      toast.error('Không thể tải lịch học, vui lòng thử lại')
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }, [courses])

  useEffect(() => {
    fetchAllTeacherOfCenter(user.centerProfileId);
  }, [user.centerProfileId]);

  useEffect(() => {
    fetchAllCourse("", "", user.centerProfileId, 1, 20);
  }, [user.centerProfileId]);

  useEffect(() => {
    fetchSubjects(1, 50)
  }, [])

  useEffect(() => {
    if (courses && courses.length > 0) {
      fetchAllScheduledClass(1, 50);
    }
  }, [courses, fetchAllScheduledClass])

  // Xử lý khi click vào một khoảng thời gian trên calendar
  const handleDateSelect = (selectInfo) => {
    setEditingEvent(null)
    form.resetFields()
    form.setFieldsValue({
      start: dayjs(selectInfo.start),
      end: dayjs(selectInfo.end)
    })
    setIsModalOpen(true)
  }

  // Xử lý khi click vào một event đã có
  const handleEventClick = (clickInfo) => {
    const { event } = clickInfo
    const { extendedProps } = event
    const { description, endTime, room, startTime, teacherProfileId, className } = extendedProps

    setEditingEvent(extendedProps)

    let foundCourseId = ""
    if (teacherProfileId && className) {
      const matchedCourse = courses.find(c => (c.title === className && c.teacherProfileId === teacherProfileId) || c.title?.includes(className))
      foundCourseId = matchedCourse?.id
    }

    const clickedDate = dayjs(event.start)

    // Tạo dayjs với thời gian từ extendedProps
    const parseTime = (time) => {
      const [h, m] = time.split(':')
      return { hour: parseInt(h), minute: parseInt(m) }
    }

    form.setFieldsValue({
      teacherProfileId: teacherProfileId,
      courseId: foundCourseId,
      room: room,
      description: description,
      start: clickedDate.hour(parseTime(startTime).hour).minute(parseTime(startTime).minute),
      end: clickedDate.hour(parseTime(endTime).hour).minute(parseTime(endTime).minute)
    })
    setIsModalOpen(true)
  }

  // Xử lý khi kéo thả event
  const handleEventDrop = async (dropInfo) => {
    const originalEventId = dropInfo.event.extendedProps?.originalEventId
    const newDate = dayjs(dropInfo.event.start)
    const newDayOfWeek = newDate.day()
    const startTime = newDate.format('HH:mm')
    const endTime = dayjs(dropInfo.event.end).format('HH:mm')

    try {
      // Tìm event gốc
      const originalEvent = events.find(e => e.id === originalEventId || e.id?.toString() === originalEventId)
      if (originalEvent) {
        // Cập nhật dayOfWeek, startTime, endTime cho toàn bộ lịch học
        const payload = {
          ...originalEvent,
          dayOfWeek: newDayOfWeek,
          startTime: startTime,
          endTime: endTime
        }
        await api.put(`/ClassSchedule/${originalEventId}`, payload)
        toast.success('Đã cập nhật thời gian lịch dạy')
        // Refresh lại danh sách events từ API
        await fetchAllScheduledClass(1, 50)
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật lịch dạy:', error)
      toast.error('Không thể cập nhật lịch dạy, vui lòng thử lại')
      // Revert lại vị trí cũ
      dropInfo.revert()
    }

  }

  // Xử lý khi resize event
  const handleEventResize = async (resizeInfo) => {
    const originalEventId = resizeInfo.event.extendedProps?.originalEventId
    const startTime = dayjs(resizeInfo.event.start).format('HH:mm')
    const endTime = dayjs(resizeInfo.event.end).format('HH:mm')

    try {
      // Tìm event gốc
      const originalEvent = events.find(e => e.id === originalEventId || e.id?.toString() === originalEventId)
      if (originalEvent) {
        // Cập nhật startTime và endTime cho toàn bộ lịch học
        const payload = {
          ...originalEvent,
          startTime: startTime,
          endTime: endTime
        }
        await api.put(`/ClassSchedule/${originalEventId}`, payload)
        toast.success('Đã cập nhật thời gian lịch dạy')
        // Refresh lại danh sách events từ API
        await fetchAllScheduledClass(1, 50)
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật lịch dạy:', error)
      toast.error('Không thể cập nhật lịch dạy, vui lòng thử lại')
      // Revert lại kích thước cũ
      resizeInfo.revert()
    }
  }

  // Xử lý submit form
  const handleSubmit = async () => {

    setIsLoading(true)

    try {
      const values = await form.validateFields()
      console.log('Form values:', values)
      console.log('Teachers:', teachers)
      console.log('Courses:', courses)
      console.log('Subjects:', subjects)

      const selectedTeacher = teachers.find(t => t.profileId === values.teacherProfileId)
      const selectedCourse = courses.find(c => c.id === values.courseId)
      const selectedSubject = subjects.find(s => s.subjectName === selectedCourse.subject)

      console.log('Selected Teacher:', selectedTeacher)
      console.log('Selected Course:', selectedCourse)
      console.log('Selected Subject:', selectedSubject)

      if (!selectedTeacher || !selectedCourse) {
        message.error('Không tìm thấy thông tin giáo viên hoặc khóa học')
        return
      }

      const start = values.start
      const end = values.end

      // Khi cập nhật, giữ nguyên startDate và endDate từ event gốc nếu có
      // Khi tạo mới, lấy từ selectedCourse
      const startDate = editingEvent?.startDate || selectedCourse.startDate
      const endDate = editingEvent?.endDate || selectedCourse.endDate

      const payload = {
        className: selectedCourse.title,
        classDescription: values.description || '',
        dayOfWeek: start.day(),
        startTime: start.format('HH:mm'),
        endTime: end.format('HH:mm'),
        startDate: startDate,
        endDate: endDate,
        teacherProfileId: values.teacherProfileId,
        roomOrLink: values.room
      }

      console.log('Payload to be sent to API:', payload)

      if (editingEvent && editingEvent.originalEventId) {
        await api.put(`/ClassSchedule/${editingEvent.originalEventId}`, payload)
        toast.success('Đã cập nhật lịch phân công')
      } else {
        const resPost = await api.post("/ClassSchedule", payload)
        console.log("response api resPost:", resPost)

        const classShedule = resPost.data.data

        if (resPost.status === 200) {
          const payload = {
            courseId: selectedCourse.id,
            classScheduleId: classShedule.id,
            subjectId: selectedSubject.subjectId,
            status: "string"
          }
          console.log("payload for post/subject:", payload)

          try {
            const resPostSubject = await api.post("../Subject", payload)
            console.log("resPostSubject:", resPostSubject)
          } catch (error) {
            console.error("error of resPostSubject:", error)
          }
        }
        toast.success('Đã tạo lịch phân công mới')
      }

      await fetchAllScheduledClass(1, 50)

      setIsModalOpen(false)
      form.resetFields()
      setEditingEvent(null)
    } catch (error) {
      console.error('Lỗi khi tạo/cập nhật lịch phân công:', error)
      message.error('Không thể lưu lịch phân công, vui lòng thử lại')
    } finally {
      setIsLoading(false)
    }
  }

  // Xử lý xóa event
  const handleDelete = async () => {
    if (editingEvent) {
      try {
        await api.delete(`/ClassSchedule/${editingEvent.originalEventId}`)
        toast.success('Đã xóa lịch phân công')

        await fetchAllScheduledClass(1, 50)
        setIsModalOpen(false)
        form.resetFields()
        setEditingEvent(null)
      } catch (error) {
        console.error('Lỗi khi xóa lịch phân công:', error)
        toast.error('Không thể xóa lịch phân công, vui lòng thử lại')
      }
    }
  }

  // Đóng modal
  const handleCancel = () => {
    setIsModalOpen(false)
    form.resetFields()
    setEditingEvent(null)
  }

  const getEventColor = (subject) => {
    // const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
    const colors = {
      'Toán Học': '#3b82f6',
      'Văn Học': '#10b981',
      'Tiếng Anh': '#f59e0b',
      'Vật Lý': '#ef4444',
    }
    return colors[subject] || '#6b7280'
  }

  console.log("Events:", events);
  // Format events cho FullCalendar sử dụng RRULE
  const calendarEvents = events
    .filter(event => event.startDate && event.endDate && event.dayOfWeek !== undefined && event.startTime && event.endTime)
    .map(event => {
      const { dayOfWeek, startDate, endDate, startTime, endTime, className, classDescription, roomOrLink, teacherProfileId, id } = event
      const teacher = teachers.find(t => t.profileId === teacherProfileId)

      // Tính duration từ startTime đến endTime
      const startDateTime = dayjs(`${startDate}T${startTime}`)
      const endDateTime = dayjs(`${startDate}T${endTime}`)
      const durationMinutes = endDateTime.diff(startDateTime, 'minute')

      return {
        id: id,
        title: className,
        rrule: {
          freq: 'weekly',
          byweekday: [weekdays[dayOfWeek]],
          dtstart: `${startDate}T${startTime}`,
          until: `${endDate}T${endTime}`
        },
        duration: { minutes: durationMinutes },
        backgroundColor: getEventColor(teacher && teacher.subject),
        borderColor: getEventColor(teacher && teacher.subject),
        extendedProps: {
          originalEventId: id,
          description: classDescription,
          room: roomOrLink,
          teacherProfileId,
          className,
          dayOfWeek,
          startTime,
          endTime,
          startDate,
          endDate
        }
      }
    })

  // Render event content
  const renderEventContent = (eventInfo) => {
    console.log("Rendering event:", eventInfo)
    const { title, extendedProps } = eventInfo.event;
    const { room, description, startTime, endTime } = extendedProps;

    return (
      <div className="fc-event-main-frame">
        <div className="fc-event-title-container">
          <div className="fc-event-title fc-sticky font-semibold">
            {title}
          </div>

          <div style={{ fontSize: "0.75rem", lineHeight: "1.1" }}>
            <div><strong>{room}</strong></div>
            <div><strong>Giờ:</strong> {dayjs(startTime, "HH:mm:ss").format("HH:mm")} - {dayjs(endTime, "HH:mm:ss").format("HH:mm")}</div>
            {description && (
              <div><strong>Mô tả:</strong> {description}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const getUniqueSubjects = () => {
    const subjects = new Set()
    teachers.forEach(teacher => {
      if (teacher.subject) {
        subjects.add(teacher.subject)
      }
    })
    return Array.from(subjects).sort()
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* Header */}
          <Card className="!bg-gradient-to-br !from-[#e58231] !to-[#eb7a34] !rounded-xl shadow-xl">
            <Title level={2} className="!text-white !m-0 !font-bold">
              <CalendarOutlined /> Phân công lịch giảng dạy
            </Title>
            <Text className="!text-white/90 !text-base">
              Quản lý và phân công thời gian giảng dạy cho giáo viên.
            </Text>
          </Card>

          <Card className="shadow-sm">
            <div className="mb-4 flex justify-between items-center">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setEditingEvent(null)
                  form.resetFields()
                  setIsModalOpen(true)
                }}
                className="px-4 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors cursor-pointer"
              >
                <PlusOutlined className="mr-2" />
                Tạo lịch mới
              </motion.button>

              <div className="flex gap-2">
                {getUniqueSubjects().map(subject => (
                  <Tag key={subject} color={getEventColor(subject)}>
                    <BookOutlined /> {subject}
                  </Tag>
                ))}
              </div>
            </div>

            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
              events={calendarEvents}
              eventContent={renderEventContent}
              locale="vi"
              height="auto"
              slotMinTime="07:00:00"
              slotMaxTime="22:00:00"
              allDaySlot={false}
              slotDuration="00:30:00"
              slotLabelInterval="01:00:00"
            />
          </Card>

          {/* Modal tạo/sửa lịch */}
          <Modal
            title={
              <div className="flex items-center gap-2">
                {editingEvent ? (
                  <>
                    <EditOutlined />
                    <span>Chỉnh sửa lịch phân công</span>
                  </>
                ) : (
                  <>
                    <PlusOutlined />
                    <span>Tạo lịch phân công mới</span>
                  </>
                )}
              </div>
            }
            open={isModalOpen}
            onCancel={handleCancel}
            footer={[
              editingEvent && (
                <Popconfirm
                  key="delete"
                  title="Bạn có chắc chắn muốn xóa lịch này?"
                  onConfirm={handleDelete}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Xóa
                  </Button>
                </Popconfirm>
              ),
              <Button key="cancel" onClick={handleCancel}>
                Hủy
              </Button>,
              <Button key="submit" type="primary" onClick={handleSubmit} loading={isLoading}>
                {editingEvent ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            ]}
            width={600}
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                start: dayjs().hour(8).minute(0),
                end: dayjs().hour(10).minute(0)
              }}
            >
              <Form.Item
                label={
                  <span>
                    <BookOutlined className="mr-2" />
                    Khóa học
                  </span>
                }
                name="courseId"
                rules={[{ required: true, message: 'Vui lòng chọn khóa học' }]}
              >
                <Select
                  placeholder="Chọn khóa học"
                  onChange={(value) => {
                    const selectedCourse = courses.find(c => c.id === value)
                    if (selectedCourse) {
                      form.setFieldsValue({
                        teacherProfileId: selectedCourse.teacherProfileId
                      })
                    }
                  }}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >

                  {courses.map(course => (
                    <Option key={course.id} value={course.id}>
                      {course.title} -|- {course.subject} ({course.gradeLevel}) -|- {course.teacherName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.courseId !== currentValues.courseId}
              >
                {({ getFieldValue }) => {
                  const courseId = getFieldValue('courseId')
                  const selectedCourse = courses.find(c => c.id === courseId)
                  const teacherProfileId = getFieldValue('teacherProfileId')

                  // Tìm giáo viên từ danh sách teachers dựa trên teacherProfileId
                  const selectedTeacher = teachers.find(t => t.profileId === teacherProfileId)

                  return (
                    <Form.Item
                      label={
                        <span>
                          <UserOutlined className="mr-2" />
                          Giáo viên
                        </span>
                      }
                      name="teacherProfileId"
                      rules={[{ required: true, message: 'Vui lòng chọn giáo viên' }]}
                    >
                      <Select
                        placeholder="Chọn giáo viên"
                        disabled={!selectedCourse}
                        value={teacherProfileId}
                      >
                        {selectedTeacher && (
                          <Option key={selectedTeacher.profileId} value={selectedTeacher.profileId}>
                            {selectedTeacher.fullName} {selectedTeacher.subject ? `(${selectedTeacher.subject})` : ''}
                          </Option>
                        )}
                      </Select>
                    </Form.Item>
                  )
                }}
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.courseId !== currentValues.courseId}
              >
                {({ getFieldValue }) => {
                  const courseId = getFieldValue('courseId')
                  const selectedCourse = courses.find(c => c.id === courseId)

                  // Lấy phạm vi ngày từ khóa học đã chọn hoặc từ event đang chỉnh sửa
                  let minDate = null
                  let maxDate = null

                  if (editingEvent && editingEvent.startDate && editingEvent.endDate) {
                    minDate = dayjs(editingEvent.startDate)
                    maxDate = dayjs(editingEvent.endDate)
                  } else if (selectedCourse && selectedCourse.startDate && selectedCourse.endDate) {
                    minDate = dayjs(selectedCourse.startDate)
                    maxDate = dayjs(selectedCourse.endDate)
                  }

                  const disabledStartDate = (current) => {
                    if (!minDate || !maxDate) return false
                    return current && (current.isBefore(minDate, 'day') || current.isAfter(maxDate, 'day'))
                  }

                  const disabledEndDate = (current) => {
                    if (!minDate || !maxDate) return false
                    return current && (current.isBefore(minDate, 'day') || current.isAfter(maxDate, 'day'))
                  }

                  return (
                    <>
                      <Form.Item
                        label={
                          <span>
                            <ClockCircleOutlined className="mr-2" />
                            Thời gian bắt đầu
                          </span>
                        }
                        name="start"
                        rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu' }]}
                      >
                        <DatePicker
                          showTime
                          format="DD/MM/YYYY HH:mm"
                          className="w-full"
                          placeholder="Chọn ngày và giờ bắt đầu"
                          disabledDate={disabledStartDate}
                        />
                      </Form.Item>

                      <Form.Item
                        label={
                          <span>
                            <ClockCircleOutlined className="mr-2" />
                            Thời gian kết thúc
                          </span>
                        }
                        name="end"
                        rules={[
                          { required: true, message: 'Vui lòng chọn thời gian kết thúc' },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || !getFieldValue('start')) {
                                return Promise.resolve()
                              }
                              if (value.isBefore(getFieldValue('start'))) {
                                return Promise.reject(new Error('Thời gian kết thúc phải sau thời gian bắt đầu'))
                              }
                              return Promise.resolve()
                            }
                          })
                        ]}
                      >
                        <DatePicker
                          showTime
                          format="DD/MM/YYYY HH:mm"
                          className="w-full"
                          placeholder="Chọn ngày và giờ kết thúc"
                          disabledDate={disabledEndDate}
                        />
                      </Form.Item>
                    </>
                  )
                }}
              </Form.Item>

              <Form.Item
                label="Phòng học"
                name="room"
                rules={[{ required: true, message: 'Vui lòng nhập phòng học' }]}
              >
                <Input
                  placeholder="Ví dụ: Phòng 101"
                  onBlur={(e) => {
                    let value = e.target.value.trim();

                    if (!value) return;

                    value = value.replace(/^phòng\s*/i, "");
                    value = `Phòng ${value}`;

                    // set lại vào form
                    form.setFieldsValue({ room: value });
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Ghi chú"
                name="description"
              >
                <TextArea
                  rows={3}
                  placeholder="Nhập ghi chú (nếu có)"
                />
              </Form.Item>
            </Form>
          </Modal>
        </>
      )}
    </Space>
  )
}

export default CenterScheduleAssignment



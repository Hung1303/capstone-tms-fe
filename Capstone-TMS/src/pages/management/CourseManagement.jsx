import { useState, useEffect } from 'react'
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  FileSyncOutlined,
  ClockCircleOutlined,
  SendOutlined,
  GlobalOutlined // [MỚI] Icon cho nút Public
} from '@ant-design/icons'
import { toast } from 'react-toastify'
import api from '../../config/axios'
import { useAuth } from '../../contexts/AuthContext'
import * as teacherService from '../../services/teacherService'

const CourseManagement = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  // Delete states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  
  // Request Approval states
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestCourseId, setRequestCourseId] = useState(null)
  const [requestNote, setRequestNote] = useState('')

  // [MỚI] Publish states (Công khai khóa học)
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [publishId, setPublishId] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    location: '',
    semester: 1,
    startDate: '',
    endDate: '',
    teachingMethod: 1,
    tuitionFee: 0,
    capacity: 30,
    gradeLevel: 10,
    teacherProfileId: null 
  })
  const [errors, setErrors] = useState({})

  // Lấy centerId chuẩn
  const centerId = user?.centerProfileId || user?.userId

  useEffect(() => {
    fetchCourses()
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (centerId) {
      fetchTeachers()
    }
  }, [centerId])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const response = await api.get('/Course')
      const courseList = response?.data?.data || response?.data || []
      setCourses(Array.isArray(courseList) ? courseList : [])
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Lỗi khi tải danh sách khóa học')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/Subject?pageNumber=1&pageSize=1000')
      const subjectList = response?.data?.data || response?.data || []
      setSubjects(Array.isArray(subjectList) ? subjectList : [])
    } catch (error) {
      console.error('Error fetching subjects:', error)
      setSubjects([])
    }
  }

  const fetchTeachers = async () => {
    if (!centerId) return
    try {
      const response = await teacherService.getTeachersByCenter(centerId, 1, 100)
      const teacherList = response.teachers || []
      setTeachers(Array.isArray(teacherList) ? teacherList : [])
    } catch (error) {
      console.error('Error fetching teachers:', error)
    }
  }

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const validateForm = () => {
    const newErrors = {}
    const today = getTodayDate()

    if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập tên khóa học'
    if (!formData.subject.trim()) newErrors.subject = 'Vui lòng chọn môn học'
    if (!formData.description.trim()) newErrors.description = 'Vui lòng nhập mô tả'
    if (!formData.location.trim()) newErrors.location = 'Vui lòng nhập địa điểm'

    if (!formData.startDate) {
      newErrors.startDate = 'Vui lòng chọn ngày bắt đầu'
    } else if (formData.startDate < today) {
      newErrors.startDate = 'Ngày bắt đầu phải từ hôm nay trở đi'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Vui lòng chọn ngày kết thúc'
    } else if (formData.endDate <= formData.startDate) {
      newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu'
    }

    if (formData.tuitionFee < 0) newErrors.tuitionFee = 'Học phí không được âm'
    if (formData.capacity < 1) newErrors.capacity = 'Sức chứa phải ≥ 1'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // --- Handlers cho Modal Tạo/Sửa ---
  const handleOpenModal = (course = null) => {
    if (course) {
      setEditingId(course.id)
      setFormData({
        title: course.title || '',
        subject: course.subject || '',
        description: course.description || '',
        location: course.location || '',
        semester: course.semester || 1,
        startDate: course.startDate ? course.startDate.split('T')[0] : '',
        endDate: course.endDate ? course.endDate.split('T')[0] : '',
        teachingMethod: course.teachingMethod || 1,
        tuitionFee: course.tuitionFee || 0,
        capacity: course.capacity || 30,
        gradeLevel: course.gradeLevel || 10,
        teacherProfileId: course.teacherProfileId || null 
      })
    } else {
      setEditingId(null)
      setFormData({
        title: '',
        subject: '',
        description: '',
        location: '',
        semester: 1,
        startDate: '',
        endDate: '',
        teachingMethod: 1,
        tuitionFee: 0,
        capacity: 30,
        gradeLevel: 10,
        teacherProfileId: null
      })
    }
    setErrors({})
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
    setErrors({})
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: ['tuitionFee', 'capacity', 'semester', 'gradeLevel', 'teachingMethod'].includes(name)
        ? parseInt(value) || 0
        : value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      const payload = {
        ...formData,
        centerProfileId: centerId,
        teacherProfileId: formData.teacherProfileId || null 
      }
      
      if (editingId) {
        await api.put(`/Course/${editingId}`, payload)
        toast.success('Cập nhật khóa học thành công!')
      } else {
        await api.post('/Course', payload)
        toast.success('Tạo bản nháp thành công! Vui lòng gửi duyệt.')
      }
      await fetchCourses()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving course:', error)
      toast.error(error.response?.data?.message || 'Lỗi khi lưu khóa học')
    } finally {
      setLoading(false)
    }
  }

  // --- Handlers cho Xóa ---
  const handleDeleteClick = (id) => {
    setDeleteId(id)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    setLoading(true)
    try {
      await api.delete(`/Course/${deleteId}`)
      await fetchCourses()
      setShowDeleteConfirm(false)
      setDeleteId(null)
      toast.success('Xóa khóa học thành công!')
    } catch (error) {
      console.error('Error deleting course:', error)
      toast.error('Lỗi khi xóa khóa học')
    } finally {
      setLoading(false)
    }
  }

  // --- Handlers cho Gửi Duyệt ---
  const handleRequestApprovalClick = (courseId) => {
    setRequestCourseId(courseId)
    setRequestNote('')
    setShowRequestModal(true)
  }

  const handleConfirmRequest = async () => {
    if (!requestCourseId) return

    setLoading(true)
    try {
      const url = `/ApprovalRequests/Course/${requestCourseId}?requestedByUserId=${user.userId}`
      await api.post(url, JSON.stringify(requestNote), {
        headers: { 'Content-Type': 'application/json' }
      })
      toast.success('Đã gửi yêu cầu duyệt thành công!')
      await fetchCourses()
      setShowRequestModal(false)
      setRequestCourseId(null)
    } catch (error) {
      console.error('Error requesting approval:', error)
      toast.error(error.response?.data?.message || 'Lỗi khi gửi yêu cầu duyệt')
    } finally {
      setLoading(false)
    }
  }

  // --- [MỚI] Handlers cho Publish (Công khai) ---
  const handlePublishClick = (id) => {
    setPublishId(id)
    setShowPublishConfirm(true)
  }

  const handleConfirmPublish = async () => {
    if (!publishId || !centerId) return

    setLoading(true)
    try {
      // API: PUT /api/Course/Publish/{courseId}?centerProfileId={centerProfileId}
      await api.put(`/Course/Publish/${publishId}?centerProfileId=${centerId}`)
      
      toast.success('Khóa học đã được công khai thành công!')
      await fetchCourses() // Load lại data để cập nhật trạng thái
      setShowPublishConfirm(false)
      setPublishId(null)
    } catch (error) {
      console.error('Error publishing course:', error)
      toast.error(error.response?.data?.message || 'Lỗi khi công khai khóa học')
    } finally {
      setLoading(false)
    }
  }

  // --- Helpers ---
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'Draft' && (course.status === 0 || course.status === 'Draft')) ||
                          (filterStatus === 'PendingApproval' && (course.status === 1 || course.status === 'PendingApproval')) ||
                          (filterStatus === 'Approved' && (course.status === 2 || course.status === 'Approved')) ||
                          (filterStatus === 'Rejected' && (course.status === 3 || course.status === 'Rejected')) ||
                          (filterStatus === 'Suspended' && (course.status === 4 || course.status === 'Suspended')) ||
                          (filterStatus === 'Archived' && (course.status === 5 || course.status === 'Archived'))

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const statusConfig = {
      Draft: { label: 'Bản nháp', className: 'bg-gray-100 text-gray-600', icon: <EditOutlined /> },
      PendingApproval: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800', icon: <ClockCircleOutlined /> },
      Approved: { label: 'Đã duyệt', className: 'bg-green-100 text-green-800', icon: <CheckCircleOutlined /> },
      Rejected: { label: 'Bị từ chối', className: 'bg-red-100 text-red-800', icon: <CloseOutlined /> },
      Suspended: { label: 'Tạm ngưng', className: 'bg-orange-100 text-orange-800', icon: <StopOutlined /> },
      Archived: { label: 'Lưu trữ', className: 'bg-gray-200 text-gray-800', icon: <FileSyncOutlined /> }
    }

    const statusMap = {
        0: 'Draft',
        1: 'PendingApproval',
        2: 'Approved',
        3: 'Rejected',
        4: 'Suspended',
        5: 'Archived'
    }
    
    const statusKey = typeof status === 'number' ? statusMap[status] : status
    const config = statusConfig[statusKey] || { label: 'Không xác định', className: 'bg-gray-100 text-gray-800' }

    return (
      <span className={`flex items-center gap-1 w-fit px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    )
  }

  // Điều kiện hiển thị nút Sửa/Xóa/Gửi duyệt
  const canModify = (status) => {
      if (status === 'Draft' || status === 0) return true
      if (status === 'Rejected' || status === 3) return true
      return false
  }

  // Điều kiện hiển thị nút Publish
  // Thường chỉ khóa học "Đã duyệt" (Approved - 2) mới được phép public
  const canPublish = (status) => {
    return status === 'Approved' || status === 2
  }

  const teachingMethods = [
    { value: 1, label: 'Trực tiếp' },
    { value: 2, label: 'Trực tuyến' },
    { value: 3, label: 'Kết hợp' }
  ]

  const gradeLevels = Array.from({ length: 13 }, (_, i) => ({
    value: i + 1,
    label: `Lớp ${i + 1}`
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý khóa học</h2>
          <p className="text-gray-600">Quản lý các khóa học trong hệ thống</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <PlusOutlined />
          <span>Tạo khóa học</span>
        </button>
      </div>

       {/* Stats */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{courses.length}</div>
          <div className="text-sm text-gray-600">Tổng khóa học</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {courses.filter(c => c.status === 'PendingApproval' || c.status === 1).length}
          </div>
          <div className="text-sm text-gray-600">Chờ duyệt</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {courses.filter(c => c.status === 'Approved' || c.status === 2).length}
          </div>
          <div className="text-sm text-gray-600">Đã duyệt</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">
            {courses.filter(c => c.status === 'Rejected' || c.status === 3).length}
          </div>
          <div className="text-sm text-gray-600">Bị từ chối</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc môn học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Draft">Bản nháp</option>
            <option value="PendingApproval">Chờ duyệt</option>
            <option value="Approved">Đã duyệt</option>
            <option value="Rejected">Bị từ chối</option>
            <option value="Suspended">Tạm ngưng</option>
            <option value="Archived">Lưu trữ</option>
          </select>
        </div>
      </div>

      {/* Courses table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên khóa học</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Môn học</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Học phí</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{course.title}</div>
                      {course.teacherProfileId ? (
                          <div className="text-xs text-blue-600 mt-1">GV: {course.teacherName || 'Đã phân công'}</div>
                      ) : (
                          <div className="text-xs text-gray-400 mt-1 italic">Chưa có GV</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{course.subject}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {course.startDate ? course.startDate.split('T')[0] : ''} - {course.endDate ? course.endDate.split('T')[0] : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {course.tuitionFee?.toLocaleString('vi-VN')}đ
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(course.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        
                        {/* [MỚI] Nút Publish - Chỉ hiện khi khóa học Đã duyệt (Status 2) */}
                        {canPublish(course.status) && (
                           <button 
                             onClick={() => handlePublishClick(course.id)}
                             className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                             title="Công khai khóa học"
                           >
                             <GlobalOutlined />
                           </button>
                        )}

                        {/* Các nút Draft/Sửa/Xóa - Chỉ hiện khi Draft hoặc Rejected */}
                        {canModify(course.status) ? (
                          <>
                            <button 
                              onClick={() => handleRequestApprovalClick(course.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Gửi duyệt"
                            >
                              <SendOutlined />
                            </button>
                            <button 
                              onClick={() => handleOpenModal(course)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Chỉnh sửa"
                            >
                              <EditOutlined />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(course.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Xóa"
                            >
                              <DeleteOutlined />
                            </button>
                          </>
                        ) : !canPublish(course.status) && (
                           // Nếu không phải Draft/Rejected VÀ cũng không phải Approved (để hiện nút Publish)
                           <span className="text-gray-400 text-xs italic">Đã khóa</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Không có khóa học nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form: Tạo/Sửa */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <CloseOutlined className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên khóa học *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Nhập tên khóa học" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Môn học *</label>
                  <select name="subject" value={formData.subject} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">-- Chọn môn học --</option>
                    {subjects.map(subject => (<option key={subject.id} value={subject.subjectName}>{subject.subjectName}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giáo viên phụ trách</label>
                <select name="teacherProfileId" value={formData.teacherProfileId || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">-- Chưa chỉ định --</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.profileId}>{teacher.fullName} {teacher.subject ? `(- ${teacher.subject})` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm *</label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kỳ học *</label>
                  <select name="semester" value={formData.semester} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value={1}>Kỳ 1</option><option value={2}>Kỳ 2</option><option value={3}>Kỳ hè</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu *</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} min={getTodayDate()} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc *</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} min={formData.startDate} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phương pháp *</label>
                  <select name="teachingMethod" value={formData.teachingMethod} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    {teachingMethods.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lớp học *</label>
                  <select name="gradeLevel" value={formData.gradeLevel} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    {gradeLevels.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Học phí *</label>
                  <input type="number" name="tuitionFee" value={formData.tuitionFee} onChange={handleInputChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa *</label>
                  <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Hủy</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50">{loading ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gửi Yêu Cầu Duyệt */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <SendOutlined className="text-2xl text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Gửi yêu cầu duyệt</h3>
              </div>
              <p className="text-gray-600 mb-4">Bạn có chắc chắn muốn gửi khóa học này để admin phê duyệt không?</p>
              <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (Tùy chọn)</label>
                 <textarea 
                   value={requestNote}
                   onChange={(e) => setRequestNote(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                   rows="3"
                   placeholder="Nhập ghi chú cho quản trị viên..."
                 />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowRequestModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Hủy</button>
                <button onClick={handleConfirmRequest} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{loading ? 'Đang gửi...' : 'Gửi duyệt'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* [MỚI] Modal Publish Confirmation */}
      {showPublishConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <GlobalOutlined className="text-2xl text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Công khai khóa học</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn công khai khóa học này? <br/>
                Sau khi công khai, phụ huynh và học sinh sẽ nhìn thấy khóa học này trên trang chủ.
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowPublishConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Hủy</button>
                <button onClick={handleConfirmPublish} disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">{loading ? 'Đang xử lý...' : 'Công khai'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <ExclamationCircleOutlined className="text-2xl text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
              </div>
              <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn tác.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Hủy</button>
                <button onClick={handleConfirmDelete} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">{loading ? 'Đang xóa...' : 'Xóa'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseManagement
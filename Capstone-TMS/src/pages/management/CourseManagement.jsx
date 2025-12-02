import { useState, useEffect } from 'react'
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import { toast } from 'react-toastify'
import api from '../../config/axios'
import { useAuth } from '../../contexts/AuthContext'

const CourseManagement = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  
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
    teacherProfileId: null // [QUAN TRỌNG] Mặc định là null
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchCourses()
    fetchSubjects()
  }, [])

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

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const validateForm = () => {
    const newErrors = {}
    const today = getTodayDate()

    if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập tên khóa học'
    if (!formData.subject.trim()) newErrors.subject = 'Vui lòng chọn môn học'
    // [ĐÃ XÓA] Không bắt buộc chọn teacherProfileId nữa
    
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
        teacherProfileId: course.teacherProfileId || null // Giữ nguyên giáo viên nếu đang edit
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
        teacherProfileId: null // Reset về null
      })
    }
    setErrors({})
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
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

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      // [QUAN TRỌNG] Payload gửi lên server
      const payload = {
        ...formData,
        centerProfileId: user?.userId,
        // Nếu editingId có teacher thì giữ nguyên, nếu tạo mới thì null
        teacherProfileId: formData.teacherProfileId || null 
      }
      
      console.log('Payload:', payload)

      if (editingId) {
        await api.put(`/Course/${editingId}`, payload)
        toast.success('Cập nhật khóa học thành công!')
      } else {
        await api.post('/Course', payload)
        toast.success('Tạo khóa học thành công! (Trạng thái: Pending)')
      }
      await fetchCourses()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving course:', error)
      const errorMsg = error.response?.data?.message || 'Lỗi khi lưu khóa học'
      setErrors({ submit: errorMsg })
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

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

  const handlePublishCourse = async (courseId) => {
    setLoading(true)
    try {
      await api.put(`/Course/${courseId}/publish`, { status: 'PUBLISHED' })
      await fetchCourses()
      toast.success('Đăng khóa học thành công!')
    } catch (error) {
      console.error('Error publishing course:', error)
      toast.error('Lỗi khi đăng khóa học')
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: 'Chờ giáo viên', className: 'bg-yellow-100 text-yellow-800' },
      ASSIGNED: { label: 'Đã có GV', className: 'bg-blue-100 text-blue-800' }, // Giáo viên đã ký
      CONFIRMED: { label: 'Đã duyệt', className: 'bg-purple-100 text-purple-800' }, // Staff đã duyệt
      PUBLISHED: { label: 'Đã đăng', className: 'bg-green-100 text-green-800' }, // Center đã đăng
      CANCELLED: { label: 'Đã hủy', className: 'bg-red-100 text-red-800' },
      COMPLETED: { label: 'Đã kết thúc', className: 'bg-gray-100 text-gray-800' }
    }
    const config = statusConfig[status] || statusConfig.PENDING
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    )
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
            {courses.filter(c => c.status === 'PENDING').length}
          </div>
          <div className="text-sm text-gray-600">Chờ giáo viên</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {courses.filter(c => c.status === 'CONFIRMED').length}
          </div>
          <div className="text-sm text-gray-600">Chờ đăng</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {courses.filter(c => c.status === 'PUBLISHED').length}
          </div>
          <div className="text-sm text-gray-600">Đã đăng</div>
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
            <option value="PENDING">Chờ giáo viên</option>
            <option value="ASSIGNED">Đã có GV</option>
            <option value="CONFIRMED">Đã duyệt</option>
            <option value="PUBLISHED">Đã đăng</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="COMPLETED">Đã kết thúc</option>
          </select>
        </div>
      </div>

      {/* Courses table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên khóa học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Môn học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học phí
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{course.title}</div>
                      {/* Hiển thị giáo viên nếu đã có */}
                      {course.teacherProfileId ? (
                         <div className="text-xs text-blue-600 mt-1">GV: {course.teacherName || 'Đã nhận lớp'}</div>
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
                        {/* Chỉ hiện nút Đăng (Publish) nếu Staff đã Confirm */}
                        {course.status === 'CONFIRMED' && (
                          <button 
                            onClick={() => handlePublishCourse(course.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Đăng khóa học"
                          >
                            <CheckCircleOutlined />
                          </button>
                        )}
                        {/* Cho phép sửa/xóa khi còn Pending */}
                        {course.status === 'PENDING' && (
                          <>
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

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <CloseOutlined className="text-xl" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errors.submit && (
                <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                  {errors.submit}
                </div>
              )}

              {/* Row 1: Tên khóa học & Môn học */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khóa học *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập tên khóa học"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Môn học *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.subject ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">-- Chọn môn học --</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.subjectName}>
                        {subject.subjectName}
                      </option>
                    ))}
                  </select>
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                  )}
                </div>
              </div>

              {/* Row 2: Mô tả (Bỏ chọn giáo viên ở đây) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập mô tả khóa học"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Row 3: Địa điểm & Kỳ học */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa điểm *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập địa điểm"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kỳ học *
                  </label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value={1}>Kỳ 1</option>
                    <option value={2}>Kỳ 2</option>
                    <option value={3}>Kỳ hè</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Ngày bắt đầu & Ngày kết thúc */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    min={getTodayDate()}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày kết thúc *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    min={formData.startDate}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Row 5: Phương pháp giảng dạy & Lớp học */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phương pháp giảng dạy *
                  </label>
                  <select
                    name="teachingMethod"
                    value={formData.teachingMethod}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {teachingMethods.map(method => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lớp học *
                  </label>
                  <select
                    name="gradeLevel"
                    value={formData.gradeLevel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {gradeLevels.map(grade => (
                      <option key={grade.value} value={grade.value}>
                        {grade.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 6: Học phí & Sức chứa */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Học phí (đ) *
                  </label>
                  <input
                    type="number"
                    name="tuitionFee"
                    value={formData.tuitionFee}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.tuitionFee ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.tuitionFee && (
                    <p className="mt-1 text-sm text-red-600">{errors.tuitionFee}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sức chứa (học sinh) *
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.capacity ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="30"
                  />
                  {errors.capacity && (
                    <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal (Giữ nguyên) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <ExclamationCircleOutlined className="text-2xl text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseManagement
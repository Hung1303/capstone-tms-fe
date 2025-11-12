import { useState, useEffect } from 'react'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, EyeInvisibleOutlined, UserOutlined, BookOutlined, CalendarOutlined,
  PhoneOutlined, MailOutlined, TeamOutlined, LockOutlined, IdcardOutlined, BankOutlined, UsergroupAddOutlined } from '@ant-design/icons'
import { Card, Space, Tooltip, Modal, message, Empty, Select } from 'antd'
import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { toast } from 'react-toastify'
import api from '../../config/axios'
import { useAuth } from '../../contexts/AuthContext'
// import api from '../../config/axios' // TODO: Uncomment when API is ready

const ChildrenManagement = () => {
  const [children, setChildren] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGrade, setFilterGrade] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingChild, setEditingChild] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    userName: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    schoolName: '',
    schoolYear: '',
    gradeLevel: 0,
    className: ''
  })
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 5,
    total: 0,
  });
  const [formErrors, setFormErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()


  const fetchChildren = async (pageNumber, pageSize) => {
    setLoading(true)

    try {
      const apiResponse = await api.get(`/Users/${user.parentProfileId}/Students?pageNumber=${pageNumber}&pageSize=${pageSize}`)
      setChildren(apiResponse.data.students)
      console.log('Fetched children:', apiResponse.data)
    } catch (error) {
      console.error('Error fetching children:', error)
      toast.error('Không thể tải danh sách con em')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
   
    fetchChildren(pagination.pageNumber, pagination.pageSize)
    // Mock data tạm thời
    // setChildren([
    //   {
    //     id: 1,
    //     fullName: 'Nguyễn Văn An',
    //     email: 'nguyenvanan@email.com',
    //     phoneNumber: '0123456789',
    //     grade: '12',
    //     status: 'Active',
    //     joinDate: '2024-01-15',
    //     totalCourses: 3,
    //     enrolledCourses: ['IELTS Foundation', 'Toán Tư Duy', 'Tiếng Anh Giao Tiếp'],
    //     attendance: 92,
    //     averageScore: 8.5,
    //     dateOfBirth: '2010-05-15',
    //     school: 'THPT Nguyễn Du'
    //   },
  }, [])

  console.log('Children data:', children)

  const filteredChildren = children.filter(child => {
    const matchesSearch =
      child.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.phoneNumber.includes(searchTerm)

    const matchesGrade = filterGrade === 'all' || child.gradeLevel === filterGrade
    const matchesStatus = filterStatus === 'all' || child.status === filterStatus

    return matchesSearch && matchesGrade && matchesStatus
  })

  const handleAddChild = () => {
    setEditingChild(null)
    setFormData({
      email: '',
      userName: '',
      password: '',
      fullName: '',
      phoneNumber: '',
      schoolName: '',
      schoolYear: '',
      gradeLevel: null,
      className: ''
    })
    setFormErrors({})
    setShowPassword(false)
    setIsModalVisible(true)
  }

  const handleEditChild = (child) => {
    setEditingChild(child)
    setFormData({
      email: child.email || '',
      userName: child.userName || '',
      password: '',
      fullName: child.fullName || '',
      phoneNumber: child.phoneNumber || '',
      schoolName: child.schoolName || '',
      schoolYear: child.schoolYear || '',
      gradeLevel: child.gradeLevel || 12,
      className: child.className || ''
    })
    setFormErrors({})
    setIsModalVisible(true)
  }

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const normalizeFullName = (name) => {
    return name
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  const formatSchoolName = (gradeLevel, schoolName) => {
    if (!schoolName || !gradeLevel) return '';

    let levelLabel = "";
    if (gradeLevel >= 6 && gradeLevel <= 9) {
      levelLabel = "THCS";
    } else if (gradeLevel >= 10 && gradeLevel <= 12) {
      levelLabel = "THPT";
    }

    const formattedName = schoolName.trim()
                                    .toLowerCase()
                                    .split(/\s+/)
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ');

    const lowerName = formattedName.toLowerCase();
    const containsSchool = lowerName.includes('trường');
    const containsLevel =
      (levelLabel === 'THCS' && lowerName.includes('thcs')) ||
      (levelLabel === 'THPT' && lowerName.includes('thpt')) ||
      (levelLabel === 'THPT' && lowerName.includes('trung học phổ thông'));

    if (containsSchool && containsLevel) {
      return `Trường ${levelLabel} ${formattedName.replace(/(Trường Thcs|Trường Thpt)\s*/i, '')}`.trim();
    } else if (containsSchool) {
      return `Trường ${levelLabel} ${formattedName.replace(/Trường\s*/i, '')}`.trim();
    } else if (containsLevel) {
      return `Trường ${levelLabel} ${formattedName.replace(/(Thpt|Thcs)\s*/i, '')}`.trim();
    } else {
      return `Trường ${levelLabel} ${formattedName}`.trim();
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.email.trim()) {
      errors.email = 'Vui lòng nhập email'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email không hợp lệ'
    }

    if (!editingChild) {
      if (!formData.userName.trim()) {
        errors.userName = 'Vui lòng nhập tên tài khoản'
      } else if (formData.userName.length < 6) {
        errors.userName = 'Tên tài khoản phải có ít nhất 6 ký tự'
      } else if (/\s/.test(formData.userName)) {
        errors.userName = 'Tên tài khoản không được chứa khoảng trắng'
      }
  
      if (!formData.password.trim()) {
        errors.password = 'Vui lòng nhập mật khẩu'
      } else if (formData.password && formData.password.length < 6) {
        errors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
      }
    }

    if (!formData.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ tên'
    } else if (formData.fullName.length < 2) {
      errors.fullName = 'Họ tên phải có ít nhất 2 ký tự'
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Vui lòng nhập số điện thoại'
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      errors.phoneNumber = 'Số điện thoại không hợp lệ'
    }

    if (!formData.schoolName.trim()) {
      errors.schoolName = 'Vui lòng nhập tên trường'
    }

    if (!formData.schoolYear.trim()) {
      errors.schoolYear = 'Vui lòng nhập năm học'
    }

    if (!formData.gradeLevel || formData.gradeLevel < 1 || formData.gradeLevel > 12) {
      errors.gradeLevel = 'Lớp học phải từ 1 đến 12'
    }

    if (!formData.className.trim()) {
      errors.className = 'Vui lòng nhập tên lớp'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmitForm = async () => {
    if (!validateForm()) {
      console.log('Validation failed, returning early')
      return
    }

    setIsSubmitting(true)

    try {
      console.log("User:", user)
      console.log('formData data:', formData)
      
      const submitData = { ...formData }
 
      if (editingChild) {
        delete submitData.userName
        delete submitData.password
      }
      console.log("submitData:", submitData)

      if (editingChild) {
        const parentProfileId = user.parentProfileId
        const studentId = editingChild.userId
        const apiResponse = await api.put(`/Users/${parentProfileId}/Student?studentId=${studentId}`, submitData)
        console.log('API response (update):', apiResponse)
        toast.success('Cập nhật thông tin con thành công')
      } else {
        const apiResponse = await api.post(`/Users/${user.userId}/Student`, submitData)
        console.log('API response (create):', apiResponse)
        toast.success("Đã thêm thành công.")
      }

      setIsModalVisible(false)
      setFormErrors({})
      
      await fetchChildren(pagination.pageNumber, pagination.pageSize)
    } catch (error) {
      console.error('Error submitting form:', error)

      if (error.response && error.response.data) {
        const message = error.response.data;

        if (message.includes("the full name")) {
          setFormErrors((prevErrors) => ({
            ...prevErrors,
            fullName: "Phải viết hoa chữ cái đầu mỗi từ"
          }))
        }
        else if (message.includes("Duplicate email")) {
          setFormErrors((prevErrors) => ({
            ...prevErrors,
            email: "Email đã được sử dụng"
          }))
        }
        else if (message.includes("Duplicate username")) {
          setFormErrors((prevErrors) => ({
            ...prevErrors,
            userName: "Tên tài khoản đã được sử dụng"
          }))
        }
        else if (message.includes("Duplicate phone number")) {
          setFormErrors((prevErrors) => ({
            ...prevErrors,
            phoneNumber: "Số điện thoại đã được sử dụng"
          }))
        }
      }
      toast.error(editingChild ? 'Cập nhật thất bại' : 'Thêm con thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteChild = (childId) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa thông tin con này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          // TODO: Thay bằng API call thực tế
          // await api.delete(`/Parent/Children/${childId}`)
          setChildren(prev => prev.filter(c => c.id !== childId))
          toast.success('Xóa thành công')
        } catch (error) {
          console.error('Error deleting child:', error)
          toast.error('Xóa thất bại')
        }
      }
    })
  }

  const handleViewDetails = (child) => {
    // TODO: Navigate to child details page or show modal
    message.info(`Xem chi tiết: ${child.fullName}`)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Hoạt động</span>
      case 'Suspended':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Tạm khóa</span>
      case 'Deactivated':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Ngừng hoạt động</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Không xác định</span>
    }
  }

  console.log("filteredChildren:", filteredChildren)

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {/* Header */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-purple-500 flex items-center gap-2">
              <TeamOutlined />
              Quản lý các con
            </h2>
            <p className="text-gray-600 mt-1">Quản lý thông tin và khóa học của các con</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddChild}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md"
          >
            <PlusOutlined />
            <span>Thêm con mình</span>
          </motion.button>
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Tất cả lớp</option>
              <option value="10">Lớp 10</option>
              <option value="11">Lớp 11</option>
              <option value="12">Lớp 12</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Active">Hoạt động</option>
              <option value="Suspended">Tạm khóa</option>
              <option value="Deactivated">Ngừng hoạt động</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng số con</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{children.length}</p>
            </div>
            <TeamOutlined className="text-4xl text-purple-400 opacity-50" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đang học</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {children.filter(c => c.status === 'Active').length}
              </p>
            </div>
            <BookOutlined className="text-4xl text-blue-400 opacity-50" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng khóa học</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {children.reduce((sum, c) => sum + c.totalCourses, 0)}
              </p>
            </div>
            <CalendarOutlined className="text-4xl text-green-400 opacity-50" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Điểm danh TB</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {children.length > 0
                  ? Math.round(children.reduce((sum, c) => sum + c.attendance, 0) / children.length)
                  : 0}%
              </p>
            </div>
            <UserOutlined className="text-4xl text-orange-400 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Content - Children Cards */}
      <Card>
        {filteredChildren.length === 0 ? (
          <Empty
            description="Không tìm thấy con nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChildren.map((child) => (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                        <span className="text-white font-bold text-lg">
                          {child.fullName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{child.fullName}</h3>
                        <p className="text-white/90 text-sm">Lớp: {child.gradeLevel} ( {child.className} )</p>
                      </div>
                    </div>
                    {getStatusBadge(child.status)}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MailOutlined className="text-purple-500!" />
                      <span className="truncate">{child.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <PhoneOutlined className="text-purple-500!" />
                      <span>{child.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOutlined className="text-purple-500!" />
                      <span className="truncate">{child.schoolName} ({child.schoolYear})</span>
                    </div>
                  </div>

                  {/* Courses */}
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Khóa học</span>
                      <span className="text-sm font-bold text-purple-600">{child.totalCourses} khóa</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {/* {child.enrolledCourses.slice(0, 2).map((course, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-white text-purple-700 rounded-full border border-purple-200"
                        >
                          {course}
                        </span>
                      ))}
                      {child.enrolledCourses.length > 2 && (
                        <span className="text-xs px-2 py-1 bg-white text-purple-700 rounded-full border border-purple-200">
                          +{child.enrolledCourses.length - 2} khác
                        </span>
                      )} */}
                    </div>
                  </div>

                  {/* Performance Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100">
                      <div className="text-xs text-gray-600 mb-1">Điểm danh</div>
                      <div className="text-xl font-bold text-green-600">{child.attendance}%</div>
                      <div className="w-full bg-green-200 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-green-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${child.attendance}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-100">
                      <div className="text-xs text-gray-600 mb-1">Điểm TB</div>
                      <div className="text-xl font-bold text-blue-600">{child.averageScore}/10</div>
                      <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${child.averageScore * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <Tooltip title="Xem chi tiết">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewDetails(child)}
                        className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <EyeOutlined />
                        <span>Chi tiết</span>
                      </motion.button>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditChild(child)}
                        className="flex-1 py-2 px-3 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <EditOutlined />
                        <span>Sửa</span>
                      </motion.button>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteChild(child.id)}
                        className="py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <DeleteOutlined />
                      </motion.button>
                    </Tooltip>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingChild ? 'Chỉnh sửa thông tin con' : 'Thêm con mới'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
        style={{ top: 20 }}
      >
        <div className="max-h-[70vh] overflow-y-auto pl-2 pr-2">
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-orange-500 mb-1">
                  <UserOutlined className="mr-2" />
                  Họ và tên
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01, boxShadow: "0 0 6px rgba(249,115,22,0.4)", borderColor: "#fdba74" }}
                  animate={{ borderColor: formErrors.fullName ? "#fca5a5" : "#d1d5db" }}
                  transition={{ duration: 0.3 }}
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleFormChange('fullName', e.target.value)}
                  onBlur={() => handleFormChange('fullName', normalizeFullName(formData.fullName))}
                  className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none ${editingChild ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  placeholder="Nhập họ và tên đầy đủ"
                  disabled={editingChild !== null}
                />
                {formErrors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-500 mb-1">
                  <MailOutlined className="mr-2" />
                  Email
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01, boxShadow: "0 0 6px rgba(249,115,22,0.4)", borderColor: "#fdba74" }}
                  animate={{ borderColor: formErrors.email ? "#fca5a5" : "#d1d5db" }}
                  transition={{ duration: 0.3 }}
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none"
                  placeholder="Nhập email"
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              {editingChild == null && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-orange-500 mb-1">
                      <IdcardOutlined className="mr-2" />
                      Tên tài khoản
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01, boxShadow: "0 0 6px rgba(249,115,22,0.4)", borderColor: "#fdba74" }}
                      animate={{ borderColor: formErrors.userName ? "#fca5a5" : "#d1d5db" }}
                      transition={{ duration: 0.3 }}
                      type="text"
                      value={formData.userName}
                      onChange={(e) => handleFormChange('userName', e.target.value)}
                      className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none"
                      placeholder="Nhập tên tài khoản"
                    />
                    {formErrors.userName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.userName}</p>
                    )}
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-orange-500 mb-1">
                      <LockOutlined className="mr-2" />
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <motion.input
                        whileFocus={{ scale: 1.01, boxShadow: "0 0 6px rgba(249,115,22,0.4)", borderColor: "#fdba74" }}
                        animate={{ borderColor: formErrors.password ? "#fca5a5" : "#d1d5db" }}
                        transition={{ duration: 0.3 }}
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleFormChange('password', e.target.value)}
                        className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none"
                        placeholder={editingChild ? "Nhập mật khẩu mới (nếu muốn đổi)" : "Nhập mật khẩu"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-orange-500 mb-1">
                  <PhoneOutlined className="mr-2" />
                  Số điện thoại 
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01, boxShadow: "0 0 6px rgba(249,115,22,0.4)", borderColor: "#fdba74" }}
                  animate={{ borderColor: formErrors.phoneNumber ? "#fca5a5" : "#d1d5db" }}
                  transition={{ duration: 0.3 }}
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                  className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none"
                  placeholder="Nhập số điện thoại"
                />
                {formErrors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-500 mb-1">
                  <BookOutlined className="mr-2" />
                  Lớp 
                </label>
                <Select
                  value={formData.gradeLevel}
                  onChange={(value) => handleFormChange('gradeLevel', value)}
                  className="w-full"
                  size="large"
                  options={Array.from({ length: 7 }, (_, i) => ({
                    value: i + 6,
                    label: `Lớp ${i + 6}`
                  }))}
                  placeholder="Chọn lớp học"
                />
                {formErrors.gradeLevel && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.gradeLevel}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-500 mb-1">
                  <CalendarOutlined className="mr-2" />
                  Năm học 
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01, boxShadow: "0 0 6px rgba(249,115,22,0.4)", borderColor: "#fdba74" }}
                  animate={{ borderColor: formErrors.schoolYear ? "#fca5a5" : "#d1d5db" }}
                  transition={{ duration: 0.3 }}
                  type="text"
                  value={formData.schoolYear}
                  onChange={(e) => handleFormChange('schoolYear', e.target.value)}
                  className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none"
                  placeholder="VD: 2024-2025"
                />
                {formErrors.schoolYear && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.schoolYear}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-500 mb-1">
                  <BankOutlined className="mr-2" />
                  Tên trường 
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01, boxShadow: "0 0 6px rgba(249,115,22,0.4)", borderColor: "#fdba74" }}
                  animate={{ borderColor: formErrors.schoolName ? "#fca5a5" : "#d1d5db" }}
                  transition={{ duration: 0.3 }}
                  type="text"
                  value={formData.schoolName}
                  disabled={formData.gradeLevel === null ? true : false}
                  onChange={(e) => handleFormChange('schoolName', e.target.value)}
                  onBlur={() => handleFormChange('schoolName', formatSchoolName(formData.gradeLevel, formData.schoolName))}
                  className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none ${formData.gradeLevel === null ? 'bg-gray-100 cursor-not-allowed' : ''  }`}
                  placeholder={ formData.gradeLevel === null ? "Chọn lớp trước" : "Nhập tên trường"}
                />
                {formErrors.schoolName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.schoolName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-500 mb-1">
                  <UsergroupAddOutlined className="mr-2" />
                  Tên lớp 
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01, boxShadow: "0 0 6px rgba(249,115,22,0.4)", borderColor: "#fdba74" }}
                  animate={{ borderColor: formErrors.className ? "#fca5a5" : "#d1d5db" }}
                  transition={{ duration: 0.3 }}
                  type="text"
                  value={formData.className}
                  onChange={(e) => handleFormChange('className', e.target.value)}
                  className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none"
                  placeholder="VD: 12A1, 11B2"
                />
                {formErrors.className && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.className}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 pb-4 border-t">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsModalVisible(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Hủy
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmitForm}
                disabled={isSubmitting}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang xử lý...' : editingChild ? 'Cập nhật' : 'Thêm con'}
              </motion.button>
            </div>
          </form>
        </div>
      </Modal>
    </Space>
  )
}

export default ChildrenManagement

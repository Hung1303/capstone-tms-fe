import { useState, useEffect } from 'react'
import { 
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, 
  UserOutlined, BookOutlined, CalendarOutlined, PhoneOutlined, 
  MailOutlined, TeamOutlined, LockOutlined, IdcardOutlined, 
  BankOutlined, UsergroupAddOutlined, EyeOutlined, EyeInvisibleOutlined 
} from '@ant-design/icons'
import { Card, Space, Tooltip, Modal, Select, Empty } from 'antd'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import api from '../../config/axios'
import { useAuth } from '../../contexts/AuthContext'

const ChildrenManagement = () => {
  const [children, setChildren] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGrade, setFilterGrade] = useState('all')
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
    pageSize: 100, // Lấy nhiều hơn để hiển thị danh sách
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
    } catch (error) {
      console.error('Error fetching children:', error)
      toast.error('Không thể tải danh sách con em')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChildren(pagination.pageNumber, pagination.pageSize)
  }, [])

  const filteredChildren = children.filter(child => {
    const matchesSearch =
      child.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.phoneNumber.includes(searchTerm)

    const matchesGrade = filterGrade === 'all' || child.gradeLevel === parseInt(filterGrade)

    return matchesSearch && matchesGrade
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
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const normalizeFullName = (name) => {
    return name.trim().toLowerCase().split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  const formatSchoolName = (gradeLevel, schoolName) => {
    if (!schoolName || !gradeLevel) return '';
    let levelLabel = "";
    if (gradeLevel >= 6 && gradeLevel <= 9) levelLabel = "THCS";
    else if (gradeLevel >= 10 && gradeLevel <= 12) levelLabel = "THPT";

    const formattedName = schoolName.trim().toLowerCase().split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const lowerName = formattedName.toLowerCase();
    
    if (lowerName.includes('trường') && (lowerName.includes('thcs') || lowerName.includes('thpt'))) {
        return `Trường ${levelLabel} ${formattedName.replace(/(Trường Thcs|Trường Thpt)\s*/i, '')}`.trim();
    }
    return `Trường ${levelLabel} ${formattedName.replace(/Trường\s*/i, '')}`.trim();
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.email.trim()) errors.email = 'Vui lòng nhập email'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email không hợp lệ'

    if (!editingChild) {
      if (!formData.userName.trim()) errors.userName = 'Vui lòng nhập tên tài khoản'
      else if (formData.userName.length < 6) errors.userName = 'Tên tài khoản phải có ít nhất 6 ký tự'
      
      if (!formData.password.trim()) errors.password = 'Vui lòng nhập mật khẩu'
      else if (formData.password.length < 6) errors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    if (!formData.fullName.trim()) errors.fullName = 'Vui lòng nhập họ tên'
    if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Vui lòng nhập số điện thoại'
    if (!formData.schoolName.trim()) errors.schoolName = 'Vui lòng nhập tên trường'
    if (!formData.schoolYear.trim()) errors.schoolYear = 'Vui lòng nhập năm học'
    if (!formData.gradeLevel) errors.gradeLevel = 'Vui lòng chọn lớp'
    if (!formData.className.trim()) errors.className = 'Vui lòng nhập tên lớp'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmitForm = async () => {
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      const submitData = { ...formData }
      if (editingChild) {
        delete submitData.userName
        delete submitData.password
        await api.put(`/Users/${user.parentProfileId}/Student?studentId=${editingChild.userId}`, submitData)
        toast.success('Cập nhật thông tin con thành công')
      } else {
        await api.post(`/Users/${user.userId}/Student`, submitData)
        toast.success("Đã thêm thành công.")
      }
      setIsModalVisible(false)
      fetchChildren(pagination.pageNumber, pagination.pageSize)
    } catch (error) {
      console.error(error)
      const message = error.response?.data || "";
      if (typeof message === 'string' && message.includes("Duplicate")) {
          toast.error("Thông tin (Email/SĐT/User) đã tồn tại!");
      } else {
          toast.error(editingChild ? 'Cập nhật thất bại' : 'Thêm con thất bại')
      }
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
          // await api.delete(`/Users/Student/${childId}`) // Uncomment khi có API
          // setChildren(prev => prev.filter(c => c.id !== childId)) // Mock UI remove
          toast.info('Chức năng xóa đang được cập nhật')
        } catch (error) {
          toast.error('Xóa thất bại')
        }
      }
    })
  }

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
            <p className="text-gray-600 mt-1">Danh sách thông tin học sinh</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddChild}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md cursor-pointer"
          >
            <PlusOutlined />
            <span>Thêm con mình</span>
          </motion.button>
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
          >
            <option value="all">Tất cả lớp</option>
            <option value="10">Lớp 10</option>
            <option value="11">Lớp 11</option>
            <option value="12">Lớp 12</option>
          </select>
        </div>
      </Card>

      {/* Children List */}
      <Card>
        {filteredChildren.length === 0 ? (
          <Empty description="Không tìm thấy học sinh nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChildren.map((child) => (
              <motion.div
                key={child.userId || child.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Header Card */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 text-white font-bold text-lg">
                      {child.fullName ? child.fullName.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{child.fullName}</h3>
                      <p className="text-white/90 text-sm opacity-90">
                        Lớp {child.gradeLevel} • {child.className}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Body Card - Chỉ hiện các thông tin được yêu cầu */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <MailOutlined className="text-purple-500 text-lg" />
                    <span className="truncate">{child.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <PhoneOutlined className="text-purple-500 text-lg" />
                    <span>{child.phoneNumber}</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-gray-700 border-t border-gray-100 pt-3 mt-1">
                    <BankOutlined className="text-purple-500 text-lg mt-0.5" />
                    <div>
                        <p className="font-medium">{child.schoolName}</p>
                        <p className="text-xs text-gray-500">Năm học: {child.schoolYear}</p>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center gap-2 p-4 border-t border-gray-100 bg-gray-50">
                  <Tooltip title="Chỉnh sửa thông tin">
                    <button
                      onClick={() => handleEditChild(child)}
                      className="cursor-pointer flex-1 py-2 bg-white border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <EditOutlined /> Sửa
                    </button>
                  </Tooltip>
                  <Tooltip title="Xóa con">
                    <button
                      onClick={() => handleDeleteChild(child.userId || child.id)}
                      className="cursor-pointer py-2 px-4 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-lg flex items-center justify-center"
                    >
                      <DeleteOutlined />
                    </button>
                  </Tooltip>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Add/Edit Modal (Giữ nguyên form nhập liệu) */}
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
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-orange-500 mb-1">
                  <UserOutlined className="mr-2" /> Họ và tên
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleFormChange('fullName', e.target.value)}
                  onBlur={() => handleFormChange('fullName', normalizeFullName(formData.fullName))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-400 ${editingChild ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  placeholder="Nhập họ và tên"
                  disabled={editingChild !== null}
                />
                {formErrors.fullName && <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-orange-500 mb-1">
                  <MailOutlined className="mr-2" /> Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-400"
                  placeholder="Nhập email"
                />
                {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
              </div>

              {/* Username & Password (Only for new) */}
              {!editingChild && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-orange-500 mb-1">
                      <IdcardOutlined className="mr-2" /> Tên tài khoản
                    </label>
                    <input
                      type="text"
                      value={formData.userName}
                      onChange={(e) => handleFormChange('userName', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-400"
                      placeholder="Nhập tên tài khoản"
                    />
                    {formErrors.userName && <p className="mt-1 text-sm text-red-600">{formErrors.userName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-500 mb-1">
                      <LockOutlined className="mr-2" /> Mật khẩu
                    </label>
                    <div className="relative">
                        <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleFormChange('password', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-400"
                        placeholder="Nhập mật khẩu"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2 text-gray-400">
                            {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </button>
                    </div>
                    {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
                  </div>
                </>
              )}

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-orange-500 mb-1">
                  <PhoneOutlined className="mr-2" /> Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-400"
                  placeholder="Nhập số điện thoại"
                />
                {formErrors.phoneNumber && <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>}
              </div>

              {/* Grade */}
              <div>
                <label className="block text-sm font-medium text-orange-500 mb-1">
                  <BookOutlined className="mr-2" /> Lớp
                </label>
                <Select
                  value={formData.gradeLevel}
                  onChange={(value) => handleFormChange('gradeLevel', value)}
                  className="w-full h-[42px]"
                  options={Array.from({ length: 7 }, (_, i) => ({ value: i + 6, label: `Lớp ${i + 6}` }))}
                  placeholder="Chọn lớp"
                />
                {formErrors.gradeLevel && <p className="mt-1 text-sm text-red-600">{formErrors.gradeLevel}</p>}
              </div>

              {/* School Year */}
              <div>
                <label className="block text-sm font-medium text-orange-500 mb-1">
                  <CalendarOutlined className="mr-2" /> Năm học
                </label>
                <input
                  type="text"
                  value={formData.schoolYear}
                  onChange={(e) => handleFormChange('schoolYear', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-400"
                  placeholder="VD: 2024-2025"
                />
                {formErrors.schoolYear && <p className="mt-1 text-sm text-red-600">{formErrors.schoolYear}</p>}
              </div>

              {/* School Name */}
              <div>
                <label className="block text-sm font-medium text-orange-500 mb-1">
                  <BankOutlined className="mr-2" /> Tên trường
                </label>
                <input
                  type="text"
                  value={formData.schoolName}
                  disabled={!formData.gradeLevel}
                  onChange={(e) => handleFormChange('schoolName', e.target.value)}
                  onBlur={() => handleFormChange('schoolName', formatSchoolName(formData.gradeLevel, formData.schoolName))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-400 ${!formData.gradeLevel ? 'bg-gray-100' : ''}`}
                  placeholder={!formData.gradeLevel ? "Chọn lớp trước" : "Nhập tên trường"}
                />
                {formErrors.schoolName && <p className="mt-1 text-sm text-red-600">{formErrors.schoolName}</p>}
              </div>

              {/* Class Name */}
              <div>
                <label className="block text-sm font-medium text-orange-500 mb-1">
                  <UsergroupAddOutlined className="mr-2" /> Tên lớp
                </label>
                <input
                  type="text"
                  value={formData.className}
                  onChange={(e) => handleFormChange('className', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-orange-400"
                  placeholder="VD: 12A1"
                />
                {formErrors.className && <p className="mt-1 text-sm text-red-600">{formErrors.className}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 pb-4 border-t mt-4">
              <button
                type="button"
                onClick={() => setIsModalVisible(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmitForm}
                disabled={isSubmitting}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Đang xử lý...' : editingChild ? 'Cập nhật' : 'Thêm con'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </Space>
  )
}

export default ChildrenManagement
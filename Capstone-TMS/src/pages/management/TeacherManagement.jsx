import { useState, useEffect, useCallback } from 'react'
import { SearchOutlined, PlusOutlined, EditOutlined, EyeOutlined, UserOutlined, PhoneOutlined, MailOutlined, StarOutlined,
         UploadOutlined, FileExcelOutlined } from '@ant-design/icons'
import { Modal, Button, Tag, Popconfirm, Form, Input, InputNumber, Progress, Upload, Table, Space, Tooltip, Card, Select } from 'antd'
import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'
import api from '../../config/axios'
import { useAuth } from '../../contexts/AuthContext'

const { TextArea } = Input

const TeacherManagement = () => {
  const { user, logout } = useAuth()
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSubject, setFilterSubject] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [uploadModalVisible, setUploadModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editForm] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResults, setUploadResults] = useState({ success: 0, failed: 0, errors: [] })
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 1000,
    total: 0
  })

  const fetchTeachers = useCallback(async (pageNumber, pageSize) => {
    if (!user?.centerProfileId) return

    setLoading(true)
    try {
      const apiResponse = await api.get(`/Users/${user.centerProfileId}/Teachers?pageNumber=${pageNumber}&pageSize=${pageSize}`)
      console.log('API Response:', apiResponse.data)

      const teachersDraft = apiResponse.data.teachers

      const teachers = await Promise.all(
        teachersDraft.map(async (teacher) => {
          try {
            const res = await api.get(`/Course/${teacher.profileId}/Courses`);
            const userRes = await api.get(`/Users/User/${teacher.id}`)

            const user = userRes.data
            const courseList = res.data.data
            
            return {
              ...teacher,
              courses: courseList || [],
              user: {
                email: user.email,
                phoneNumber: user.phoneNumber
              }
            };
          } catch (err) {
            console.error("Lỗi fetch course cho teacher:", err);

            return {
              ...teacher,
              courses: [],
              user: null
            };
          }
        })
      )

      setTeachers(teachers)
      setPagination(prev => ({
        ...prev,
        total: apiResponse.data.totalCount
      }))
    } catch (error) {
      console.error('Error fetching teachers:', error)

      if (error.code === 'ERR_NETWORK') {
        logout();
      }

      toast.error('Lỗi khi tải danh sách giáo viên')
      setTeachers([])
    } finally {
      setLoading(false)
    }
  }, [user, logout])

  useEffect(() => {
      fetchTeachers(pagination.pageNumber, pagination.pageSize)
  }, [fetchTeachers, pagination.pageNumber, pagination.pageSize])

  // Lấy danh sách môn học duy nhất từ danh sách giáo viên
  const getUniqueSubjects = () => {
    const subjects = new Set()
    teachers.forEach(teacher => {
      if (teacher.subject) {
        subjects.add(teacher.subject)
      }
    })
    return Array.from(subjects).sort()
  }

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch =
      teacher.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.phoneNumber?.includes(searchTerm) ||
      teacher.subject?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSubject = filterSubject === 'all' || teacher.subject === filterSubject
    const matchesStatus = filterStatus === 'all' || teacher.status === filterStatus

    return matchesSearch && matchesSubject && matchesStatus
  })

  const getStatusBadge = (status) => {
    const statusMap = {
      'Active': { color: 'green', text: 'Hoạt động' },
      'Inactive': { color: 'red', text: 'Không hoạt động' },
      'Pending': { color: 'orange', text: 'Chờ duyệt' },
      'Suspended': { color: 'red', text: 'Tạm khóa' }
    }

    const statusInfo = statusMap[status] || { color: 'default', text: status }
    return (
      <Tag color={statusInfo.color}>
        {statusInfo.text}
      </Tag>
    )
  }

  const handleViewTeacher = (teacher) => {
    setSelectedTeacher(teacher)
    setViewModalVisible(true)
  }

  const handleEditTeacher = (teacher) => {
    console.log('Editing teacher:', teacher)
    setSelectedTeacher(teacher)
    editForm.setFieldsValue({
      email: teacher.user.email || '',
      phoneNumber: teacher.user.phoneNumber || '',
      subjects: teacher.subject || teacher.subjects || '',
      bio: teacher.bio || ''
    })
    setEditModalVisible(true)
  }

  const handleCancelEdit = () => {
    setEditModalVisible(false)
    editForm.resetFields()
    setSelectedTeacher(null)
  }

  const handleSubmitEdit = async () => {
    try {
      const values = await editForm.validateFields()
      setEditing(true)

      const userId = selectedTeacher?.id
      if (!userId) {
        toast.error('Không tìm thấy ID giáo viên')
        setEditing(false)
        return
      }

      const payload = {
        email: values.email,
        phoneNumber: values.phoneNumber,
        subjects: values.subjects,
        bio: values.bio || ''
      }

      console.log('Updating teacher with payload:', payload)
      console.log('Teacher ID:', userId)

      await api.put(`/Users/Teacher/${userId}`, payload)

      toast.success('Đã cập nhật thông tin giáo viên thành công')
      setEditModalVisible(false)
      editForm.resetFields()
      setSelectedTeacher(null)
      fetchTeachers(pagination.pageNumber, pagination.pageSize)
    } catch (error) {
      console.error('Error updating teacher:', error)

      const errorResponse = error.response?.data
      let errorMessage = ""

      if (errorResponse) {
        if (typeof errorResponse === 'string') {
          if (errorResponse.includes("Duplicate email")) {
            errorMessage = "Email đã được sử dụng"
            editForm.setFields([{ name: 'email', errors: [errorMessage] }])
          } else if (errorResponse.includes("Duplicate Phonenumber")) {
            errorMessage = "Số điện thoại đã được sử dụng"
            editForm.setFields([{ name: 'phoneNumber', errors: [errorMessage] }])
          } else {
            errorMessage = errorResponse
          }
        } else if (errorResponse.message) {
          errorMessage = errorResponse.message
        }
      }

      if (errorMessage) {
        toast.error(errorMessage)
      } else {
        toast.error('Không thể cập nhật giáo viên, vui lòng thử lại')
      }
    } finally {
      setEditing(false)
    }
  }

  // const handleDeleteTeacher = async (id) => {
  //   try {
  //     const res = await api.delete(`/Users/${id}`)
  //     console.log("api response delete:", res)
  //     toast.success("Đã xóa thành công.")
  //   } catch (error) {
  //     console.error("error api delete teacher:", error)
  //     toast.error("Xóa thất bại.")
  //   }
  // }

  const handleAddTeacher = () => {
    form.resetFields()
    setAddModalVisible(true)
  }

  const handleCancelAdd = () => {
    setAddModalVisible(false)
    form.resetFields()
  }

  const handleSubmitAdd = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      const payload = {
        email: values.email,
        userName: values.userName,
        password: values.password,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        yearOfExperience: values.yearOfExperience || 0,
        qualifications: values.qualifications || '',
        licenseNumber: values.licenseNumber || '',
        subjects: values.subjects || '',
        bio: values.bio || '',
        teachingAtSchool: values.teachingAtSchool || '',
        teachAtClasses: values.teachAtClasses || ''
      }

      console.log('Creating teacher with payload:', payload)

      const centerOwnerId = user?.userId
      await api.post(`/Users/Center${centerOwnerId}/Teacher`, payload)

      toast.success('Đã thêm giáo viên thành công')
      setAddModalVisible(false)
      form.resetFields()
      fetchTeachers(pagination.pageNumber, pagination.pageSize)
    } catch (error) {
      console.error('Error creating teacher:', error)

      const errorResponse = error.response.data
      let errorMessage = ""

      if (errorResponse.includes("the full name")) {
        errorMessage = "Phải viết hoa chữ cái đầu mỗi từ"
        form.setFields([
          { name: 'fullName', errors: [errorMessage] }
        ])
      }
      else if (errorResponse.includes("Duplicate email")) {
        errorMessage = "Email đã được sử dụng"
        form.setFields([
          { name: 'email', errors: [errorMessage] }
        ])
      }
      else if (errorResponse.includes("Duplicate Username")) {
        errorMessage = "Tên tài khoản đã được sử dụng"
        form.setFields([
          { name: 'userName', errors: [errorMessage] }
        ])
      }
      else if (errorResponse.includes("Duplicate Phonenumber")) {
        errorMessage = "Số điện thoại đã được sử dụng"
        form.setFields([
          { name: 'phoneNumber', errors: [errorMessage] }
        ])
      }

      if (error.response?.data) {
        toast.error(error.response.data.message || 'Không thể thêm giáo viên, vui lòng thử lại')
      } else {
        toast.error('Không thể thêm giáo viên, vui lòng thử lại')
      }

      setUploadResults(prev => ({
        ...prev,
        errors: [...prev.errors, { error: errorMessage }]
      }))
    } finally {
      setSubmitting(false)
    }
  }

  // const handleCreateVerification = (teacher) => {
  //   console.log('Creating verification for teacher:', teacher)
  //   createVerifyForm.setFieldsValue({
  //     teacherProfileId: teacher.profileId,
  //     notes: ""
  //   })
  //   setCreateModalOpen(true)
  // }

  // const handleSubmitVerification = async () => {
  //   try {
  //     const values = await createVerifyForm.validateFields()
  //     setCreateVerifyLoading(true)
      
  //     const payload = {
  //       teacherProfileId: values.teacherProfileId,
  //       notes: values.notes || ''
  //     }
      
  //     console.log('Creating verification with payload:', payload)
  //     const response = await api.post('/teacher-verifications', payload)
  //     console.log('Create verification response:', response.data)
      
  //     toast.success('Tạo yêu cầu kiểm định thành công')
  //     setCreateModalOpen(false)
  //     createVerifyForm.resetFields()
      
  //     fetchTeachers(pagination.pageNumber, pagination.pageSize)
  //   } catch (error) {
  //     console.error('Error creating verification:', error)

  //     // if (error.code === 'ERR_NETWORK') {
  //     //   logout()
  //     // } 

  //     const errorMessage = error.response?.data?.message || 'Không thể tạo yêu cầu kiểm định'
  //     toast.error(errorMessage)
      
  //   } finally {
  //     setCreateVerifyLoading(false)
  //   }
  // }

  // const handleCancel = () => {
  //   setCreateModalOpen(false)
  //   form.resetFields()
  // }

  const handleUploadExcel = () => {
    setUploadModalVisible(true)
    setUploadResults({ success: 0, failed: 0, errors: [] })
    setUploadProgress(0)
  }

  const handleCancelUpload = () => {
    setUploadModalVisible(false)
    setUploadResults({ success: 0, failed: 0, errors: [] })
    setUploadProgress(0)
  }

  const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          // Map dữ liệu từ Excel sang format API
          const teachers = jsonData.map((row, index) => {
            return {
              email: row['Email'] || row['email'] || '',
              userName: row['Tên đăng nhập'] || row['UserName'] || row['userName'] || row['Tên tài khoản'] || '',
              password: String(row['Mật khẩu'] || row['Password'] || row['password'] || 'Default123!'),
              fullName: row['Họ và tên'] || row['FullName'] || row['fullName'] || row['Tên'] || '',
              phoneNumber: String(row['Số điện thoại'] || row['PhoneNumber'] || row['phoneNumber'] || row['SĐT'] || '').replace(/\s/g, ''),
              yearOfExperience: parseInt(row['Số năm kinh nghiệm'] || row['YearOfExperience'] || row['yearOfExperience'] || row['Kinh nghiệm'] || 0) || 0,
              qualifications: row['Bằng cấp'] || row['Qualifications'] || row['qualifications'] || row['Chứng chỉ'] || '',
              licenseNumber: row['Số giấy phép'] || row['LicenseNumber'] || row['licenseNumber'] || '',
              subjects: row['Môn học'] || row['Subjects'] || row['subjects'] || '',
              bio: row['Giới thiệu'] || row['Bio'] || row['bio'] || row['Mô tả'] || '',
              teachingAtSchool: row['Trường đang dạy'] || row['TeachingAtSchool'] || row['teachingAtSchool'] || row['Trường'] || '',
              teachAtClasses: row['Dạy các lớp'] || row['TeachAtClasses'] || row['teachAtClasses'] || row['Lớp'] || '',
              rowNumber: index + 2 // +2 vì có header và index bắt đầu từ 0
            }
          }).filter(teacher => teacher.email && teacher.fullName) // Lọc bỏ các dòng trống

          resolve(teachers)
        } catch (error) {
          reject(new Error('Không thể đọc file Excel: ' + error.message))
        }
      }

      reader.onerror = () => {
        reject(new Error('Lỗi khi đọc file'))
      }

      reader.readAsArrayBuffer(file)
    })
  }

  const handleFileUpload = async (file) => {
    setUploading(true)
    setUploadProgress(0)
    setUploadResults({ success: 0, failed: 0, errors: [] })

    try {
      // Parse file Excel
      const teachers = await parseExcelFile(file)

      if (teachers.length === 0) {
        toast.error('Không tìm thấy dữ liệu giáo viên trong file Excel')
        setUploading(false)
        return
      }

      const centerOwnerId = user?.userId
      if (!centerOwnerId) {
        toast.error('Không tìm thấy thông tin trung tâm')
        setUploading(false)
        return
      }

      const results = { success: 0, failed: 0, errors: [] }

      // Gửi từng giáo viên đến API
      for (let i = 0; i < teachers.length; i++) {
        const teacher = teachers[i]
        try {
          await api.post(`/Users/Center${centerOwnerId}/Teacher`, teacher)
          results.success++
        } catch (error) {
          results.failed++
          console.error("lỗi tạo giáo viên file:", error)
          const errorResponse = error.response.data
          let errorMessage = ""

          if (errorResponse.includes("the full name")) {
            errorMessage = "Phải viết hoa chữ cái đầu mỗi từ"
          }
          else if (errorResponse.includes("Duplicate email")) {
            errorMessage = "Email đã được sử dụng"
          }
          else if (errorResponse.includes("Duplicate Username")) {
            errorMessage = "Tên tài khoản đã được sử dụng"
          }
          else if (errorResponse.includes("Duplicate Phonenumber")) {
            errorMessage = "Số điện thoại đã được sử dụng"
          }

          results.errors.push({
            row: teacher.rowNumber,
            name: teacher.fullName,
            email: teacher.email,
            error: errorMessage
          })
        }

        // Cập nhật progress
        const progress = Math.round(((i + 1) / teachers.length) * 100)
        setUploadProgress(progress)
      }

      setUploadResults(results)

      if (results.success > 0) {
        toast.success(`Đã thêm thành công ${results.success} giáo viên`)
        fetchTeachers(pagination.pageNumber, pagination.pageSize)
      }

      if (results.failed > 0) {
        toast.warning(`${results.failed} giáo viên không thể thêm`)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Lỗi khi xử lý file Excel: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const beforeUpload = (file) => {
    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')

    if (!isExcel) {
      toast.error('Chỉ chấp nhận file Excel (.xlsx, .xls)')
      return false
    }

    handleFileUpload(file)
    return false // Ngăn upload tự động
  }

  // Tính toán thống kê
  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.status === 'Active').length,
    totalCourses: teachers.reduce((sum, t) => sum + (t.totalCourses || 0), 0),
    averageRating: teachers.length > 0
      ? (teachers.reduce((sum, t) => sum + (t.rating || 0), 0) / teachers.length).toFixed(1)
      : 0
  }

  const normalizeFullName = (name) => {
    return name
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  const formatSchoolName = (name) => {
    if (!name) return '';

    const upperWords = ['THPT', 'THCS'];

    const words = name
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map(w => {
        const upper = w.toUpperCase();
        if (upperWords.includes(upper)) return upper; // giữ nguyên dạng viết hoa đặc biệt
        return w.charAt(0).toUpperCase() + w.slice(1); // viết hoa chữ đầu
      });

    if (words[0] !== "Trường") {
      words.unshift("Trường");
    }

    return words.join(' ');
  };

  // columns cho Table
  const columns = [
    {
      title: 'Giáo viên',
      key: 'teacher',
      render: (_, teacher) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm font-medium">
              {teacher.fullName?.charAt(0) || 'T'}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{teacher.fullName}</div>
            {teacher.teacherId && (
              <div className="text-xs text-gray-500">ID: {teacher.teacherId}</div>
            )}
          </div>
        </div>
      ),
    },

    {
      title: 'Môn học',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject) => <Tag color="blue">{subject || 'N/A'}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusBadge(status),
    },
    {
      title: 'Khóa học',
      key: 'courses',
      render: (_, record) => (
        <div className="text-sm text-gray-900">
          {record.courses.length || 0} khóa học
        </div>
      ),
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <StarOutlined className="text-yellow-400" />
          <span className="text-sm font-medium text-gray-900">
            {record.rating ? record.rating.toFixed(1) : 'N/A'}
          </span>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined className="!text-blue-500 !text-lg hover:!text-blue-400 active:!text-blue-600"/>}
              onClick={() => handleViewTeacher(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="link"
              icon={<EditOutlined className="!text-yellow-500 !text-lg hover:!text-yellow-400 active:!text-yellow-600"/>}
              onClick={() => handleEditTeacher(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // const data = 

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
        <div className="flex gap-2">
          <button
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            onClick={handleUploadExcel}
          >
            <FileExcelOutlined />
            <span>Tải lên Excel</span>
          </button>
          <button
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            onClick={handleAddTeacher}
          >
            <PlusOutlined />
            <span>Thêm giáo viên</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Tổng giáo viên</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Đang hoạt động</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.totalCourses}</div>
          <div className="text-sm text-gray-600">Tổng khóa học</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.averageRating}</div>
          <div className="text-sm text-gray-600">Đánh giá trung bình</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Input
            className="search-input"
            size="large"
            placeholder="ìm kiếm theo tên, email, số điện thoại hoặc môn học..."
            prefix={<SearchOutlined className="search-icon" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
          <Select
            value={filterSubject}
            onChange={(value) => setFilterSubject(value)}
            placeholder="Tất cả môn học"
            style={{ width: 200, textAlign: 'center' }}
            allowClear
          >
            <Select.Option value="all">Tất cả môn học</Select.Option>
            {getUniqueSubjects().map(subject => (
              <Select.Option key={subject} value={subject}>{subject}</Select.Option>
            ))}
          </Select>
          <Select
            value={filterStatus}
            onChange={(value) => setFilterStatus(value)}
            placeholder="Tất cả trạng thái"
            style={{ width: 200, textAlign: 'center' }}
            allowClear
          >
            <Select.Option value="all">Tất cả trạng thái</Select.Option>
            <Select.Option value="Active">Hoạt động</Select.Option>
            <Select.Option value="Inactive">Không hoạt động</Select.Option>
            <Select.Option value="Pending">Chờ duyệt</Select.Option>
            <Select.Option value="Suspended">Tạm khóa</Select.Option>
          </Select>
        </div>
      </div>

      {/* Teachers table */}
      <Card>
        <div className="rounded-lg shadow-sm">
          <Table
            columns={columns}
            dataSource={filteredTeachers}
            loading={loading}
            rowKey={(record) => record.profileId || record.id}
            pagination={{ pageSize: 10 }}
            scroll={{ x: "max-content", ...(filteredTeachers.length > 5) ? { y: 75 * 5 } : "" }}
            locale={{
              emptyText: 'Không tìm thấy giáo viên nào'
            }}
          />
        </div>
      </Card>

      {/* View Teacher Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <UserOutlined />
            <span>Chi tiết giáo viên</span>
          </div>
        }
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {selectedTeacher && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-medium">
                  {selectedTeacher.fullName?.charAt(0) || 'T'}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedTeacher.fullName}</h3>
                <p className="text-gray-600">{selectedTeacher.subject}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <div className="flex items-center gap-2 mt-1">
                  <MailOutlined className="!text-gray-400" />
                  <span className="text-gray-900">{selectedTeacher.user.email || 'N/A'}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                <div className="flex items-center gap-2 mt-1">
                  <PhoneOutlined className="!text-gray-400" />
                  <span className="text-gray-900">{selectedTeacher.user.phoneNumber || 'N/A'}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Môn học</label>
                <div className="mt-1">
                  <Tag color="blue">{selectedTeacher.subject || 'N/A'}</Tag>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                <div className="mt-1">
                  {getStatusBadge(selectedTeacher.status)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Số khóa học</label>
                <div className="mt-1 text-gray-900">{selectedTeacher.courses.length || 0}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Đánh giá</label>
                <div className="flex items-center gap-1 mt-1">
                  <StarOutlined className="text-yellow-400" />
                  <span className="text-gray-900">
                    {selectedTeacher.rating ? selectedTeacher.rating.toFixed(1) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Bằng cấp</label>
              <p className="mt-1 text-gray-900">{selectedTeacher.qualification || 'N/A'}</p>
            </div>

            {selectedTeacher.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">Mô tả</label>
                <p className="mt-1 text-gray-900">{selectedTeacher.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Teacher Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <PlusOutlined />
            <span>Thêm giáo viên mới</span>
          </div>
        }
        open={addModalVisible}
        onCancel={handleCancelAdd}
        footer={[
          <Button key="cancel" onClick={handleCancelAdd}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmitAdd}
            loading={submitting}
          >
            Thêm giáo viên
          </Button>
        ]}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input placeholder="user@example.com" />
            </Form.Item>

            <Form.Item
              label="Tên đăng nhập"
              name="userName"
              rules={[
                { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                { min: 6, message: 'Tên đăng nhập phải có ít nhất 6 ký tự' },
                { pattern: /^\S+$/, message: 'Tên đăng nhập không được chứa khoảng trắng' }
              ]}
            >
              <Input placeholder="username" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>

            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[
                { required: true, message: 'Vui lòng nhập họ và tên' },
                { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' }
              ]}
            >
              <Input 
                placeholder="Nguyễn Văn A" 
                onBlur={(e) => {
                  const value = e.target.value;
                  form.setFieldsValue({ fullName: normalizeFullName(value) });
                }}
              />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại' },
                { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
              ]}
            >
              <Input placeholder="0123456789" />
            </Form.Item>

            <Form.Item
              label="Số năm kinh nghiệm"
              name="yearOfExperience"
              rules={[
                { required: true, message: 'Vui lòng nhập số năm kinh nghiệm' },
                { type: 'number', min: 0, max: 50, message: 'Số năm kinh nghiệm phải từ 0 đến 50' }
              ]}
            >
              <InputNumber
                className="w-full"
                placeholder="0"
                min={0}
                max={50}
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Bằng cấp/Chứng chỉ"
            name="qualifications"
          >
            <TextArea
              rows={2}
              placeholder="Ví dụ: Thạc sĩ Toán học, Chứng chỉ IELTS 8.5..."
            />
          </Form.Item>

          <Form.Item
            label="Số giấy phép"
            name="licenseNumber"
          >
            <Input placeholder="Số giấy phép giảng dạy (nếu có)" />
          </Form.Item>

          <Form.Item
            label="Môn học"
            name="subjects"
            rules={[
              { required: true, message: 'Vui lòng nhập môn học' }
            ]}
          >
            <Input 
              placeholder="Ví dụ: Toán, Vật Lý, Tiếng Anh..." 
              onBlur={e => {
                const value = e.target.value
                form.setFieldsValue({ subjects: normalizeFullName(value) })
              }}  
            />
          </Form.Item>

          <Form.Item
            label="Giới thiệu"
            name="bio"
          >
            <TextArea
              rows={3}
              placeholder="Giới thiệu về giáo viên..."
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Đang giảng dạy tại trường"
              name="teachingAtSchool"
            >
              <Input 
                placeholder="Tên trường (nếu có)" 
                onBlur={(e) => {
                  const value = e.target.value;
                  form.setFieldsValue({ teachingAtSchool: formatSchoolName(value) });
                }}
              />
            </Form.Item>

            <Form.Item
              label="Dạy các lớp"
              name="teachAtClasses"
            >
              <Input placeholder="Ví dụ: Lớp 10, 11, 12..." />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Edit Teacher Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EditOutlined />
            <span>Chỉnh sửa thông tin giáo viên</span>
          </div>
        }
        open={editModalVisible}
        onCancel={handleCancelEdit}
        footer={[
          <Button key="cancel" onClick={handleCancelEdit}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmitEdit}
            loading={editing}
          >
            Cập nhật
          </Button>
        ]}
        width={700}
      >
        <Form
          form={editForm}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input placeholder="user@example.com" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phoneNumber"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input placeholder="0123456789" />
          </Form.Item>

          <Form.Item
            label="Môn học"
            name="subjects"
            rules={[
              { required: true, message: 'Vui lòng nhập môn học' }
            ]}
          >
            <Input 
              placeholder="Ví dụ: Toán, Vật Lý, Tiếng Anh..." 
              onBlur={e => {
                const value = e.target.value
                editForm.setFieldsValue({ subjects: normalizeFullName(value) })
              }}  
            />
          </Form.Item>

          <Form.Item
            label="Giới thiệu"
            name="bio"
          >
            <TextArea
              rows={4}
              placeholder="Giới thiệu về giáo viên..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Upload Excel Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileExcelOutlined />
            <span>Tải lên danh sách giáo viên từ Excel</span>
          </div>
        }
        open={uploadModalVisible}
        onCancel={handleCancelUpload}
        footer={[
          <Button key="close" onClick={handleCancelUpload} disabled={uploading}>
            {uploading ? 'Đang xử lý...' : 'Đóng'}
          </Button>
        ]}
        width={700}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Hướng dẫn:</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>File Excel phải có định dạng .xlsx hoặc .xls</li>
              <li>Nếu không có mật khẩu, hệ thống sẽ tự động tạo mật khẩu mặc định</li>
            </ul>
          </div>

          <Upload
            beforeUpload={beforeUpload}
            accept=".xlsx,.xls"
            showUploadList={false}
            disabled={uploading}
          >
            <Button
              icon={<UploadOutlined />}
              size="large"
              block
              disabled={uploading}
              className="h-12"
            >
              {uploading ? 'Đang xử lý...' : 'Chọn file Excel'}
            </Button>
          </Upload>

          {uploading && (
            <div className="space-y-2">
              <Progress percent={uploadProgress} status="active" />
              <p className="text-sm text-gray-600 text-center">
                Đang xử lý file... {uploadProgress}%
              </p>
            </div>
          )}

          {(uploadResults.success > 0 || uploadResults.failed > 0) && (
            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">
                    {uploadResults.success}
                  </div>
                  <div className="text-sm text-green-700">Thành công</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-2xl font-bold text-red-600">
                    {uploadResults.failed}
                  </div>
                  <div className="text-sm text-red-700">Thất bại</div>
                </div>
              </div>

              {uploadResults.errors.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <h4 className="font-semibold text-yellow-900 mb-2">Chi tiết lỗi:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {uploadResults.errors.map((error, index) => (
                      <div key={index} className="text-sm text-yellow-800">
                        <strong>Dòng {error.row}:</strong> {error.name} ({error.email}) - {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Create Verification Modal */}
      {/* <Modal
        title="Tạo yêu cầu kiểm định giáo viên"
        open={createModalOpen}
        onOk={handleSubmitVerification}
        onCancel={handleCancel}
        confirmLoading={createVerifyLoading}
        okText="Tạo yêu cầu"
        cancelText="Hủy"
        width={600}
      >
        <Form
          form={createVerifyForm}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            name="teacherProfileId"
            label="ID Giáo viên"
            rules={[{ required: true, message: 'Vui lòng chọn giáo viên' }]}
            hidden
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập ghi chú (tùy chọn)..."
            />
          </Form.Item>
        </Form>
      </Modal> */}
    </div>
  )
}

export default TeacherManagement


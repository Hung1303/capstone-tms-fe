import { useState, useEffect } from 'react'
import { SearchOutlined, PlusOutlined, DeleteOutlined, UserOutlined, TeamOutlined, ClockCircleOutlined, CheckCircleOutlined, 
         WarningOutlined, StopOutlined, EyeOutlined, EyeInvisibleOutlined, ReloadOutlined} from '@ant-design/icons'
import { PiChalkboardTeacherLight, PiStudentLight } from 'react-icons/pi'
import { Card, Space, Table, Select, Modal, Input, Popconfirm, Typography, Button } from 'antd'
import api from '../../config/axios'
import { RiAdminLine } from 'react-icons/ri'
import { TfiLayoutCtaCenter } from 'react-icons/tfi'
import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { toast } from 'react-toastify'

const { Title, Text } = Typography

const UserManagement = () => {
  const ROLE_META = [
    { key: 'all', label: 'Tất cả', accent: 'from-slate-50 via-slate-50 to-slate-100', border: 'border-slate-200', icon: <TeamOutlined className="!text-slate-600" /> },
    { key: 'Admin', label: 'Quản trị viên', accent: 'from-rose-50 via-rose-50 to-rose-100', border: 'border-rose-200', icon: <RiAdminLine className="text-rose-500 text-xl" /> },
    { key: 'Inspector', label: 'Giám định viên', accent: 'from-orange-50 via-amber-50 to-orange-100', border: 'border-orange-200', icon: <UserOutlined className="!text-orange-500" /> },
    { key: 'Center', label: 'Trung tâm', accent: 'from-purple-50 via-purple-50 to-purple-100', border: 'border-purple-200', icon: <TfiLayoutCtaCenter className="text-purple-500" /> },
    { key: 'Teacher', label: 'Giáo viên', accent: 'from-green-50 via-green-50 to-emerald-100', border: 'border-green-200', icon: <PiChalkboardTeacherLight className="text-green-600 text-xl" /> },
    { key: 'Parent', label: 'Phụ huynh', accent: 'from-yellow-50 via-amber-50 to-yellow-100', border: 'border-yellow-200', icon: <UserOutlined className="!text-amber-500" /> },
    { key: 'Student', label: 'Học sinh', accent: 'from-blue-50 via-sky-50 to-blue-100', border: 'border-sky-200', icon: <PiStudentLight className="text-sky-600 text-xl" /> },
  ]

  const initialFormData = {
		email: "",
		userName: "",
		password: "",
		fullName: "",
		phoneNumber: ""
	}

	const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [openModalAdd, setOpenModalAdd] = useState(false)
  const [activeRole, setActiveRole] = useState('all')
  const [roleStats, setRoleStats] = useState({
    all: 0,
    Admin: 0,
    Inspector: 0,
    Center: 0,
    Teacher: 0,
    Parent: 0,
    Student: 0
  })
  const [statsLoading, setStatsLoading] = useState(false)
  const STATUS_LIST = [ 'Pending', 'Active', 'Suspended', 'Deactivated' ]
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    total: 0,
  });


  // ===== Columns =====
  const columns = [
    {
      title: 'Tài khoản',
      dataIndex: 'account',
      key: 'acount',
      width: 300,
      render: (account) => {
        const color = {
          Admin: { bg: 'bg-red-200', text: 'text-red-600' },
          Teacher: { bg: 'bg-green-200', text: 'text-green-600'},
          Student: { bg: 'bg-blue-200', text: 'text-blue-600' },
          Parent: { bg: 'bg-yellow-200', text: 'text-yellow-600' },
          Center: { bg: 'bg-purple-200', text: 'text-purple-600' },
          Inspector: { bg: 'bg-orange-200', text: 'text-orange-600'}
        }
        const roleColor = color[account.role] || { bg: 'bg-gray-200', text: 'text-gray-600' }

        return (
          <div className="flex items-center">
            <div className={`w-10 h-10 ${roleColor.bg} rounded-full flex items-center justify-center`}>
              <span className={`${roleColor.text} font-medium`}>
                {account.fullName.charAt(0)}
              </span>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">{account.fullName}</div>
              <div className="text-sm text-gray-500">{account.email}</div>
            </div>
          </div>
        )
      }
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      align: 'center',
      width: 180,
      render: (role) => {
        const background = {
          Admin: 'bg-red-100',
          Teacher: 'bg-green-100',
          Student: 'bg-blue-100',
          Parent: 'bg-yellow-100',
          Center: 'bg-purple-100',
          Inspector: 'bg-orange-100'
        }

        return (
          <div className={`inline-flex items-center gap-2 ${background[role]} w-fit px-2 py-1 rounded`}>
            {getRoleIcon(role)}
            <span>{getRoleLabel(role)}</span> 
          </div>
        )
      }
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      align: 'center'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 165,
      align: 'center',
      render: (status) => getStatusBadge(status)
    },
    {
      title: 'Cập nhật trạng thái',
      key: 'updateStatus',
      width: 200,
      align: 'center',
      render: (_, record) => {
        console.log("record", record)
        return (
          <Select
            value={record.status}
            onChange={(val) => handleChangeStatus(record.key, val)}
            style={{ width: 155, textAlign: "center" }}
            disabled={record.role === "Center" ? true : false}
            options={[
              { value: 'Pending', label: 'Chờ duyệt', disabled: true },
              { value: 'Active', label: 'Hoạt động' },
              { value: 'Suspended', label: 'Tạm khóa' },
              { value: 'Deactivated', label: 'Ngừng hoạt động' },
            ]}
          />
        )
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center justify-center gap-2">
          <Popconfirm
            title="Xác nhận xóa"
            description={`Bạn có chắc chắn muốn xóa người dùng "${record.account.fullName}"?`}
            onConfirm={() => handleDeleteUser(record.key)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
            icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer p-1 text-lg text-red-600 hover:bg-red-50 rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <DeleteOutlined />
            </motion.button>
          </Popconfirm>
        </div>
      )
    }
  ]

  // ===== Datas =====
  console.log("users", users)
  const data = users.map(user => ({
    key: user.id,
    account: { fullName: user.fullName, email: user.email, role: user.role },
    role: user.role,
    phone: user.phoneNumber,
    status: user.status,
  }))

  const filteredData = data.filter(item => {
    if (!searchTerm.trim()) return true
    const keyword = searchTerm.trim().toLowerCase()
    return (
      item.account.fullName.toLowerCase().includes(keyword) ||
      item.account.email.toLowerCase().includes(keyword)
    )
  })

  const deriveCount = (payload) => {
    if (!payload) return 0
    if (Array.isArray(payload)) return payload.length
    if (Array.isArray(payload.users)) return payload.users.length
    if (typeof payload.totalCount === 'number') return payload.totalCount
    return 0
  }

  const fetchRoleStats = async () => {
    setStatsLoading(true)
    try {
      const [ centersRes, teachersRes, parentsRes, studentsRes, adminsRes, inspectorsRes ] = await Promise.all([
        api.get('/Users/Centers'),
        api.get('/Users/Teachers'),
        api.get('/Users/Parents'),
        api.get('/Users/Students'),
        api.get('/Users/Users?userRole=Admin'),
        api.get('/Users/Users?userRole=Inspector'),
      ])

      const counts = {
        Center: deriveCount(centersRes.data),
        Teacher: deriveCount(teachersRes.data),
        Parent: deriveCount(parentsRes.data),
        Student: deriveCount(studentsRes.data),
        Admin: deriveCount(adminsRes.data),
        Inspector: deriveCount(inspectorsRes.data),
      }

      const totalCount = Object.values(counts).reduce((acc, curr) => acc + curr, 0)
      setRoleStats({
        all: totalCount,
        ...counts,
      })
    } catch (error) {
      console.error('Error fetching role statistics:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchUsers = async (role, pageNumber, pageSize) => {
    setLoading(true)

    const roleParam = role && role !== 'all' ? `&userRole=${role}` : ''
    try {
      const apiResponse = await api.get(`/Users/Users?pageNumber=${pageNumber}&pageSize=${pageSize}${roleParam}`)
      console.log('API Response:', apiResponse.data)
      const payload = apiResponse.data
      setUsers(payload.users || [])
      setPagination({
        pageNumber,
        pageSize,
        total: payload.totalCount || (payload.users?.length ?? 0),
      })
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoleStats()
    fetchUsers(activeRole, pagination.pageNumber, pagination.pageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChangeStatus = async (userId, newStatus) => {
    setLoading(true)

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u))

    try {
      const statusValue = STATUS_LIST.indexOf(newStatus)
      const apiResponse = await api.put(`/Users/Status/${userId}?status=${statusValue}`)
      console.log('Change status response:', apiResponse.data)
      toast.success('Cập nhật trạng thái thành công')
    } catch (error) {
      console.error('Change status failed:', error)
      toast.error('Cập nhật trạng thái thất bại')
    } finally {
      fetchUsers(activeRole, pagination.pageNumber, pagination.pageSize)
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    setLoading(true)
    console.log("Deleting user with ID:", userId) 
    try {
      const apiResponse = await api.delete(`/Users/${userId}`)
      toast.success('Xóa người dùng thành công')
      console.log('Delete user response:', apiResponse.data)
      await fetchUsers(activeRole, pagination.pageNumber, pagination.pageSize)
      await fetchRoleStats()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Xóa người dùng thất bại')
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin': return <RiAdminLine className="text-lg" />
      case 'Staff': return <TeamOutlined className="text-blue-500" />
      case 'Teacher': return <PiChalkboardTeacherLight className="text-lg" />
      case 'Student': return <PiStudentLight  className="text-lg" />
      case 'Parent': return <UserOutlined className="text-[15px]" />
      case 'Center': return <TfiLayoutCtaCenter  className="text-lg" />
      case 'Inspector': return <TeamOutlined className="text-[15px]" />
      default: return <UserOutlined />
    }
  }

  const getRoleLabel = (role) => {
    const labels = {
      Admin: 'Quản trị viên',
      Staff: 'Nhân viên',
      Teacher: 'Giáo viên',
      Student: 'Học sinh',
      Parent: 'Phụ huynh',
      Center: 'Trung tâm',
      Inspector: 'Giám định viên'
    }
    return labels[role] || role
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      Active: {
        label: "Hoạt động", 
        className: "bg-green-100 text-green-800",
        icon: <CheckCircleOutlined />
      },
      Pending: {
        label: "Chờ duyệt", 
        className: "bg-yellow-100 text-yellow-800",
        icon: <ClockCircleOutlined />
      },
      Suspended: {
        label: "Tạm khóa", 
        className: "bg-orange-100 text-orange-800",
        icon: <WarningOutlined />
      },
      Deactivated: {
        label: "Ngừng hoạt động", 
        className: "bg-red-100 text-red-800",
        icon: <StopOutlined />
      }
    }

    const config = statusConfig[status] || {
      label: status || "Không rõ",
      className: "bg-gray-100 text-gray-800",
      icon: <ClockCircleOutlined />
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    )
  }

  const handleChange = (field, value) => {
		setFormData({
			...formData,
			[field]: value
		})
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors({
				...errors,
				[field]: ""
			})
		}
	}  

  const handleSelectRole = (roleKey) => {
    setActiveRole(roleKey)
    setPagination((prev) => ({
      ...prev,
      pageNumber: 1,
    }))
    fetchUsers(roleKey, 1, pagination.pageSize)
  }

  const normalizeFullName = (name) => {
    return name
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên"
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = "Họ tên phải có ít nhất 2 ký tự"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại"
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ"
    }

    if (!formData.userName.trim()) {
      newErrors.userName = "Vui lòng nhập tên tài khoản"
    } else if (formData.userName.length < 6) {
      newErrors.userName = "Tên tài khoản phải có ít nhất 6 ký tự"
    } else if (/\s/.test(formData.userName)) {
      newErrors.userName = "Tên tài khoản không được chứa khoảng trắng"
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu"
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCancel = () => {
    setOpenModalAdd(false)
    setFormData(initialFormData)
    setErrors({})
  }

  const handleOk = async () => {
		if (!validateForm()) {
      console.log("validateForm", errors)
			return
		}

		setLoading(true)
    console.log("formData:", formData)

		try {
			const apiResponse = await api.post("/Users/Inspector", formData)
			console.log("apiResponse create inspector", apiResponse)
			toast.success("Tạo thành công.")
      setOpenModalAdd(false)
      setFormData(initialFormData)
      setErrors({})
		} catch (error) {
			console.log("error create inspector:", error)

			if (error.response && error.response.data) {
        const message = error.response.data;

        if (message.includes("the full name")) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            fullName: "Phải viết hoa chữ cái đầu mỗi từ"
          }))
        }
        else if (message.includes("Duplicate email")) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            email: "Email đã được sử dụng"
          }))
        }
        else if (message.includes("Duplicate Username")) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            userName: "Tên tài khoản đã được sử dụng"
          }))
        }
        else if (message.includes("Duplicate Phonenumber")) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            phoneNumber: "Số điện thoại đã được sử dụng"
          }))
        }
      }

			toast.error("Thất bại. Vui lòng thử lại")
		} finally {
			setLoading(false)
      await fetchUsers(activeRole, pagination.pageNumber, pagination.pageSize)
      await fetchRoleStats()
		}
	}

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {/* Header */}
      <Card className="!bg-gradient-to-r !from-orange-500 !to-purple-600 !rounded-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Title level={2} className="!text-white !m-0 !font-bold">
              <UserOutlined /> Quản lý tài khoản
            </Title>
            <Text className="!text-white/90 !text-base">
              Theo dõi vai trò, trạng thái và thao tác nhanh với tài khoản.
            </Text>
          </div>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpenModalAdd(true)}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg shadow hover:shadow-xl transition-shadow"
          >
            <PlusOutlined />
            <span>Tạo NV Giám Định</span>
          </motion.button>
        </div>
      </Card>

      {/* Role Highlights */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ROLE_META.map(role => {
            const isActive = activeRole === role.key
            const count = roleStats[role.key] ?? 0
            return (
              <button
                key={role.key}
                onClick={() => handleSelectRole(role.key)}
                className={`relative group rounded-xl border ${role.border} bg-gradient-to-br ${role.accent} px-4 py-3 text-left transition-all duration-200 ${isActive ? 'ring-2 ring-offset-2 ring-orange-400 shadow-md' : 'hover:-translate-y-0.5 hover:shadow'} `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/70 ${isActive ? 'shadow-inner' : ''}`}>
                      {role.icon}
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Vai trò</p>
                      <p className="text-base font-semibold text-gray-900">{role.label}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{statsLoading ? '...' : count}</span>
                </div>
                <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
                  <span className={`inline-block h-2 w-2 rounded-full ${isActive ? 'bg-orange-500' : 'bg-gray-300'}`} />
                  {isActive ? 'Đang xem' : 'Nhấn để xem chi tiết'}
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Filters */}
      <Card className="shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Input
            className="search-input"
            size="large"
            placeholder="Tìm kiếm theo tên hoặc email..."
            prefix={<SearchOutlined className="search-icon" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
          <span className="text-sm text-gray-500 whitespace-nowrap">
            Vai trò đang xem: <span className="font-semibold text-gray-800">{ROLE_META.find(r => r.key === activeRole)?.label}</span>
          </span>
          <Button
            type="primary"
            onClick={() => {
              setSearchTerm('')
              fetchUsers(activeRole, pagination.pageNumber, pagination.pageSize)
            }}
            className="group"
          >
            <ReloadOutlined className="group-hover:animate-spin" />
            Làm mới
          </Button>
        </div>
        <div className="mt-6 rounded-lg shadow-sm">
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="key"
            loading={loading}
            pagination={{
              current: pagination.pageNumber,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`,
              onChange: (page, pageSize) => fetchUsers(activeRole, page, pageSize),
              className: "!mr-2"
            }}
            scroll={{ x: "max-content", y: 75 * 5 }}
          />
        </div>
      </Card>

      {/* Add User Modal */}
      <Modal
        title={<span className="text-xl text-center font-semibold text-gray-800">Thêm tài khoản NV Giám định</span>}
        open={openModalAdd}
        onCancel={handleCancel}
        onOk={handleOk}
        confirmLoading={loading}
        okText="Tạo"
        cancelText="Hủy"
      >
        <div className="max-h-[70vh] overflow-y-auto pl-2 pr-2 mt-7">
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email :</label>
                <Input
									name="email"
									type="email"
									value={formData.email}
									onChange={(e) => handleChange("email", e.target.value)}
									className="!w-full !px-4 !py-2 !border-2"
									placeholder="user@example.com"
								/>
								{errors.email &&
									<p className="mt-1 text-sm text-red-600">{errors.email}</p>
								}
              </div>

              <div>
								<label className="block text-sm font-medium text-slate-700 mb-2">Họ và tên :</label>
								<Input
									name="fullName"
									type="text"
									value={formData.fullName}
									onChange={(e) => handleChange("fullName", e.target.value)}
									onBlur={() => handleChange("fullName", normalizeFullName(formData.fullName))}
									className="!w-full !px-4 !py-2 !border-2"
									placeholder="--- Nguyễn Văn A ---"
								/>
								{errors.fullName &&
									<p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
								}
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">Tên đăng nhập :</label>
								<Input
									name="userName"
									type="text"
									value={formData.userName}
									onChange={(e) => handleChange("userName", e.target.value)}
									className="!w-full !px-4 !py-2 !border-2"
									placeholder="Nhập tên đăng nhập"
								/>
								{errors.userName &&
									<p className="mt-1 text-sm text-red-600">{errors.userName}</p>
								}
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu :</label>
								<div className="relative">
									<Input
										name="password"
										type={showPassword ? "text" : "password"}
										value={formData.password}
										onChange={(e) => handleChange("password", e.target.value)}
										className="!w-full !px-4 !py-2 !border-2"
										placeholder="*********"
									/>
									<motion.button
										type="button"
										whileHover={{ scale: 1.2 }}
										whileTap={{ scale: 0.98 }}
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
									>
										{showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
									</motion.button>
								</div>
								{errors.password &&
									<p className="mt-1 text-sm text-red-600">{errors.password}</p>
								}
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại :</label>
								<Input
									name="phoneNumber"
									type="text"
                  maxLength={10}
									value={formData.phoneNumber}
									onChange={(e) => handleChange("phoneNumber", e.target.value)}
									className="!w-full !px-4 !py-2 !border-2"
									placeholder="098xxxxxxx"
								/>
								{errors.phoneNumber &&
									<p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
								}
							</div>
            </div>
          </form>
        </div>
      </Modal>
    </Space>
  )
}

export default UserManagement

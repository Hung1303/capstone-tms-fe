import { useState, useEffect } from 'react'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, TeamOutlined, ClockCircleOutlined, CheckCircleOutlined, 
         WarningOutlined, StopOutlined } from '@ant-design/icons'
import { PiChalkboardTeacherLight, PiStudentLight } from 'react-icons/pi'
import { Card, Space, Table, Tooltip, Select } from 'antd'
import api from '../../config/axios'
import { RiAdminLine } from 'react-icons/ri'
import { TfiLayoutCtaCenter } from 'react-icons/tfi'
import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { toast } from 'react-toastify'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState([])
  const STATUS_LIST = [ 'Pending', 'Active', 'Suspended', 'Deactivated' ]
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 5,
    total: 0,
  });


  // ===== Columns =====
  const columns = [
    {
      title: 'Tài khoản',
      dataIndex: 'account',
      key: 'acount',
      width: 300,
      render: (account) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium">
              {account.fullName.charAt(0)}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{account.fullName}</div>
            <div className="text-sm text-gray-500">{account.email}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const background = {
          Admin: 'bg-red-100',
          Staff: 'bg-blue-100',
          Teacher: 'bg-green-100',
          Student: 'bg-gray-100',
          Parent: 'bg-yellow-100',
          Center: 'bg-purple-100',
          Inspector: 'bg-orange-100'
        }

        return (
          <div className={`flex items-center gap-2 ${background[role]} w-fit px-2 py-1 rounded`}>
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
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 165,
      render: (status) => getStatusBadge(status)
    },
    {
      title: 'Cập nhật trạng thái',
      key: 'updateStatus',
      width: 200,
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
      render: () => (
        <div className="flex items-center gap-2">
          <Tooltip title="Chỉnh sửa">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 text-lg text-blue-600 hover:bg-blue-50 rounded"
            >
              <EditOutlined />
            </motion.button>
          </Tooltip>
          <Tooltip title="Xóa">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 text-lg text-red-600 hover:bg-red-50 rounded"
            >
              <DeleteOutlined />
            </motion.button>
          </Tooltip>
        </div>
      )
    }
  ]

  // ===== Datas =====
  const data = users.map(user => ({
    key: user.id,
    account: { fullName: user.fullName, email: user.email},
    role: user.role,
    phone: user.phoneNumber,
    status: user.status,
  }))

  const fetchUsers = async (pageNumber, pageSize) => {
    setLoading(true)

    try {
      const apiResponse = await api.get(`/Users/Users?pageNumber=${pageNumber}&pageSize=${pageSize}`)
      console.log('API Response:', apiResponse.data)
      setUsers(apiResponse.data.users)
      setPagination({
        pageNumber: pageNumber,
        pageSize: pageSize,
        total: apiResponse.data.totalCount,
      })
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(pagination.pageNumber, pagination.pageSize)
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
      fetchUsers(pagination.pageNumber, pagination.pageSize)
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

    const config = statusConfig[status]
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    )
  }

  

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {/* Header */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h2>
            <p className="text-gray-600">Quản lý tài khoản người dùng trong hệ thống</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            <PlusOutlined />
            <span>Thêm người dùng</span>
          </button>
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
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="Admin">Quản trị viên</option>
              <option value="Staff">Nhân viên</option>
              <option value="Teacher">Giáo viên</option>
              <option value="Student">Học sinh</option>
              <option value="Parent">Phụ huynh</option>
              <option value="Center">Trung tâm</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Content */}
      <Card>
        <Table
          rowSelection={{
            selectedRowKeys: selectedUsers,
            onChange: (selectedRowKeys) => setSelectedUsers(selectedRowKeys),
          }}
          columns={columns}
          dataSource={data}
          rowKey="key"
          loading={loading}
          pagination={{
            current: pagination.pageNumber,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20'],
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`,
            onChange: (page, pageSize) => fetchUsers(page, pageSize),
          }}
          scroll={{ x: "max-content", y: pagination.pageSize === 5 ? undefined : 75 * 5 }}
        />
      </Card>
    </Space>
  )
}

export default UserManagement

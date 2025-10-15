import { useState, useEffect } from 'react'
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined
} from '@ant-design/icons'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState([])

  useEffect(() => {
    // Mock data - trong thực tế sẽ gọi API
    setUsers([
      {
        id: 1,
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@email.com',
        role: 'student',
        status: 'active',
        joinDate: '2024-01-15',
        lastLogin: '2024-01-20',
        center: 'Trung tâm ABC'
      },
      {
        id: 2,
        name: 'Trần Thị B',
        email: 'tranthib@email.com',
        role: 'teacher',
        status: 'active',
        joinDate: '2024-01-10',
        lastLogin: '2024-01-19',
        center: 'Trung tâm XYZ'
      },
      {
        id: 3,
        name: 'Lê Văn C',
        email: 'levanc@email.com',
        role: 'admin',
        status: 'active',
        joinDate: '2024-01-01',
        lastLogin: '2024-01-20',
        center: 'Hệ thống'
      },
      {
        id: 4,
        name: 'Phạm Thị D',
        email: 'phamthid@email.com',
        role: 'staff',
        status: 'inactive',
        joinDate: '2024-01-05',
        lastLogin: '2024-01-15',
        center: 'Trung tâm DEF'
      }
    ])
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <UserOutlined className="text-red-500" />
      case 'staff': return <TeamOutlined className="text-blue-500" />
      case 'teacher': return <BookOutlined className="text-green-500" />
      case 'student': return <UserOutlined className="text-gray-500" />
      default: return <UserOutlined />
    }
  }

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Quản trị viên',
      staff: 'Nhân viên',
      teacher: 'Giáo viên',
      student: 'Học sinh'
    }
    return labels[role] || role
  }

  const getStatusBadge = (status) => {
    return status === 'active' 
      ? <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Hoạt động</span>
      : <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Không hoạt động</span>
  }

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length 
        ? [] 
        : filteredUsers.map(user => user.id)
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Filters */}
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
            <option value="admin">Quản trị viên</option>
            <option value="staff">Nhân viên</option>
            <option value="teacher">Giáo viên</option>
            <option value="student">Học sinh</option>
          </select>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trung tâm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đăng nhập cuối
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <span className="text-sm text-gray-900">{getRoleLabel(user.role)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.center}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <EditOutlined />
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <DeleteOutlined />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Hiển thị {filteredUsers.length} trong tổng số {users.length} người dùng
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
            Trước
          </button>
          <span className="px-3 py-1 bg-orange-500 text-white rounded text-sm">1</span>
          <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
            Sau
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserManagement

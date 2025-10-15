import { useState, useEffect } from 'react'
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'

const CenterManagement = () => {
  const [centers, setCenters] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    // Mock data - trong thực tế sẽ gọi API
    setCenters([
      {
        id: 1,
        name: 'Trung tâm ABC',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        phone: '0123456789',
        email: 'contact@abc.com',
        status: 'approved',
        licenseNumber: 'LIC001',
        joinDate: '2024-01-15',
        totalStudents: 150,
        totalTeachers: 12,
        rating: 4.8
      },
      {
        id: 2,
        name: 'Trung tâm XYZ',
        address: '456 Đường XYZ, Quận 2, TP.HCM',
        phone: '0987654321',
        email: 'info@xyz.com',
        status: 'pending',
        licenseNumber: 'LIC002',
        joinDate: '2024-01-20',
        totalStudents: 89,
        totalTeachers: 8,
        rating: 4.5
      },
      {
        id: 3,
        name: 'Trung tâm DEF',
        address: '789 Đường DEF, Quận 3, TP.HCM',
        phone: '0555666777',
        email: 'hello@def.com',
        status: 'rejected',
        licenseNumber: 'LIC003',
        joinDate: '2024-01-10',
        totalStudents: 0,
        totalTeachers: 0,
        rating: 0
      }
    ])
  }, [])

  const filteredCenters = centers.filter(center => {
    const matchesSearch = center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         center.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || center.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { 
        label: 'Đã duyệt', 
        className: 'bg-green-100 text-green-800',
        icon: <CheckCircleOutlined />
      },
      pending: { 
        label: 'Chờ duyệt', 
        className: 'bg-yellow-100 text-yellow-800',
        icon: <ClockCircleOutlined />
      },
      rejected: { 
        label: 'Từ chối', 
        className: 'bg-red-100 text-red-800',
        icon: <ExclamationCircleOutlined />
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

  const handleApprove = (centerId) => {
    setCenters(prev => prev.map(center => 
      center.id === centerId 
        ? { ...center, status: 'approved' }
        : center
    ))
  }

  const handleReject = (centerId) => {
    setCenters(prev => prev.map(center => 
      center.id === centerId 
        ? { ...center, status: 'rejected' }
        : center
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý trung tâm</h2>
          <p className="text-gray-600">Quản lý các trung tâm dạy kèm đăng ký</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
          <PlusOutlined />
          <span>Thêm trung tâm</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{centers.length}</div>
          <div className="text-sm text-gray-600">Tổng trung tâm</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {centers.filter(c => c.status === 'approved').length}
          </div>
          <div className="text-sm text-gray-600">Đã duyệt</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {centers.filter(c => c.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Chờ duyệt</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">
            {centers.filter(c => c.status === 'rejected').length}
          </div>
          <div className="text-sm text-gray-600">Từ chối</div>
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
                placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
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
            <option value="approved">Đã duyệt</option>
            <option value="pending">Chờ duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>

      {/* Centers table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trung tâm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin liên hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thống kê
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đánh giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCenters.map((center) => (
                <tr key={center.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{center.name}</div>
                      <div className="text-sm text-gray-500">{center.address}</div>
                      <div className="text-xs text-gray-400">Mã giấy phép: {center.licenseNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{center.phone}</div>
                    <div className="text-sm text-gray-500">{center.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(center.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {center.totalStudents} học sinh
                    </div>
                    <div className="text-sm text-gray-500">
                      {center.totalTeachers} giáo viên
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm font-medium">{center.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <EyeOutlined />
                      </button>
                      <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                        <EditOutlined />
                      </button>
                      {center.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(center.id)}
                            className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                          >
                            Duyệt
                          </button>
                          <button 
                            onClick={() => handleReject(center.id)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
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
          Hiển thị {filteredCenters.length} trong tổng số {centers.length} trung tâm
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

export default CenterManagement

import { useState, useEffect } from 'react'
import { Table, Button, Modal, Space, Empty, Alert, Popconfirm, message, Input, Typography } from 'antd'
import { BookOutlined, CheckOutlined, CloseOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import api from '../../config/axios'
import { useAuth } from '../../contexts/AuthContext'

const { Text } = Typography

const ApprovalCourseTab = () => {
  const { user } = useAuth()
  const [approvals, setApprovals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedRecord, setSelectedRecord] = useState(null)
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false)
  const [decisionReason, setDecisionReason] = useState('')
  const [decidingId, setDecidingId] = useState(null)
  const [decidingAction, setDecidingAction] = useState(null) // 'approve' or 'reject'

  // Pagination State
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  // Search State
  const [searchTerm, setSearchTerm] = useState('')
  const [allApprovals, setAllApprovals] = useState([]) // Store all data for client-side search

  // 1. Fetch danh sách khi mount
  useEffect(() => {
    fetchApprovals(1, pagination.pageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 2. Fetch all data when searching
  useEffect(() => {
    if (searchTerm) {
      fetchAllApprovals()
    } else {
      // Reset to normal pagination when clearing search
      fetchApprovals(1, pagination.pageSize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  const fetchApprovals = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/ApprovalRequests', {
        params: {
          pageNumber: page,
          pageSize: pageSize
        }
      })
      
      const { records, totalCount } = response.data || {}
      
      setApprovals(records || [])
      setPagination(prev => ({
        ...prev,
        current: page,
        pageSize: pageSize,
        total: totalCount || 0
      }))

    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách duyệt khóa học')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllApprovals = async () => {
    try {
      setLoading(true)
      setError(null)
      // Fetch a large number to get all records (adjust based on your needs)
      const response = await api.get('/ApprovalRequests', {
        params: {
          pageNumber: 1,
          pageSize: 1000 // Adjust this based on your typical data size
        }
      })
      
      const { records } = response.data || {}
      setAllApprovals(records || [])
      setPagination(prev => ({
        ...prev,
        current: 1,
        total: records?.length || 0
      }))

    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách duyệt khóa học')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTableChange = (newPagination) => {
    if (searchTerm) {
      // Client-side pagination when searching
      setPagination(prev => ({
        ...prev,
        current: newPagination.current,
        pageSize: newPagination.pageSize
      }))
    } else {
      // Server-side pagination when not searching
      fetchApprovals(newPagination.current, newPagination.pageSize)
    }
  }

  // Filter approvals based on search term
  const filteredApprovals = searchTerm 
    ? allApprovals.filter(approval => {
        const searchLower = searchTerm.toLowerCase()
        return (
          approval.courseTitle?.toLowerCase().includes(searchLower) ||
          approval.notes?.toLowerCase().includes(searchLower) ||
          approval.decidedBy?.toLowerCase().includes(searchLower)
        )
      })
    : approvals

  // Client-side pagination for search results
  const paginatedApprovals = searchTerm 
    ? filteredApprovals.slice(
        (pagination.current - 1) * pagination.pageSize,
        pagination.current * pagination.pageSize
      )
    : filteredApprovals

  // 2. Chuẩn bị Modal
  const handleApprove = (record) => {
    setSelectedRecord(record)
    setDecidingAction('approve')
    setDecisionReason('')
    setDecidingId(record.id)
    setModalVisible(true)
  }

  const handleReject = (record) => {
    setSelectedRecord(record)
    setDecidingAction('reject')
    setDecisionReason('')
    setDecidingId(record.id)
    setModalVisible(true)
  }

  // 3. API Duyệt/Từ chối (PUT) - Đã sửa theo Swagger mới
  const submitDecision = async () => {
    try {
      setLoading(true)
      
      // Mapping Decision theo Enum: 0=Pending, 1=Approved, 2=Rejected
      const decisionValue = decidingAction === 'approve' ? 1 : 2

      // Config cho Query Params
      const config = {
        params: {
          reviewerUserId: user?.userId, // Query param: reviewerUserId
          decision: decisionValue       // Query param: decision (int)
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }

      // Body là ghi chú (String)
      const body = decisionReason || ''
      
      console.log(`Submitting PUT to /ApprovalRequests/${decidingId}`)
      console.log('Params:', config.params)
      console.log('Body (Notes):', body)

      // Endpoint: PUT /api/ApprovalRequests/{approvalRequestId}
      await api.put(`/ApprovalRequests/${decidingId}`, body, config)
      
      message.success(`Đã ${decidingAction === 'approve' ? 'duyệt' : 'từ chối'} yêu cầu thành công!`)
      setModalVisible(false)
      fetchApprovals(pagination.current, pagination.pageSize) // Load lại bảng
    } catch (err) {
      console.error('Submit error:', err)
      message.error('Lỗi khi xử lý: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  // 4. API Xóa yêu cầu (DELETE)
  const handleDeleteRequest = async (id) => {
    try {
        setLoading(true)
        // Endpoint: DELETE /api/ApprovalRequests/{approvalRequestId}
        await api.delete(`/ApprovalRequests/${id}`)
        
        message.success('Đã xóa yêu cầu duyệt thành công')
        fetchApprovals(pagination.current, pagination.pageSize) // Load lại bảng
    } catch (err) {
        console.error('Delete error:', err)
        message.error('Lỗi khi xóa: ' + (err.response?.data?.message || err.message))
    } finally {
        setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Tên khóa học',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
      width: 200,
      fixed: 'left',
      render: (text) => (
        <Space>
          <BookOutlined style={{ color: '#1890ff' }} />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'decision',
      key: 'decision',
      width: 120,
      render: (status) => {
        // Map status text trả về từ GET API
        const statusMap = {
          'Pending': { color: '#faad14', text: 'Chờ duyệt', bg: '#fffbe6', border: '#ffe58f' },
          'Approved': { color: '#52c41a', text: 'Đã duyệt', bg: '#f6ffed', border: '#b7eb8f' },
          'Rejected': { color: '#f5222d', text: 'Từ chối', bg: '#fff1f0', border: '#ffa39e' }
        }
        
        const config = statusMap[status] || { color: '#999', text: status || 'Không rõ', bg: '#f5f5f5', border: '#d9d9d9' }
        
        return (
          <span style={{ 
            color: config.color, 
            backgroundColor: config.bg,
            border: `1px solid ${config.border}`,
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            {config.text}
          </span>
        )
      }
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      width: 200,
      ellipsis: true,
      render: (text) => text || <span className="text-gray-400 italic">Không có</span>
    },
    {
      title: 'Người duyệt',
      dataIndex: 'decidedBy',
      key: 'decidedBy',
      width: 150,
      render: (text) => (
        <Space>
          <UserOutlined style={{ color: '#52c41a' }} />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => {
        if (!date) return '-'
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        })
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => {
        // Kiểm tra status (thường GET trả về text "Pending", "Approved"...)
        const isPending = record.decision === 'Pending'
        
        return (
          <Space size="small">
            {isPending ? (
              <>
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => handleApprove(record)}
                  className="bg-green-600 hover:bg-green-700 border-green-600"
                >
                  Duyệt
                </Button>
                <Button
                  danger
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => handleReject(record)}
                >
                  Từ chối
                </Button>
              </>
            ) : (
                <span className="text-gray-500 italic text-xs mr-2">Đã xử lý</span>
            )}
            
            <Popconfirm
                title="Xóa yêu cầu"
                description="Bạn có chắc chắn muốn xóa yêu cầu này không?"
                onConfirm={() => handleDeleteRequest(record.id)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >
                <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    size="small"
                />
            </Popconfirm>
          </Space>
        )
      }
    }
  ]

  return (
    <div>
      <div className="flex gap-2 items-center">
        <Input
          className="search-input"
          size="large"
          placeholder="Tìm kiếm theo tên khóa học, ghi chú hoặc người duyệt..."
          prefix={<SearchOutlined className="search-icon" />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />
        <Button 
          type="primary"
          onClick={() => {
            setSearchTerm('')
            fetchApprovals(pagination.current, pagination.pageSize)
          }}
          className="group"
        >
          <ReloadOutlined className="group-hover:animate-spin"/>
          Làm mới
        </Button>
      </div>

      {error && (
        <Alert 
          message="Lỗi hệ thống" 
          description={error} 
          type="error" 
          showIcon 
          className="mb-4" 
          closable 
          onClose={() => setError(null)} 
        />
      )}

      <div className="mt-6 rounded-lg shadow-sm">
        <Table
          columns={columns}
          dataSource={paginatedApprovals}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: searchTerm ? filteredApprovals.length : pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
            pageSizeOptions: ['10', '20', '50', '100'],
            className: "!mr-2"
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          locale={{ 
            emptyText: (
              <Empty 
                description={
                  searchTerm 
                    ? 'Không tìm thấy kết quả nào' 
                    : 'Không có dữ liệu'
                } 
              />
            ) 
          }}
        />
      </div>

      {/* Decision Modal */}
      <Modal
        title={
            <div className="flex items-center gap-2">
                {decidingAction === 'approve' ? <CheckOutlined className="text-green-600"/> : <CloseOutlined className="text-red-600"/>}
                <span>{decidingAction === 'approve' ? 'Xác nhận DUYỆT' : 'Xác nhận TỪ CHỐI'}</span>
            </div>
        }
        open={modalVisible}
        onOk={submitDecision}
        onCancel={() => setModalVisible(false)}
        okText={decidingAction === 'approve' ? 'Duyệt ngay' : 'Xác nhận từ chối'}
        okButtonProps={{ 
            danger: decidingAction === 'reject',
            className: decidingAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''
        }}
        cancelText="Quay lại"
        confirmLoading={loading}
        destroyOnClose
      >
        <div className="space-y-4 py-2">
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Đang xử lý khóa học:</p>
            <p className="font-semibold text-lg text-blue-600">{selectedRecord?.courseTitle}</p>
          </div>

          <div>
            <label className="block font-medium mb-2 text-gray-700">
                {decidingAction === 'approve' ? 'Ghi chú duyệt (tùy chọn):' : 'Lý do từ chối (tùy chọn):'}
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
              rows={4}
              placeholder={decidingAction === 'approve' ? "Nhập ghi chú..." : "Nhập lý do từ chối..."}
              value={decisionReason}
              onChange={(e) => setDecisionReason(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ApprovalCourseTab
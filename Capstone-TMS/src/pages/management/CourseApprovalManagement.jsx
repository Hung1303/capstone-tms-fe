import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Space, Empty, Alert, Popconfirm, message } from 'antd'
import { CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons'
import api from '../../config/axios'
import { useAuth } from '../../contexts/AuthContext'

const CourseApprovalManagement = () => {
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

  // 1. Fetch danh sách (GET)
  useEffect(() => {
    fetchApprovals(pagination.current, pagination.pageSize)
  }, [])

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

  const handleTableChange = (newPagination) => {
    fetchApprovals(newPagination.current, newPagination.pageSize)
  }

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

      // Body là ghi chú (String JSON)
      const body = JSON.stringify(decisionReason)
      
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
      render: (text) => <span className="font-medium text-blue-600">{text}</span>
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
      render: (text) => text || '-'
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
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Duyệt khóa học</h1>
            <p className="text-gray-600">Duyệt hoặc từ chối các khóa học gửi từ trung tâm</p>
        </div>
        <Button onClick={() => fetchApprovals(pagination.current, pagination.pageSize)}>
            Làm mới
        </Button>
      </div>

      {error && <Alert message="Lỗi hệ thống" description={error} type="error" showIcon className="mb-4" closable onClose={() => setError(null)} />}

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <Table
          columns={columns}
          dataSource={approvals}
          loading={loading}
          rowKey="id"
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          locale={{ emptyText: <Empty description="Không có dữ liệu" /> }}
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
                {decidingAction === 'approve' ? 'Ghi chú duyệt (tùy chọn):' : 'Lý do từ chối (bắt buộc):'}
                {decidingAction === 'reject' && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              className={`w-full p-3 border rounded-md focus:ring-2 focus:outline-none transition-all ${
                  decidingAction === 'reject' && !decisionReason.trim() ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              }`}
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

export default CourseApprovalManagement
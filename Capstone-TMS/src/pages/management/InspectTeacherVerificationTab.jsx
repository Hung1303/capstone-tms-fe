import { useState, useEffect, useCallback } from 'react'
import { SearchOutlined, ReloadOutlined, TeamOutlined, UserOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons'
import { Card, Input, Modal, Space, Table, Button, Tag, Form, Radio } from 'antd'
import api from '../../config/axios'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { toast } from 'react-toastify'
import { useAuth } from '../../contexts/AuthContext'

dayjs.extend(utc)

const InspectTeacherVerificationTab = () => {
  const { user, logout, loading: authLoading } = useAuth()
  
  const [centers, setCenters] = useState([])
  const [selectedCenter, setSelectedCenter] = useState(null)
  const [teachers, setTeachers] = useState([])
  const [loadingStates, setLoadingStates] = useState({
    centers: false,
    teachers: false
  })
  const [modalLoading, setModalLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [decisionModalOpen, setDecisionModalOpen] = useState(false)
  const [form] = Form.useForm()
  
  const [centersPagination, setCentersPagination] = useState({
    pageNumber: 1,
    pageSize: 5,
    total: 0
  })
  
  const [teachersPagination, setTeachersPagination] = useState({
    pageNumber: 1,
    pageSize: 5,
    total: 0
  })

  const setTableLoading = useCallback((key, value) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const fetchCenters = useCallback(async (pageNumber, pageSize) => {
    setTableLoading("centers", true)
    
    try {
      const apiResponse = await api.get(`/Users/Centers/Status/4?pageNumber=${pageNumber}&pageSize=${pageSize}`)
      console.log('API Response Centers:', apiResponse.data)
      
      const centersData = apiResponse.data.centers
      const totalCount = apiResponse.data.totalCount
      
      setCenters(centersData)
      setCentersPagination(prev => ({
        ...prev,
        pageNumber,
        pageSize,
        total: totalCount
      }))
    } catch (error) {
      console.error('Error fetching centers:', error)
      if (error.code === 'ERR_NETWORK') {
        logout()
      } else {
        toast.error('Không thể tải danh sách trung tâm')
      }
    } finally {
      setTableLoading("centers", false)
    }
  }, [logout, setTableLoading])

  // Fetch teachers needing verification for a center
  const fetchTeachers = useCallback(async (centerId, pageNumber, pageSize) => {
    if (!centerId) return
    
    setTableLoading("teachers", true)
    
    try {
      const apiResponse = await api.get(`/teacher-verifications/center/${centerId}?pageNumber=${pageNumber}&pageSize=${pageSize}`)
      console.log('API Response Teachers:', apiResponse.data)
      
      const teachersData = apiResponse.data.teachers || apiResponse.data || []
      const totalCount = apiResponse.data.totalCount || teachersData.length || 0
      
      setTeachers(teachersData)
      setTeachersPagination(prev => ({
        ...prev,
        pageNumber,
        pageSize,
        total: totalCount
      }))
    } catch (error) {
      console.error('Error fetching teachers:', error)
      if (error.code === 'ERR_NETWORK') {
        logout()
      } else {
        toast.error('Không thể tải danh sách giáo viên')
      }
    } finally {
      setTableLoading("teachers", false)
    }
  }, [logout, setTableLoading])

  useEffect(() => {
    fetchCenters(centersPagination.pageNumber, centersPagination.pageSize)
  }, [fetchCenters, centersPagination.pageNumber, centersPagination.pageSize])

  const handleCentersPaginationChange = (page, pageSize) => {
    setCentersPagination(prev => ({
      ...prev,
      pageNumber: pageSize !== prev.pageSize ? 1 : page,
      pageSize
    }))
  }

  const handleTeachersPaginationChange = (page, pageSize) => {
    setTeachersPagination(prev => ({
      ...prev,
      pageNumber: pageSize !== prev.pageSize ? 1 : page,
      pageSize
    }))
  }

  const handleCenterClick = (center) => {
    setSelectedCenter(center)
    setTeachersPagination(prev => ({ ...prev, pageNumber: 1 }))
    fetchTeachers(center.id || center.centerId, 1, teachersPagination.pageSize)
  }

  const handleOpenDecisionModal = (teacher) => {
    console.log('Open decision modal for teacher:', teacher)
    
    setSelectedCenter(teacher.center || selectedCenter)
    form.setFieldsValue({
      id: teacher.id
    })
    setDecisionModalOpen(true)
  }

  const handleSubmitDecision = async () => {
    try {
      const values = await form.validateFields()
      setModalLoading(true)

      console.log('values:', values)
      
      const payload = {
        status: values.status,
        verifierId: user.userId,
        notes: values.notes || ''
      }
      
      console.log('Creating verification with payload:', payload)
      const response = await api.put(`/teacher-verifications/${values.id}/status`, payload)
      console.log('Create verification response:', response.data)
      
      toast.success('Tạo quyết định thành công')
      setDecisionModalOpen(false)
      form.resetFields()
      
      // Refresh teachers list
      if (selectedCenter) {
        await fetchTeachers(selectedCenter.id || selectedCenter.centerId, teachersPagination.pageNumber, teachersPagination.pageSize)
      }
    } catch (error) {
      console.error('Error creating verification:', error)
      // if (error.code === 'ERR_NETWORK') {
      //   logout()
      // } else {
        const errorMessage = error.response?.data?.message || 'Không thể tạo yêu cầu kiểm định'
        toast.error(errorMessage)
      // }
    } finally {
      setModalLoading(false)
    }
  }

  const handleCancel = () => {
    setDecisionModalOpen(false)
    form.resetFields()
  }

  const handleRefresh = () => {
    setSearchTerm('')
    fetchCenters(centersPagination.pageNumber, centersPagination.pageSize)
    if (selectedCenter) {
      fetchTeachers(
        selectedCenter.id || selectedCenter.centerId,
        teachersPagination.pageNumber,
        teachersPagination.pageSize
      )
    }
  }

  const getVerifyStatusBadge = (status) => {
    const statusConfig = {
      0: {
        label: "Chờ nộp tài liệu",
        className: "bg-yellow-100 text-yellow-800",
        icon: <ClockCircleOutlined />
      },
      1: {
        label: "Chờ quyết định",
        className: "bg-cyan-100 text-cyan-800",
        icon: <ClockCircleOutlined />
      },
      2: {
        label: "Đã chấp nhận",
        className: "bg-green-100 text-green-800",
        icon: <CheckCircleOutlined />
      },
      3: {
        label: "Đã từ chối",
        className: "bg-red-100 text-red-800",
        icon: <WarningOutlined />
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

  // Filter centers by search term
  const filteredCenters = centers.filter(center => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      center.centerName?.toLowerCase().includes(search) ||
      center.address?.toLowerCase().includes(search) ||
      center.ownerName?.toLowerCase().includes(search)
    )
  })

  // Centers table columns
  const centersColumns = [
    {
      title: "Trung tâm",
      dataIndex: "centerInfo",
      key: "centerInfo",
      width: 300,
      render: (centerInfo) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{centerInfo.centerName}</div>
          <div className="text-sm text-gray-500">{centerInfo.address}</div>
          {centerInfo.licenseNumber && (
            <div className="text-xs text-gray-400">Mã giấy phép: {centerInfo.licenseNumber}</div>
          )}
        </div>
      )
    },
    {
      title: "Thông tin liên hệ",
      dataIndex: "information",
      key: "information",
      width: 250,
      render: (information) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{information.ownerName}</div>
          <div className="text-sm text-gray-500">{information.contactPhone}</div>
          <div className="text-sm text-gray-400">{information.contactEmail}</div>
        </div>
      )
    },
    // {
    //   title: "Trạng thái",
    //   dataIndex: "status",
    //   key: "status",
    //   width: 150,
    //   render: (status) => getStatusBadge(status)
    // },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleCenterClick(record)}
        >
          Xem giáo viên
        </Button>
      )
    }
  ]

  // Teachers table columns
  const teachersColumns = [
    {
      title: "Giáo viên",
      dataIndex: "teacherName",
      key: "teacherName",
      width: 150,
      render: (teacherName) => (
        <div className="text-sm font-medium text-gray-900">{teacherName}</div>
      )
    },
    {
      title: "Ngày gửi yêu cầu",
      dataIndex: "requestedAt",
      key: "requestedAt",
      width: 80,
      align: "center",
      render: (requestedAt) => (
        <div className="text-sm text-gray-500">{requestedAt ? dayjs(requestedAt).format('DD/MM/YYYY') : "....."}</div>
      )
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => getVerifyStatusBadge(status)
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_, record) => {
        if (record.status === 2 || record.status === 3) {
          return (
            <Tag color="gray">Đã quyết định</Tag>
          )
        } else {
          return (
           <Button
             type="primary"
             size="small"
             icon={<PlusOutlined />}
             onClick={() => handleOpenDecisionModal(record)}
             disabled={record.status === 0}
           >
             Tạo quyết định
           </Button>
          )
        }
      }
    },
    {
      title: "Ghi chú",
      key: "notes",
      width: 200,
      render: (_, record) => {
        if (record.status === 0) {
          return (
            <span>Chờ trung tâm nộp tài liệu thì mới thao tác được</span>
          )
        }
      }
    }
  ]

  const centersData = filteredCenters.map(center => ({
    key: center.id || center.centerId,
    centerInfo: {
      centerName: center.centerName,
      address: center.address,
      licenseNumber: center.licenseNumber
    },
    information: {
      ownerName: center.ownerName,
      contactPhone: center.contactPhone,
      contactEmail: center.contactEmail
    },
    status: center.status,
    id: center.id,
    centerId: center.centerId
  }))

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {authLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* Centers Section */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <UserOutlined />
                <span>Danh sách trung tâm có giáo viên cần kiểm định</span>
              </div>
            }
            extra={
              <Button
                type="primary"
                className="group"
                onClick={handleRefresh}
              >
                <ReloadOutlined className="group-hover:animate-spin" />
                Làm mới
              </Button>
            }
          >
            <div className="mb-4">
              <Input
                className="search-input"
                size="large"
                placeholder="Tìm kiếm theo tên trung tâm, địa chỉ..."
                prefix={<SearchOutlined className="search-icon" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
            </div>
            
            <Table
              columns={centersColumns}
              dataSource={centersData}
              rowKey="key"
              loading={loadingStates.centers}
              pagination={{
                current: centersPagination.pageNumber,
                pageSize: centersPagination.pageSize,
                total: centersPagination.total,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '20', '50'],
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} trung tâm`,
                onChange: handleCentersPaginationChange
              }}
              scroll={{ x: 'max-content', ...(centersData.length > 5 ? {y: 75*5} : "") }}
            />
          </Card>

          {/* Teachers Section */}
          {selectedCenter && (
            <Card
              title={
                <div className="flex items-center gap-2">
                  <TeamOutlined />
                  <span>
                    Giáo viên cần kiểm định - {selectedCenter.centerName || selectedCenter.centerInfo?.centerName}
                  </span>
                </div>
              }
              extra={
                <Button
                  onClick={() => {
                    setSelectedCenter(null)
                    setTeachers([])
                  }}
                >
                  Đóng
                </Button>
              }
            >
              <Table
                columns={teachersColumns}
                dataSource={teachers}
                rowKey="id"
                loading={loadingStates.teachers}
                pagination={{
                  current: teachersPagination.pageNumber,
                  pageSize: teachersPagination.pageSize,
                  total: teachersPagination.total,
                  showSizeChanger: true,
                  pageSizeOptions: ['5', '10', '20', '50'],
                  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} giáo viên`,
                  onChange: handleTeachersPaginationChange
                }}
                scroll={{ x: 'max-content' }}
              />
            </Card>
          )}

          {/* Create Verification Modal */}
          <Modal
            title="Đưa ra quyết định"
            open={decisionModalOpen}
            onOk={handleSubmitDecision}
            onCancel={handleCancel}
            confirmLoading={modalLoading}
            okText="Gửi"
            cancelText="Hủy"
            width={600}
          >
            <Form
              form={form}
              layout="vertical"
              className="mt-4"
            >
              <Form.Item
                name="id"
                label="ID Yêu cầu"
                hidden
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="status"
                label="Quyết định"
                rules={[{ required: true, message: 'Vui lòng chọn quyết định' }]}
              >
                <Radio.Group>
                  <Radio value={2}>Đồng ý</Radio>
                  <Radio value={3}>Từ chối</Radio>
                </Radio.Group>
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
          </Modal>
        </>
      )}
    </Space>
  )
}

export default InspectTeacherVerificationTab

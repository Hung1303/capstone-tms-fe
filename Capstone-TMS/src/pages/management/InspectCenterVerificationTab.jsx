import { useCallback, useEffect, useMemo, useState } from 'react'
import { ReloadOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined, StopOutlined, EditOutlined, PlusOutlined, SearchOutlined, SendOutlined } from '@ant-design/icons'
import { Button, Card, DatePicker, Input, Modal, Select, Space, Table, Tooltip, Upload, Image, Popconfirm, Progress } from 'antd'
import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import api from '../../config/axios'
import { toast } from 'react-toastify'
import { useAuth } from '../../contexts/AuthContext'

dayjs.extend(utc)

const initialPagination = {
  pageNumber: 1,
  pageSize: 10,
  total: 0
}

const verificationStatus = [
  'Pending',
  'InProgress',
  'Completed',
  'Failed',
  'Finalized'
]

const statusFilterOptions = [
  { label: 'Tất cả trung tâm', value: 'all' },
  { label: 'Tất cả đơn giám định', value: 'pending' },
  // { label: 'Đang xử lý', value: 'inProgress' },
  // { label: 'Giám định hoàn tất', value: 'completed' },
  // { label: 'Giám định không đạt', value: 'failed' },
  // { label: 'Đã kết luận', value: 'finalized' }
]

const verificationStatusFilterOptions = [
  { label: 'Tất cả trạng thái', value: 'all' },
  { label: 'Chờ duyệt', value: '0' },
  { label: 'Đang xử lý', value: '1' },
  { label: 'Hoàn thành', value: '2' },
  // { label: 'Không đạt', value: '3' },
  // { label: 'Đã hoàn tất', value: '4' }
]

const InspectCenterVerificaitonTab = () => {
  const { logout, loading } = useAuth()
  const [statusFilter, setStatusFilter] = useState('all')
  const [verificationStatusFilter, setVerificationStatusFilter] = useState('all')
  const [modalLoading, setModalLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editTargetVerificationId, setEditTargetVerificationId] = useState(null)
  const [previewImage, setPreviewImage] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [fileList, setFileList] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  const [editForm, setEditForm] = useState({
    completedDate: null,
    scheduledDate: null,
    inspectorNotes: '',
    verificationFiles: [],
    documentChecklistText: '',
    isLocationVerified: true,
    isDocumentsVerified: true,
    isLicenseValid: true
  })
  const [centers, setCenters] = useState([])
  const [pendingCenters, setPendingCenters] = useState([])

  const [centersPagination, setCentersPagination] = useState(initialPagination)
  const [pendingPagination, setPendingPagination] = useState(initialPagination)

  const [loadingStates, setLoadingStates] = useState({
    centers: false,
    pending: false,
    active: false,
    rejected: false
  })

  const setTableLoading = useCallback((key, value) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: value
    }))
  }, [setLoadingStates])

  const fetchCenters = useCallback(async (pageNumber, pageSize) => {
    setTableLoading("centers", true)

    try {
      const apiResponse = await api.get(`/Users/Centers?pageNumber=${pageNumber}&pageSize=${pageSize}`)
      console.log('API Response:', apiResponse.data)
      setCenters(apiResponse.data.centers)
      setCentersPagination(prev => ({
        ...prev,
        pageNumber,
        pageSize,
        total: apiResponse.data.totalCount ?? apiResponse.data.centers?.length ?? prev.total,
      }))
    } catch (error) {
      console.error('Error fetching centers:', error)
      if (error.code === 'ERR_NETWORK') {
        logout();
      }
    } finally {
      setTableLoading("centers", false)
    }
  }, [logout, setTableLoading])

  useEffect(() => {
    fetchCenters(centersPagination.pageNumber, centersPagination.pageSize);
  }, [fetchCenters, centersPagination.pageNumber, centersPagination.pageSize])

  const fetchPendingCenters = useCallback(async (pageNumber, pageSize) => {
    setTableLoading("pending", true)

    try {
      const apiResponse = await api.get(`/CenterVerification/pending?pageNumber=${pageNumber}&pageSize=${pageSize}`)
      console.log('API Response PendingCenters:', apiResponse.data)
      setPendingCenters(apiResponse.data)
      setPendingPagination(prev => ({
        ...prev,
        total: apiResponse.data.totalCount
      }))
    } catch (error) {
      console.error('Error fetching pending centers:', error)
    } finally {
      setTableLoading("pending", false)
    }
  }, [setTableLoading])

  useEffect(() => {
    fetchPendingCenters(centersPagination.pageNumber, centersPagination.pageSize);
  }, [fetchPendingCenters, centersPagination.pageNumber, centersPagination.pageSize])

  // Reset pagination to page 1 when searchTerm changes
  useEffect(() => {
    if (statusFilter === "all") {
      setCentersPagination(prev => ({ ...prev, pageNumber: 1 }))
    } else if (statusFilter === "pending") {
      setPendingPagination(prev => ({ ...prev, pageNumber: 1 }))
    }
  }, [searchTerm, statusFilter])

  const statusSummary = useMemo(() => {
    const summary = {
      all: centers.length,
      pending: pendingCenters.length,
      inProgress: 0,
      completed: 0,
      failed: 0,
      finalized: 0
    }

    return summary
  }, [centers, pendingCenters])

  const getVerificationStatusBadge = (status) => {
    const statusConfig = {
      Pending: {
        label: 'Chờ xử lý',
        className: 'bg-yellow-100 text-yellow-800',
        icon: <ClockCircleOutlined />
      },
      InProgress: {
        label: 'Đang xử lý',
        className: 'bg-cyan-100 text-cyan-900',
        icon: <ClockCircleOutlined />
      },
      Completed: {
        label: 'Hoàn thành',
        className: 'bg-green-100 text-green-700',
        icon: <CheckCircleOutlined />
      },
      Failed: {
        label: 'Không đạt',
        className: 'bg-red-100 text-red-700',
        icon: <WarningOutlined />
      },
      Finalized: {
        label: 'Đã hoàn tất',
        className: 'bg-blue-100 text-blue-700',
        icon: <CheckCircleOutlined />
      }
    }

    const config = statusConfig[status] || statusConfig.Pending
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    )
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      Active: {
        label: "Hoạt động",
        className: "bg-green-100 text-green-800",
        icon: <CheckCircleOutlined />
      },
      Pending: {
        label: "Chờ xác minh",
        className: "bg-yellow-100 text-yellow-800",
        icon: <ClockCircleOutlined />
      },
      UnderVerification: {
        label: "Đang được xác minh",
        className: "bg-cyan-100 text-cyan-800",
        icon: <ClockCircleOutlined />
      },
      Suspended: {
        label: "Tạm khóa",
        className: "bg-orange-100 text-orange-800",
        icon: <WarningOutlined />
      },
      Rejected: {
        label: "Không đạt",
        className: "bg-red-100 text-red-800",
        icon: <StopOutlined />
      }
    }

    const config = statusConfig[status] || statusConfig.Pending
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    )
  }

  const getBackgroundStatus = (status) => {
    switch (status) {
      case 'all':
        return 'bg-gray-100 text-gray-800 border-gray-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-400'
      case 'inProgress':
        return 'bg-cyan-100 text-cyan-800 border-cyan-400'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-400'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-400'
      case 'finalized':
        return 'bg-blue-100 text-blue-800 border-blue-400'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-400'
    }
  }

  const columns = [
    {
      title: "Trung tâm",
      dataIndex: "centerInfo",
      key: "centerInfo",
      width: 300,
      render: (centerInfo) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{centerInfo.centerName}</div>
          <div className="text-sm text-gray-500">{centerInfo.address}</div>
          <div className="text-xs text-gray-400">Mã giấy phép: {centerInfo.licenseNumber}</div>
        </div >
      )
    },
    {
      title: "Thông tin liên hệ",
      dataIndex: "informtion",
      key: "informtion",
      width: 300,
      render: (information) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{information.ownerName}</div>
          <div className="text-sm text-gray-500">{information.contactPhone}</div>
          <div className="text-sm text-gray-400">{information.contactEmail}</div>
        </div>
      )
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 200,
      render: (status) => getStatusBadge(status)
    }
  ]

  const pendingTableColumns = [
    {
      title: "Trung tâm",
      dataIndex: "centerInfo",
      key: "centerInfo",
      width: 250,
      render: (centerInfo) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{centerInfo.centerName}</div>
        </div >
      )
    },
    {
      title: "Giám định viên",
      dataIndex: "inspectorName",
      key: "inspectorName",
      width: 180,
      render: (inspectorName) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{inspectorName}</div>
        </div>
      )
    },
    {
      title: "Ngày giám định",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      width: 130,
      render: (scheduledDate) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {scheduledDate ? dayjs(scheduledDate).format('DD/MM/YYYY') : 'Chưa đặt lịch'}
          </div>
        </div>
      )
    },
    {
      title: "Ngày hoàn tất giám định",
      dataIndex: "completedDate",
      key: "completedDate",
      width: 130,
      render: (completedDate) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {completedDate ? dayjs(completedDate).format('DD/MM/YYYY') : "--"}
          </div>
        </div>
      )
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => getVerificationStatusBadge(verificationStatus[status])
    },

    {
      title: "Đánh giá",
      dataIndex: "sideAdmin",
      key: "sideAdmin",
      width: 150,
      render: (sideAdmin) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {sideAdmin.adminDecision !== 0 ? (sideAdmin.adminDecision === 1 ? 'Chấp nhận' : 'Từ chối') : 'Chưa quyết định'}
          </div>
          <div className="text-sm text-gray-500">
            <label>Lúc: </label>
            {sideAdmin.adminDecisionDate ? dayjs(sideAdmin.adminDecisionDate).format('DD/MM/YYYY HH:mm') : '--'}
          </div>
        </div>
      )
    },
    {
      title: "Thao tác",
      dataIndex: "action",
      key: "action",
      render: (center) => (
        <div className="flex items-center gap-2">
          <Tooltip title="Chỉnh sửa giám định">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 text-lg text-blue-400 hover:text-blue-600 rounded cursor-pointer"
              onClick={() =>  handleUpdateAppraisal(center)}
            >
              <EditOutlined />
            </motion.button>
          </Tooltip>

          {center.status !== 2 && (
            <Popconfirm
              title={
                <div className="flex items-center gap-2">
                  <SendOutlined style={{ color: center.status !== 0 ? "#22c55e" : "#f97316" }}
                  />
                  <span className="font-semibold">Xác nhận gửi đơn</span>
                </div>
              }
              description={
                <div className="mt-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span>Trạng thái đơn:</span>
                    <span
                      className={`font-semibold ${center.status !== 0 ? "text-green-500" : "text-orange-500"
                        }`}
                    >
                      {center.status !== 0 ? "Đã sẵn sàng" : "Chưa sẵn sàng"}
                    </span>
                  </div>

                  {center.status === 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      ⚠️ Vui lòng hoàn tất thông tin trước khi gửi duyệt.
                    </div>
                  )}
                </div>
              }
              onConfirm={() => handleSendAppraisal(center)}
              okText="Gửi"
              cancelText="Hủy"
              icon={null}
              okButtonProps={{ disabled: center.status === 0 }}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-1 text-lg text-green-400 hover:text-green-600 rounded cursor-pointer"
              >
                <SendOutlined />
              </motion.button>
            </Popconfirm>
          )}
        </div>
      )
    }
  ]

  const data = centers.map(center => ({
    key: center.id,
    centerInfo: { centerName: center.centerName, address: center.address, licenseNumber: center.licenseNumber },
    informtion: { contactEmail: center.contactEmail, contactPhone: center.contactPhone, ownerName: center.ownerName },
    status: center.status,
    action: { status: center.status, id: center.id }
  }))

  console.log("pendingCenters", pendingCenters)
  const pendingTableData = pendingCenters.map(center => ({
    key: center.verificationId,
    centerInfo: { centerName: center.centerName },
    status: center.status,
    completedDate: center.completedDate,
    scheduledDate: center.scheduledDate,
    inspectorName: center.inspectorName,
    sideAdmin: { adminDecision: center.adminDecision, adminDecisionDate: center.adminDecisionDate },
    action: { status: center.status, verificationId: center.verificationId }
  }))

  // Filter data based on searchTerm
  const normalizedSearch = searchTerm.toLowerCase().trim()

  const filterBySearch = (data = [], search, fields = []) => {
    if (!search) return data

    return data.filter(item =>
      fields.some(field => {
        const value = field(item)?.toLowerCase?.() || ''
        return value.includes(search)
      })
    )
  }

  const filteredData = filterBySearch(data, normalizedSearch, [
    item => item.centerInfo?.centerName,
    item => item.centerInfo?.address,
  ])

  const filteredPendingTableData = filterBySearch(pendingTableData, normalizedSearch, [
    item => item.centerInfo?.centerName,
    item => item.inspectorName,
  ]).filter(item => {
    if (verificationStatusFilter === 'all') return true
    return item.status === parseInt(verificationStatusFilter)
  })

  const handleStatusCardClick = (statusKey) => {
    setStatusFilter(statusKey)
    // Reset verification status filter when switching tabs
    setVerificationStatusFilter('all')
  }

  const handleRefresh = async () => {
    setSearchTerm('')
    if (statusFilter === "all") {
      await fetchCenters(centersPagination.pageNumber, centersPagination.pageSize)
    } else if (statusFilter === "pending") {
      await fetchPendingCenters(pendingPagination.pageNumber, pendingPagination.pageSize)
    }
  }

  const handleCentersPaginationChange = (page, pageSize) => {
    setCentersPagination(prev => ({
      ...prev,
      pageNumber: pageSize !== prev.pageSize ? 1 : page,
      pageSize
    }))
  }

  const handlePendingPaginationChange = (page, pageSize) => {
    setPendingPagination(prev => ({
      ...prev,
      pageNumber: pageSize !== prev.pageSize ? 1 : page,
      pageSize
    }))
  }

  const MAX_FILE_SIZE = 5 * 1024 * 1024 
  // const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

  const beforeUpload = (file) => {
    // if (!ALLOWED_TYPES.includes(file.type)) {
    //   toast.error("Chỉ cho phép ảnh JPG, PNG, WEBP")
    //   return Upload.LIST_IGNORE
    // }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Ảnh không được vượt quá 5MB")
      return Upload.LIST_IGNORE
    }

    return false // chặn auto upload
  }

  const uploadVerificationFiles = async () => {
    console.log("Starting upload of files:", fileList)
    if (!fileList.length) return

    const formData = new FormData()
    console.log("Uploading files:", fileList)
    fileList.forEach(file => {
      console.log("originFileObj:", file.originFileObj)
      formData.append("imgs", file.originFileObj)
    })

    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1])
    }
    console.log("FormData prepared for upload:", formData)
    try {
      setUploading(true)

      const res = await api.post("/Image/multiple", formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          setUploadProgress(percent)
        },
      })

      const uploadedFiles = res.data.map((url, index) => ({
        uid: fileList[index].uid,
        name: fileList[index].name,
        status: "done",
        url,
        thumbUrl: url,
      }))

      handleEditFormChange("verificationFiles", uploadedFiles)
      toast.success("Upload thành công")
    } catch (err) {
      console.error(err)
      toast.error("Upload thất bại")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleUpdateAppraisal = async (center) => {
    if (!center?.verificationId) {
      toast.error('Không tìm thấy thông tin giám định để chỉnh sửa')
      return
    }
    console.log('Editing center verification:', center)

    setModalLoading(true)
    try {
      const response = await api.get(`/CenterVerification/request/${center.verificationId}`)
      console.log('Edit Verification Response:', response.data)
      const data = response.data

      const mappedFiles = Array.isArray(data.verificationPhotos)
      ? data.verificationPhotos.map((url, index) => ({
          uid: `loaded-${index}`,
          name: `Ảnh ${index + 1}`,
          status: 'done',
          url: url,
          thumbUrl: url
        }))
      : []

      setEditTargetVerificationId(center.verificationId)
      setEditForm({
        completedDate: data.completedDate ? dayjs(data.completedDate) : null,
        inspectorNotes: data.inspectorNotes || '',
        verificationFiles: mappedFiles,
        documentChecklistText: Array.isArray(data.documentChecklist) ? data.documentChecklist.join('\n') : '',
        isLocationVerified: !!data.isLocationVerified,
        isDocumentsVerified: !!data.isDocumentsVerified,
        isLicenseValid: !!data.isLicenseValid,
        scheduledDate: data.scheduledDate ? dayjs(data.scheduledDate) : null,
      })
      setFileList(mappedFiles)
      setEditModalOpen(true)
    } catch (error) {
      console.error('Error loading verification for edit:', error)
      if (error.code === 'ERR_NETWORK') {
        logout();
      }
    } finally {
      setModalLoading(false)
    }
  }

  const handleSendAppraisal = async (center) => {
    if (!center?.verificationId) {
      toast.error('Không tìm thấy thông tin giám định để gửi đi. Thử lại sau.')
      return
    }
    console.log('Sending center verification:', center)

    try {
      const response = await api.put(`/CenterVerification/request/${center.verificationId}/complete`)
      console.log('Send Verification Response:', response.data)
      toast.success(response.data.message)
    } catch (error) {
      console.error('Error loading verification for edit:', error)
      const errorRes = error.response?.data

      if (error.code === 'ERR_NETWORK') {
        logout();
      }

      if (errorRes.message.includes("Thất bại trong việc xác minh")) {
        toast.error("Bạn đã gửi rồi.")
      }
    } finally {
      await fetchPendingCenters(centersPagination.pageNumber, centersPagination.pageSize)
      await fetchCenters(centersPagination.pageNumber, centersPagination.pageSize)
    }
  }

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmitEdit = async () => {
    if (!editTargetVerificationId) {
      toast.error('Thiếu mã giám định cần cập nhật')
      return
    }

    setModalLoading(true)
    console.log('Submitting edit for verification ID:', editForm)

    const payload = {
      completedDate: editForm.completedDate,
      inspectorNotes: editForm.inspectorNotes,
      verificationPhotos: Array.isArray(editForm.verificationFiles)
        ? editForm.verificationFiles
          .map(file => {
            // Nếu file.url là string (ảnh đã có sẵn hoặc đã upload), dùng trực tiếp
            if (typeof file.url === 'string') {
              return file.url
            }
            // Nếu file.url là object, lấy img_url hoặc url
            return file.url?.img_url || file.url?.url || file.thumbUrl || null
          })
          .filter(Boolean)
        : [],
      documentChecklist: editForm.documentChecklistText
        .split('\n')
        .map(x => x.trim())
        .filter(Boolean),
      isLocationVerified: !!editForm.isLocationVerified,
      isDocumentsVerified: !!editForm.isDocumentsVerified,
      isLicenseValid: !!editForm.isLicenseValid
    }
    console.log('Update Verification Payload:', payload)

    try {
      const apiResponse = await api.put(`/CenterVerification/request/${editTargetVerificationId}`, payload)
      console.log('Update Verification Response:', apiResponse.data)
      toast.success('Cập nhật giám định thành công')
      setEditModalOpen(false)
    } catch (error) {
      console.error('Error updating verification:', error)
      toast.error('Không thể cập nhật giám định')
    } finally {
      await fetchPendingCenters(centersPagination.pageNumber, centersPagination.pageSize)
      await fetchCenters(centersPagination.pageNumber, centersPagination.pageSize)
      setModalLoading(false)
    }
  }

  console.log("FileList", fileList)

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {statusFilterOptions.map(option => (
              <motion.button
                key={option.value}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStatusCardClick(option.value)}
                className={`rounded-lg border p-4 text-left shadow-sm ${getBackgroundStatus(option.value)}`}
              >
                <p className="text-xs text-gray-500">{option.label}</p>
                <p className="text-2xl font-bold">{statusSummary[option.value]}</p>
              </motion.button>
            ))}
          </div>

          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Input
                className="search-input"
                size="large"
                placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
                prefix={<SearchOutlined className="search-icon" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
              {statusFilter === "pending" && (
                <Select
                  size="large"
                  style={{ width: 200 }}
                  placeholder="Lọc theo trạng thái"
                  value={verificationStatusFilter}
                  onChange={setVerificationStatusFilter}
                  options={verificationStatusFilterOptions}
                />
              )}
              <Button
                type="primary"
                className="group"
                onClick={handleRefresh}
              >
                <ReloadOutlined className="group-hover:animate-spin" />
                Làm mới
              </Button>
            </div>
            <div className="mt-6 rounded-lg shadow-sm">
              {statusFilter === "all" &&
                <Table
                  columns={columns}
                  dataSource={filteredData}
                  rowKey="key"
                  loading={loadingStates.centers}
                  pagination={{
                    current: centersPagination.pageNumber,
                    pageSize: centersPagination.pageSize,
                    total: centersPagination.total,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`,
                    onChange: handleCentersPaginationChange,
                    className: "!mr-2"
                  }}
                  scroll={{ x: "max-content", y: 75 * 5 }}
                />
              }

              {statusFilter === "pending" &&
                <Table
                  columns={pendingTableColumns}
                  dataSource={filteredPendingTableData}
                  rowKey="key"
                  loading={loadingStates.pending}
                  pagination={{
                    current: pendingPagination.pageNumber,
                    pageSize: pendingPagination.pageSize,
                    total: pendingPagination.total,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`,
                    onChange: handlePendingPaginationChange,
                    className: "!mr-2"
                  }}
                  scroll={{ x: "max-content", ...(filteredPendingTableData.length > 5 ? {y: 75*5} : "") }}
                />
              }
            </div>
          </Card>

          <Modal
            title="Chỉnh sửa giám định"
            open={editModalOpen}
            onCancel={() => {
              setEditModalOpen(false)
              setPreviewOpen(false)
              setPreviewImage('')
            }}
            onOk={handleSubmitEdit}
            okText="Lưu thay đổi"
            cancelText="Hủy"
            confirmLoading={modalLoading}
            width={720}
            okButtonProps={{ disabled: !!editForm.scheduledDate?.isAfter(dayjs(), "day") }}
          >
            <div className="space-y-5 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hoàn tất</label>
                  <DatePicker
                    className="w-full"
                    value={editForm.completedDate}
                    onChange={(value) => handleEditFormChange("completedDate", value)}
                    format="DD/MM/YYYY"
                    disabledDate={(current) => current && current.isBefore(editForm.scheduledDate, 'day')}
                    disabled={editForm.scheduledDate && editForm.scheduledDate.isAfter(dayjs(), "day")}
                  />
                  {editForm.scheduledDate && editForm.scheduledDate.isAfter(dayjs(), "day") && (
                    <p className="mt-1 text-xs text-gray-500">
                      Chưa tới ngày giám định ({editForm.scheduledDate.format('DD/MM/YYYY')}).
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Vị trí đạt yêu cầu</span>
                    <Select
                      style={{ width: 120 }}
                      value={editForm.isLocationVerified ? "true" : "false"}
                      onChange={(val) => handleEditFormChange("isLocationVerified", val === 'true')}
                      options={[
                        { label: 'Đạt', value: 'true' },
                        { label: 'Không đạt', value: 'false' }
                      ]}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Hồ sơ tài liệu</span>
                    <Select
                      style={{ width: 120 }}
                      value={editForm.isDocumentsVerified ? 'true' : 'false'}
                      onChange={(val) => handleEditFormChange('isDocumentsVerified', val === 'true')}
                      options={[
                        { label: 'Đạt', value: 'true' },
                        { label: 'Không đạt', value: 'false' }
                      ]}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Giấy phép hợp lệ</span>
                    <Select
                      style={{ width: 120 }}
                      value={editForm.isLicenseValid ? 'true' : 'false'}
                      onChange={(val) => handleEditFormChange('isLicenseValid', val === 'true')}
                      options={[
                        { label: 'Đạt', value: 'true' },
                        { label: 'Không đạt', value: 'false' }
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú giám định viên</label>
                <Input.TextArea
                  rows={4}
                  value={editForm.inspectorNotes}
                  onChange={(e) => handleEditFormChange('inspectorNotes', e.target.value)}
                  placeholder="Nhập ghi chú tổng quan về kết quả giám định..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh sách tài liệu (mỗi dòng một mục)
                  </label>
                  <Input.TextArea
                    rows={5}
                    value={editForm.documentChecklistText}
                    onChange={(e) => handleEditFormChange('documentChecklistText', e.target.value)}
                    placeholder={'Ví dụ:\nGiấy phép kinh doanh\nHợp đồng thuê mặt bằng'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ảnh giám định
                  </label>
                  <Upload
                    listType="picture-card"
                    multiple
                    fileList={fileList}
                    beforeUpload={beforeUpload}
                    onChange={({ fileList }) => {
                      setFileList(fileList)
                      handleEditFormChange("verificationFiles", fileList)
                    }}
                    onPreview={(file) => {
                      setPreviewImage(file.url || file.thumbUrl)
                      setPreviewOpen(true)
                    }}
                  >
                    {fileList.length < 8 && (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                      </div>
                    )}
                  </Upload>
                  {previewImage && (
                    <Image
                      wrapperStyle={{ display: 'none' }}
                      preview={{
                        visible: previewOpen,
                        onVisibleChange: (visible) => setPreviewOpen(visible),
                        mask: 'Xem ảnh'
                      }}
                      src={previewImage}
                    />
                  )}
                  {uploading && (
                    <Progress percent={uploadProgress} status="active" />
                  )}

                  <Button
                    type="primary"
                    onClick={uploadVerificationFiles}
                    disabled={!fileList.length}
                    loading={uploading}
                  >
                    Tải ảnh lên
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        </>
      )}
    </Space>
  )
}

export default InspectCenterVerificaitonTab

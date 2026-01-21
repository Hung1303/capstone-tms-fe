import { useState, useEffect, useCallback } from 'react'
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined, StopOutlined, ReloadOutlined, TeamOutlined } from '@ant-design/icons'
import { Card, DatePicker, Input, Modal, Select, Space, Table, Tooltip, Divider, Typography, Button } from 'antd'
import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import api from '../../config/axios'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { toast } from 'react-toastify'
import { useAuth } from '../../contexts/AuthContext'

dayjs.extend(utc);
const { Title, Text } = Typography;


const generateEmailBody = ({ center, inspectorName, scheduledDate }) => {
  const inspectorDisplay = inspectorName || "Đang cập nhật";
  const scheduleDisplay = scheduledDate ? dayjs(scheduledDate).format("DD/MM/YYYY") : "Đang cập nhật";
  const centerName = center?.centerName || "Trung tâm";
  const ownerName = center?.ownerName;
  const greetingTarget = ownerName || (centerName ? `đại diện trung tâm ${centerName}` : "quý trung tâm");

  return (
    `
      <div style="max-width: 600px; margin: auto; padding: 20px;
              font-family: Arial, sans-serif; color: #333;
              border: 1px solid #e6e6e6; border-radius: 10px;">

        <!-- Logo -->
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://your-domain.com/logo.png"
              alt="TutorLink Logo"
              style="max-width: 140px; margin-bottom: 10px;">
          <h2 style="color: #4c6ef5; margin: 0;">Thông Báo Lịch Giám Định</h2>
          <p style="margin: 5px 0 0 0; color: #666;">Hệ thống TutorLink</p>
        </div>

        <!-- Greeting -->
        <p style="font-size: 15px; line-height: 1.6;">
          Kính gửi <strong>${greetingTarget}</strong>,
        </p>

        <!-- Message -->
        <p style="font-size: 15px; line-height: 1.6;">
          Chúng tôi xin thông báo lịch giám định mới cho 
          <strong>${centerName}</strong>.
        </p>

        <!-- Info Box -->
        <div style="
          background: #f8f9ff;
          padding: 15px;
          border-left: 4px solid #4c6ef5;
          margin: 20px 0;
          border-radius: 6px;
        ">
          <p style="margin: 0; font-size: 15px; line-height: 1.8;">
            <strong>Người giám định:</strong> ${inspectorDisplay}<br>
            <strong>Ngày giám định:</strong> ${scheduleDisplay}
          </p>
        </div>

        <!-- Footer Text -->
        <p style="font-size: 15px; line-height: 1.6;">
          Vui lòng chuẩn bị đầy đủ hồ sơ, cơ sở vật chất và phản hồi ngay 
          nếu cần điều chỉnh lịch.
        </p>

        <p style="font-size: 15px; margin-top: 25px; line-height: 1.6;">
          Trân trọng,<br>
          <strong>TutorLink</strong>
        </p>

        <!-- Optional Footer -->
        <div style="text-align: center; margin-top: 25px; color: #888; font-size: 12px;">
          © ${new Date().getFullYear()} TutorLink – Hệ thống quản lý trung tâm & giám định.
        </div>

      </div>  
    `
  )
}

const generateEmailBodyUI = ({ center, inspectorName, scheduledDate }) => {
  const inspectorDisplay = inspectorName || "Đang cập nhật";
  const scheduleDisplay = scheduledDate ? dayjs(scheduledDate).format("DD/MM/YYYY") : "Đang cập nhật";
  const centerName = center?.centerName || "Trung tâm";
  const ownerName = center?.ownerName;
  const greetingTarget = ownerName || (centerName ? `đại diện trung tâm ${centerName}` : "quý trung tâm");

  return (
    `
                        Thông Báo Lịch Giám Định
                           Hệ thống TutorLink

      Kính gửi ${greetingTarget},

      Chúng tôi xin thông báo lịch giám định mới cho ${centerName}.

      Người giám định: ${inspectorDisplay}

      Ngày giám định: ${scheduleDisplay}

      Vui lòng chuẩn bị đầy đủ hồ sơ, cơ sở vật chất và phản hồi ngay nếu cần điều chỉnh lịch.

      Trân trọng,
      TutorLink

      © ${new Date().getFullYear()} TutorLink – Hệ thống quản lý trung tâm & giám định.
    `
  )
}

const AdminCenterVerificationTab = () => {
  const { user, logout, loading: authLoading } = useAuth()
  const initialFormData = {
    centerProfileId: "",
    inspectorId: null,
    scheduledDate: ""
  }

  const initialFormEmail = {
    subject: "",
    body: "",
    centerIds: []
  }

  const createInitialPagination = () => ({
    pageNumber: 1,
    pageSize: 10,
    total: 0,
  })

  const [centers, setCenters] = useState([])
  const [pendingCenters, setPendingCenters] = useState([])
  const [activeCenters, setActiveCenters] = useState([])
  const [rejectedCenters, setRejectedCenters] = useState([])
  const [inspectors, setInspectors] = useState([])
  const [loadingStates, setLoadingStates] = useState({
    centers: false,
    pending: false,
    active: false,
    rejected: false
  })
  const [modalLoading, setModalLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [openModelAppraisal, setOpenModelAppraisal] = useState(false)
  const [openModelViewAppraisal, setOpenModeViewlAppraisal] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState(initialFormData)
  const [formViewData, setFormViewData] = useState()
  const [formEmailData, setFormEmailData] = useState(initialFormEmail)
  const [selectedCenters, setSelectedCenters] = useState([])
  const [pendingSelectedRowKeys, setPendingSelectedRowKeys] = useState([])
  const [pendingSelectedCenters, setPendingSelectedCenters] = useState([])

  const [centersPagination, setCentersPagination] = useState(createInitialPagination)
  const [activePagination, setActivePagination] = useState(createInitialPagination)
  const [pendingPagination, setPendingPagination] = useState(createInitialPagination)
  const [rejectedPagination, setRejectedPagination] = useState(createInitialPagination)

  const centerStatus = [
    "Pending", "UnderVerification", "Verified", "Rejected", "Active", "Suspended"
  ]

  const verificationStatus = [
    "Pending", "InProgress", "Completed", "Failed", "Finalized"
  ]

  const DEFAULT_PENDING_PAGE_SIZE = 20

  const setTableLoading = useCallback((key, value) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: value
    }))
  }, [setLoadingStates])


  // ===== Columns =====
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
    },
    {
      title: "Đánh giá",
      dataIndex: "evaluation",
      key: "evaluation",
      width: 100,
    },
  ]

  // column for table pending status
  const pendingTableColumns = [
    {
      title: "Trung tâm",
      dataIndex: "centerInfo",
      key: "centerInfo",
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
      render: (status) => getStatusBadge(centerStatus[status])
    },
    {
      title: "Thao tác",
      dataIndex: "action",
      key: "action",
      render: (center) => (
        <div className="flex items-center gap-2">
          <Tooltip title="Xem chi tiết">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 text-lg text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
              onClick={() => handleViewAppraisal(center)}
            >
              <EyeOutlined />
            </motion.button>
          </Tooltip>
          <Tooltip title="Tạo giám định">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 text-lg text-yellow-600 hover:bg-yellow-50 rounded cursor-pointer"
              onClick={() => handleCreateAppraisal(center)}
            >
              <EditOutlined />
            </motion.button>
          </Tooltip>
        </div>
      )
    }
  ]

  // column for table active status
  const activeTableColumns = [
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
      width: 150,
      render: (status) => getStatusBadge(centerStatus[status])
    },
    {
      title: "Ngày đưa ra quyết định",
      dataIndex: "verificationCompletedAt",
      key: "verificationCompletedAt",
      width: 140,
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: "Thao tác",
      dataIndex: "action",
      key: "action",
      width: 100,
      align: "center",
      render: (center) => (
        <div className="flex items-center justify-center gap-2">
          <Tooltip title="Xem chi tiết">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 text-lg text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
              onClick={() => handleViewAppraisal(center)}
            >
              <EyeOutlined />
            </motion.button>
          </Tooltip>
        </div>
      )
    }
  ]

  // column for table rejected status
  const rejectedTableColumns = [
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
      render: (status) => getStatusBadge(centerStatus[status])
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      width: 200,
    },
    {
      title: "Đánh giá",
      dataIndex: "evaluation",
      key: "evaluation",
      width: 100,
    },
    {
      title: "Thao tác",
      dataIndex: "action",
      key: "action",
      width: 100,
      render: (center) => (
        <div className="flex items-center gap-2">
          <Tooltip title="Chỉnh sửa">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 text-lg text-blue-600 hover:bg-blue-50 rounded"
              onClick={() => handleViewAppraisal(center)}
            >
              <EyeOutlined />
            </motion.button>
          </Tooltip>
          <Tooltip title="Tạo giám định">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 text-lg text-yellow-600 hover:bg-blue-50 rounded"
            >
              <EditOutlined />
            </motion.button>
          </Tooltip>
          <Tooltip title="Xóa">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 text-lg text-red-600 hover:bg-blue-50 rounded"
            >
              <DeleteOutlined />
            </motion.button>
          </Tooltip>
        </div>
      )
    }
  ]

  console.log("centers:", centers)
  // ===== Datas =====
  const data = centers.map(center => ({
    key: center.id,
    centerInfo: { centerName: center.centerName, address: center.address, licenseNumber: center.licenseNumber },
    informtion: { contactEmail: center.contactEmail, contactPhone: center.contactPhone, ownerName: center.ownerName },
    status: center.status,
    action: { status: center.status, id: center.id }
  }))

  console.log("pendingCenters", pendingCenters)
  const pendingTableData = pendingCenters.map(center => ({
    key: center.centerId,
    centerInfo: { centerName: center.centerName, address: center.address, licenseNumber: center.licenseNumber },
    informtion: { contactEmail: center.contactEmail, contactPhone: center.contactPhone, ownerName: center.ownerName },
    status: center.status,
    centerDetails: {
      centerId: center.centerId,
      centerName: center.centerName,
      ownerName: center.ownerName,
      contactEmail: center.contactEmail
    },
    action: {
      status: center.status,
      centerId: center.centerId,
      verificationId: center.verificationId,
      centerName: center.centerName,
      ownerName: center.ownerName,
      contactEmail: center.contactEmail
    }
  }))

  const pendingRowSelection = {
    selectedRowKeys: pendingSelectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setPendingSelectedRowKeys(selectedRowKeys)
      const centers = selectedRows
        .map(row => row.centerDetails)
        .filter(Boolean)
      setPendingSelectedCenters(centers)
      if (errors.centerSelection) {
        setErrors(prev => ({ ...prev, centerSelection: "" }))
      }
    }
  }

  console.log("activeCenters", activeCenters)
  const activeTableData = activeCenters.map(center => ({
    key: center.centerId,
    centerInfo: { centerName: center.centerName, address: center.address, licenseNumber: center.licenseNumber },
    informtion: { contactEmail: center.contactEmail, contactPhone: center.contactPhone, ownerName: center.ownerName },
    status: center.status,
    verificationCompletedAt: center.verificationCompletedAt,
    action: {
      status: center.status,
      centerId: center.centerId,
      verificationId: center.verificationId,
      centerName: center.centerName,
      ownerName: center.ownerName,
      contactEmail: center.contactEmail
    }
  }))

  console.log("rejectedCenters", rejectedCenters)
  const rejectedTableData = rejectedCenters.map(center => ({
    key: center.centerId,
    centerInfo: { centerName: center.centerName, address: center.address, licenseNumber: center.licenseNumber },
    informtion: { contactEmail: center.contactEmail, contactPhone: center.contactPhone, ownerName: center.ownerName },
    status: center.status,
    reason: center.rejectionReason,
    action: {
      status: center.status,
      centerId: center.centerId,
      verificationId: center.verificationId,
      centerName: center.centerName,
      ownerName: center.ownerName,
      contactEmail: center.contactEmail
    }
  }))

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

  const fetchPendingCenters = useCallback(async (pageNumber, pageSize) => {
    setTableLoading("pending", true)

    try {
      const apiResCenterPending = await api.get(`/CenterVerification/centers/pending?pageNumber=${pageNumber}&pageSize=${pageSize}`)
      console.log('API apiResCenterPending:', apiResCenterPending.data)
      setPendingCenters(apiResCenterPending.data)
    } catch (error) {
      console.error('Error fetching centers:', error)
      if (error.code === 'ERR_NETWORK') {
        logout();
      }
    } finally {
      setTableLoading("pending", false)
    }
  }, [logout, setTableLoading])

  const fetchCentersWithStatus = useCallback(async (stauts, pageNumber, pageSize) => {
    const targetKey = stauts === 3 ? "rejected" : "active"
    setTableLoading(targetKey, true)

    try {
      const apiResponse = await api.get(`/CenterVerification/centers/status/${stauts}?pageNumber=${pageNumber}&pageSize=${pageSize}`)
      console.log('API Response RejectedCenters:', apiResponse.data)
      const totalCount = apiResponse.data.totalCount ?? apiResponse.data.length ?? 0
      if (stauts === 3) {
        setRejectedCenters(apiResponse.data)
        setRejectedPagination(prev => ({
          ...prev,
          pageNumber,
          pageSize,
          total: totalCount
        }))
      } else if (stauts === 4) {
        setActiveCenters(apiResponse.data)
        setActivePagination(prev => ({
          ...prev,
          pageNumber,
          pageSize,
          total: totalCount
        }))
      }
    } catch (error) {
      console.error('Error fetching RejectedCenters:', error)
    } finally {
      setTableLoading(targetKey, false)
    }
  }, [setTableLoading])

  useEffect(() => {
    fetchCenters(centersPagination.pageNumber, centersPagination.pageSize);
  }, [fetchCenters, centersPagination.pageNumber, centersPagination.pageSize])

  useEffect(() => {
    fetchPendingCenters(1, DEFAULT_PENDING_PAGE_SIZE)
  }, [fetchPendingCenters])

  useEffect(() => {
    fetchCentersWithStatus(3, rejectedPagination.pageNumber, rejectedPagination.pageSize);
  }, [fetchCentersWithStatus, rejectedPagination.pageNumber, rejectedPagination.pageSize])

  useEffect(() => {
    fetchCentersWithStatus(4, activePagination.pageNumber, activePagination.pageSize);
  }, [fetchCentersWithStatus, activePagination.pageNumber, activePagination.pageSize])

  useEffect(() => {
    if (!selectedCenters.length) {
      return
    }

    const inspectorName = inspectors.find((inspector) => inspector.id === formData.inspectorId)?.fullName || ""
    const firstCenter = selectedCenters[0] || {}
    setFormEmailData({
      subject: `Thông báo lịch giám định - ${firstCenter.centerName || "Trung tâm"}`,
      body: generateEmailBodyUI({
        center: firstCenter,
        inspectorName,
        scheduledDate: formData.scheduledDate
      }),
      centerIds: [firstCenter.centerId].filter(Boolean)
    })
  }, [formData.inspectorId, formData.scheduledDate, inspectors, selectedCenters])

  const getUsersByRole = async (role, pageSize) => {
    const allUsers = [];
    let pageNumber = 1;
    let totalCount = 0;

    try {
      do {
        const apiResponse = await api.get(`/Users/Users?pageNumber=${pageNumber}&pageSize=${pageSize}`)
        console.log('API Response in inspector:', apiResponse.data)
        const data = apiResponse.data;

        if (pageNumber === 1) {
          totalCount = data.totalCount;
        }

        const matchedUsers = data.users.filter(user => user.role === role)
        allUsers.push(...matchedUsers)

        pageNumber++
      } while (pageNumber * pageSize < totalCount)

      return allUsers
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  }

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
    item => item.centerInfo?.address,
  ])
  
  const filteredActiveTableData = filterBySearch(activeTableData, normalizedSearch, [
    item => item.centerInfo?.centerName,
    item => item.centerInfo?.address,
  ])
  
  const filteredRejectedTableData = filterBySearch(rejectedTableData, normalizedSearch, [
    item => item.centerInfo?.centerName,
    item => item.centerInfo?.address,
  ])

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

    const config = statusConfig[status]
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    )
  }

  const getVerificationStatusBadge = (status) => {
    const statusConfig = {
      InProgress: {
        label: "Đang chờ duyệt",
        className: "bg-cyan-100 text-cyan-800",
        icon: <ClockCircleOutlined />
      },
      Pending: {
        label: "Đang giám định",
        className: "bg-yellow-100 text-yellow-800",
        icon: <ClockCircleOutlined />
      },
      Completed: {
        label: "Hoàn thành",
        className: "bg-green-100 text-green-800",
        icon: <CheckCircleOutlined />
      },
      Failed: {
        label: "Thất bại",
        className: "bg-red-100 text-red-800",
        icon: <WarningOutlined />
      },
      Finalized: {
        label: "Đã hoàn tất",
        className: "bg-green-100 text-green-800",
        icon: <CheckCircleOutlined />
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

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleViewAppraisal = async (center) => {
    console.log('center in ViewAppraisal:', center);

    try {
      const apiResponse = await api.get(`/CenterVerification/request/${center.verificationId}`)
      console.log("apiResponse in ViewAppraisal:", apiResponse.data)
      setFormViewData(apiResponse.data)
      setOpenModeViewlAppraisal(true)
    } catch (error) {
      console.error("error in ViewAppraisal:", error)
      if (error.code === 'ERR_NETWORK') {
        logout();
      } else {
        toast.error("Trung tâm này chưa tạo giám định.")
      }
    }
  }

  const handleCreateAppraisal = async (centers) => {
    const normalizedCenters = Array.isArray(centers) ? centers.filter(Boolean) : [centers].filter(Boolean)
    if (!normalizedCenters.length) {
      toast.warning("Vui lòng chọn ít nhất một trung tâm.")
      return
    }

    setFormData(prev => ({
      ...prev,
      centerProfileId: normalizedCenters.length === 1 ? normalizedCenters[0].centerId : ""
    }))
    setSelectedCenters(normalizedCenters)
    setErrors(prev => ({
      ...prev,
      centerSelection: ""
    }))
    setPendingSelectedCenters(normalizedCenters)
    setPendingSelectedRowKeys(normalizedCenters.map(center => center.centerId))
    setFormEmailData(initialFormEmail)
    setOpenModelAppraisal(true)
    const inspectorList = await getUsersByRole("Inspector", 20)
    console.log('Inspector List:', inspectorList);
    setInspectors(inspectorList)
  }

  const handleOk = async () => {
    if (!validateForm()) {
      console.log("validateForm", errors)
      return
    }

    if (!selectedCenters.length) {
      toast.error("Chưa chọn trung tâm nào để tạo lịch.")
      return
    }

    setModalLoading(true)
    console.log("formData:", formData)
    const token = localStorage.getItem('token')
    console.log("token", token)

    try {
      const inspectorName = inspectors.find((inspector) => inspector.id === formData.inspectorId)?.fullName || ""

      const createRequests = selectedCenters.map(center => {
        const payload = {
          centerProfileId: center.centerId,
          inspectorId: formData.inspectorId,
          scheduledDate: formData.scheduledDate
        }
        return api.post("/CenterVerification/request", payload)
      })

      let createResults;

      try {
        createResults = await Promise.all(createRequests)
        console.log("Create success:", createResults);
      } catch (createError) {
        console.error("Error creating appraisals:", createError);

        if (createError.response && createError.response.data) {
          const message = createError.response.data.message;
          if (message.includes("Center is not in pending status for verification")) {
            toast.error("Trung tâm này đã được tạo lịch giám định")
          } else if (message.includes("Center not found")) {
            toast.error("Không tìm thấy trung tâm")
          }
        }

        return;
      }

      // Gửi email riêng cho từng trung tâm
      const emailRequests = selectedCenters.map(center => {
        const emailBody = generateEmailBody({
          center,
          inspectorName,
          scheduledDate: formData.scheduledDate
        })

        const emailPayload = {
          subject: `Thông báo lịch giám định - ${center.centerName || "Trung tâm"}`,
          body: emailBody,
          centerIds: [center.centerId].filter(Boolean)
        }
        return api.post("/Email/send-to-centers", emailPayload)
      })

      try {
        const emailResults = await Promise.all(emailRequests)
        console.log("apiRes sendEmail:", emailResults)
      } catch (emailError) {
        console.error("Email sending error:", emailError)
        toast.warning("Đã tạo lịch giám định, nhưng một số email gửi thất bại.")
      }

      toast.success(`Đã tạo lịch giám định cho ${selectedCenters.length} trung tâm.`)
      setOpenModelAppraisal(false)
      setFormData(initialFormData)
      setFormEmailData(initialFormEmail)
      setSelectedCenters([])
      setPendingSelectedRowKeys([])
      setPendingSelectedCenters([])
    } catch (error) {
      console.log("Unexpected error:", error);
      toast.error("Đã xảy ra lỗi không mong muốn.");
    } finally {
      setModalLoading(false)
      await fetchPendingCenters(1, DEFAULT_PENDING_PAGE_SIZE)
    }
  }

  const handleCancel = () => {
    setOpenModelAppraisal(false)
    setFormData(initialFormData)
    setFormEmailData(initialFormEmail)
    setSelectedCenters([])
    setPendingSelectedRowKeys([])
    setPendingSelectedCenters([])
    setErrors({})
  }

  const handleCancelViewAppraisal = () => {
    setOpenModeViewlAppraisal(false)
    setErrors({})
  }

  const handleDecision = async (decision) => {
    console.log("decision:", decision)

    setModalLoading(true)
    const dataTran = {
      adminId: user.userId,
      decision: null,
      adminNotes: formViewData.adminNotes || ""
    }

    if (decision === "Approved") {
      dataTran.decision = 1
    } else if (decision === "Rejected") {
      dataTran.decision = 2
    }

    console.log("verificationId", formViewData.verificationId)
    console.log("dataTran:", dataTran)
    try {
      const apiResponse = await api.put(`/CenterVerification/request/${formViewData.verificationId}/decision`, dataTran)
      console.log("apiResponse decision:", apiResponse)
      toast.success("Bạn đã duyệt thành công.")
    } catch (error) {
      console.error("error decision:", error)
      const message = error.response.data.message;
      if (message.includes("Yêu cầu xác minh chưa sẵn sàng cho quyết định của quản trị viên.")) {
        toast.error("Tạm thời chưa thể quyết định.")
      }
    } finally {
      setOpenModeViewlAppraisal(false)
      setModalLoading(false)
      await fetchPendingCenters(1, DEFAULT_PENDING_PAGE_SIZE)
      await fetchCenters(centersPagination.pageNumber, centersPagination.pageSize)
      await fetchCentersWithStatus(3, rejectedPagination.pageNumber, rejectedPagination.pageSize)
      await fetchCentersWithStatus(4, activePagination.pageNumber, activePagination.pageSize)
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.inspectorId) {
      errors.inspectorId = 'Vui lòng chọn người giám định'
    }

    if (!formData.scheduledDate) {
      errors.scheduledDate = "Vui lòng chọn ngày"
    }

    if (!selectedCenters.length) {
      errors.centerSelection = "Vui lòng chọn ít nhất một trung tâm"
    }

    setErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFilterByStatus = (status) => {
    setFilterStatus(status)
  }

  const handleCentersPaginationChange = (page, pageSize) => {
    setCentersPagination(prev => ({
      ...prev,
      pageNumber: pageSize !== prev.pageSize ? 1 : page,
      pageSize
    }))
  }

  const handleActivePaginationChange = (page, pageSize) => {
    setActivePagination(prev => ({
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

  const handleRejectedPaginationChange = (page, pageSize) => {
    setRejectedPagination(prev => ({
      ...prev,
      pageNumber: pageSize !== prev.pageSize ? 1 : page,
      pageSize
    }))
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {authLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleFilterByStatus("all")}
              className="bg-white text-left rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer"
            >
              <div className="text-2xl font-bold text-gray-900">{centersPagination.total}</div>
              <div className="text-sm text-gray-600">Tổng trung tâm</div>
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleFilterByStatus("active")}
              className="bg-green-100 text-left rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer"
            >
              <div className="text-2xl font-bold text-green-600">
                {activeCenters.length}
              </div>
              <div className="text-sm text-gray-600">Đang hoạt động</div>
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleFilterByStatus("pending")}
              className="bg-yellow-100 text-left rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer"
            >
              <div className="text-2xl font-bold text-yellow-600">
                {pendingCenters.length}
              </div>
              <div className="text-sm text-gray-600">Chờ duyệt</div>
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleFilterByStatus("rejected")}
              className="bg-red-100 text-left rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer"
            >
              <div className="text-2xl font-bold text-red-600">
                {rejectedCenters.length}
              </div>
              <div className="text-sm text-gray-600">Không đạt</div>
            </motion.button>
          </div>

          {/* Centers table */}
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
              <Button
                type="primary"
                onClick={() => {
                  if (filterStatus === "all") {
                    setSearchTerm('')
                    fetchCenters(centersPagination.pageNumber, centersPagination.pageSize)
                  } else if (filterStatus === "pending") {
                    setSearchTerm('')
                    fetchPendingCenters(pendingPagination.pageNumber, pendingPagination.pageSize)
                  } else if (filterStatus === "active") {
                    setSearchTerm('')
                    fetchCentersWithStatus(4, activePagination.pageNumber, activePagination.pageSize)
                  } else if (filterStatus === "rejected") {
                    setSearchTerm('')
                    fetchCentersWithStatus(3, rejectedPagination.pageNumber, rejectedPagination.pageSize)
                  }
                }}
                className="group"
              >
                <ReloadOutlined className="group-hover:animate-spin" />
                Làm mới
              </Button>
            </div>
            <div className="mt-6 rounded-lg shadow-sm">
              {filterStatus === "all" &&
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

              {filterStatus === "pending" &&
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3">
                    <span className="text-sm text-gray-600">
                      {pendingSelectedRowKeys.length ? `${pendingSelectedRowKeys.length} trung tâm đã chọn` : "Chưa chọn trung tâm nào"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCreateAppraisal(pendingSelectedCenters)}
                      disabled={!pendingSelectedCenters.length}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pendingSelectedCenters.length
                        ? "bg-orange-500 text-white hover:bg-orange-600 cursor-pointer"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                      Tạo giám định cho lựa chọn
                    </button>
                  </div>
                  <Table
                    columns={pendingTableColumns}
                    dataSource={filteredPendingTableData}
                    rowKey="key"
                    loading={loadingStates.pending}
                    rowSelection={pendingRowSelection}
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
                    scroll={{ x: "max-content", y: 75 * 5 }}
                  />
                </>
              }

              {filterStatus === "active" &&
                <Table
                  columns={activeTableColumns}
                  dataSource={filteredActiveTableData}
                  rowKey="key"
                  loading={loadingStates.active}
                  pagination={{
                    current: activePagination.pageNumber,
                    pageSize: activePagination.pageSize,
                    total: activePagination.total,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`,
                    onChange: handleActivePaginationChange,
                    className: "!mr-2"
                  }}
                  scroll={{ x: "max-content", y: 75 * 5 }}
                />
              }

              {filterStatus === "rejected" &&
                <Table
                  columns={rejectedTableColumns}
                  dataSource={filteredRejectedTableData}
                  rowKey="key"
                  loading={loadingStates.rejected}
                  pagination={{
                    current: rejectedPagination.pageNumber,
                    pageSize: rejectedPagination.pageSize,
                    total: rejectedPagination.total,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`,
                    onChange: handleRejectedPaginationChange,
                    className: "!mr-2"
                  }}
                  scroll={{ x: "max-content", y: 75 * 5 }}
                />
              }
            </div>
          </Card>

          {console.log("formData before modal:", formData)}
          <Modal
            title={"Tạo thời gian giám định"}
            open={openModelAppraisal}
            onCancel={handleCancel}
            onOk={handleOk}
            confirmLoading={modalLoading}
            okText="Tạo"
            cancelText="Hủy"
          >
            {console.log("inspectors:", inspectors)}
            <div className="flex flex-col gap-4 py-3">
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-700">
                    Đang tạo lịch cho {selectedCenters.length} trung tâm
                  </p>
                  <span className="text-xs text-slate-500">
                    {selectedCenters.length ? "Vui lòng kiểm tra danh sách" : "Chưa có trung tâm nào"}
                  </span>
                </div>
                <div className="max-h-32 overflow-y-auto text-sm text-slate-700 space-y-1">
                  {selectedCenters.length ? (
                    selectedCenters.map((center, index) => (
                      <div key={center.centerId || index} className="flex justify-between gap-2">
                        <span className="font-medium">{center.centerName || "Trung tâm"}</span>
                        <span className="text-slate-500">{center.ownerName}</span>
                      </div>
                    ))
                  ) : (
                    <p className="italic text-slate-500">Vui lòng quay lại danh sách và chọn trung tâm.</p>
                  )}
                </div>
                {errors.centerSelection &&
                  <p className="mt-2 text-sm text-red-600">{errors.centerSelection}</p>
                }
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Người giám định :</label>
                  <Select
                    value={formData.inspectorId}
                    onChange={(value) => handleFormChange("inspectorId", value)}
                    options={inspectors.map(inspector => ({
                      value: inspector.id, label: inspector.fullName
                    }))}
                    placeholder="Chọn người giám định"
                  />
                  {errors.inspectorId &&
                    <p className="mt-1 text-sm text-red-600">{errors.inspectorId}</p>
                  }
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ngày giám định :</label>
                  <DatePicker
                    value={formData.scheduledDate ? dayjs(formData.scheduledDate, "YYYY-MM-DD") : null}
                    onChange={(date) => {
                      const formattedDate = date ? dayjs(date).hour(12).minute(0).second(0).utc().toISOString() : ""
                      setFormData({ ...formData, scheduledDate: formattedDate });
                      if (errors.scheduledDate) {
                        setErrors({ ...errors, scheduledDate: "" });
                      }
                    }}
                    placeholder="DD-MM-YYYY"
                    format="DD-MM-YYYY"
                    disabledDate={(current) => current && current < dayjs().startOf("day")}
                  />
                  {errors.scheduledDate &&
                    <p className="mt-1 text-sm text-red-600">{errors.scheduledDate}</p>
                  }
                </div>
              </div>

              <Divider className="my-1" />

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  Email thông báo sẽ được gửi riêng cho từng trung tâm
                  {selectedCenters.length > 1 && (
                    <span className="text-xs font-normal text-slate-500 ml-2">
                      (Hiển thị mẫu email cho trung tâm đầu tiên)
                    </span>
                  )}
                </p>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tiêu đề email</label>
                  <Input
                    value={formEmailData.subject}
                    readOnly
                    placeholder="Tiêu đề sẽ tự động tạo khi chọn trung tâm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nội dung email</label>
                  <Input.TextArea
                    rows={6}
                    value={formEmailData.body}
                    readOnly
                    placeholder="Nội dung sẽ hiển thị khi bạn chọn lịch giám định"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Mỗi trung tâm sẽ nhận email riêng với nội dung tương ứng. Nội dung đã bao gồm thông tin Người giám định và Ngày giám định.
                  </p>
                </div>
              </div>
            </div>
          </Modal>

          <Modal
            title={<span className="text-xl font-semibold text-gray-800">Chi tiết giám định</span>}
            open={openModelViewAppraisal}
            onCancel={handleCancelViewAppraisal}
            footer={null}
            confirmLoading={modalLoading}
            width={800}
          >
            {console.log("formViewData", formViewData)}
            {formViewData &&
              <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{formViewData.centerName}</h3>
                    {getVerificationStatusBadge(verificationStatus[formViewData.status])}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Ngày tạo giám định: </span>
                    <span>{dayjs(formViewData.createdAt).format("DD/MM/YYYY HH:mm")}</span>
                  </div>
                </div>

                <Divider className="my-4" />

                {/* Thông tin giám định viên */}
                <div className="space-y-4">
                  <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <span className="w-1 h-5 bg-blue-500 rounded"></span>
                    Thông tin giám định
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Người giám định</label>
                      <span className="text-sm text-gray-900 font-medium">{formViewData.inspectorName || "N/A"}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Ngày kiểm tra</label>
                      <span className="text-sm text-gray-900 font-medium">
                        {formViewData.scheduledDate ? dayjs(formViewData.scheduledDate).format("DD/MM/YYYY") : "N/A"}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Ngày hoàn tất</label>
                      <span className="text-sm text-gray-900 font-medium">
                        {formViewData.completedDate ? dayjs(formViewData.completedDate).format("DD/MM/YYYY") : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <Divider className="my-4" />

                {/* Nội dung kiểm tra */}
                <div className="space-y-4">
                  <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <span className="w-1 h-5 bg-blue-500 rounded"></span>
                    Nội dung kiểm tra
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <label className="block text-sm font-medium text-gray-600 mb-2">Các tài liệu</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${formViewData.isDocumentsVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}>
                        {formViewData.isDocumentsVerified ? "✓ Đạt" : "✗ Không đạt"}
                      </span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <label className="block text-sm font-medium text-gray-600 mb-2">Các chứng chỉ</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${formViewData.isLicenseValid
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}>
                        {formViewData.isLicenseValid ? "✓ Đạt" : "✗ Không đạt"}
                      </span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <label className="block text-sm font-medium text-gray-600 mb-2">Vị trí</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${formViewData.isLocationVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}>
                        {formViewData.isLocationVerified ? "✓ Đạt" : "✗ Không đạt"}
                      </span>
                    </div>
                  </div>
                </div>

                <Divider className="my-4" />

                {/* Danh sách kiểm tra */}
                {formViewData.documentChecklist && formViewData.documentChecklist.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                      <span className="w-1 h-5 bg-blue-500 rounded"></span>
                      Danh sách kiểm tra
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="space-y-2">
                        {formViewData.documentChecklist.map((item, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span className="text-sm text-gray-700 flex-1">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Ảnh kèm theo */}
                {formViewData.verificationPhotos && formViewData.verificationPhotos.length > 0 && (
                  <>
                    <Divider className="my-4" />
                    <div className="space-y-4">
                      <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                        <span className="w-1 h-5 bg-blue-500 rounded"></span>
                        Ảnh kèm theo
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {formViewData.verificationPhotos.map((photo, index) => (
                          <div key={index} className="relative aspect-square bg-gray-100 rounded-lg border border-gray-200 overflow-hidden group">
                            {typeof photo === 'string' && (photo.startsWith('http') || photo.startsWith('/')) ? (
                              <img
                                src={photo}
                                alt={`Verification ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="hidden w-full h-full items-center justify-center text-gray-400 text-xs">
                              {photo}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Divider className="my-4" />

                {/* Ghi chú */}
                <div className="space-y-4">
                  {formViewData.inspectorNotes && (
                    <div>
                      <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-2">
                        <span className="w-1 h-5 bg-blue-500 rounded"></span>
                        Ghi chú phía giám định
                      </h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{formViewData.inspectorNotes}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-2">
                      <span className="w-1 h-5 bg-blue-500 rounded"></span>
                      Ghi chú phía admin
                    </h4>
                    <Input.TextArea
                      rows={4}
                      name="adminNotes"
                      value={formViewData.adminNotes || ""}
                      onChange={(e) => setFormViewData({ ...formViewData, adminNotes: e.target.value })}
                      placeholder="Nhập ghi chú cho quyết định của bạn..."
                      readOnly={!!formViewData.adminDecision}
                      className={formViewData.adminDecision ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                {!formViewData.adminDecision && (
                  <>
                    <Divider className="my-4" />
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDecision("Rejected")}
                        disabled={modalLoading}
                        className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                      >
                        Không chấp nhận
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDecision("Approved")}
                        disabled={modalLoading}
                        className="px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                      >
                        Chấp nhận
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            }
          </Modal>
        </>
      )}
    </Space>
  )
}

export default AdminCenterVerificationTab

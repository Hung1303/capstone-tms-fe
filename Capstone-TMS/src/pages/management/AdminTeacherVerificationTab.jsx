import { useState, useEffect, useCallback } from 'react'
import { SearchOutlined, ReloadOutlined, TeamOutlined, UserOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined, EyeOutlined, SendOutlined } from '@ant-design/icons'
import { Card, Input, Modal, Space, Table, Button, Tag, Form, Tooltip } from 'antd'
import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import api from '../../config/axios'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { toast } from 'react-toastify'
import { useAuth } from '../../contexts/AuthContext'

dayjs.extend(utc)

const AdminTeacherVerificationTab = () => {
  const { logout, loading: authLoading } = useAuth()
  
  const [allTeachers, setAllTeachers] = useState([]) // Store all teachers from API
  const [centers, setCenters] = useState([]) // Unique centers derived from teachers
  const [selectedCenter, setSelectedCenter] = useState(null)
  const [teachers, setTeachers] = useState([]) // Teachers filtered by selected center
  const [loadingStates, setLoadingStates] = useState({
    centers: false,
    teachers: false
  })
  const [modalLoading, setModalLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [form] = Form.useForm()
  
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

  const fetchTeachers = useCallback(async (pageNumber, pageSize) => {
    setTableLoading("centers", true)
    
    try {
      const apiResponse = await api.get(`/Users/Teachers?pageNumber=${pageNumber}&pageSize=${pageSize}`)
      console.log('API Response Teachers:', apiResponse.data)
      
      const teachersData = apiResponse.data.teachers || []
      const totalCount = apiResponse.data.totalCount || 0
      
      setAllTeachers(teachersData)
      
      // Group teachers by centerName to create unique centers list
      const centersMap = new Map()
      teachersData.forEach(teacher => {
        const {centerName, status} = teacher

        if (status !== 'Pending' || !centerName) return

        if (centerName && !centersMap.has(centerName)) {
          // Create a center object from the first teacher of that center
          centersMap.set(centerName, {
            centerName: centerName,
            teacherCount: 1,
            firstTeacher: teacher
          })
        } else if (centerName) {
          // Increment teacher count for existing center
          const center = centersMap.get(centerName)
          center.teacherCount += 1
        }
      })
      
      const uniqueCenters = Array.from(centersMap.values()).map(center => ({
        centerName: center.centerName,
        teacherCount: center.teacherCount,
        id: center.firstTeacher.id,
        profileId: center.firstTeacher.profileId
      }))
      
      setCenters(uniqueCenters)
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
      setTableLoading("centers", false)
    }
  }, [logout, setTableLoading])

  const filterTeachersByCenter = useCallback((centerName) => {
    if (!centerName) {
      setTeachers([])
      return
    }
    
    setTableLoading("teachers", true)
    
    const filtered = allTeachers.filter(teacher => teacher.centerName === centerName)
    
    setTeachers(filtered)
    setTableLoading("teachers", false)
  }, [allTeachers, setTableLoading])

  useEffect(() => {
    fetchTeachers(teachersPagination.pageNumber, teachersPagination.pageSize)
  }, [fetchTeachers, teachersPagination.pageNumber, teachersPagination.pageSize])

  const handleCenterClick = (center) => {
    setSelectedCenter(center)
    filterTeachersByCenter(center.centerName)
  }

  const handleCreateVerification = (teacher) => {
    console.log('Creating verification for teacher:', teacher)
    form.setFieldsValue({
      teacherProfileId: teacher.profileId,
      notes: ""
    })
    setCreateModalOpen(true)
  }

  const handleSubmitVerification = async () => {
    try {
      const values = await form.validateFields()
      setModalLoading(true)
      
      const payload = {
        teacherProfileId: values.teacherProfileId,
        notes: values.notes || ''
      }
      
      console.log('Creating verification with payload:', payload)
      const response = await api.post('/teacher-verifications', payload)
      console.log('Create verification response:', response.data)
      
      toast.success('Tạo yêu cầu nộp tài liệu thành công')
      setCreateModalOpen(false)
      form.resetFields()
      
      if (selectedCenter) {
        filterTeachersByCenter(selectedCenter.centerName)
      }
    } catch (error) {
      console.error('Error creating verification:', error)
      const errorMessage = error.response?.data?.message || 'Không thể tạo yêu cầu kiểm định'

      if (error.code === 'ERR_NETWORK') {
        toast.error('Không thể kết nối đến máy chủ. Vui lòng thử lại.')
        return
      }
      
      if (errorMessage.includes('Đã có yêu cầu xác minh đang chờ duyệt') ) {
        toast.error("Bạn đã tạo yêu cầu rồi.")
      }
      
    } finally {
      setModalLoading(false)
    }
  }

  const handleCancel = () => {
    setCreateModalOpen(false)
    form.resetFields()
  }

  const handleRefresh = () => {
    setSearchTerm('')
    setSelectedCenter(null)
    setTeachers([])
    fetchTeachers(teachersPagination.pageNumber, teachersPagination.pageSize)
    // if (selectedCenter) {
    //   filterTeachersByCenter(selectedCenter.centerName)
    // }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      Active: {
        label: "Hoạt động",
        className: "bg-green-100 text-green-800",
        icon: <CheckCircleOutlined />
      },
      Pending: {
        label: "Chưa kích hoạt",
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
        icon: <WarningOutlined />
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

  // Filter centers by search term
  const filteredCenters = centers.filter(center => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return center.centerName?.toLowerCase().includes(search)
  })

  // Centers table columns
  const centersColumns = [
    {
      title: "Tên trung tâm",
      dataIndex: "centerName",
      key: "centerName",
      width: 400,
      render: (centerName) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{centerName}</div>
        </div>
      )
    },
    {
      title: "Số lượng giáo viên",
      dataIndex: "teacherCount",
      key: "teacherCount",
      width: 150,
      render: (count) => (
        <Tag color="blue">{count} giáo viên</Tag>
      )
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (record) => (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleCenterClick(record)}
          className="inline-flex items-center cursor-pointer px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg"
        >
          <EyeOutlined className="text-lg mr-1"/> 
          <span>Xem giáo viên</span>
        </motion.button>
      )
    }
  ]

  // Teachers table columns
  const teachersColumns = [
    {
      title: "Giáo viên",
      dataIndex: "fullName",
      key: "fullName",
      width: 200,
      render: (fullName) => (
        <div className="text-sm font-medium text-gray-900">{fullName}</div>
      )
    },
    {
      title: "Kinh nghiệm",
      dataIndex: "yearOfExperience",
      key: "yearOfExperience",
      width: 120,
      align: "center",
      render: (years) => (
        <Tag color="green">{years || 0} năm</Tag>
      )
    },
    {
      title: "Trình độ",
      dataIndex: "qualification",
      key: "qualification",
      width: 200,
      render: (qualification) => (
        <div className="text-sm text-gray-700">{qualification || 'N/A'}</div>
      )
    },
    {
      title: "Môn học",
      dataIndex: "subject",
      key: "subject",
      width: 150,
      align: "center",
      render: (subject) => (
        <Tag color="blue">{subject || 'N/A'}</Tag>
      )
    },
    {
      title: "Trường dạy",
      dataIndex: "teachingAtSchool",
      key: "teachingAtSchool",
      width: 200,
      render: (school) => (
        <div className="text-sm text-gray-700">{school || 'N/A'}</div>
      )
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => getStatusBadge(status)
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => {
        if (record.status === 'Pending') {
          return (
            <Tooltip title="Tạo yêu cầu nộp tài liệu">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => handleCreateVerification(record)}
                className="cursor-pointer text-lg text-green-500 hover:text-green-600"
              >
                <SendOutlined />
              </motion.button>
            </Tooltip>
          )
        }
      }
    }
  ]

  
  const centersData = filteredCenters.map(center => ({
    key: center.centerName, 
    centerName: center.centerName,
    teacherCount: center.teacherCount,
    id: center.id,
    profileId: center.profileId
  }))

  console.log('Mapping teacher for table:', teachers)
  const teachersData = teachers.map(teacher => ({
    key: teacher.id,
    ...teacher 
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
                onClick={handleRefresh}
                className="group"
              >
                <ReloadOutlined className="group-hover:animate-spin" />
                Làm mới
              </Button>
            }
          >
            <div className="mb-4">
              <Input
                size="large"
                placeholder="Tìm kiếm theo tên trung tâm, địa chỉ..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
            </div>
            
            <Table
              columns={centersColumns}
              dataSource={centersData}
              rowKey="key"
              pagination={false}
              loading={loadingStates.centers}
              scroll={{ x: 'max-content', ...(centersData.length > 5 && {y: 75 * 5}) }}
            />
          </Card>

          {/* Teachers Section */}
          {selectedCenter && (
            <Card
              title={
                <div className="flex items-center gap-2">
                  <TeamOutlined />
                  <span>
                    Giáo viên cần kiểm định - {selectedCenter.centerName}
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
                dataSource={teachersData}
                rowKey="key"
                loading={loadingStates.teachers}
                pagination={false}
                scroll={{ x: 'max-content', ...(teachersData.length > 5 && {y: 75 * 5}) }}
              />
            </Card>
          )}

          {/* Create Verification Modal */}
          <Modal
            title="Tạo yêu cầu kiểm định giáo viên"
            open={createModalOpen}
            onOk={handleSubmitVerification}
            onCancel={handleCancel}
            confirmLoading={modalLoading}
            okText="Tạo yêu cầu"
            cancelText="Hủy"
            width={600}
          >
            <Form
              form={form}
              layout="vertical"
              className="mt-4"
            >
              <Form.Item
                name="teacherProfileId"
                label="profileId Giáo viên"
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
          </Modal>
        </>
      )}
    </Space>
  )
}

export default AdminTeacherVerificationTab

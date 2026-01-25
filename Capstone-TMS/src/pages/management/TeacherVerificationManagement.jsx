import { useCallback, useEffect, useState } from 'react'
import { Card, Space, Table, Typography, Button, Modal, Form, Input } from 'antd'
import { TeamOutlined, FileDoneOutlined, ReloadOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import api from '../../config/axios'
import { toast } from 'react-toastify'
import { useAuth } from '../../contexts/AuthContext'

dayjs.extend(utc)
const { Title, Text } = Typography

const TeacherVerificationManagement = () => {
  const { user, logout, loading: authLoading } = useAuth()

  const [verifications, setVerifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    total: 0
  })

  const [documentModalOpen, setDocumentModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [selectedVerification, setSelectedVerification] = useState(null)
  const [form] = Form.useForm()

  const fetchVerifications = useCallback(async (pageNumber, pageSize) => {
    setLoading(true)
    try {
      const apiResponse = await api.get(`/teacher-verifications/center/${user.centerProfileId}?pageNumber=${pageNumber}&pageSize=${pageSize}`)
      console.log('API Response Teacher Verifications (center):', apiResponse.data)

      const items = apiResponse.data || []
      const totalCount = apiResponse.data.totalCount ?? apiResponse.data.total ?? items.length ?? 0

      setVerifications(items)
      setPagination(prev => ({
        ...prev,
        pageNumber,
        pageSize,
        total: totalCount
      }))
    } catch (error) {
      console.error('Error fetching teacher verifications for center:', error)
      if (error.code === 'ERR_NETWORK') {
        logout()
      } else {
        const message = error.response?.data?.message || 'Không thể tải danh sách kiểm tra giáo viên'
        toast.error(message)
      }
    } finally {
      setLoading(false)
    }
  }, [logout, user])

  useEffect(() => {
    fetchVerifications(pagination.pageNumber, pagination.pageSize)
  }, [fetchVerifications, pagination.pageNumber, pagination.pageSize])

  const handlePaginationChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      pageNumber: pageSize !== prev.pageSize ? 1 : page,
      pageSize
    }))
  }

  const handleRefresh = () => {
    fetchVerifications(pagination.pageNumber, pagination.pageSize)
  }

  const getVerifyStatusBadge = (status) => {
    const statusConfig = {
      0: {
        label: 'Chờ duyệt',
        className: 'bg-yellow-100 text-yellow-800',
        icon: <ClockCircleOutlined />
      },
      1: {
        label: 'Đang kiểm tra',
        className: 'bg-cyan-100 text-cyan-800',
        icon: <ClockCircleOutlined />
      },
      2: {
        label: 'Đã hoàn tất',
        className: 'bg-green-100 text-green-800',
        icon: <CheckCircleOutlined />
      },
      3: {
        label: 'Không đạt',
        className: 'bg-red-100 text-red-800',
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

  const openDocumentModal = (record) => {
    console.log('Opening document modal for verification:', record)
    setSelectedVerification(record)

    if (record.status === 1) {
      form.setFieldsValue({
        qualificationCertificatePath: record.qualificationCertificatePath || '',
        employmentContractPath: record.employmentContractPath || '',
        approvalFromCenterPath: record.approvalFromCenterPath || '',
        otherDocumentsPath: record.otherDocumentsPath || ''
      })
    } else {
      form.resetFields()
    }

    setDocumentModalOpen(true)
  }

  const handleSubmitDocuments = async () => {
    try {
      const values = await form.validateFields()
      if (!selectedVerification) {
        toast.error('Không tìm thấy yêu cầu kiểm định để nộp tài liệu')
        return
      }

      console.log('Form values for submitting documents:', selectedVerification, values)
      const verificationId = selectedVerification.id || selectedVerification.verificationId
      if (!verificationId) {
        toast.error('Thiếu mã yêu cầu kiểm định')
        return
      }

      const payload = {
        qualificationCertificatePath: values.qualificationCertificatePath || '',
        employmentContractPath: values.employmentContractPath || '',
        approvalFromCenterPath: values.approvalFromCenterPath || '',
        otherDocumentsPath: values.otherDocumentsPath || ''
      }

      setModalLoading(true)
      console.log('Submitting teacher verification documents:', {
        verificationId,
        payload
      })

      const response = await api.put(`/teacher-verifications/${verificationId}/documents`, payload)
      console.log('Submit documents response:', response.data)
      toast.success('Nộp tài liệu thành công')

      setDocumentModalOpen(false)
      setSelectedVerification(null)
      form.resetFields()

      await fetchVerifications(pagination.pageNumber, pagination.pageSize)
    } catch (error) {
      if (error?.errorFields) {
        // validation error from AntD, do nothing
        return
      }
      console.error('Error submitting teacher documents:', error)
      if (error.code === 'ERR_NETWORK') {
        logout()
      } else {
        const message = error.response?.data?.message || 'Không thể nộp tài liệu cho giáo viên'
        toast.error(message)
      }
    } finally {
      setModalLoading(false)
    }
  }

  const handleCancelModal = () => {
    setDocumentModalOpen(false)
    setSelectedVerification(null)
    form.resetFields()
  }

  const columns = [
    {
      title: 'Giáo viên',
      dataIndex: 'teacherName',
      key: 'teacherName',
      render: (teacherName, record) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {teacherName || record.fullName || 'N/A'}
          </span>
          {record.subject && (
            <span className="text-xs text-gray-500">
              Môn: {record.subject}
            </span>
          )}
        </div>
      )
    },
    {
      title: 'Ngày gửi yêu cầu',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      render: (requestedAt) => (
        <span className="text-sm text-gray-600">
          {requestedAt ? dayjs(requestedAt).format('DD/MM/YYYY HH:mm') : '--'}
        </span>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getVerifyStatusBadge(status)
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => {
        return (
          record.status === 0 || record.status === 1 ? (
            <Button
              type="primary"
              icon={<FileDoneOutlined />}
              onClick={() => openDocumentModal(record)}
            >
              Nộp tài liệu
            </Button>
          ) : (null)
        )
      }
    }
  ]

  const tableData = verifications.map(item => ({
    key: item.id || item.verificationId || item.key,
    ...item
  }))

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {authLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Card className="shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Title level={4} className="!mb-1">
                  Danh sách kiểm tra giáo viên của trung tâm
                </Title>
                <Text type="secondary">
                  Quản lý và nộp tài liệu cho các yêu cầu kiểm tra giáo viên.
                </Text>
              </div>
              <Button
                type="primary"
                className="group"
                onClick={handleRefresh}
              >
                <ReloadOutlined className="group-hover:animate-spin" />
                Làm mới
              </Button>
            </div>

            <div className="rounded-lg shadow-sm">
              <Table
                columns={columns}
                dataSource={tableData}
                rowKey="key"
                loading={loading}
                pagination={{
                  current: pagination.pageNumber,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} yêu cầu`,
                  onChange: handlePaginationChange,
                  className: '!mr-4'
                }}
                scroll={{ x: 'max-content' }}
              />
            </div>
          </Card>

          <Modal
            title="Nộp tài liệu kiểm tra giáo viên"
            open={documentModalOpen}
            onOk={handleSubmitDocuments}
            onCancel={handleCancelModal}
            confirmLoading={modalLoading}
            okText="Nộp tài liệu"
            cancelText="Hủy"
            width={600}
          >
            <Form
              form={form}
              layout="vertical"
              className="mt-4"
            >
              <Form.Item
                label="Link chứng chỉ chuyên môn"
                name="qualificationCertificatePath"
                rules={[
                  { required: true, message: 'Vui lòng nhập đường dẫn chứng chỉ chuyên môn' }
                ]}
              >
                <Input placeholder="Ví dụ: /cousera/teacher-abc.pdf" />
              </Form.Item>

              <Form.Item
                label="Link hợp đồng lao động"
                name="employmentContractPath"
                rules={[
                  { required: true, message: 'Vui lòng nhập đường dẫn hợp đồng lao động' }
                ]}
              >
                <Input placeholder="Ví dụ: /cousera/teacher-abc.pdf" />
              </Form.Item>

              <Form.Item
                label="Link phê duyệt từ trung tâm"
                name="approvalFromCenterPath"
                rules={[
                  { required: true, message: 'Vui lòng nhập đường dẫn phê duyệt từ trung tâm' }
                ]}
              >
                <Input placeholder="Ví dụ: /cousera/approval-xyz.pdf" />
              </Form.Item>

              <Form.Item
                label="Các tài liệu khác (tùy chọn)"
                name="otherDocumentsPath"
              >
                <Input placeholder="Ví dụ: /cousera/others/..." />
              </Form.Item>
            </Form>
          </Modal>
        </>
      )}
    </Space>
  )
}

export default TeacherVerificationManagement

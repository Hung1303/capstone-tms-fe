import { useState, useEffect } from 'react'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, ReloadOutlined, GiftOutlined } from '@ant-design/icons'
import { toast } from 'react-toastify'
import api from '../../config/axios'
import { Button, Card, Input, Space, Typography, Table, Modal, Form, InputNumber, Switch } from 'antd'
import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars

const { Title, Text } = Typography

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    setLoading(true)
    try {
      const response = await api.get('/Subscription/packages')
      const subList = response?.data?.data || response?.data || []
      setSubscriptions(Array.isArray(subList) ? subList : [])
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      toast.error('Lỗi khi tải danh sách gói')
      setSubscriptions([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (subscription = null) => {
    if (subscription) {
      setEditingId(subscription.id)
      form.setFieldsValue({
        packageName: subscription.packageName || '',
        description: subscription.description || '',
        tier: subscription.tier || 1,
        monthlyPrice: subscription.monthlyPrice || 0,
        maxCoursePosts: subscription.maxCoursePosts || 5,
        isActive: subscription.isActive !== undefined ? subscription.isActive : true,
        displayOrder: subscription.displayOrder || 1
      })
    } else {
      setEditingId(null)
      form.resetFields()
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
    form.resetFields()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      if (editingId) {
        await api.put(`/Subscription/packages/${editingId}`, values)
        toast.success('Cập nhật gói thành công!')
      } else {
        await api.post('/Subscription/packages', values)
        toast.success('Tạo gói thành công!')
      }
      await fetchSubscriptions()
      handleCloseModal()
    } catch (error) {
      if (error.errorFields) {
        // Form validation errors
        return
      }
      console.error('Error saving subscription:', error)
      const errorMsg = error.response?.data?.message || 'Lỗi khi lưu gói'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    setDeleteId(id)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    
    setLoading(true)
    try {
      await api.delete(`/Subscription/packages/${deleteId}`)
      await fetchSubscriptions()
      toast.success('Xóa gói thành công!')
      setShowDeleteModal(false)
      setDeleteId(null)
    } catch (error) {
      console.error('Error deleting subscription:', error)
      toast.error('Lỗi khi xóa gói')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setDeleteId(null)
  }

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.packageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getPriceDisplay = (price) => {
    return price?.toLocaleString('vi-VN') || '0'
  }

  const getTierLabel = (tier) => {
    const labels = {
      1: 'Basic',
      2: 'Standard',
      3: 'Premium'
    }
    return labels[tier] || `Tier ${tier}`
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {/* Header */}
      <Card className="!bg-gradient-to-r !from-[#e7a025] !to-[#f9c161] !rounded-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Title level={2} className="!text-white !m-0 !font-bold">
              <GiftOutlined /> Quản lý các gói
            </Title>
            <Text className="!text-white/90 !text-base">
              Thêm, xóa, chỉnh sửa các gói dịch vụ cho trung tâm.
            </Text>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenModal()}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg shadow hover:shadow-xl transition-shadow"
          >
            <PlusOutlined />
            <span>Tạo gói mới</span>
          </motion.button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{subscriptions.length}</div>
          <div className="text-sm text-gray-600">Tổng gói</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {subscriptions.filter(s => s.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Gói đang hoạt động</div>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Input
            className="search-input"
            size="large"
            placeholder="Tìm kiếm theo tên hoặc mô tả..."
            prefix={<SearchOutlined className="search-icon" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
          <Button
            type="primary"
            onClick={() => {
              setSearchTerm('')
              fetchSubscriptions()
            }}
            className="group"
          >
            <ReloadOutlined className="group-hover:animate-spin" />
            Làm mới
          </Button>
        </div>

        {/* Subscriptions table */}
        <div className="mt-6 rounded-lg shadow-sm overflow-hidden">
          <Table
            dataSource={filteredSubscriptions}
            columns={[
              {
                title: 'Tên gói',
                dataIndex: 'packageName',
                key: 'packageName',
                render: (text) => <span className="font-medium">{text}</span>
              },
              {
                title: 'Tier',
                dataIndex: 'tier',
                key: 'tier',
                render: (tier) => getTierLabel(tier)
              },
              {
                title: 'Giá/tháng',
                dataIndex: 'monthlyPrice',
                key: 'monthlyPrice',
                render: (price) => <span className="font-medium">{getPriceDisplay(price)}đ</span>
              },
              {
                title: 'Bài đăng tối đa',
                dataIndex: 'maxCoursePosts',
                key: 'maxCoursePosts'
              },
              {
                title: 'Trạng thái',
                dataIndex: 'isActive',
                key: 'isActive',
                render: (isActive) => (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                )
              },
              {
                title: 'Thứ tự',
                dataIndex: 'displayOrder',
                key: 'displayOrder'
              },
              {
                title: 'Thao tác',
                key: 'action',
                render: (_, record) => (
                  <Space>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOpenModal(record)}
                      className="cursor-pointer text-lg text-green-600 hover:text-green-700"
                    >
                      <EditOutlined />
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleDeleteClick(e, record.id)}
                      className="cursor-pointer ml-1 text-lg text-red-600 hover:text-red-700"
                    >
                      <DeleteOutlined />
                    </motion.button>
                  </Space>
                )
              }
            ]}
            rowKey="id"
            loading={loading}
            pagination={false}
            locale={{
              emptyText: 'Không có gói nào'
            }}
          />
        </div>

        <Modal
          title={editingId ? 'Chỉnh sửa gói' : 'Tạo gói mới'}
          open={showModal}
          onCancel={handleCloseModal}
          onOk={handleSubmit}
          confirmLoading={loading}
          okText={editingId ? 'Cập nhật' : 'Tạo gói'}
          cancelText="Hủy"
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              tier: 1,
              monthlyPrice: 0,
              maxCoursePosts: 5,
              isActive: true,
              displayOrder: 1
            }}
          >
            <Form.Item
              label="Tên gói"
              name="packageName"
              rules={[
                { required: true, message: 'Vui lòng nhập tên gói' },
                { whitespace: true, message: 'Tên gói không được để trống' }
              ]}
            >
              <Input placeholder="VD: Basic Plan, Standard Plan, Premium Plan" />
            </Form.Item>

            <Form.Item
              label="Mô tả"
              name="description"
              rules={[
                { required: true, message: 'Vui lòng nhập mô tả' },
                { whitespace: true, message: 'Mô tả không được để trống' }
              ]}
            >
              <Input.TextArea rows={3} placeholder="Nhập mô tả gói" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="Tier"
                name="tier"
                rules={[
                  { required: true, message: 'Vui lòng nhập tier' },
                  { type: 'number', min: 1, message: 'Tier phải ≥ 1' }
                ]}
              >
                <InputNumber min={1} className="w-full" placeholder="1" />
              </Form.Item>

              <Form.Item
                label="Giá/tháng (đ)"
                name="monthlyPrice"
                rules={[
                  { required: true, message: 'Vui lòng nhập giá' },
                  { type: 'number', min: 0, message: 'Giá không được âm' }
                ]}
              >
                <InputNumber min={0} className="w-full" placeholder="500000" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="Bài đăng tối đa"
                name="maxCoursePosts"
                rules={[
                  { required: true, message: 'Vui lòng nhập số bài đăng tối đa' },
                  { type: 'number', min: 1, message: 'Số bài đăng tối đa phải ≥ 1' }
                ]}
              >
                <InputNumber min={1} className="w-full" placeholder="5" />
              </Form.Item>

              <Form.Item
                label="Thứ tự hiển thị"
                name="displayOrder"
                rules={[
                  { required: true, message: 'Vui lòng nhập thứ tự hiển thị' },
                  { type: 'number', min: 1, message: 'Thứ tự hiển thị phải ≥ 1' }
                ]}
              >
                <InputNumber min={1} className="w-full" placeholder="1" />
              </Form.Item>
            </div>

            <Form.Item
              label="Trạng thái"
              name="isActive"
              valuePropName="checked"
            >
              <Switch checkedChildren="Hoạt động" unCheckedChildren="Không hoạt động" />
            </Form.Item>
          </Form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <ExclamationCircleOutlined className="text-red-600" />
              <span>Xác nhận xóa</span>
            </div>
          }
          open={showDeleteModal}
          onOk={handleConfirmDelete}
          onCancel={handleCancelDelete}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          confirmLoading={loading}
        >
          <p>Bạn có chắc chắn muốn xóa gói này? Hành động này không thể hoàn tác.</p>
        </Modal>
      </Card>
    </Space>
  )
}

export default SubscriptionManagement

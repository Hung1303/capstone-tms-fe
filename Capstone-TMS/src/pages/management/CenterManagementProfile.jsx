import { useEffect, useState } from 'react'
import { Form, Input, Button, Card, Spin, message, Row, Col, Divider, Space } from 'antd'
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../config/axios'

// CSS để ẩn spinner (nút tăng/giảm) của input number
const numberInputStyle = `
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
`

const CenterManagementProfile = () => {
  const { user } = useAuth()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [centerData, setCenterData] = useState(null)

  // Fetch center data
  const fetchCenterData = async () => {
    if (!user?.userId) return
    
    setLoading(true)
    try {
      const response = await api.get(`/Users/Center/${user.userId}`)
      console.log('Center data:', response.data)
      setCenterData(response.data)
      
      // Set form values
      form.setFieldsValue({
        fullName: response.data.fullName,
        email: response.data.email,
        phoneNumber: response.data.phoneNumber,
        status: response.data.status,
        centerName: response.data.centerName,
        ownerName: response.data.ownerName,
        licenseNumber: response.data.licenseNumber,
        issueDate: response.data.issueDate,
        licenseIssuedBy: response.data.licenseIssuedBy,
        address: response.data.address,
        contactEmail: response.data.contactEmail,
        contactPhone: response.data.contactPhone,
        latitude: response.data.latitude || '',
        longitude: response.data.longitude || '',
      })
    } catch (error) {
      console.error('Lỗi tải dữ liệu trung tâm:', error)
      message.error('Không thể tải thông tin trung tâm')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCenterData()
  }, [user?.userId])

  // Handle form submit
  const handleSubmit = async (values) => {
    if (!user?.userId) {
      message.error('Không tìm thấy thông tin người dùng')
      return
    }

    setSubmitting(true)
    try {
      const updateData = {
        fullName: values.fullName || '',
        email: values.email || '',
        phoneNumber: values.phoneNumber || '',
        status: values.status || '',
        centerName: values.centerName || '',
        ownerName: values.ownerName || '',
        licenseNumber: values.licenseNumber || '',
        issueDate: values.issueDate || '',
        licenseIssuedBy: values.licenseIssuedBy || '',
        address: values.address || '',
        contactEmail: values.contactEmail || '',
        contactPhone: values.contactPhone || '',
        latitude: values.latitude ? parseFloat(values.latitude) : null,
        longitude: values.longitude ? parseFloat(values.longitude) : null,
      }

      console.log('Updating center with:', updateData)
      
      const response = await api.put(`/Users/Center/${user.userId}`, updateData)
      console.log('Update response:', response.data)
      
      message.success('Cập nhật thông tin trung tâm thành công')
      setCenterData(response.data)
      form.setFieldsValue({
        fullName: response.data.fullName,
        email: response.data.email,
        phoneNumber: response.data.phoneNumber,
        status: response.data.status,
        centerName: response.data.centerName,
        ownerName: response.data.ownerName,
        licenseNumber: response.data.licenseNumber,
        issueDate: response.data.issueDate,
        licenseIssuedBy: response.data.licenseIssuedBy,
        address: response.data.address,
        contactEmail: response.data.contactEmail,
        contactPhone: response.data.contactPhone,
        latitude: response.data.latitude || '',
        longitude: response.data.longitude || '',
      })
    } catch (error) {
      console.error('Lỗi cập nhật:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra'
      message.error(`Cập nhật thất bại: ${errorMsg}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="Đang tải thông tin trung tâm..." />
      </div>
    )
  }

  return (
    <div className="p-6">
      <style>{numberInputStyle}</style>
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Trung Tâm</h1>
        <p className="text-gray-600 mt-2">Xem và chỉnh sửa thông tin trung tâm của bạn</p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="max-w-4xl"
      >
        {/* Thông tin cá nhân */}
        <Card className="mb-6" title="Thông tin cá nhân" bordered={false}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Họ và tên"
                name="fullName"
              >
                <Input disabled className="bg-blue-50 border-blue-200" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
              >
                <Input disabled className="bg-blue-50 border-blue-200" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Số điện thoại"
                name="phoneNumber"
              >
                <Input disabled className="bg-blue-50 border-blue-200" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Trạng thái"
                name="status"
              >
                <Input disabled className="bg-blue-50 border-blue-200" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Thông tin trung tâm */}
        <Card className="mb-6" title="Thông tin Trung Tâm" bordered={false}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tên trung tâm"
                name="centerName"
              >
                <Input disabled className="bg-blue-50 border-blue-200" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Chủ sở hữu"
                name="ownerName"
              >
                <Input disabled className="bg-blue-50 border-blue-200" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label="Địa chỉ"
                name="address"
              >
                <Input.TextArea disabled className="bg-blue-50 border-blue-200" rows={3} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Thông tin giấy phép */}
        <Card className="mb-6" title="Thông tin Giấy Phép" bordered={false}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Số giấy phép"
                name="licenseNumber"
              >
                <Input disabled className="bg-blue-50 border-blue-200" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Ngày cấp"
                name="issueDate"
              >
                <Input disabled className="bg-blue-50 border-blue-200" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label="Cơ quan cấp phép"
                name="licenseIssuedBy"
              >
                <Input disabled className="bg-blue-50 border-blue-200" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Thông tin liên hệ */}
        <Card className="mb-6" title="Thông tin Liên Hệ" bordered={false}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Email liên hệ"
                name="contactEmail"
              >
                <Input disabled className="bg-blue-50 border-blue-200" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Số điện thoại liên hệ"
                name="contactPhone"
              >
                <Input disabled className="bg-blue-50 border-blue-200" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Vị trí địa lý - Có thể chỉnh sửa */}
        <Card 
          className="mb-6" 
          title="Vị Trí Địa Lý" 
          bordered={false}
          style={{ borderColor: '#ffa940', borderWidth: 2 }}
        >
          <div className="bg-orange-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-orange-800">
               Bạn có thể chỉnh sửa kinh độ và vĩ độ để cập nhật vị trí trung tâm trên bản đồ
            </p>
          </div>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Vĩ độ (Latitude)"
                name="latitude"
                rules={[
                  {
                    pattern: /^-?([0-8]?[0-9](\.[0-9]{1,8})?|90(\.0{1,8})?)$/,
                    message: 'Vĩ độ phải là số từ -90 đến 90',
                  },
                ]}
              >
                <Input 
                  placeholder="Ví dụ: 10.7769"
                  type="number"
                  step="0.0001"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Kinh độ (Longitude)"
                name="longitude"
                rules={[
                  {
                    pattern: /^-?([0-9]{1,2}(\.[0-9]{1,8})?|1[0-7][0-9](\.[0-9]{1,8})?|180(\.0{1,8})?)$/,
                    message: 'Kinh độ phải là số từ -180 đến 180',
                  },
                ]}
              >
                <Input 
                  placeholder="Ví dụ: 106.6835"
                  type="number"
                  step="0.0001"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Hiển thị tọa độ hiện tại */}
          {centerData?.latitude && centerData?.longitude && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                📍 <strong>Tọa độ hiện tại:</strong> {centerData.latitude}, {centerData.longitude}
              </p>
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="primary"
            icon={<SaveOutlined />}
            htmlType="submit"
            loading={submitting}
            size="large"
          >
            Cập nhật
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchCenterData}
            loading={loading}
            size="large"
          >
            Làm mới
          </Button>
        </div>
      </Form>
    </div>
  )
}

export default CenterManagementProfile
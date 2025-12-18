import { useState } from 'react'
import { CheckCircleOutlined, StopOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button, Card, Space, Typography, Row, Col } from 'antd'
import SuspendCourseTab from './SuspendCourseTab'
import ApprovalCourseTab from './ApprovalCourseTab'

const { Title, Text } = Typography

const AdminCourseManagement = () => {
  const [activeTab, setActiveTab] = useState('suspend') // 'suspend' or 'approve'

  const tabItems = [
    {
      key: 'suspend',
      label: (
        <Space>
          <StopOutlined style={{ fontSize: '16px' }} />
          <span style={{ fontWeight: 600 }}>Thu hồi khóa học</span>
        </Space>
      ),
      children: null,
    },
    {
      key: 'approve',
      label: (
        <Space>
          <CheckCircleOutlined style={{ fontSize: '16px' }} />
          <span style={{ fontWeight: 600 }}>Chấp nhận khóa học</span>
        </Space>
      ),
      children: null,
    },
  ]

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {/* Header */}
      <Card className="!bg-gradient-to-br !from-[#667eea] !to-[#764ba2] !rounded-xl shadow-[0_8px_24px_rgba(102,126,234,0.3)]">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} className="!text-white !m-0 !font-bold">
              Quản lý khóa học
            </Title>
            <Text className="!text-white/90 !text-base">
              Thu hồi và chấp nhận các khóa học đã được công khai
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              onClick={() => window.location.reload()}
              size="large"
              className="group !bg-white/20 !border !border-white/30 !text-white !font-bold !backdrop-blur-[10px] hover:!bg-white/30 !transition-colors"
            >
              <ReloadOutlined className="group-hover:animate-spin"/>
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Excel-style Tabs and Search */}
      <Card className='shadow-lg'>
        <div>
          <div className="flex space-x-2 overflow-x-auto">
            {tabItems.map(item => (
              <div
                key={item.key}
                className={`relative px-6 py-3 mt-1 cursor-pointer border-2 transition-all duration-200 ease-out
                                  ${activeTab === item.key ? 'bg-white border-b-white rounded-t-2xl -translate-y-1 font-semibold shadow-[0_-2px_8px_currentColor/20]' : 'bg-transparent border-transparent hover:bg-white/50'}
                                  ${item.key === 'suspend' && activeTab === item.key ? 'text-red-500' : ''}
                                  ${item.key === 'approve' && activeTab === item.key ? 'text-green-500' : ''}
                          `}
                onClick={() => {
                  setActiveTab(item.key)
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
        <div className='mt-6'>
          {activeTab === 'suspend' && (
            <SuspendCourseTab />
          )}
          
          {activeTab === 'approve' && (
            <ApprovalCourseTab />
          )}
        </div>
      </Card>
    </Space>
  )
}

export default AdminCourseManagement


import { SafetyOutlined } from "@ant-design/icons"
import { Card, Space, Typography } from "antd"
import { useState } from "react"
import { MdOutlineBusinessCenter, MdOutlineHomeWork } from "react-icons/md"
import InspectTeacherVerificationTab from "./InspectTeacherVerificationTab"
import InspectCenterVerificaitonTab from "./InspectCenterVerificationTab"

const { Title, Text } = Typography

const InspectorVerification = () => {
  const [activeTab, setActiveTab] = useState('center') // 'center' or 'teacher'

  const tabItems = [
    {
      key: 'center',
      label: (
        <Space>
          <MdOutlineHomeWork style={{ fontSize: '16px' }} />
          <span style={{ fontWeight: 600 }}>Trung tâm</span>
        </Space>
      ),
      children: <InspectCenterVerificaitonTab />,
    },
    {
      key: 'teacher',
      label: (
        <Space>
          <MdOutlineBusinessCenter style={{ fontSize: '16px' }} />
          <span style={{ fontWeight: 600 }}>Giáo viên</span>
        </Space>
      ),
      children: <InspectTeacherVerificationTab />,
    },
  ]

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {/* Header */}
      <Card className="!bg-gradient-to-br !from-[#d92736] !to-[#f04b4b] !rounded-xl shadow-[0_8px_24px_rgba(102,126,234,0.3)]">
        <Title level={2} className="!text-white !m-0 !font-bold">
          <SafetyOutlined /> Quản lý xác thực
        </Title>
        <Text className="!text-white/90 !text-base">
          Kiểm duyệt và xác thực các trung tâm và giáo viên đăng ký trên hệ thống
        </Text>
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
                                  ${item.key === 'center' && activeTab === item.key ? 'text-yellow-500' : ''}
                                  ${item.key === 'teacher' && activeTab === item.key ? 'text-blue-500' : ''}
                          `}
                onClick={() => setActiveTab(item.key)}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
        <div className='mt-6'>
          {tabItems.find(item => item.key === activeTab).children}
        </div>
      </Card>
    </Space>
  )
}

export default InspectorVerification

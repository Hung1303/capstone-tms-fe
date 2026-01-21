import { SafetyOutlined, TeamOutlined } from "@ant-design/icons"
import { Card, Space, Typography } from "antd"
import { useState } from "react"
import { MdOutlineBusinessCenter, MdOutlineHomeWork } from "react-icons/md"
import TeacherManagement from "./TeacherManagement"
import TeacherVerificationManagement from "./TeacherVerificationManagement"

const { Title, Text } = Typography

const TeacherManagementMain = () => {
  const [activeTab, setActiveTab] = useState('teachers') // 'center' or 'teacher'

  const tabItems = [
    {
      key: 'teachers',
      label: (
        <Space>
          <TeamOutlined style={{ fontSize: '16px' }} />
          <span style={{ fontWeight: 600 }}>Danh sách giáo viên</span>
        </Space>
      ),
      children: <TeacherManagement />,
    },
    {
      key: 'verifications',
      label: (
        <Space>
          <SafetyOutlined style={{ fontSize: '16px' }} />
          <span style={{ fontWeight: 600 }}>Danh sách kiểm tra giáo viên</span>
        </Space>
      ),
      children: <TeacherVerificationManagement />,
    }
  ]

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {/* Header */}
      <Card className="!bg-gradient-to-br !from-[#d92736] !to-[#f04b4b] !rounded-xl shadow-[0_8px_24px_rgba(102,126,234,0.3)]">
        <Title level={2} className="!text-white !m-0 !font-bold">
          <TeamOutlined /> Quản lý giáo viên
        </Title>
        <Text className="!text-white/90 !text-base">
          Danh sách giáo viên và các yêu cầu kiểm tra giáo viên trên hệ thống
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
                                  ${item.key === 'verifications' && activeTab === item.key ? 'text-yellow-500' : ''}
                                  ${item.key === 'teachers' && activeTab === item.key ? 'text-blue-500' : ''}
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

export default TeacherManagementMain

import { useState, useEffect, useCallback } from 'react'
import {
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  CheckCircleOutlined, ClockCircleOutlined, WarningOutlined, StopOutlined
} from '@ant-design/icons'
import { Card, Input, Modal, Select, Space, Table, Tooltip, Form, Button, message, Popconfirm } from 'antd'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { useAuth } from '../../contexts/AuthContext'
import * as teacherService from '../../services/teacherService'

const TeacherManagement = () => {
  const { user, logout } = useAuth()
  const [teachers, setTeachers] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    total: 0
  })
  const [modalVisible, setModalVisible] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  // Lấy centerId từ AuthContext
  const centerId = user?.centerProfileId

  // Fetch danh sách giáo viên
  const fetchTeachers = useCallback(async (pageNumber = 1, pageSize = 10) => {
    if (!centerId) {
      toast.error('Không tìm thấy ID trung tâm')
      return
    }

    setLoading(true)
    try {
      const response = await teacherService.getTeachersByCenter(centerId, pageNumber, pageSize)
      console.log('Teachers response:', response)
      setTeachers(response.teachers || [])
      setPagination(prev => ({
        ...prev,
        pageNumber,
        pageSize,
        total: response.totalCount || response.teachers?.length || 0
      }))
    } catch (error) {
      console.error('Error fetching teachers:', error)
      if (error.code === 'ERR_NETWORK') {
        logout()
      } else {
        toast.error('Lỗi khi tải danh sách giáo viên')
      }
    } finally {
      setLoading(false)
    }
  }, [centerId, logout])

  // Fetch danh sách môn học
  const fetchSubjects = useCallback(async () => {
    try {
      const response = await teacherService.getSubjects()
      console.log('Subjects response:', response)
      // Xử lý response - có thể là array hoặc object với property subjects
      let subjectsList = []
      if (Array.isArray(response)) {
        subjectsList = response
      } else if (response.subjects && Array.isArray(response.subjects)) {
        subjectsList = response.subjects
      } else if (response.data && Array.isArray(response.data)) {
        subjectsList = response.data
      }
      setSubjects(subjectsList)
    } catch (error) {
      console.error('Error fetching subjects:', error)
      toast.error('Lỗi khi tải danh sách môn học')
    }
  }, [])

  useEffect(() => {
    fetchTeachers(pagination.pageNumber, pagination.pageSize)
    fetchSubjects()
  }, [])

  // Mở modal thêm giáo viên
  const handleAddTeacher = () => {
    setEditingTeacher(null)
    form.resetFields()
    setModalVisible(true)
  }

  // Mở modal sửa giáo viên
  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher)
    form.setFieldsValue({
      fullName: teacher.fullName,
      yearOfExperience: teacher.yearOfExperience,
      qualification: teacher.qualification,
      subject: teacher.subject,
      status: teacher.status
    })
    setModalVisible(true)
  }

  // Xóa giáo viên
  const handleDeleteTeacher = async (teacherId) => {
    try {
      setSubmitting(true)
      await teacherService.deleteTeacher(teacherId)
      toast.success('Xóa giáo viên thành công')
      fetchTeachers(pagination.pageNumber, pagination.pageSize)
    } catch (error) {
      console.error('Error deleting teacher:', error)
      toast.error('Lỗi khi xóa giáo viên')
    } finally {
      setSubmitting(false)
    }
  }

  // Submit form
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true)
      const teacherData = {
        fullName: values.fullName,
        yearOfExperience: values.yearOfExperience,
        qualification: values.qualification,
        subject: values.subject,
        status: values.status || 'Active',
        centerProfileId: centerId
      }

      if (editingTeacher) {
        // Cập nhật giáo viên
        await teacherService.updateTeacher(editingTeacher.id, teacherData)
        toast.success('Cập nhật giáo viên thành công')
      } else {
        // Thêm giáo viên mới
        await teacherService.createTeacher(teacherData)
        toast.success('Thêm giáo viên thành công')
      }

      setModalVisible(false)
      form.resetFields()
      setEditingTeacher(null)
      fetchTeachers(pagination.pageNumber, pagination.pageSize)
    } catch (error) {
      console.error('Error submitting teacher:', error)
      const errorMessage = error.response?.data?.message || 'Lỗi khi lưu giáo viên'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  // Lọc giáo viên theo tìm kiếm
  const filteredTeachers = teachers.filter(teacher =>
    teacher.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Cấu hình cột bảng
  const columns = [
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200,
      // Đã sửa: Chỉ hiển thị tên, bỏ phần hiển thị ID bên dưới
      render: (text) => (
        <div className="text-sm font-medium text-gray-900">{text}</div>
      )
    },
    {
      title: 'Môn học',
      dataIndex: 'subject',
      key: 'subject',
      width: 150,
      render: (text) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {text}
        </span>
      )
    },
    {
      title: 'Kinh nghiệm (năm)',
      dataIndex: 'yearOfExperience',
      key: 'yearOfExperience',
      width: 120,
      render: (text) => <span className="font-medium">{text}</span>
    },
    {
      title: 'Bằng cấp',
      dataIndex: 'qualification',
      key: 'qualification',
      width: 150,
      render: (text) => <span className="text-sm text-gray-700">{text}</span>
    },
    {
      title: 'Dạy tại',
      dataIndex: 'teachingAtSchool',
      key: 'teachingAtSchool',
      width: 150,
      render: (text) => <span className="text-sm text-gray-700">{text || 'N/A'}</span>
    },
    {
      title: 'Lớp dạy',
      dataIndex: 'teachAtClasses',
      key: 'teachAtClasses',
      width: 120,
      render: (text) => <span className="text-sm text-gray-700">{text || 'N/A'}</span>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusConfig = {
          Active: {
            label: 'Hoạt động',
            className: 'bg-green-100 text-green-800',
            icon: <CheckCircleOutlined />
          },
          Inactive: {
            label: 'Không hoạt động',
            className: 'bg-gray-100 text-gray-800',
            icon: <StopOutlined />
          },
          Suspended: {
            label: 'Tạm khóa',
            className: 'bg-orange-100 text-orange-800',
            icon: <WarningOutlined />
          }
        }
        const config = statusConfig[status] || statusConfig.Inactive
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
            {config.icon}
            {config.label}
          </span>
        )
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Tooltip title="Chỉnh sửa">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleEditTeacher(record)}
              className="p-1 text-lg text-blue-600 hover:bg-blue-50 rounded"
            >
              <EditOutlined />
            </motion.button>
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa giáo viên"
              description="Bạn có chắc chắn muốn xóa giáo viên này?"
              onConfirm={() => handleDeleteTeacher(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-1 text-lg text-red-600 hover:bg-red-50 rounded"
              >
                <DeleteOutlined />
              </motion.button>
            </Popconfirm>
          </Tooltip>
        </div>
      )
    }
  ]

  const tableData = filteredTeachers.map(teacher => ({
    key: teacher.id,
    ...teacher
  }))

  const handlePaginationChange = (page, pageSize) => {
    fetchTeachers(page, pageSize)
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {/* Header */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý giáo viên</h2>
            <p className="text-gray-600">Quản lý danh sách giáo viên trong trung tâm</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddTeacher}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <PlusOutlined />
            <span>Thêm giáo viên</span>
          </motion.button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
          <div className="text-sm text-gray-600">Tổng giáo viên</div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-green-100 rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="text-2xl font-bold text-green-600">
            {teachers.filter(t => t.status === 'Active').length}
          </div>
          <div className="text-sm text-gray-600">Đang hoạt động</div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-orange-100 rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="text-2xl font-bold text-orange-600">
            {teachers.filter(t => t.status !== 'Active').length}
          </div>
          <div className="text-sm text-gray-600">Không hoạt động</div>
        </motion.div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc môn học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card>
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
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} giáo viên`,
            onChange: handlePaginationChange
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Modal thêm/sửa giáo viên */}
      <Modal
        title={editingTeacher ? 'Chỉnh sửa giáo viên' : 'Thêm giáo viên mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setEditingTeacher(null)
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            label="Họ tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nhập họ tên giáo viên" />
          </Form.Item>

          <Form.Item
            label="Môn học"
            name="subject"
            rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
          >
            <Select
              placeholder="Chọn môn học"
              options={subjects.map(subject => ({
                value: subject.name || subject,
                label: subject.name || subject
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Kinh nghiệm (năm)"
            name="yearOfExperience"
            rules={[{ required: true, message: 'Vui lòng nhập kinh nghiệm' }]}
          >
            <Input type="number" placeholder="Nhập số năm kinh nghiệm" min={0} />
          </Form.Item>

          <Form.Item
            label="Bằng cấp"
            name="qualification"
            rules={[{ required: true, message: 'Vui lòng nhập bằng cấp' }]}
          >
            <Input placeholder="Nhập bằng cấp (VD: Đại học, Thạc sĩ)" />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            initialValue="Active"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select
              options={[
                { value: 'Active', label: 'Hoạt động' },
                { value: 'Inactive', label: 'Không hoạt động' },
                { value: 'Suspended', label: 'Tạm khóa' }
              ]}
            />
          </Form.Item>

          <Form.Item>
            <div className="flex gap-2 justify-end">
              <Button onClick={() => {
                setModalVisible(false)
                form.resetFields()
                setEditingTeacher(null)
              }}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {editingTeacher ? 'Cập nhật' : 'Thêm'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}

export default TeacherManagement
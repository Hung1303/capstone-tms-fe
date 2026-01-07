import { useState, useEffect } from 'react'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, ReloadOutlined, BookOutlined } from '@ant-design/icons'
import { toast } from 'react-toastify'
import api from '../../config/axios'
import { Button, Card, Input, Space, Typography, Table, Modal, Form, Popover } from 'antd'
import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars

const { Title, Text } = Typography

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [errors, setErrors] = useState({})
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set())

  const [formData, setFormData] = useState({
    subjectName: '',
    description: ''
  })
  
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 1000, 
    total: 0
  })

  // Fetch subjects
  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/Subject?pageNumber=${pagination.pageNumber}&pageSize=${pagination.pageSize}`)
      console.log('Fetch subjects response:', response)
      const subjectList = response?.data?.data || response?.data || []
      setSubjects(Array.isArray(subjectList) ? subjectList : [])
      // Cập nhật total nếu API trả về
      if (response?.data?.totalCount) {
        setPagination(prev => ({ ...prev, total: response.data.totalCount }))
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
      toast.error('Lỗi khi tải danh sách môn học: ' + (error.response?.data?.message || error.message))
      setSubjects([])
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.subjectName.trim()) {
      newErrors.subjectName = 'Vui lòng nhập tên môn học'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleOpenModal = (subject) => {
    if (subject) {
      setEditingId(subject.subjectId)
      setFormData({
        subjectName: subject.subjectName || '',
        description: subject.description || ''
      })
    }
    setErrors({})
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({
      subjectName: '',
      description: ''
    })
    setErrors({})
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      console.log('Submitting with editingId:', editingId)
      console.log('Form data:', formData)
      
      if (editingId) {
        console.log('Calling PUT /Subject/' + editingId)
        // Gửi id trong request body cho PUT
        const updateData = {
          id: editingId,
          ...formData
        }
        console.log('Update data:', updateData)
        await api.put(`/Subject/${editingId}`, updateData)
        toast.success('Cập nhật môn học thành công!')
      } else {
        console.log('Calling POST /Subject')
        await api.post('/Subject', formData)
        toast.success('Thêm môn học thành công!')
      }
      await fetchSubjects()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving subject:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi lưu môn học'
      setErrors({ submit: errorMessage })
      toast.error('Lỗi: ' + errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id) => {
    setDeleteId(id)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    setLoading(true)
    try {
      console.log('Deleting subject with ID:', deleteId)
      const response = await api.delete(`/Subject/${deleteId}`)
      console.log('Delete response:', response)
      console.log('Delete successful')
      toast.success('Xóa môn học thành công!')
      // Refresh danh sách sau khi xóa thành công
      await new Promise(resolve => setTimeout(resolve, 500))
      await fetchSubjects()
      setShowDeleteConfirm(false)
      setDeleteId(null)
    } catch (error) {
      console.error('Error deleting subject:', error)
      console.error('Error response:', error.response)
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi xóa môn học'
      toast.error('Lỗi: ' + errorMessage)
      setShowDeleteConfirm(false)
      setDeleteId(null)
    } finally {
      setLoading(false)
    }
  }

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getSubjectIcon = (subjectName) => {
    const icons = {
      'Toán': '📐',
      'Toán học': '📐',
      'Vật lý': '⚡',
      'Hóa học': '🧪',
      'Sinh học': '🧬',
      'Tiếng Anh': '🇺🇸',
      'Ngữ văn': '📚',
      'Lịch sử': '📜',
      'Địa lý': '🌍',
      'Tin học': '💻'
    }
    return icons[subjectName] || '📖'
  }

  const toggleDescription = (subjectId) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(subjectId)) {
        newSet.delete(subjectId)
      } else {
        newSet.add(subjectId)
      }
      return newSet
    })
  }

  const isDescriptionTruncated = (text, maxLength = 100) => {
    return text && text.length > maxLength
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {/* Header */}
      <Card className="!bg-gradient-to-r !from-[#0729ea] !to-blue-500 !rounded-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Title level={2} className="!text-white !m-0 !font-bold">
              <BookOutlined /> Quản lý môn học
            </Title>
            <Text className="!text-white/90 !text-base">
              Quản lý các môn học trong hệ thống.
            </Text>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenModal()}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg shadow hover:shadow-xl transition-shadow"
          >
            <PlusOutlined />
            <span>Thêm môn học</span>
          </motion.button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{subjects.length}</div>
          <div className="text-sm text-gray-600">Tổng môn học</div>
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
              fetchSubjects()
            }}
            className="group"
          >
            <ReloadOutlined className="group-hover:animate-spin" />
            Làm mới
          </Button>
        </div>

        {/* Subjects table */}
        <div className="mt-6 rounded-lg shadow-sm overflow-hidden">
          <Table
            dataSource={filteredSubjects}
            columns={[
              {
                title: 'Môn học',
                dataIndex: 'subjectName',
                key: 'subjectName',
                render: (text) => (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getSubjectIcon(text)}</span>
                    <div className="text-sm font-medium text-gray-900">{text}</div>
                  </div>
                )
              },
              {
                title: 'Mô tả',
                dataIndex: 'description',
                key: 'description',
                render: (text, record) => {
                  const isExpanded = expandedDescriptions.has(record.subjectId)
                  const isTruncated = isDescriptionTruncated(text, 100)
                  const displayText = isTruncated ? text.substring(0, 100) + '...' : text
                  
                  const popoverContent = (
                    <div className="max-w-md">
                      <div className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">{text}</div>
                    </div>
                  )
                  
                  return (
                    <div className="text-sm text-gray-600 max-w-xs">
                      <div className="line-clamp-3">
                        {displayText}
                      </div>
                      {isTruncated && (
                        <Popover
                          content={popoverContent}
                          trigger="click"
                          open={isExpanded}
                          onOpenChange={(open) => {
                            if (open && !isExpanded) {
                              toggleDescription(record.subjectId)
                            } else if (!open && isExpanded) {
                              toggleDescription(record.subjectId)
                            }
                          }}
                          placement="topLeft"
                        >
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800 text-xs mt-1 font-medium"
                          >
                            {isExpanded ? "Thu gọn" : "Xem thêm"} 
                          </button>
                        </Popover>
                      )}
                    </div>
                  )
                }
              },
              {
                title: 'Thao tác',
                key: 'action',
                render: (_, record) => (
                  <div className="flex items-center gap-2">
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
                      onClick={() => handleDeleteClick(record.subjectId)}
                      className="cursor-pointer ml-1 text-lg text-red-600 hover:text-red-700"
                    >
                      <DeleteOutlined />
                    </motion.button>
                  </div>
                )
              }
            ]}
            rowKey="subjectId"
            loading={loading}
            locale={{
              emptyText: 'Không có môn học nào'
            }}
            pagination={false}
          />
        </div>
      </Card>

      {/* Modal */}
      <Modal
        title={editingId ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}
        open={showModal}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm mb-4">
              {errors.submit}
            </div>
          )}

          <Form.Item
            label="Tên môn học"
            required
            validateStatus={errors.subjectName ? 'error' : ''}
            help={errors.subjectName}
          >
            <Input
              name="subjectName"
              value={formData.subjectName}
              onChange={handleInputChange}
              placeholder="Nhập tên môn học"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            required
            validateStatus={errors.description ? 'error' : ''}
            help={errors.description}
          >
            <Input.TextArea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Nhập mô tả môn học"
            />
          </Form.Item>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ backgroundColor: '#f97316', borderColor: '#f97316' }}
            >
              {editingId ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <ExclamationCircleOutlined className="text-red-600" />
            <span>Xác nhận xóa</span>
          </div>
        }
        open={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onOk={handleConfirmDelete}
        confirmLoading={loading}
        okText="Xóa"
        okButtonProps={{ danger: true }}
        cancelText="Hủy"
      >
        <p className="text-gray-600">
          Bạn có chắc chắn muốn xóa môn học này? Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </Space>
  )
}

export default SubjectManagement
import { useState, useEffect } from 'react'
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  CloseOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { toast } from 'react-toastify'
import api from '../../config/axios'

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [formData, setFormData] = useState({
    subjectName: '',
    description: ''
  })
  const [errors, setErrors] = useState({})
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 1000, // Lấy tối đa 1000 môn học
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý môn học</h2>
          <p className="text-gray-600">Quản lý các môn học trong hệ thống</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <PlusOutlined />
          <span>Thêm môn học</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{subjects.length}</div>
          <div className="text-sm text-gray-600">Tổng môn học</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subjects table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Môn học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <tr key={subject.subjectId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getSubjectIcon(subject.subjectName)}</span>
                        <div className="text-sm font-medium text-gray-900">{subject.subjectName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">{subject.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenModal(subject)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <EditOutlined />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(subject.subjectId)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    Không có môn học nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <CloseOutlined className="text-xl" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errors.submit && (
                <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                  {errors.submit}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên môn học *
                </label>
                <input
                  type="text"
                  name="subjectName"
                  value={formData.subjectName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.subjectName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập tên môn học"
                />
                {errors.subjectName && (
                  <p className="mt-1 text-sm text-red-600">{errors.subjectName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập mô tả môn học"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <ExclamationCircleOutlined className="text-2xl text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa môn học này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SubjectManagement
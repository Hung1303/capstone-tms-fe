import { useState, useEffect } from 'react'
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  CheckOutlined,
  CloseOutlined as CloseIconOutlined
} from '@ant-design/icons'
import { toast } from 'react-toastify'
import api from '../../config/axios'

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [formData, setFormData] = useState({
    packageName: '',
    description: '',
    tier: 1,
    monthlyPrice: 0,
    maxCoursePosts: 5,
    isActive: true,
    displayOrder: 1
  })
  const [errors, setErrors] = useState({})

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

  const validateForm = () => {
    const newErrors = {}

    if (!formData.packageName.trim()) {
      newErrors.packageName = 'Vui lòng nhập tên gói'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả'
    }

    if (formData.tier < 1) {
      newErrors.tier = 'Tier phải ≥ 1'
    }

    if (formData.monthlyPrice < 0) {
      newErrors.monthlyPrice = 'Giá không được âm'
    }

    if (formData.maxCoursePosts < 1) {
      newErrors.maxCoursePosts = 'Số bài đăng tối đa phải ≥ 1'
    }

    if (formData.displayOrder < 1) {
      newErrors.displayOrder = 'Thứ tự hiển thị phải ≥ 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleOpenModal = (subscription = null) => {
    if (subscription) {
      setEditingId(subscription.id)
      setFormData({
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
      setFormData({
        packageName: '',
        description: '',
        tier: 1,
        monthlyPrice: 0,
        maxCoursePosts: 5,
        isActive: true,
        displayOrder: 1
      })
    }
    setErrors({})
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({
      packageName: '',
      description: '',
      tier: 1,
      monthlyPrice: 0,
      maxCoursePosts: 5,
      isActive: true,
      displayOrder: 1
    })
    setErrors({})
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : ['tier', 'monthlyPrice', 'maxCoursePosts', 'displayOrder'].includes(name)
        ? parseInt(value) || 0
        : value
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
      if (editingId) {
        await api.put(`/Subscription/packages/${editingId}`, formData)
        toast.success('Cập nhật gói thành công!')
      } else {
        await api.post('/Subscription/packages', formData)
        toast.success('Tạo gói thành công!')
      }
      await fetchSubscriptions()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving subscription:', error)
      const errorMsg = error.response?.data?.message || 'Lỗi khi lưu gói'
      setErrors({ submit: errorMsg })
      toast.error(errorMsg)
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
      await api.delete(`/Subscription/packages/${deleteId}`)
      await fetchSubscriptions()
      setShowDeleteConfirm(false)
      setDeleteId(null)
      toast.success('Xóa gói thành công!')
    } catch (error) {
      console.error('Error deleting subscription:', error)
      toast.error('Lỗi khi xóa gói')
    } finally {
      setLoading(false)
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý gói subscription</h2>
          <p className="text-gray-600">Quản lý các gói dịch vụ cho trung tâm</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <PlusOutlined />
          <span>Tạo gói mới</span>
        </button>
      </div>

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

      {/* Subscriptions table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên gói
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá/tháng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bài đăng tối đa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thứ tự
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscriptions.length > 0 ? (
                filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{subscription.packageName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{getTierLabel(subscription.tier)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {getPriceDisplay(subscription.monthlyPrice)}đ
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{subscription.maxCoursePosts}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        subscription.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {subscription.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{subscription.displayOrder}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenModal(subscription)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Chỉnh sửa"
                        >
                          <EditOutlined />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(subscription.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Xóa"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Không có gói nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Chỉnh sửa gói' : 'Tạo gói mới'}
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

              {/* Row 1: Tên gói */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên gói *
                </label>
                <input
                  type="text"
                  name="packageName"
                  value={formData.packageName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.packageName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="VD: Basic Plan, Standard Plan, Premium Plan"
                />
                {errors.packageName && (
                  <p className="mt-1 text-sm text-red-600">{errors.packageName}</p>
                )}
              </div>

              {/* Row 2: Mô tả */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập mô tả gói"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Row 3: Tier & Giá */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tier *
                  </label>
                  <input
                    type="number"
                    name="tier"
                    value={formData.tier}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.tier ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1"
                  />
                  {errors.tier && (
                    <p className="mt-1 text-sm text-red-600">{errors.tier}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá/tháng (đ) *
                  </label>
                  <input
                    type="number"
                    name="monthlyPrice"
                    value={formData.monthlyPrice}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.monthlyPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="500000"
                  />
                  {errors.monthlyPrice && (
                    <p className="mt-1 text-sm text-red-600">{errors.monthlyPrice}</p>
                  )}
                </div>
              </div>

              {/* Row 4: Bài đăng tối đa & Thứ tự */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bài đăng tối đa *
                  </label>
                  <input
                    type="number"
                    name="maxCoursePosts"
                    value={formData.maxCoursePosts}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.maxCoursePosts ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="5"
                  />
                  {errors.maxCoursePosts && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxCoursePosts}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thứ tự hiển thị *
                  </label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.displayOrder ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1"
                  />
                  {errors.displayOrder && (
                    <p className="mt-1 text-sm text-red-600">{errors.displayOrder}</p>
                  )}
                </div>
              </div>

              {/* Row 5: Trạng thái */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Gói đang hoạt động</span>
                </label>
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
                  {loading ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo gói'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <ExclamationCircleOutlined className="text-2xl text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa gói này? Hành động này không thể hoàn tác.
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

export default SubscriptionManagement

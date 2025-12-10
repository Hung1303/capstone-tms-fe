import { useState, useEffect } from 'react'
import { SearchOutlined, CheckCircleOutlined, ExclamationCircleOutlined, ArrowUpOutlined, DeleteOutlined } from '@ant-design/icons'
import { toast } from 'react-toastify'
import api from '../../config/axios'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const CenterSubscription = () => {
  const { user } = useAuth()
  const [subscriptions, setSubscriptions] = useState([])
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [autoRenew, setAutoRenew] = useState(false);
  const navigate = useNavigate()


  useEffect(() => {
    fetchSubscriptions()
    fetchCurrentSubscription()
  }, [])

  const fetchSubscriptions = async () => {
    setLoading(true)
    try {
      const response = await api.get('/Subscription/packages')
      const subList = response?.data?.data || response?.data || []
      const activePackages = subList.filter(s => s.isActive === true)
      setSubscriptions(activePackages.sort((a, b) => a.displayOrder - b.displayOrder))
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      toast.error('Lỗi khi tải danh sách gói')
      setSubscriptions([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentSubscription = async () => {
    try {
      const response = await api.get(`/Subscription/center/${user?.centerProfileId}/active`)
      const data = response.data.data
      if (data) {
        setCurrentSubscription(data)
      } else {
        setCurrentSubscription(null)
      }
    } catch (error) {
      console.error('Error fetching current subscription:', error)
      // Nếu lỗi 404 hoặc không có gói, set null
      setCurrentSubscription(null)
    }
  }

  const handleSubscribe = (packageData) => {
    setSelectedPackage(packageData)
    setConfirmAction('subscribe')
    setShowConfirmModal(true)
  }

  const handleUpgrade = (packageData) => {
    setSelectedPackage(packageData)
    setConfirmAction('upgrade')
    setShowConfirmModal(true)
  }

  const handleCancel = () => {
    setSelectedPackage(null)
    setConfirmAction('cancel')
    setShowConfirmModal(true)
  }

  const handleConfirmAction = async () => {
    setLoading(true)
    try {
      if (confirmAction === 'subscribe') {
        const apiRes = await api.post('/Subscription/subscribe', {
          centerProfileId: user?.centerProfileId,
          subscriptionPackageId: selectedPackage.id,
          autoRenewalEnabled: autoRenew
        })
        console.log("apiRes handleConfirmAction:", apiRes.data)
        console.log("selectedPackage:", selectedPackage)

        const apiSuccess = apiRes.data.success
        if (apiSuccess) {
          const payload = {
            amount: selectedPackage.monthlyPrice,
            description: selectedPackage.packageName,
            userId: user.userId,
            centerSubscriptionId: apiRes.data.data.id,
            enrollmentId: null
          }
          console.log("checkout payload:", payload)
          try {
            const apiResPayment = await api.post("/Payment", payload)
            console.log("apiResPayment:", apiResPayment.data)

            if (apiResPayment.data.success) {
              const paymentId = apiResPayment.data.data.id
              console.log("paymentId:", paymentId)

              try {
                const apiResponse = await api.get(`Payment/VNPAY?paymentId=${paymentId}`)
                console.log("apiResponse:", apiResponse)

                const paymentUrl = apiResponse.data.data
                window.open(paymentUrl, "_blank")

              } catch (error) {
                console.log("lỗi Payment/VNPAY:", error)
              }
            }
          } catch (error) {
            console.log("lỗi payment:", error)
          }
        }

        toast.success('Đăng ký gói thành công!')
      } else if (confirmAction === 'upgrade') {
        await api.post('/Subscription/upgrade', {
          centerId: user?.centerProfileId,
          packageId: selectedPackage.id
        })
        toast.success('Nâng cấp gói thành công!')
      } else if (confirmAction === 'cancel') {
        await api.post('/Subscription/cancel', {
          centerId: user?.centerProfileId
        })
        toast.success('Hủy gói thành công!')
      }
      
      await fetchCurrentSubscription()
      await fetchSubscriptions()
      setShowConfirmModal(false)
      setConfirmAction(null)
      setSelectedPackage(null)
    } catch (error) {
      console.error('Error:', error)
      const errorMsg = error.response?.data?.message || 'Lỗi khi thực hiện hành động'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Lắng nghe thông điệp từ tab VNPay
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.payment === "success") {
        navigate("/payment/success");
      } else if (event.data.payment === "failed") {
        navigate("/payment/failure");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);


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

  // Lọc gói để hiển thị
  const getDisplayPackages = () => {
    if (!currentSubscription) {
      // Chưa có gói: hiển thị tất cả
      return subscriptions
    } else {
      // Có gói: chỉ hiển thị gói cao hơn (để nâng cấp)
      return subscriptions.filter(pkg => pkg.tier > currentSubscription.tier)
    }
  }

  const displayPackages = getDisplayPackages()
  const filteredPackages = displayPackages.filter(sub => {
    const matchesSearch = sub.packageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gói dịch vụ</h2>
        <p className="text-gray-600">Quản lý gói subscription của trung tâm</p>
      </div>

      {/* Current Subscription Info */}
      {currentSubscription && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg shadow-sm border border-orange-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Gói hiện tại: {currentSubscription.packageName}
              </h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Tier:</span> {getTierLabel(currentSubscription.tier)}
                </p>
                <p>
                  <span className="font-medium">Bài đăng còn lại:</span> {currentSubscription.remainingCoursePosts} / {currentSubscription.maxCoursePosts}
                </p>
                {currentSubscription.endDate && (
                  <p>
                    <span className="font-medium">Hết hạn:</span> {new Date(currentSubscription.endDate).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <DeleteOutlined />
              <span>Hủy gói</span>
            </button>
          </div>
        </div>
      )}

      {/* No Subscription Info */}
      {!currentSubscription && (
        <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-6">
          <p className="text-blue-900">
            Bạn chưa đăng ký gói nào. Vui lòng chọn một gói bên dưới để bắt đầu.
          </p>
        </div>
      )}

      {/* Search */}
      {filteredPackages.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm gói..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Packages Grid */}
      <div>
        {currentSubscription && filteredPackages.length > 0 && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Nâng cấp gói ({filteredPackages.length} gói có sẵn)
          </h3>
        )}
        
        {filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-lg shadow-sm border-2 border-gray-200 bg-white hover:shadow-md transition-all"
              >
                {/* Package Header */}
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.packageName}</h3>
                  <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">
                      {getPriceDisplay(pkg.monthlyPrice)}
                    </span>
                    <span className="text-gray-600">đ/tháng</span>
                  </div>
                </div>

                {/* Package Features */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircleOutlined className="text-green-600 text-lg" />
                    <span className="text-sm text-gray-700">
                      {pkg.maxCoursePosts} bài đăng khóa học/tháng
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircleOutlined className="text-green-600 text-lg" />
                    <span className="text-sm text-gray-700">
                      Tier: {getTierLabel(pkg.tier)}
                    </span>
                  </div>
                </div>

                {/* Package Actions */}
                <div className="p-6 border-t border-gray-200">
                  {currentSubscription ? (
                    <button
                      onClick={() => handleUpgrade(pkg)}
                      disabled={loading}
                      className="cursor-pointer w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <ArrowUpOutlined />
                      <span>Nâng cấp</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(pkg)}
                      disabled={loading}
                      className="cursor-pointer w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                      Đăng ký ngay
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            {currentSubscription ? (
              <p className="text-gray-500">Bạn đã có gói cao nhất. Không có gói nâng cấp.</p>
            ) : (
              <p className="text-gray-500">Không tìm thấy gói nào</p>
            )}
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <ExclamationCircleOutlined className="text-2xl text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {confirmAction === 'subscribe' && 'Xác nhận đăng ký'}
                  {confirmAction === 'upgrade' && 'Xác nhận nâng cấp'}
                  {confirmAction === 'cancel' && 'Xác nhận hủy gói'}
                </h3>
              </div>

              {confirmAction === 'subscribe' && (
                <p className="text-gray-600 mb-6">
                  Bạn có chắc chắn muốn đăng ký gói <strong>{selectedPackage?.packageName}</strong> với giá <strong>{getPriceDisplay(selectedPackage?.monthlyPrice)}đ/tháng</strong>?
                </p>
              )}

              {confirmAction === 'upgrade' && (
                <p className="text-gray-600 mb-6">
                  Bạn có chắc chắn muốn nâng cấp lên gói <strong>{selectedPackage?.packageName}</strong> với giá <strong>{getPriceDisplay(selectedPackage?.monthlyPrice)}đ/tháng</strong>?
                </p>
              )}

              {confirmAction === 'cancel' && (
                <p className="text-gray-600 mb-6">
                  Bạn có chắc chắn muốn hủy gói hiện tại? Bạn sẽ mất quyền truy cập vào các tính năng của gói.
                </p>
              )}

              {(confirmAction === 'subscribe' || confirmAction === 'upgrade') && (
                <div className="flex items-start mb-6">
                  <input
                    type="checkbox"
                    name="autoRenew"
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
                    className="mt-1 w-4 h-4 mr-2"
                  />
                  <label htmlFor="autoRenew" className="text-gray-700 leading-normal">
                    Bạn có muốn tự động gia hạn hàng tháng không?
                  </label>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={loading}
                  className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                    confirmAction === 'cancel'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                >
                  {loading ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CenterSubscription
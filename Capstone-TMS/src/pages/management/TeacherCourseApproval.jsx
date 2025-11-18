import { useState, useEffect } from 'react'
import { 
  SearchOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  EyeOutlined,
  CloseOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { toast } from 'react-toastify'
import api from '../../config/axios'

const TeacherCourseApproval = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  useEffect(() => {
    fetchPendingCourses()
  }, [])

  const fetchPendingCourses = async () => {
    setLoading(true)
    try {
      const response = await api.get('/Course?status=PENDING&pageSize=1000')
      const courseList = response?.data?.data || response?.data || []
      setCourses(Array.isArray(courseList) ? courseList : [])
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Lỗi khi tải danh sách khóa học')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = (course) => {
    setSelectedCourse(course)
    setShowDetailModal(true)
  }

  const handleCloseDetailModal = () => {
    setShowDetailModal(false)
    setSelectedCourse(null)
  }

  const handleApproveClick = (course) => {
    setSelectedCourse(course)
    setConfirmAction('approve')
    setShowConfirmModal(true)
  }

  const handleRejectClick = (course) => {
    setSelectedCourse(course)
    setConfirmAction('reject')
    setShowConfirmModal(true)
  }

  const handleConfirmAction = async () => {
    if (!selectedCourse) return

    setLoading(true)
    try {
      const newStatus = confirmAction === 'approve' ? 'ASSIGNED' : 'CANCELLED'
      await api.put(`/Course/${selectedCourse.id}`, { status: newStatus })
      
      toast.success(
        confirmAction === 'approve' 
          ? 'Bạn đã ký vào khóa học này!' 
          : 'Bạn đã từ chối khóa học này!'
      )
      
      await fetchPendingCourses()
      setShowConfirmModal(false)
      setConfirmAction(null)
      setSelectedCourse(null)
    } catch (error) {
      console.error('Error updating course:', error)
      toast.error('Lỗi khi cập nhật khóa học')
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Xét duyệt khóa học</h2>
          <p className="text-gray-600">Xem và ký vào các khóa học được giao</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{courses.length}</div>
          <div className="text-sm text-gray-600">Khóa học chờ ký</div>
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
                placeholder="Tìm kiếm theo tên hoặc môn học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Courses table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên khóa học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Môn học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học phí
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{course.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{course.subject}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {course.startDate} - {course.endDate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {course.tuitionFee?.toLocaleString('vi-VN')}đ
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewDetail(course)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Xem chi tiết"
                        >
                          <EyeOutlined />
                        </button>
                        <button 
                          onClick={() => handleApproveClick(course)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Ký vào khóa học"
                        >
                          <CheckCircleOutlined />
                        </button>
                        <button 
                          onClick={() => handleRejectClick(course)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Từ chối"
                        >
                          <CloseCircleOutlined />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    Không có khóa học nào chờ ký
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết khóa học</h3>
              <button 
                onClick={handleCloseDetailModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <CloseOutlined className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên khóa học</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCourse.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Môn học</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCourse.subject}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                <p className="mt-1 text-sm text-gray-900">{selectedCourse.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Địa điểm</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCourse.location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kỳ học</label>
                  <p className="mt-1 text-sm text-gray-900">Kỳ {selectedCourse.semester}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCourse.startDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCourse.endDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phương pháp giảng dạy</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedCourse.teachingMethod === 1 ? 'Trực tiếp' : selectedCourse.teachingMethod === 2 ? 'Trực tuyến' : 'Kết hợp'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lớp học</label>
                  <p className="mt-1 text-sm text-gray-900">Lớp {selectedCourse.gradeLevel}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Học phí</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {selectedCourse.tuitionFee?.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sức chứa</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCourse.capacity} học sinh</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseDetailModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <ExclamationCircleOutlined className="text-2xl text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {confirmAction === 'approve' ? 'Xác nhận ký vào khóa học' : 'Xác nhận từ chối khóa học'}
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                {confirmAction === 'approve' 
                  ? `Bạn có chắc chắn muốn ký vào khóa học "${selectedCourse.title}"?`
                  : `Bạn có chắc chắn muốn từ chối khóa học "${selectedCourse.title}"?`
                }
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={loading}
                  className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                    confirmAction === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {loading ? 'Đang xử lý...' : confirmAction === 'approve' ? 'Ký vào' : 'Từ chối'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherCourseApproval

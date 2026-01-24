import { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Button, Spin, Empty, Tag, Pagination, message, Modal, Tooltip } from 'antd';
import { SearchOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import { useAuth } from '../../contexts/AuthContext';

const Centers = () => {
  const [centers, setCenters] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch danh sách trung tâm
  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const response = await api.get('/Users/Centers', {
        params: {
          pageNumber: 1,
          pageSize: 1000 // Lấy số lượng lớn để lọc client
        }
      });
      
      const centersData = response.data?.centers || [];
      const activeCenters = centersData.filter(
        center => center.status === 'Active'
      );
      
      setCenters(activeCenters);
      setFilteredCenters(activeCenters);
    } catch (error) {
      console.error('Error fetching centers:', error); 
      message.error('Không thể tải danh sách trung tâm');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    
    if (!value) {
      setFilteredCenters(centers);
      return;
    }

    const lowerValue = value.toLowerCase();
    const filtered = centers.filter(center =>
      (center.centerName && center.centerName.toLowerCase().includes(lowerValue)) ||
      (center.ownerName && center.ownerName.toLowerCase().includes(lowerValue)) ||
      (center.address && center.address.toLowerCase().includes(lowerValue)) ||
      (center.contactPhone && center.contactPhone.includes(value)) ||
      (center.contactEmail && center.contactEmail.toLowerCase().includes(lowerValue))
    );
    
    setFilteredCenters(filtered);
  };

  // Xử lý xem chi tiết
  const handleViewDetails = (center) => {
    setSelectedCenter(center);
    setIsModalVisible(true);
  };

  // Logic: Xem Khóa Học
  const handleViewCourses = () => {
    setIsModalVisible(false);
    navigate('/courses');
  };

  // Logic: Tư Vấn
  const handleConsultation = () => {
    if (!user) {
      message.warning('Vui lòng đăng nhập để sử dụng tính năng này');
      return;
    }
    
    setIsModalVisible(false);

    // Chuyển hướng kèm state targetCenter
    navigate('/parent/consultation', { 
      state: { 
        targetCenter: {
          id: selectedCenter.id,
          name: selectedCenter.centerName
        } 
      } 
    });
  };

  // Tính toán phân trang
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCenters = filteredCenters.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Danh Sách Trung Tâm
          </h1>
          <p className="text-lg text-gray-600">
            Khám phá các trung tâm giáo dục hàng đầu trong hệ thống
          </p>
        </div>

        {/* Search Bar - Sử dụng biến searchTerm và hàm handleSearch */}
        <div className="mb-8">
          <Input
            placeholder="Tìm kiếm theo tên trung tâm, chủ sở hữu, địa chỉ, điện thoại hoặc email..."
            prefix={<SearchOutlined />}
            size="large"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="rounded-lg shadow-md"
            style={{ height: '48px' }}
          />
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Tìm thấy <span className="font-bold text-blue-600">{filteredCenters.length}</span> trung tâm
            {searchTerm && ` cho từ khóa "${searchTerm}"`}
          </p>
        </div>

        {/* Centers Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" tip="Đang tải danh sách trung tâm..." />
          </div>
        ) : filteredCenters.length === 0 ? (
          <Empty
            description="Không tìm thấy trung tâm nào"
            style={{ marginTop: 50, marginBottom: 50 }}
          />
        ) : (
          <>
            <Row gutter={[24, 24]} className="mb-8">
              {paginatedCenters.map((center) => (
                <Col key={center.id || center.centerProfileId} xs={24} sm={12} lg={8}>
                  <Card
                    hoverable
                    className="h-full shadow-lg hover:shadow-2xl transition-all duration-300 rounded-lg overflow-hidden"
                    onClick={() => handleViewDetails(center)}
                    cover={
                      <div 
                        className="h-32 flex items-center justify-center relative overflow-hidden"
                        style={{
                          backgroundImage: 'url(https://images.unsplash.com/photo-1710429026883-524947152fb1?q=80&w=1331&auto=format&fit=crop)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        <div className="absolute inset-0 bg-black/40"></div>
                      </div>
                    }
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-3 truncate" title={center.centerName}>
                      {center.centerName}
                    </h3>

                    <div className="flex items-center gap-2 mb-3 text-gray-700">
                      <UserOutlined className="text-blue-500" />
                      <span className="text-sm truncate">
                        <strong>Chủ sở hữu:</strong> {center.ownerName}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 mb-3 text-gray-700">
                      <EnvironmentOutlined className="text-red-500 mt-1 flex-shrink-0" />
                      <span className="text-sm line-clamp-2" title={center.address}>
                        {center.address}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-xs text-gray-600 mb-1">Số giấy phép:</p>
                      <p className="text-sm font-mono text-gray-900 truncate">
                        {center.licenseNumber}
                      </p>
                    </div>

                    <Button
                      type="primary"
                      block
                      size="large"
                      className="bg-blue-600 hover:bg-blue-700 border-0 rounded-lg font-semibold"
                    >
                      Xem Chi Tiết
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Pagination - Sử dụng setPageSize */}
            {filteredCenters.length > pageSize && (
              <div className="flex justify-center mt-12">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={filteredCenters.length}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger
                  onShowSizeChange={(current, size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  pageSizeOptions={['6', '12', '24']}
                  showTotal={(total) => `Tổng cộng ${total} trung tâm`}
                  locale={{
                    items_per_page: 'trung tâm/trang',
                    jump_to: 'Đến trang',
                    jump_to_confirm: 'xác nhận',
                    page: 'trang',
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        title={selectedCenter?.centerName}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedCenter && (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Trạng thái:</p>
              <Tag color="green" className="text-base py-1 px-3">
                {selectedCenter.status === 'Active' ? 'Đang hoạt động' : selectedCenter.status}
              </Tag>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Chủ sở hữu:</p>
              <p className="text-base font-semibold text-gray-900">
                {selectedCenter.ownerName}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Địa chỉ:</p>
              <p className="text-base text-gray-900">
                {selectedCenter.address}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Điện thoại:</p>
                <a
                  href={`tel:${selectedCenter.contactPhone}`}
                  className="text-base text-blue-600 hover:underline font-semibold"
                >
                  {selectedCenter.contactPhone}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Email:</p>
                <a
                  href={`mailto:${selectedCenter.contactEmail}`}
                  className="text-base text-blue-600 hover:underline font-semibold"
                >
                  {selectedCenter.contactEmail}
                </a>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-4 border-t flex gap-3">
              {/* Nút Tư Vấn */}
              {user?.role === 'Parent' ? (
                <Button
                  type="primary"
                  size="large"
                  className="flex-1 bg-green-600 hover:bg-green-700 border-0"
                  icon={<MessageOutlined />}
                  onClick={handleConsultation}
                >
                  Tư vấn với trung tâm
                </Button>
              ) : (
                <Tooltip title={user ? "Chỉ tài khoản Phụ huynh mới có thể tư vấn" : "Vui lòng đăng nhập tài khoản Phụ huynh"}>
                  <Button
                    size="large"
                    className="flex-1"
                    disabled
                    icon={<MessageOutlined />}
                  >
                    Tư vấn với trung tâm
                  </Button>
                </Tooltip>
              )}

              {/* Nút Xem Khóa Học */}
              <Button
                type="default"
                size="large"
                className="flex-1 border-blue-600 text-blue-600 hover:text-blue-700 hover:border-blue-700"
                onClick={handleViewCourses}
              >
                Xem Khóa Học
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Centers;
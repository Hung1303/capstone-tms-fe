import { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Button, Spin, Empty, Tag, Pagination, message, Modal } from 'antd';
import { SearchOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import api from '../../config/axios';
import dayjs from 'dayjs';

const Centers = () => {
  const [centers, setCenters] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Fetch danh sách trung tâm
  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const response = await api.get('/Users/Centers');
      console.log('Centers response:', response.data);
      
      // Lọc chỉ các trung tâm có status "Active"
      const activeCenters = response.data.centers.filter(
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
    
    const filtered = centers.filter(center =>
      center.centerName.toLowerCase().includes(value.toLowerCase()) ||
      center.ownerName.toLowerCase().includes(value.toLowerCase()) ||
      center.address.toLowerCase().includes(value.toLowerCase()) ||
      center.contactPhone.includes(value) ||
      center.contactEmail.toLowerCase().includes(value.toLowerCase())
    );
    
    setFilteredCenters(filtered);
  };

  // Xử lý xem chi tiết
  const handleViewDetails = (center) => {
    setSelectedCenter(center);
    setIsModalVisible(true);
  };

  // Tính toán dữ liệu cho trang hiện tại
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

        {/* Search Bar */}
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
                <Col key={center.centerProfileId} xs={24} sm={12} lg={8}>
                  <Card
                    hoverable
                    className="h-full shadow-lg hover:shadow-2xl transition-all duration-300 rounded-lg overflow-hidden"
                    onClick={() => handleViewDetails(center)}
                    cover={
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-white mb-2">
                            {center.centerName.charAt(0).toUpperCase()}
                          </div>
                          <Tag color="green" className="text-xs">
                            Đang hoạt động
                          </Tag>
                        </div>
                      </div>
                    }
                  >
                    {/* Center Name */}
                    <h3 className="text-lg font-bold text-gray-900 mb-3 truncate">
                      {center.centerName}
                    </h3>

                    {/* Owner */}
                    <div className="flex items-center gap-2 mb-3 text-gray-700">
                      <UserOutlined className="text-blue-500" />
                      <span className="text-sm">
                        <strong>Chủ sở hữu:</strong> {center.ownerName}
                      </span>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-2 mb-3 text-gray-700">
                      <EnvironmentOutlined className="text-red-500 mt-1 flex-shrink-0" />
                      <span className="text-sm line-clamp-2">
                        {center.address}
                      </span>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-2 mb-3 text-gray-700">
                      <PhoneOutlined className="text-green-500" />
                      <a
                        href={`tel:${center.contactPhone}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {center.contactPhone}
                      </a>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-2 mb-4 text-gray-700">
                      <MailOutlined className="text-orange-500" />
                      <a
                        href={`mailto:${center.contactEmail}`}
                        className="text-sm text-blue-600 hover:underline truncate"
                      >
                        {center.contactEmail}
                      </a>
                    </div>

                    {/* License Number */}
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-xs text-gray-600 mb-1">Số giấy phép:</p>
                      <p className="text-sm font-mono text-gray-900">
                        {center.licenseNumber}
                      </p>
                    </div>

                    {/* View Details Button */}
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

            {/* Pagination */}
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
            {/* Status */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Trạng thái:</p>
              <Tag color="green" className="text-base py-1 px-3">
                {selectedCenter.status === 'Active' ? 'Đang hoạt động' : selectedCenter.status}
              </Tag>
            </div>

            {/* Owner */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Chủ sở hữu:</p>
              <p className="text-base font-semibold text-gray-900">
                {selectedCenter.ownerName}
              </p>
            </div>

            {/* License */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Số giấy phép:</p>
              <p className="text-base font-mono text-gray-900">
                {selectedCenter.licenseNumber}
              </p>
            </div>

            {/* Address */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Địa chỉ:</p>
              <p className="text-base text-gray-900">
                {selectedCenter.address}
              </p>
            </div>

            {/* Contact Info */}
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

            {/* Location Info */}
            {(selectedCenter.city || selectedCenter.district) && (
              <div className="grid grid-cols-2 gap-4">
                {selectedCenter.city && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Thành phố:</p>
                    <p className="text-base text-gray-900">{selectedCenter.city}</p>
                  </div>
                )}
                {selectedCenter.district && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Quận/Huyện:</p>
                    <p className="text-base text-gray-900">{selectedCenter.district}</p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="primary"
                size="large"
                block
                className="bg-blue-600 hover:bg-blue-700 border-0"
              >
                Liên Hệ Trung Tâm
              </Button>
              <Button
                size="large"
                block
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
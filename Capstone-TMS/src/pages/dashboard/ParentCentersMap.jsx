import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import { Select, Spin, Button, Space, Tag, Typography, List, Avatar, Card, Input, Empty, Tooltip } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, UserOutlined, BookOutlined, SendOutlined, WarningOutlined } from "@ant-design/icons";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../config/axios";

const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

const { Option } = Select;
const { Title, Text } = Typography;

// Fix icon Leaflet không hiện
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// --- SUB-COMPONENTS ---
const FlyToLocation = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 15, { duration: 1.5 });
  }, [position, map]);
  return null;
};

const CenterSidebar = ({
  visible,
  onClose,
  centers,
  selectedCenterId,
  onSelectCenter,
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterStatus,
}) => {
  if (!visible) return null;

  return (
    <div style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Title level={4} style={{ margin: 0 }}>Danh Sách Trung Tâm</Title>
          <Button type="text" icon={<MenuFoldOutlined />} onClick={onClose} />
        </div>
      </div>
      <div style={styles.sidebarContent}>
        {/* Tìm kiếm */}
        <div style={{ padding: 24, paddingBottom: 0 }}>
          <Input
            placeholder="Tìm kiếm trung tâm..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ marginBottom: 16 }}
            allowClear
          />

          {/* Lọc theo trạng thái */}
          <Text strong style={{ fontSize: 12, color: "#888" }}>TRẠNG THÁI</Text>
          <Select
            style={{ width: "100%", marginTop: 8, marginBottom: 16 }}
            placeholder="Tất cả trạng thái"
            allowClear
            onChange={onFilterStatus}
            value={filterStatus}
          >
            <Option value="Active">Hoạt động</Option>
            <Option value="Pending">Chờ duyệt</Option>
          </Select>

          <Text strong style={{ fontSize: 12, color: "#888" }}>KẾT QUẢ: {centers.length}</Text>
        </div>

        {/* Danh sách trung tâm */}
        {centers.length === 0 ? (
          <div style={{ padding: 24 }}>
            <Empty description="Không tìm thấy trung tâm nào" />
          </div>
        ) : (
          <List
            dataSource={centers}
            renderItem={(item) => (
              <List.Item
                style={{
                  ...styles.listItem,
                  backgroundColor: selectedCenterId === item.id ? "#e6f7ff" : "white",
                }}
                onClick={() => onSelectCenter(item)}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      shape="square"
                      size={40}
                      icon={<BookOutlined />}
                      style={{
                        backgroundColor: item.status === "Active" ? "#f6ffed" : "#fff1f0",
                        color: item.status === "Active" ? "#52c41a" : "#f5222d",
                      }}
                    />
                  }
                  title={<Text strong>{item.centerName}</Text>}
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.ownerName}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <EnvironmentOutlined /> {item.address}
                      </Text>
                      <br />
                      <Tag color={item.status === "Active" ? "green" : "orange"} style={{ marginTop: 4 }}>
                        {item.status === "Active" ? "Hoạt động" : "Chờ duyệt"}
                      </Tag>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const ParentCentersMap = () => {
  const navigate = useNavigate();
  const markerRefs = useRef({});

  // States
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [filterCity, setFilterCity] = useState(null);
  const [filterDistrict, setFilterDistrict] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userPos, setUserPos] = useState(null);
  const [mapCenter, setMapCenter] = useState([10.762622, 106.660172]); // Mặc định HCM
  const [routeCoords, setRouteCoords] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  // Fetch centers
  useEffect(() => {
    const initData = async () => {
      setLoading(true);

      // Lấy vị trí user
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const userLoc = [pos.coords.latitude, pos.coords.longitude];
            setUserPos(userLoc);
            setMapCenter(userLoc);
          },
          (err) => console.warn("Không lấy được vị trí", err)
        );
      }

      try {
        console.log("Đang load trung tâm...");
        const response = await api.get("/Users/Centers");
        const centersData = response.data?.centers || [];
        setCenters(centersData);
      } catch (err) {
        console.error("Lỗi khi load trung tâm:", err);
        setCenters([]);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // Filter logic
  const filteredCenters = useMemo(() => {
    return centers.filter((center) => {
      const matchSearch =
        center.centerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCity = !filterCity || center.city === filterCity;
      const matchDistrict = !filterDistrict || center.district === filterDistrict;
      const matchStatus = !filterStatus || center.status === filterStatus;

      return matchSearch && matchCity && matchDistrict && matchStatus;
    });
  }, [centers, searchTerm, filterCity, filterDistrict, filterStatus]);

  const cities = useMemo(() => {
    const citySet = new Set(centers.map((c) => c.city).filter(Boolean));
    return Array.from(citySet);
  }, [centers]);

  const districts = useMemo(() => {
    if (!filterCity) return [];
    const districtSet = new Set(
      centers
        .filter((c) => c.city === filterCity)
        .map((c) => c.district)
        .filter(Boolean)
    );
    return Array.from(districtSet);
  }, [centers, filterCity]);

  // Actions
  const handleSelectCenter = (center) => {
    setSelectedCenter(center);
    if (center.latitude && center.longitude) {
      setMapCenter([center.latitude, center.longitude]);
      setTimeout(() => markerRefs.current[center.id]?.openPopup(), 100);
    }
  };

  const handleViewCourses = (center) => {
    navigate(`/parent/centers?centerId=${center.id}`);
  };

  const handleGetDirection = async (center) => {
    if (!userPos) return alert("Cần bật định vị!");
    setSelectedCenter(center);
    markerRefs.current[center.id]?.closePopup();
    const url = `${OSRM_URL}/${userPos[1]},${userPos[0]};${center.longitude || 106.660172},${center.latitude || 10.762622}?overview=full&geometries=geojson`;
    try {
      const res = await fetch(url).then(r => r.json());
      if (res.routes?.[0]) {
        const route = res.routes[0];
        setRouteCoords(route.geometry.coordinates.map(c => [c[1], c[0]]));
        setRouteInfo({ dist: route.distance, dur: route.duration });
      }
    } catch (e) { console.error(e); }
  };

  const clearRoute = () => {
    setRouteCoords(null);
    setRouteInfo(null);
    setMapCenter(userPos || mapCenter);
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <Spin size="large" tip="Đang tải bản đồ..." />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Nút mở Sidebar khi bị đóng */}
      {!isSidebarOpen && (
        <Button
          icon={<MenuUnfoldOutlined />}
          size="large"
          onClick={() => setIsSidebarOpen(true)}
          style={styles.floatingButton}
        />
      )}

      {/* Sidebar */}
      <CenterSidebar
        visible={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        centers={filteredCenters}
        selectedCenterId={selectedCenter?.id}
        onSelectCenter={handleSelectCenter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterStatus={setFilterStatus}
      />

      {/* Map */}
      <div style={{ flex: 1, position: "relative" }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OSM"
          />
          <FlyToLocation position={mapCenter} />

          {/* User position */}
          {userPos && (
            <Marker
              position={userPos}
              icon={L.divIcon({
                className: "user-pulse",
                html: '<div style="background:#1890ff;width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 0 3px rgba(24,144,255,0.3)"></div>',
              })}
            />
          )}

          {/* Route polyline */}
          {routeCoords && <Polyline positions={routeCoords} color="#1890ff" weight={6} />}

          {/* Centers markers */}
          {filteredCenters.map((center) => {
            // Nếu không có tọa độ, dùng tọa độ mặc định HCM
            const lat = center.latitude || 10.762622;
            const lng = center.longitude || 106.660172;

            return (
              <Marker key={center.id} position={[lat, lng]} ref={(r) => (markerRefs.current[center.id] = r)}>
                <Popup maxWidth={300}>
                  <div style={{ padding: 8 }}>
                    <Title level={5} style={{ margin: "0 0 8px 0" }}>
                      {center.centerName}
                    </Title>
                    <Text type="secondary">
                      <UserOutlined /> {center.ownerName}
                    </Text>
                    <br />
                    <Text type="secondary">
                      <EnvironmentOutlined /> {center.address}
                    </Text>
                    <br />
                    <Text type="secondary">
                      <PhoneOutlined /> {center.contactPhone}
                    </Text>
                    <br />
                    <Text type="secondary">
                      <MailOutlined /> {center.contactEmail}
                    </Text>
                    <div style={{ margin: "12px 0" }}>
                      <Tag color={center.status === "Active" ? "green" : "orange"}>
                        {center.status === "Active" ? "Hoạt động" : "Chờ duyệt"}
                      </Tag>
                    </div>
                    <Space style={{ width: "100%", flexDirection: "column" }}>
                      <Button
                        block
                        icon={<SendOutlined />}
                        onClick={() => handleGetDirection(center)}
                        disabled={!userPos}
                      >
                        Chỉ đường
                      </Button>
                      <Button
                        type="primary"
                        block
                        icon={<BookOutlined />}
                        onClick={() => handleViewCourses(center)}
                      >
                        Xem khóa học
                      </Button>
                    </Space>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Route info overlay */}
        {routeInfo && (
          <div style={styles.routeOverlay}>
            <Text strong style={{color:'white', fontSize: 16}}>
              {(routeInfo.dist / 1000).toFixed(1)} km - {Math.round(routeInfo.dur / 60)} phút
            </Text>
            <Button type="text" icon={<WarningOutlined style={{color: '#ff4d4f'}} />} onClick={clearRoute} />
          </div>
        )}
      </div>

      <GlobalStyle />
    </div>
  );
};

// --- STYLES ---
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    position: "relative",
  },
  center: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" },
  sidebar: {
    width: 400,
    background: "white",
    borderRight: "1px solid #ddd",
    display: "flex",
    flexDirection: "column",
    zIndex: 100,
    boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
  },
  sidebarHeader: { padding: 16, borderBottom: "1px solid #f0f0f0" },
  sidebarContent: { flex: 1, overflowY: "auto" },
  listItem: { padding: "12px 24px", cursor: "pointer", transition: "0.2s" },
  floatingButton: {
    position: "absolute",
    top: 24,
    left: 24,
    zIndex: 1001,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  routeOverlay: {
    position: 'absolute', 
    bottom: 30, 
    left: '50%', 
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.8)', 
    padding: '8px 20px', 
    borderRadius: 30,
    zIndex: 900, 
    display: 'flex', 
    alignItems: 'center', 
    gap: 10
  },
};

const GlobalStyle = () => (
  <style>{`
    .leaflet-popup-content-wrapper { border-radius: 12px; padding: 0; overflow: hidden; }
    .leaflet-popup-content { margin: 0 !important; width: 100% !important; }
    .user-pulse { animation: pulse 2s infinite; }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(24,144,255,0.7); }
      70% { box-shadow: 0 0 0 10px rgba(24,144,255,0); }
      100% { box-shadow: 0 0 0 0 rgba(24,144,255,0); }
    }
  `}</style>
);

export default ParentCentersMap;
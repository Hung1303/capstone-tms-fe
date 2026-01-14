import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import { Spin, Button, Space, Tag, Typography, List, Avatar, Input, Empty } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, UserOutlined, BookOutlined, SendOutlined, WarningOutlined, CheckCircleOutlined } from "@ant-design/icons";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../config/axios";

const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

const { Title, Text } = Typography;

// Fix lỗi icon Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// --- SUB-COMPONENT QUAN TRỌNG: XỬ LÝ MAP & POPUP ---
// Component này thay thế cho FlyToLocation cũ
const MapHandler = ({ selectedCenter, markerRefs }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedCenter && selectedCenter.id) {
      const latitude = selectedCenter.latitude || 10.762622;
      const longitude = selectedCenter.longitude || 106.660172;
      const { id } = selectedCenter;

      console.log('MapHandler - Flying to:', { latitude, longitude, id });

      // 1. Bay đến vị trí
      map.flyTo([latitude, longitude], 16, {
        duration: 1.5,
      });

      // 2. Tìm marker và mở popup
      setTimeout(() => {
        console.log('MapHandler - Looking for marker:', id);
        console.log('MapHandler - Available markers:', Object.keys(markerRefs.current));
        
        const marker = markerRefs.current[id];
        if (marker) {
          console.log('MapHandler - Found marker, opening popup');
          marker.openPopup();
        } else {
          console.log('MapHandler - Marker not found');
        }
      }, 800);
    }
  }, [selectedCenter, map, markerRefs]);

  return null;
};

// --- SIDEBAR ---
const CenterSidebar = ({
  visible,
  onClose,
  centers,
  selectedCenterId,
  onSelectCenter,
  searchTerm,
  onSearchChange,
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
          <Text strong style={{ fontSize: 12, color: "#888" }}>KẾT QUẢ: {centers.length} (Đang hoạt động)</Text>
        </div>

        {/* Danh sách */}
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
                      style={{ backgroundColor: "#f6ffed", color: "#52c41a" }}
                    />
                  }
                  title={<Text strong>{item.centerName}</Text>}
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.ownerName}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <EnvironmentOutlined /> {item.address}
                      </Text>
                      <br />
                      <Tag icon={<CheckCircleOutlined />} color="success" style={{ marginTop: 4 }}>
                        Hoạt động
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
  
  // Ref để lưu trữ tham chiếu đến tất cả các Marker trên bản đồ
  const markerRefs = useRef({}); 

  // States
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userPos, setUserPos] = useState(null);
  const [mapCenter, setMapCenter] = useState([10.762622, 106.660172]);
  const [routeCoords, setRouteCoords] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
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
        const response = await api.get("/Users/Centers");
        const centersData = response.data?.centers || [];
        // Chỉ lấy trung tâm Active
        setCenters(centersData.filter(c => c.status === "Active"));
      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const filteredCenters = useMemo(() => {
    return centers.filter((center) => {
      const s = searchTerm.toLowerCase();
      return (
        center.centerName.toLowerCase().includes(s) ||
        center.ownerName.toLowerCase().includes(s) ||
        center.address.toLowerCase().includes(s)
      );
    });
  }, [centers, searchTerm]);

  const handleSelectCenter = (center) => {
    // Clone object để đảm bảo useEffect trong MapHandler luôn chạy (kể cả khi click lại trung tâm cũ)
    setSelectedCenter({ ...center });
    
    // Trên mobile thì đóng sidebar để xem map
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleViewCourses = (center) => navigate(`/courses`);

  const handleGetDirection = async (center) => {
    if (!userPos) return alert("Cần bật định vị!");
    
    // Khi bấm chỉ đường cũng tự động chọn trung tâm đó
    setSelectedCenter({ ...center });

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
    if(userPos) setMapCenter(userPos);
  };

  if (loading) return <div style={styles.center}><Spin size="large" /></div>;

  return (
    <div style={styles.container}>
      {!isSidebarOpen && (
        <Button icon={<MenuUnfoldOutlined />} size="large" onClick={() => setIsSidebarOpen(true)} style={styles.floatingButton} />
      )}

      <CenterSidebar
        visible={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        centers={filteredCenters}
        selectedCenterId={selectedCenter?.id}
        onSelectCenter={handleSelectCenter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div style={{ flex: 1, position: "relative" }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM" />
          
          {/* Component điều khiển Map & Popup */}
          <MapHandler selectedCenter={selectedCenter} markerRefs={markerRefs} />

          {userPos && (
            <Marker
              position={userPos}
              icon={L.divIcon({
                className: "user-pulse",
                html: '<div style="background:#1890ff;width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 0 3px rgba(24,144,255,0.3)"></div>',
              })}
            />
          )}

          {routeCoords && <Polyline positions={routeCoords} color="#1890ff" weight={6} />}

          {filteredCenters.map((center) => {
            const lat = center.latitude || 10.762622;
            const lng = center.longitude || 106.660172;

            return (
              <Marker
                key={center.id}
                position={[lat, lng]}
                // QUAN TRỌNG: Gán ref của marker vào object markerRefs
                ref={(ref) => {
                  console.log('Marker ref assigned for:', center.id, ref ? 'SUCCESS' : 'FAILED');
                  if (ref) {
                    markerRefs.current[center.id] = ref;
                  }
                }}
              >
                <Popup maxWidth={300}>
                  <div style={{ padding: 8 }}>
                    <Title level={5} style={{ margin: "0 0 8px 0" }}>{center.centerName}</Title>
                    <Text type="secondary"><UserOutlined /> {center.ownerName}</Text><br />
                    <Text type="secondary"><EnvironmentOutlined /> {center.address}</Text><br />
                    <Text type="secondary"><PhoneOutlined /> {center.contactPhone}</Text><br />
                    <div style={{ margin: "12px 0" }}><Tag color="green">Hoạt động</Tag></div>
                    <Space style={{ width: "100%", flexDirection: "column" }}>
                      <Button block icon={<SendOutlined />} onClick={() => handleGetDirection(center)} disabled={!userPos}>
                        Chỉ đường
                      </Button>
                      <Button type="primary" block icon={<BookOutlined />} onClick={() => handleViewCourses(center)}>
                        Xem khóa học
                      </Button>
                    </Space>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

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
  container: { display: "flex", height: "100vh", overflow: "hidden", position: "relative" },
  center: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" },
  sidebar: { width: 400, background: "white", borderRight: "1px solid #ddd", display: "flex", flexDirection: "column", zIndex: 100, boxShadow: "2px 0 8px rgba(0,0,0,0.1)" },
  sidebarHeader: { padding: 16, borderBottom: "1px solid #f0f0f0" },
  sidebarContent: { flex: 1, overflowY: "auto" },
  listItem: { padding: "12px 24px", cursor: "pointer", transition: "0.2s" },
  floatingButton: { position: "absolute", top: 24, left: 24, zIndex: 1001, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" },
  routeOverlay: { position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', padding: '8px 20px', borderRadius: 30, zIndex: 900, display: 'flex', alignItems: 'center', gap: 10 },
};

const GlobalStyle = () => (
  <style>{`
    .leaflet-popup-content-wrapper { border-radius: 12px; padding: 0; overflow: hidden; }
    .leaflet-popup-content { margin: 0 !important; width: 100% !important; }
    .user-pulse { animation: pulse 2s infinite; }
    @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(24,144,255,0.7); } 70% { box-shadow: 0 0 0 10px rgba(24,144,255,0); } 100% { box-shadow: 0 0 0 0 rgba(24,144,255,0); } }
  `}</style>
);

export default ParentCentersMap;
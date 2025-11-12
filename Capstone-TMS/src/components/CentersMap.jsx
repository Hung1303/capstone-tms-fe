import React, { Fragment, useEffect, useState, useRef, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
  Tooltip,
} from "react-leaflet";
import { Select, Card, Spin, Button } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
// import api from "../config/axios"; // Khi có API thì bỏ comment dòng này
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./CentersMap.css";

const { Option } = Select;

// 🔴 Cấu hình OSRM
const OSRM_BASE_URL = "https://router.project-osrm.org/route/v1";
const ROUTING_PROFILE = "driving";

// Custom Marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component để focus map tới vị trí mới
function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 14, { duration: 1.5 });
  }, [position, map]);
  return null;
}

// 🆕 Hàm tiện ích để định dạng
const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

const formatTime = (seconds) => {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} giờ ${remainingMinutes} phút`;
};

const CentersMap = () => {
  // Mock data trung tâm học
  const mockCenters = [
    {
      id: 1,
      name: "Trung Tâm Anh Ngữ Quốc Tế",
      city: "TP. Hồ Chí Minh",
      district: "Quận 1",
      location: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      contactInfo: "028-1234-5678",
      latitude: 10.7769,
      longitude: 106.7009,
      totalCourses: 15,
      totalStudents: 156,
    },
    {
      id: 2,
      name: "Trung Tâm Toán Học Thông Minh",
      city: "TP. Hồ Chí Minh",
      district: "Quận 3",
      location: "456 Lê Lợi, Quận 3, TP.HCM",
      contactInfo: "028-2345-6789",
      latitude: 10.7756,
      longitude: 106.6919,
      totalCourses: 12,
      totalStudents: 98,
    },
    {
      id: 3,
      name: "Trung Tâm Luyện Thi THPT",
      city: "TP. Hồ Chí Minh",
      district: "Quận 7",
      location: "789 Nguyễn Văn Linh, Quận 7, TP.HCM",
      contactInfo: "028-3456-7890",
      latitude: 10.7411,
      longitude: 106.7198,
      totalCourses: 20,
      totalStudents: 234,
    },
    {
      id: 4,
      name: "Trung Tâm Tin Học ABC",
      city: "TP. Hồ Chí Minh",
      district: "Thủ Đức",
      location: "321 Đường Hiệp Bình, TP. Thủ Đức",
      contactInfo: "028-4567-8901",
      latitude: 10.8505,
      longitude: 106.7717,
      totalCourses: 18,
      totalStudents: 187,
    },
  ];

  const [centers, setCenters] = useState(mockCenters);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [userGeoPosition, setUserGeoPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([10.762622, 106.660172]);
  const [routeCoordinates, setRouteCoordinates] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const markerRefs = useRef({});

  // Fetch centers từ API (hiện tại dùng mock data)
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setLoading(true);
        // const res = await api.get("/centers");
        // setCenters(res.data);
        
        // Mock data - comment out khi có API
        setCenters(mockCenters);
      } catch (err) {
        console.error("Lỗi khi tải trung tâm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCenters();
  }, []);

  // Geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserGeoPosition(newPosition);
          setMapCenter(newPosition);
        },
        (error) => {
          console.warn(`Lỗi Geolocation (${error.code}): ${error.message}`);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.log("Trình duyệt không hỗ trợ Geolocation.");
    }
  }, []);

  // 🆕 Tính toán đường đi
  const getRoute = async (origin, destination) => {
    setRouteCoordinates(null);
    setRouteInfo(null);

    const start = `${origin[1]},${origin[0]}`;
    const end = `${destination[1]},${destination[0]}`;
    const coordinates = `${start};${end}`;
    const url = `${OSRM_BASE_URL}/${ROUTING_PROFILE}/${coordinates}?overview=full&geometries=geojson`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`OSRM API thất bại với status ${res.status}`);
      }
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinatesList = route.geometry.coordinates.map((coord) => [
          coord[1],
          coord[0],
        ]);
        setRouteCoordinates(coordinatesList);
        setRouteInfo({
          distance: route.distance,
          duration: route.duration,
        });
      } else {
        alert("Không tìm thấy tuyến đường.");
      }
    } catch (error) {
      console.error("Lỗi khi tính toán đường đi OSRM:", error);
      alert("Có lỗi khi tính toán đường đi. Vui lòng thử lại sau.");
    }
  };

  // Xử lý khi bấm nút Chỉ Đường
  const handleDirectionsClick = (center) => {
    if (!userGeoPosition) {
      alert(
        "Vui lòng cho phép truy cập vị trí (Geolocation) để tính toán đường đi."
      );
      return;
    }
    setSelectedCenter(center);
    getRoute(userGeoPosition, [center.latitude, center.longitude]);
    const ref = markerRefs.current[center.id];
    if (ref) ref.closePopup();
  };

  // Xóa đường đi
  const clearRoute = () => {
    setRouteCoordinates(null);
    setRouteInfo(null);
    setSelectedCenter(null);
  };

  // Lọc cities, districts, centers
  const cities = useMemo(() => {
    return [...new Set(centers.map((c) => c.city))];
  }, [centers]);

  const districts = useMemo(() => {
    return selectedCity
      ? [
          ...new Set(
            centers
              .filter((c) => c.city === selectedCity)
              .map((c) => c.district)
          ),
        ]
      : [];
  }, [centers, selectedCity]);

  const filteredCenters = useMemo(() => {
    return centers.filter(
      (c) =>
        (!selectedCity || c.city === selectedCity) &&
        (!selectedDistrict || c.district === selectedDistrict)
    );
  }, [centers, selectedCity, selectedDistrict]);

  if (loading) return <Spin tip="Đang tải dữ liệu trung tâm..." />;

  return (
    <Fragment>
      <div style={{ display: "flex", height: "90vh", position: "relative", zIndex: 0 }}>
        {/* Nút Toggle */}
        <Button
          type="primary"
          icon={isSidebarVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          className="sidebar-toggle-button"
        />

        {/* Sidebar */}
        {isSidebarVisible && (
          <Card
            title={
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#1890ff",
                  textAlign: "center",
                  marginTop: "16px",
                }}
              >
                <h1>Hệ thống Trung tâm</h1>
              </div>
            }
            style={{
              width: 300,
              transition: "width 0.3s ease, padding 0.3s ease",
              flexShrink: 0,
              zIndex: 999,
            }}
          >
            <p>
              <strong>Thành phố:</strong>
            </p>
            <Select
              style={{ width: "100%", marginBottom: 10 }}
              placeholder="Chọn thành phố"
              allowClear
              onChange={(v) => {
                setSelectedCity(v);
                setSelectedDistrict(null);
                clearRoute();
              }}
            >
              {cities.map((city) => (
                <Option key={city} value={city}>
                  {city}
                </Option>
              ))}
            </Select>

            <p>
              <strong>Quận / Huyện:</strong>
            </p>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn quận / huyện"
              allowClear
              value={selectedDistrict}
              onChange={(v) => {
                setSelectedDistrict(v);
                clearRoute();
              }}
              disabled={!selectedCity}
            >
              {districts.map((d) => (
                <Option key={d} value={d}>
                  {d}
                </Option>
              ))}
            </Select>

            <p style={{ marginTop: 16 }}>
              <strong>Trung tâm hiện có:</strong> ({filteredCenters.length})
            </p>
            <ul
              style={{
                maxHeight: 300,
                overflowY: "auto",
                paddingLeft: 16,
              }}
            >
              {filteredCenters.map((c) => (
                <li
                  key={c.id}
                  onClick={() => {
                    setSelectedCenter(c);
                    setMapCenter([c.latitude, c.longitude]);
                    setTimeout(() => {
                      const ref = markerRefs.current[c.id];
                      if (ref) ref.openPopup();
                    }, 100);
                  }}
                  style={{
                    cursor: "pointer",
                    marginBottom: 8,
                    color: selectedCenter?.id === c.id ? "#fa541c" : "#1890ff",
                    fontWeight:
                      selectedCenter?.id === c.id ? "bold" : "normal",
                  }}
                >
                  📍 {c.name} ({c.district})
                </li>
              ))}
            </ul>

            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <Button
                type="default"
                danger
                onClick={clearRoute}
                disabled={!routeCoordinates}
              >
                Xóa Chỉ Đường
              </Button>
              {routeInfo && (
                <p
                  style={{
                    fontSize: "14px",
                    marginTop: "10px",
                    fontWeight: "bold",
                  }}
                >
                  Tổng: {formatDistance(routeInfo.distance)} (
                  {formatTime(routeInfo.duration)})
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Map */}
        <div style={{ flex: 1, position: "relative", height: "100%" }}>
          <MapContainer
            center={mapCenter}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Vẽ đường đi */}
            {routeCoordinates && (
              <Polyline
                positions={routeCoordinates}
                color="#007bff"
                weight={5}
                opacity={0.8}
              >
                {routeInfo && (
                  <Tooltip
                    direction="center"
                    permanent={true}
                    className="route-tooltip"
                  >
                    {formatDistance(routeInfo.distance)} |{" "}
                    {formatTime(routeInfo.duration)}
                  </Tooltip>
                )}
              </Polyline>
            )}

            {/* Marker vị trí người dùng */}
            {userGeoPosition && (
              <Marker
                position={userGeoPosition}
                icon={L.divIcon({
                  className: "user-geo-icon",
                  html: '<div style="background-color: #007bff; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>',
                  iconSize: [20, 20],
                })}
              >
                <Popup>
                  <strong>📍 Vị trí của bạn</strong> <br /> (Điểm bắt đầu chỉ
                  đường)
                </Popup>
              </Marker>
            )}

            {selectedCenter && (
              <FlyToLocation
                position={[selectedCenter.latitude, selectedCenter.longitude]}
              />
            )}

            {/* Markers Trung tâm */}
            {filteredCenters.map((c) => (
              <Marker
                key={c.id}
                position={[c.latitude, c.longitude]}
                ref={(ref) => (markerRefs.current[c.id] = ref)}
              >
                <Popup>
                  <strong>{c.name}</strong> <br />
                  📍 {c.location} <br />
                  ☎️ {c.contactInfo} <br />
                  📚 Khóa học: {c.totalCourses} <br />
                  👨‍🎓 Học sinh: {c.totalStudents}
                  <div
                    style={{
                      marginTop: "8px",
                      borderTop: "1px solid #eee",
                      paddingTop: "8px",
                    }}
                  >
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleDirectionsClick(c)}
                      disabled={!userGeoPosition}
                    >
                      {userGeoPosition
                        ? "Chỉ Đường Đến Đây"
                        : "Đang chờ vị trí..."}
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </Fragment>
  );
};

export default CentersMap;

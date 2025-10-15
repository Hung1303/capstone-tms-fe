import React, { useState } from "react";
import Map, { Marker, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
// import api from "../config/axios"; // Khi có API thì bỏ comment dòng này

const MAPTILER_STYLE_URL = `https://api.maptiler.com/maps/streets/style.json?key=CTM4zwFIPv1QIPNs6QSj`;
const FPT_SAIGON = { lat: 10.841127, lng: 106.809866 };

const containerStyleDefault = {
    width: '100%',
    height: '70vh',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
};

const PinMarker = ({ color, isOrigin = false }) => {
    const size = isOrigin ? 20 : 28;
    return (
        <div style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
        }}>
            <div style={{
                width: size,
                height: size,
                borderRadius: '50% 50% 50% 0',
                backgroundColor: color,
                boxShadow: '0 0 5px rgba(0,0,0,0.3)',
                transform: 'rotate(-45deg)',
                border: '1px solid #fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: -3,
            }}>
            </div>
        </div>
    );
};


function CentersMap({ style = {}, showHeader = false }) {
    
    // Giả định dữ liệu trung tâm - ĐÃ XÓA registeredStudents
    const dummyCenters = [
        { id: 1, name: "TT Quận 7", location: "Nguyễn Văn Linh, Q.7", branch: "Chi nhánh 7", lat: 10.74, lng: 106.70 },
        { id: 2, name: "TT Thủ Đức", location: "Đường Hiệp Bình, TP. Thủ Đức", branch: "Chi nhánh Thủ Đức", lat: 10.83, lng: 106.75 },
    ];
    
    const [centers, setCenters] = useState(dummyCenters); 
    const [viewState, setViewState] = useState({
        longitude: FPT_SAIGON.lng,
        latitude: FPT_SAIGON.lat,
        zoom: 12
    });
    const [popupInfo, setPopupInfo] = useState(null);

    const containerStyle = { ...containerStyleDefault, ...style };

    return (
        <div>
            {showHeader && (
                <header style={{ textAlign: 'center', marginBottom: 16 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#1e3a8a' }}>
                        Mạng lưới Trung tâm Dạy học
                    </h1>
                    <div style={{ fontSize: 36, fontWeight: 800, color: '#059669' }}>
                        {centers.length + 1}
                    </div>
                    <p style={{ color: '#64748b' }}>Trung tâm đã được cấp phép</p>
                </header>
            )}
            <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={containerStyle}
                mapStyle={MAPTILER_STYLE_URL}
            >
                {/* Marker cho Trụ sở chính (FPT) */}
                <Marker
                    longitude={FPT_SAIGON.lng}
                    latitude={FPT_SAIGON.lat}
                    anchor="bottom"
                    onClick={e => {
                        e.originalEvent.stopPropagation();
                        setPopupInfo({
                            name: "Trụ sở chính FPT Sài Gòn",
                            location: "Đại học FPT, Khu CNC Q9",
                            branch: "Văn phòng điều hành chính",
                            lat: FPT_SAIGON.lat,
                            lng: FPT_SAIGON.lng
                        });
                    }}
                >
                    <PinMarker color="#1e3a8a" isOrigin={true} />
                </Marker>
                
                {/* Marker cho các trung tâm khác */}
                {centers.map(c => (
                    <Marker
                        key={c.id}
                        longitude={c.lng}
                        latitude={c.lat}
                        anchor="bottom"
                        onClick={e => {
                            e.originalEvent.stopPropagation();
                            setPopupInfo({
                                name: c.name,
                                location: c.location,
                                branch: c.branch, 
                                lat: c.lat,
                                lng: c.lng
                            });
                        }}
                    >
                        <PinMarker color="#ef4444" isOrigin={false} />
                    </Marker>
                ))}


                {/* Popup (chỉ hiển thị tên, vị trí và chi nhánh) */}
                {popupInfo && (
                    <Popup
                        longitude={popupInfo.lng}
                        latitude={popupInfo.lat}
                        closeButton={true}
                        closeOnClick={false}
                        onClose={() => setPopupInfo(null)}
                        anchor="bottom"
                    >
                        <div style={{ minWidth: 180, padding: 5 }}>
                            <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 5px 0', color: '#1e3a8a' }}>
                                {popupInfo.name}
                            </h4>
                            <p style={{ margin: '0 0 2px 0', fontSize: 13, color: '#444' }}>
                                Vị trí: <b>{popupInfo.location}</b>
                            </p>
                            <p style={{ margin: '0 0 5px 0', fontSize: 13, fontWeight: 600, color: '#059669' }}>
                                Chi Nhánh: <b>{popupInfo.branch}</b>
                            </p>
                        </div>
                    </Popup>
                )}
            </Map>
        </div>
    );
}

export default CentersMap;
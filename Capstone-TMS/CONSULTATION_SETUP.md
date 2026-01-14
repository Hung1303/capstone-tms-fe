# Hướng dẫn Cấu hình Chức năng Tư vấn với SignalR

## 📋 Tổng quan

Chức năng tư vấn đã được xây dựng với SignalR để hỗ trợ giao tiếp real-time giữa Trung tâm và Phụ huynh.

## 🔧 Các file đã tạo/cập nhật

### 1. Services
- **`src/services/consultationService.js`** - Quản lý kết nối SignalR và các API

### 2. Contexts
- **`src/contexts/ConsultationContext.jsx`** - Quản lý state tư vấn toàn cục

### 3. Pages
- **`src/pages/management/CenterConsultation.jsx`** - Giao diện tư vấn cho Trung tâm
- **`src/pages/management/ParentConsultation.jsx`** - Giao diện tư vấn cho Phụ huynh

### 4. Router
- **`src/router/router.jsx`** - Thêm routes `/center/consultation` và `/parent/consultation`

### 5. Layout
- **`src/layouts/AdminLayout.jsx`** - Thêm menu "Tư vấn" cho Center và Parent

### 6. App
- **`src/App.jsx`** - Bao bọc ứng dụng với ConsultationProvider

## 🚀 Các bước tiếp theo

### 1. Cấu hình Environment Variables

Thêm vào file `.env` hoặc `.env.local`:

```env
VITE_API_URL=http://localhost:5000
```

### 2. Kiểm tra Backend SignalR Hub

Đảm bảo backend của bạn có:

- **SignalR Hub**: `/consultationHub`
- **API Endpoints**:
  - `GET /api/Consultation/{sessionId}` - Lấy danh sách phiên tư vấn
  - `POST /api/Consultation/Session` - Tạo phiên tư vấn mới
  - `POST /api/Consultation/Chat/{userId}` - Gửi tin nhắn

### 3. Cấu hình CORS (Backend)

Đảm bảo backend cho phép CORS từ frontend:

```csharp
services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder.WithOrigins("http://localhost:5173")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});
```

### 4. Cấu hình SignalR (Backend)

```csharp
app.MapHub<ConsultationHub>("/consultationHub");
```

## 📱 Các tính năng đã triển khai

### Cho Trung tâm (Center)
- ✅ Xem danh sách phiên tư vấn với phụ huynh
- ✅ Gửi/nhận tin nhắn real-time
- ✅ Hiển thị trạng thái kết nối
- ✅ Cuộn tự động đến tin nhắn mới nhất

### Cho Phụ huynh (Parent)
- ✅ Xem danh sách phiên tư vấn với trung tâm
- ✅ Tạo phiên tư vấn mới
- ✅ Gửi/nhận tin nhắn real-time
- ✅ Hiển thị trạng thái kết nối
- ✅ Cuộn tự động đến tin nhắn mới nhất

## 🔌 SignalR Events

### Server → Client
- `ReceiveMessage` - Nhận tin nhắn mới
- `ReceiveConsultationSessions` - Nhận danh sách phiên
- `SessionCreated` - Phiên tư vấn được tạo
- `SessionUpdated` - Phiên tư vấn được cập nhật
- `UserJoined` - Người dùng tham gia phiên
- `UserLeft` - Người dùng rời phiên

### Client → Server
- `SendMessage(userId, sessionId, content)` - Gửi tin nhắn

## 🛠️ Tùy chỉnh

### Thay đổi URL SignalR Hub

Chỉnh sửa trong `src/services/consultationService.js`:

```javascript
const HUB_URL = `${API_BASE_URL}/consultationHub`;
```

### Thay đổi Styling

Các component sử dụng Tailwind CSS. Bạn có thể tùy chỉnh màu sắc bằng cách sửa các class:

- `bg-orange-500` - Màu chính
- `bg-gray-50` - Màu nền
- `border-orange-500` - Màu viền

### Thêm tính năng mới

Bạn có thể mở rộng `ConsultationContext` để thêm:
- Chia sẻ file
- Ghi âm/video call
- Lịch sử tư vấn
- Đánh giá phiên tư vấn

## 🐛 Troubleshooting

### SignalR không kết nối
1. Kiểm tra URL backend có đúng không
2. Kiểm tra CORS configuration
3. Kiểm tra token JWT có hợp lệ không
4. Mở DevTools → Network → WS để xem chi tiết

### Tin nhắn không gửi được
1. Kiểm tra kết nối SignalR (xem badge trạng thái)
2. Kiểm tra console để xem lỗi
3. Thử gửi lại tin nhắn
4. Nếu vẫn lỗi, hệ thống sẽ fallback sang API

### Danh sách phiên trống
1. Kiểm tra API `/api/Consultation/{sessionId}` có trả dữ liệu không
2. Kiểm tra user ID có đúng không
3. Kiểm tra database có dữ liệu không

## 📚 Tài liệu tham khảo

- [SignalR Documentation](https://learn.microsoft.com/en-us/aspnet/core/signalr/)
- [React Context API](https://react.dev/reference/react/useContext)
- [Ant Design Components](https://ant.design/components/overview/)

## ✅ Checklist

- [ ] Cấu hình `.env` với `VITE_API_URL`
- [ ] Kiểm tra backend SignalR Hub
- [ ] Kiểm tra CORS configuration
- [ ] Test kết nối SignalR
- [ ] Test gửi/nhận tin nhắn
- [ ] Test tạo phiên tư vấn mới
- [ ] Test danh sách phiên
- [ ] Test trạng thái kết nối

---

**Lưu ý**: Nếu gặp bất kỳ vấn đề nào, hãy kiểm tra console browser và backend logs để tìm nguyên nhân.
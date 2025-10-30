# 🔑 Tài Khoản Mock Data - TutorLink TMS

File này chứa danh sách tất cả các tài khoản mock để test các chức năng của hệ thống theo **Thông tư 29** và business flows thực tế.

---

## 🎯 Tổng Quan Hệ Thống

### 6 Roles Chính:
1. **Admin** - Quản trị viên hệ thống
2. **Staff** - Chuyên viên xác thực
3. **Center** - Tài khoản trung tâm
4. **Teacher** - Giáo viên
5. **Parent** - Phụ huynh
6. **Student** - Học sinh

---

## 📋 Danh Sách Tài Khoản Chi Tiết

### 1️⃣ 👨‍💼 Admin Accounts (Quản trị viên hệ thống)

| Email | Password | Tên | Mô tả |
|-------|----------|-----|-------|
| admin@tutorlink.com | admin123 | Nguyễn Văn Admin | Quản trị viên chính |
| admin2@tutorlink.com | admin123 | Trần Thị Quản Trị | Quản trị viên phụ |

**Quyền hạn:**
- ✅ **Toàn quyền hệ thống**
- ✅ Quản lý tất cả người dùng (CRUD)
- ✅ Quản lý trung tâm (approve/reject)
- ✅ Quản lý khóa học
- ✅ Quản lý staff, teacher, parent, student
- ✅ Xem dashboard tổng quan
- ✅ Xem báo cáo tài chính
- ✅ Cấu hình hệ thống
- ✅ Quản lý gói subscription

**Dashboard:** `/admin`

---

### 2️⃣ 🔍 Staff Accounts (Chuyên viên xác thực)

| Email | Password | Tên | Mã NV | Phòng ban |
|-------|----------|-----|-------|-----------|
| staff@tutorlink.com | staff123 | Lê Văn Chuyên Viên | STAFF001 | Phòng Xác Thực |
| staff2@tutorlink.com | staff123 | Phạm Thị Kiểm Duyệt | STAFF002 | Phòng Xác Thực |

**Quyền hạn:**
- ✅ **Xác thực trung tâm** (verify centers)
  - Đi thực địa chụp ảnh trung tâm
  - Kiểm tra giấy phép kinh doanh
  - Kiểm tra chứng chỉ giáo viên
  - Xác thực lên admin
- ✅ **Xác thực khóa học** (verify courses)
  - Kiểm tra thông tin khóa học
  - Confirm khóa học sau khi giáo viên ký
- ✅ **Xác thực học sinh** (verify students)
  - Add học sinh vào lớp sau khi phụ huynh đăng ký
  - Xác nhận đã đặt cọc
- ✅ Xem tất cả trung tâm
- ✅ Xem tất cả khóa học
- ✅ Quản lý yêu cầu xác thực
- ❌ Không thể tạo/xóa trung tâm
- ❌ Không thể cấu hình hệ thống

**Dashboard:** `/staff`

---

### 3️⃣ 🏢 Center Accounts (Tài khoản trung tâm)

| Email | Password | Tên Trung Tâm | Trạng thái | Gói |
|-------|----------|----------------|------------|-----|
| center1@tutorlink.com | center123 | Trung Tâm Anh Ngữ Quốc Tế | ✅ Verified | Premium |
| center2@tutorlink.com | center123 | Trung Tâm Toán Học Thông Minh | ⏳ Pending | Standard |

**Thông tin trung tâm:**
- Địa chỉ, giấy phép kinh doanh, mã số thuế
- Chứng chỉ đạt chuẩn
- Ảnh thực địa (do staff chụp)
- Trạng thái xác thực: pending/verified/rejected

**Quyền hạn:**
- ✅ **Tạo khóa học** (create courses)
  - Tạo thông tin khóa học
  - Assign giáo viên vào khóa học
  - Khóa học ở trạng thái pending
- ✅ **Quản lý khóa học của mình**
  - Chỉnh sửa thông tin
  - Đăng khóa học sau khi staff confirm
- ✅ **Assign giáo viên** vào khóa học
- ✅ **Xác nhận học sinh** đã được staff verify
- ✅ Xem học sinh đăng ký
- ✅ Quản lý lịch học
- ✅ Xem doanh thu
- ✅ **Quản lý gói subscription**
  - Xem số bài đăng còn lại
  - Upgrade gói
- ❌ Không thể xem trung tâm khác
- ❌ Không thể tự verify khóa học

**Subscription Packages:**
- **Basic**: 6 tháng - 500k - 20 bài đăng
- **Standard**: 6 tháng - 800k - 50 bài đăng + Analytics
- **Premium**: 1 năm - 1.5tr - 100 bài đăng + Marketing tools
- **Enterprise**: 1 năm - 3tr - Unlimited + Priority support

**Dashboard:** `/center`

---

### 4️⃣ 👨‍🏫 Teacher Accounts (Giáo viên)

| Email | Password | Tên | Trung Tâm | Môn dạy |
|-------|----------|-----|-----------|---------|
| teacher1@tutorlink.com | teacher123 | Nguyễn Thị Giáo Viên | Anh Ngữ Quốc Tế | Tiếng Anh, IELTS |
| teacher2@tutorlink.com | teacher123 | Lê Văn Thầy Giáo | Toán Học Thông Minh | Toán, Vật Lý |

**Thông tin giáo viên:**
- Thuộc trung tâm nào
- Môn dạy, kinh nghiệm
- Bằng cấp, chứng chỉ
- Rating, số học sinh đã dạy
- Khóa học được assign

**Quyền hạn:**
- ✅ **Ký vào khóa học** (assigned by center)
  - Xem khóa học được assign
  - Ký xác nhận tham gia
  - Khóa học chuyển sang pending (chờ staff confirm)
- ✅ **Quản lý lớp học**
  - Xem danh sách học sinh
  - Quản lý lịch dạy
- ✅ **Điểm danh** học sinh
- ✅ **Chấm điểm** học sinh
- ✅ Xem thông tin học sinh trong lớp
- ✅ Liên lạc phụ huynh
- ❌ Không thể tạo khóa học
- ❌ Không thể xem lớp khác

**Dashboard:** `/teacher`

---

### 5️⃣ 👨‍👩‍👧 Parent Accounts (Phụ huynh)

| Email | Password | Tên | Số con | Trạng thái |
|-------|----------|-----|--------|------------|
| parent1@tutorlink.com | parent123 | Nguyễn Văn Phụ Huynh | 2 con | Active |
| parent2@tutorlink.com | parent123 | Trần Thị Mẹ | 1 con | Active |

**Thông tin con cái:**
- Tên, ngày sinh, lớp, trường
- Khóa học đã đăng ký
- Lịch sử thanh toán

**Quyền hạn:**
- ✅ **Đăng ký tài khoản**
- ✅ **Thêm con vào hệ thống**
- ✅ **Đăng ký khóa học cho con**
  - Chọn khóa học
  - Đặt cọc 10% học phí
  - Chờ staff verify
  - Chờ center confirm
- ✅ **Thanh toán học phí**
  - Đặt cọc (10%)
  - Thanh toán đầy đủ
  - Xem lịch sử thanh toán
- ✅ Xem lịch học của con
- ✅ Xem điểm số của con
- ✅ Xem điểm danh của con
- ✅ Liên lạc giáo viên
- ✅ Quản lý thông tin con
- ❌ **Học sinh KHÔNG thể tự đăng ký**
- ❌ Không thể xem thông tin con người khác

**Unhappy Case:**
- Lớp bị hủy (không đủ học sinh, giáo viên nghỉ)
- → Hệ thống thông báo
- → Hoàn tiền cho phụ huynh

**Dashboard:** `/parent`

---

### 6️⃣ 👨‍🎓 Student Accounts (Học sinh)

| Email | Password | Tên | Lớp | Phụ huynh |
|-------|----------|-----|-----|-----------|
| student1@tutorlink.com | student123 | Nguyễn Văn Con | Lớp 10 | Nguyễn Văn Phụ Huynh |
| student2@tutorlink.com | student123 | Nguyễn Thị Con Gái | Lớp 8 | Nguyễn Văn Phụ Huynh |
| student3@tutorlink.com | student123 | Trần Văn Bé | Lớp 9 | Trần Thị Mẹ |

**Thông tin học sinh:**
- Phụ huynh quản lý
- Lớp, trường
- Khóa học đang học
- Điểm danh, điểm số

**Quyền hạn:**
- ✅ **Xem lịch học** của mình
- ✅ **Xem điểm số** của mình
- ✅ **Xem điểm danh**
- ✅ Xem tài liệu học tập
- ✅ Nộp bài tập
- ❌ **KHÔNG thể đăng ký khóa học** (chỉ phụ huynh mới đăng ký được)
- ❌ Không thể xem thông tin học sinh khác
- ❌ Không thể thanh toán

**Dashboard:** `/student`

---

## 🔄 Business Flows (Theo Thông tư 29)

### Flow 1: Trung tâm tạo khóa học

```
1. Center tạo khóa học
   ├─ Nhập thông tin khóa học
   ├─ Assign giáo viên
   └─ Khóa học ở trạng thái: PENDING

2. Teacher ký xác nhận
   ├─ Xem khóa học được assign
   ├─ Ký xác nhận tham gia
   └─ Khóa học vẫn ở: PENDING

3. Staff confirm khóa học
   ├─ Kiểm tra thông tin
   ├─ Kiểm tra giáo viên đã ký
   ├─ Confirm khóa học
   └─ Khóa học chuyển sang: VERIFIED

4. Center đăng khóa học
   ├─ Khóa học đã verified
   ├─ Đăng lên hệ thống
   └─ Khóa học hiển thị công khai: ACTIVE
```

**Test với:**
- Center: `center1@tutorlink.com / center123`
- Teacher: `teacher1@tutorlink.com / teacher123`
- Staff: `staff@tutorlink.com / staff123`

---

### Flow 2: Đăng ký trung tâm

```
1. Tạo tài khoản trung tâm
   ├─ Đăng ký thông tin cơ bản
   ├─ Upload giấy phép kinh doanh
   ├─ Upload chứng chỉ giáo viên
   └─ Tài khoản ở trạng thái: PENDING

2. Staff xác thực trung tâm
   ├─ Đi thực địa chụp ảnh trung tâm
   ├─ Kiểm tra giấy phép
   ├─ Kiểm tra chứng chỉ
   ├─ Upload ảnh thực địa
   └─ Xác thực lên admin

3. Admin confirm tài khoản
   ├─ Xem báo cáo của staff
   ├─ Xem ảnh thực địa
   ├─ Approve/Reject
   └─ Tài khoản chuyển sang: ACTIVE/REJECTED
```

**Test với:**
- Center (pending): `center2@tutorlink.com / center123`
- Staff: `staff@tutorlink.com / staff123`
- Admin: `admin@tutorlink.com / admin123`

---

### Flow 3: Đăng ký khóa học (từ phụ huynh)

```
1. Parent đăng ký tài khoản
   ├─ Tạo tài khoản phụ huynh
   └─ Thêm thông tin con vào hệ thống

2. Parent đăng ký khóa học
   ├─ Chọn khóa học cho con
   ├─ Đặt cọc 10% học phí
   └─ Đăng ký ở trạng thái: PENDING

3. Staff verify học sinh
   ├─ Kiểm tra thông tin học sinh
   ├─ Kiểm tra đã đặt cọc
   ├─ Add học sinh vào lớp
   └─ Chuyển sang: VERIFIED

4. Center xác nhận
   ├─ Xem học sinh đã được verify
   ├─ Confirm học sinh
   └─ Học sinh chính thức vào lớp: ACTIVE

5. Unhappy Case: Lớp bị hủy
   ├─ Không đủ học sinh
   ├─ Giáo viên nghỉ
   ├─ Hệ thống thông báo
   └─ Hoàn tiền cho phụ huynh
```

**Lưu ý quan trọng:**
- ❌ **Học sinh KHÔNG thể tự đăng ký khóa học**
- ✅ **Chỉ phụ huynh mới đăng ký được**
- ✅ Học sinh chỉ xem lịch học

**Test với:**
- Parent: `parent1@tutorlink.com / parent123`
- Student: `student1@tutorlink.com / student123`
- Staff: `staff@tutorlink.com / staff123`
- Center: `center1@tutorlink.com / center123`

---

### Flow 4: Admin quản lý

```
Admin Dashboard:
├─ CRUD tất cả users
├─ CRUD trung tâm
├─ CRUD khóa học
├─ Xem báo cáo tổng hợp
├─ Quản lý subscription packages
└─ Cấu hình hệ thống
```

**Test với:**
- Admin: `admin@tutorlink.com / admin123`

---

### Flow 5: Thanh toán & Subscription

```
Subscription Packages (cho Center):

📦 BASIC - 6 tháng - 500,000đ
   ├─ 20 bài đăng khóa học
   └─ Support cơ bản

📦 STANDARD - 6 tháng - 800,000đ
   ├─ 50 bài đăng khóa học
   ├─ Analytics
   └─ Support nâng cao

📦 PREMIUM - 1 năm - 1,500,000đ
   ├─ 100 bài đăng khóa học
   ├─ Analytics
   ├─ Marketing tools
   └─ Priority support

📦 ENTERPRISE - 1 năm - 3,000,000đ
   ├─ Unlimited bài đăng
   ├─ Advanced analytics
   ├─ Marketing automation
   ├─ Dedicated support
   └─ Custom features
```

**Upgrade flow:**
```
1. Center xem gói hiện tại
2. Chọn gói muốn upgrade
3. Thanh toán
4. Hệ thống cập nhật gói
5. Số bài đăng được cập nhật
```

**Test với:**
- Center: `center1@tutorlink.com / center123` (Premium)
- Center: `center2@tutorlink.com / center123` (Standard)

---

## 🚀 Hướng Dẫn Test

### 1. Đăng nhập
```
URL: /auth hoặc /login
Nhập email và password từ bảng trên
```

### 2. Test theo từng role

#### 👨‍💼 Admin:
```
Email: admin@tutorlink.com
Password: admin123
Dashboard: /admin
```
**Test:**
- CRUD users
- Approve/reject centers
- Xem dashboard tổng quan
- Quản lý subscription

#### 🔍 Staff:
```
Email: staff@tutorlink.com
Password: staff123
Dashboard: /staff
```
**Test:**
- Verify centers (center2 đang pending)
- Verify courses
- Verify students
- Đi thực địa chụp ảnh

#### 🏢 Center:
```
Email: center1@tutorlink.com
Password: center123
Dashboard: /center
```
**Test:**
- Tạo khóa học
- Assign giáo viên
- Xem học sinh đăng ký
- Quản lý subscription

#### 👨‍🏫 Teacher:
```
Email: teacher1@tutorlink.com
Password: teacher123
Dashboard: /teacher
```
**Test:**
- Xem khóa học được assign
- Ký vào khóa học
- Điểm danh
- Chấm điểm

#### 👨‍👩‍👧 Parent:
```
Email: parent1@tutorlink.com
Password: parent123
Dashboard: /parent
```
**Test:**
- Thêm con
- Đăng ký khóa học cho con
- Đặt cọc 10%
- Xem lịch học của con

#### 👨‍🎓 Student:
```
Email: student1@tutorlink.com
Password: student123
Dashboard: /student
```
**Test:**
- Xem lịch học
- Xem điểm số
- Xem điểm danh
- ❌ Không thể đăng ký khóa học

---

## 📝 Lưu Ý Quan Trọng

### 🔐 Authentication
1. **Mock Data**: Tất cả tài khoản là mock data, không kết nối backend thật
2. **Token**: Token được tạo tự động khi đăng nhập và lưu trong localStorage
3. **Persistence**: Thông tin đăng nhập được lưu trong localStorage
4. **Logout**: Click nút logout để xóa token và thông tin user

### 🎯 Business Rules
1. **Học sinh KHÔNG thể tự đăng ký khóa học** - Chỉ phụ huynh mới đăng ký được
2. **Khóa học phải qua 3 bước**: Center tạo → Teacher ký → Staff confirm
3. **Trung tâm phải verify**: Staff đi thực địa → Admin approve
4. **Đặt cọc 10%** học phí khi đăng ký
5. **Hoàn tiền** nếu lớp bị hủy

### 📦 Subscription
1. Trung tâm phải mua gói để đăng khóa học
2. Số bài đăng giới hạn theo gói
3. Có thể upgrade gói bất kỳ lúc nào
4. Gói hết hạn → không thể đăng bài mới

### 🔄 Status Flow
```
Center: pending → verified → active
Course: pending → verified → active
Student Registration: pending → verified → active
Payment: pending → completed → refunded (nếu hủy)
```

---

## 🔧 Cấu Trúc File

```
src/
├── data/
│   └── mockUsers.js              # Mock data với 6 roles
├── contexts/
│   └── AuthContext.jsx           # Context quản lý authentication
├── pages/
│   ├── auth/
│   │   └── LoginPage.jsx         # Trang đăng nhập
│   ├── dashboard/
│   │   ├── AdminDashboard.jsx    # Dashboard admin
│   │   ├── StaffDashboard.jsx    # Dashboard staff
│   │   ├── CenterDashboard.jsx   # Dashboard center (TODO)
│   │   ├── TeacherDashboard.jsx  # Dashboard teacher (TODO)
│   │   ├── ParentDashboard.jsx   # Dashboard parent (TODO)
│   │   └── StudentDashboard.jsx  # Dashboard student (TODO)
│   └── management/
│       ├── UserManagement.jsx
│       ├── CenterManagement.jsx
│       ├── ClassManagement.jsx
│       └── ...
└── router/
    └── router.jsx                # Routes cho tất cả roles
```

---

## 🛠️ API Mock Functions

File `src/data/mockUsers.js` cung cấp các functions:

```javascript
// Authenticate user
authenticateUser(email, password) 
// Returns: user object (without password) or null

// Get user by ID
getUserById(userId) 
// Returns: user object (without password) or null

// Get users by role
getUsersByRole(role) 
// Returns: array of users (without passwords)
// Roles: 'admin', 'staff', 'center', 'teacher', 'parent', 'student'

// Generate mock token
generateMockToken(user) 
// Returns: mock JWT token string
// Format: 'mock-jwt-token-{userId}-{timestamp}'
```

### Ví dụ sử dụng:

```javascript
import { authenticateUser, getUsersByRole } from './data/mockUsers'

// Login
const user = authenticateUser('admin@tutorlink.com', 'admin123')
if (user) {
  console.log('Logged in as:', user.role)
}

// Get all centers
const centers = getUsersByRole('center')
console.log('Total centers:', centers.length)
```

---

## 📊 Thống Kê Mock Data

| Role | Số lượng | Dashboard | Status |
|------|----------|-----------|--------|
| Admin | 2 | `/admin` | ✅ Ready |
| Staff | 2 | `/staff` | ✅ Ready |
| Center | 2 | `/center` | 🚧 TODO |
| Teacher | 2 | `/teacher` | 🚧 TODO |
| Parent | 2 | `/parent` | 🚧 TODO |
| Student | 3 | `/student` | 🚧 TODO |
| **Total** | **13** | - | - |

---

## 🎨 UI/UX Notes

### Color Coding by Role:
- 🔴 **Admin**: Red (#EF4444)
- 🔵 **Staff**: Blue (#3B82F6)
- 🟠 **Center**: Orange (#F97316)
- 🟢 **Teacher**: Green (#10B981)
- 🟣 **Parent**: Purple (#A855F7)
- 🔷 **Student**: Teal (#14B8A6)

---

## 📞 Support

Nếu cần thêm tài khoản mock hoặc có vấn đề, vui lòng liên hệ team phát triển.

---

## 📚 Tài Liệu Tham Khảo

- **Thông tư 29**: Quy định về hoạt động trung tâm ngoại ngữ, tin học
- **Business Flows**: Theo yêu cầu thực tế của hệ thống
- **Payment Integration**: VNPay, MoMo (TODO)

---

**Last Updated**: 2024
**Version**: 2.0.0 - Complete Business Flows
**Author**: TutorLink Development Team

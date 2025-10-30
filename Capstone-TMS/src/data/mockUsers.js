/**
 * Mock Users Data for Testing - TutorLink TMS
 * Tài khoản mock theo Thông tư 29 và business flows
 * 
 * ROLES:
 * - admin: Quản trị viên hệ thống (toàn quyền)
 * - staff: Chuyên viên xác thực (verify centers, courses, students)
 * - center: Tài khoản trung tâm (tạo courses, quản lý giáo viên)
 * - teacher: Giáo viên (assigned vào courses, dạy học)
 * - parent: Phụ huynh (đăng ký khóa học cho con, thanh toán)
 * - student: Học sinh (xem lịch học, không đăng ký được)
 */

export const MOCK_USERS = [
  // ==================== ADMIN ACCOUNTS ====================
  {
    id: 1,
    email: 'admin@tutorlink.com',
    password: 'admin123',
    role: 'admin',
    name: 'Nguyễn Văn Admin',
    phone: '0901234567',
    avatar: 'https://i.pravatar.cc/150?img=1',
    permissions: ['all'],
    createdAt: '2024-01-01',
    status: 'active',
    description: 'Quản trị viên hệ thống - Toàn quyền'
  },
  {
    id: 2,
    email: 'admin2@tutorlink.com',
    password: 'admin123',
    role: 'admin',
    name: 'Trần Thị Quản Trị',
    phone: '0901234568',
    avatar: 'https://i.pravatar.cc/150?img=5',
    permissions: ['all'],
    createdAt: '2024-01-15',
    status: 'active',
    description: 'Quản trị viên hệ thống - Toàn quyền'
  },

  // ==================== STAFF ACCOUNTS (Chuyên viên xác thực) ====================
  {
    id: 3,
    email: 'staff@tutorlink.com',
    password: 'staff123',
    role: 'staff',
    name: 'Lê Văn Chuyên Viên',
    phone: '0902345678',
    avatar: 'https://i.pravatar.cc/150?img=12',
    permissions: [
      'verify_centers',        // Xác thực trung tâm
      'verify_courses',        // Xác thực khóa học
      'verify_students',       // Xác thực học sinh
      'view_all_centers',      // Xem tất cả trung tâm
      'view_all_courses',      // Xem tất cả khóa học
      'manage_verifications',  // Quản lý các yêu cầu xác thực
      'visit_centers',         // Đi thực địa chụp ảnh trung tâm
      'check_certificates'     // Kiểm tra chứng chỉ
    ],
    department: 'Phòng Xác Thực',
    employeeId: 'STAFF001',
    createdAt: '2024-02-01',
    status: 'active',
    description: 'Chuyên viên xác thực trung tâm và khóa học'
  },
  {
    id: 4,
    email: 'staff2@tutorlink.com',
    password: 'staff123',
    role: 'staff',
    name: 'Phạm Thị Kiểm Duyệt',
    phone: '0903456789',
    avatar: 'https://i.pravatar.cc/150?img=20',
    permissions: [
      'verify_centers',
      'verify_courses',
      'verify_students',
      'view_all_centers',
      'view_all_courses',
      'manage_verifications',
      'visit_centers',
      'check_certificates'
    ],
    department: 'Phòng Xác Thực',
    employeeId: 'STAFF002',
    createdAt: '2024-02-10',
    status: 'active',
    description: 'Chuyên viên xác thực trung tâm và khóa học'
  },

  // ==================== CENTER ACCOUNTS (Tài khoản trung tâm) ====================
  {
    id: 5,
    email: 'center1@tutorlink.com',
    password: 'center123',
    role: 'center',
    name: 'Trung Tâm Anh Ngữ Quốc Tế',
    phone: '0904567890',
    avatar: 'https://i.pravatar.cc/150?img=33',
    permissions: [
      'create_courses',        // Tạo khóa học
      'manage_own_courses',    // Quản lý khóa học của mình
      'assign_teachers',       // Assign giáo viên vào khóa học
      'view_own_students',     // Xem học sinh của mình
      'confirm_students',      // Xác nhận học sinh đã verify
      'manage_schedule',       // Quản lý lịch học
      'view_revenue',          // Xem doanh thu
      'manage_subscription'    // Quản lý gói đăng ký
    ],
    centerInfo: {
      centerName: 'Trung Tâm Anh Ngữ Quốc Tế',
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      establishedYear: 2015,
      licenseNumber: 'GPKD-001-2015',
      taxCode: '0123456789',
      representative: 'Nguyễn Văn A',
      representativePosition: 'Giám đốc',
      certificates: [
        { type: 'Giấy phép kinh doanh', number: 'GPKD-001-2015', issueDate: '2015-01-15' },
        { type: 'Chứng nhận đạt chuẩn', number: 'CN-001-2020', issueDate: '2020-06-20' }
      ],
      verificationStatus: 'verified', // pending, verified, rejected
      verifiedBy: 3, // staff id
      verifiedAt: '2024-02-15',
      verificationPhotos: [
        'https://picsum.photos/400/300?random=1',
        'https://picsum.photos/400/300?random=2'
      ]
    },
    subscription: {
      package: 'premium',      // basic, standard, premium, enterprise
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      postsLimit: 100,         // Số bài đăng khóa học
      postsUsed: 25,
      features: ['priority_support', 'analytics', 'marketing_tools']
    },
    createdAt: '2024-01-20',
    status: 'active',
    description: 'Trung tâm Anh ngữ uy tín với 10 năm kinh nghiệm'
  },
  {
    id: 6,
    email: 'center2@tutorlink.com',
    password: 'center123',
    role: 'center',
    name: 'Trung Tâm Toán Học Thông Minh',
    phone: '0905678901',
    avatar: 'https://i.pravatar.cc/150?img=40',
    permissions: [
      'create_courses',
      'manage_own_courses',
      'assign_teachers',
      'view_own_students',
      'confirm_students',
      'manage_schedule',
      'view_revenue',
      'manage_subscription'
    ],
    centerInfo: {
      centerName: 'Trung Tâm Toán Học Thông Minh',
      address: '456 Lê Lợi, Quận 3, TP.HCM',
      establishedYear: 2018,
      licenseNumber: 'GPKD-002-2018',
      taxCode: '0987654321',
      representative: 'Trần Thị B',
      representativePosition: 'Giám đốc',
      certificates: [
        { type: 'Giấy phép kinh doanh', number: 'GPKD-002-2018', issueDate: '2018-03-10' }
      ],
      verificationStatus: 'pending', // Đang chờ xác thực
      verifiedBy: null,
      verifiedAt: null,
      verificationPhotos: []
    },
    subscription: {
      package: 'standard',
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      postsLimit: 50,
      postsUsed: 15,
      features: ['basic_support', 'analytics']
    },
    createdAt: '2024-01-25',
    status: 'pending', // Chờ admin confirm
    description: 'Trung tâm chuyên về Toán học tư duy'
  },

  // ==================== TEACHER ACCOUNTS (Giáo viên) ====================
  {
    id: 7,
    email: 'teacher1@tutorlink.com',
    password: 'teacher123',
    role: 'teacher',
    name: 'Nguyễn Thị Giáo Viên',
    phone: '0906789012',
    avatar: 'https://i.pravatar.cc/150?img=25',
    permissions: [
      'view_assigned_courses',  // Xem khóa học được assign
      'manage_class_schedule',  // Quản lý lịch dạy
      'take_attendance',        // Điểm danh
      'grade_students',         // Chấm điểm
      'view_class_students',    // Xem học sinh trong lớp
      'communicate_parents'     // Liên lạc phụ huynh
    ],
    teacherInfo: {
      centerId: 5,              // Thuộc trung tâm nào
      centerName: 'Trung Tâm Anh Ngữ Quốc Tế',
      subjects: ['Tiếng Anh', 'IELTS'],
      experience: 8,            // Số năm kinh nghiệm
      education: 'Thạc sĩ Ngôn ngữ Anh',
      certificates: [
        { name: 'TESOL', issuer: 'Cambridge', year: 2016 },
        { name: 'IELTS 8.5', issuer: 'British Council', year: 2015 }
      ],
      rating: 4.8,
      totalStudents: 150,
      assignedCourses: [
        { courseId: 'C001', courseName: 'IELTS Foundation', status: 'active' },
        { courseId: 'C002', courseName: 'IELTS Advanced', status: 'pending' }
      ]
    },
    createdAt: '2024-02-01',
    status: 'active',
    description: 'Giáo viên Tiếng Anh với 8 năm kinh nghiệm'
  },
  {
    id: 8,
    email: 'teacher2@tutorlink.com',
    password: 'teacher123',
    role: 'teacher',
    name: 'Lê Văn Thầy Giáo',
    phone: '0907890123',
    avatar: 'https://i.pravatar.cc/150?img=30',
    permissions: [
      'view_assigned_courses',
      'manage_class_schedule',
      'take_attendance',
      'grade_students',
      'view_class_students',
      'communicate_parents'
    ],
    teacherInfo: {
      centerId: 6,
      centerName: 'Trung Tâm Toán Học Thông Minh',
      subjects: ['Toán', 'Vật Lý'],
      experience: 10,
      education: 'Thạc sĩ Toán học',
      certificates: [
        { name: 'Giáo viên giỏi cấp thành phố', issuer: 'Sở GD&ĐT', year: 2020 }
      ],
      rating: 4.9,
      totalStudents: 200,
      assignedCourses: [
        { courseId: 'C003', courseName: 'Toán 12 Luyện Thi', status: 'active' }
      ]
    },
    createdAt: '2024-02-05',
    status: 'active',
    description: 'Giáo viên Toán với 10 năm kinh nghiệm'
  },

  // ==================== PARENT ACCOUNTS (Phụ huynh) ====================
  {
    id: 9,
    email: 'parent1@tutorlink.com',
    password: 'parent123',
    role: 'parent',
    name: 'Nguyễn Văn Phụ Huynh',
    phone: '0908901234',
    avatar: 'https://i.pravatar.cc/150?img=50',
    permissions: [
      'register_courses',       // Đăng ký khóa học cho con
      'view_children_schedule', // Xem lịch học của con
      'view_children_grades',   // Xem điểm của con
      'make_payment',           // Thanh toán học phí
      'view_payment_history',   // Xem lịch sử thanh toán
      'communicate_teachers',   // Liên lạc giáo viên
      'manage_children'         // Quản lý thông tin con
    ],
    parentInfo: {
      children: [
        {
          id: 11,
          name: 'Nguyễn Văn Con',
          dateOfBirth: '2010-05-15',
          grade: 'Lớp 10',
          school: 'THPT Nguyễn Thị Minh Khai',
          studentId: 'HS001'
        },
        {
          id: 12,
          name: 'Nguyễn Thị Con Gái',
          dateOfBirth: '2012-08-20',
          grade: 'Lớp 8',
          school: 'THCS Lê Quý Đôn',
          studentId: 'HS002'
        }
      ],
      enrolledCourses: [
        {
          courseId: 'C001',
          courseName: 'IELTS Foundation',
          studentId: 11,
          studentName: 'Nguyễn Văn Con',
          status: 'active',          // pending, active, completed, cancelled
          registeredAt: '2024-03-01',
          depositPaid: true,
          depositAmount: 500000,     // 10% học phí
          totalFee: 5000000,
          verifiedByStaff: true,
          verifiedAt: '2024-03-02',
          confirmedByCenter: true,
          confirmedAt: '2024-03-03'
        }
      ],
      paymentHistory: [
        {
          id: 'PAY001',
          courseId: 'C001',
          amount: 500000,
          type: 'deposit',           // deposit, full_payment, refund
          method: 'bank_transfer',
          status: 'completed',
          paidAt: '2024-03-01'
        }
      ]
    },
    createdAt: '2024-02-20',
    status: 'active',
    description: 'Phụ huynh có 2 con đang học'
  },
  {
    id: 10,
    email: 'parent2@tutorlink.com',
    password: 'parent123',
    role: 'parent',
    name: 'Trần Thị Mẹ',
    phone: '0909012345',
    avatar: 'https://i.pravatar.cc/150?img=45',
    permissions: [
      'register_courses',
      'view_children_schedule',
      'view_children_grades',
      'make_payment',
      'view_payment_history',
      'communicate_teachers',
      'manage_children'
    ],
    parentInfo: {
      children: [
        {
          id: 13,
          name: 'Trần Văn Bé',
          dateOfBirth: '2011-03-10',
          grade: 'Lớp 9',
          school: 'THCS Trần Hưng Đạo',
          studentId: 'HS003'
        }
      ],
      enrolledCourses: [],
      paymentHistory: []
    },
    createdAt: '2024-02-25',
    status: 'active',
    description: 'Phụ huynh mới đăng ký'
  },

  // ==================== STUDENT ACCOUNTS (Học sinh) ====================
  {
    id: 11,
    email: 'student1@tutorlink.com',
    password: 'student123',
    role: 'student',
    name: 'Nguyễn Văn Con',
    phone: '0910123456',
    avatar: 'https://i.pravatar.cc/150?img=8',
    permissions: [
      'view_own_schedule',      // Xem lịch học của mình
      'view_own_grades',        // Xem điểm của mình
      'view_own_attendance',    // Xem điểm danh
      'view_course_materials',  // Xem tài liệu học tập
      'submit_homework'         // Nộp bài tập
    ],
    studentInfo: {
      parentId: 9,
      parentName: 'Nguyễn Văn Phụ Huynh',
      parentPhone: '0908901234',
      dateOfBirth: '2010-05-15',
      grade: 'Lớp 10',
      school: 'THPT Nguyễn Thị Minh Khai',
      studentId: 'HS001',
      enrolledCourses: [
        {
          courseId: 'C001',
          courseName: 'IELTS Foundation',
          centerId: 5,
          centerName: 'Trung Tâm Anh Ngữ Quốc Tế',
          teacherId: 7,
          teacherName: 'Nguyễn Thị Giáo Viên',
          status: 'active',
          startDate: '2024-03-05',
          endDate: '2024-06-05',
          schedule: [
            { day: 'Thứ 2, 4, 6', time: '18:00 - 20:00' }
          ]
        }
      ],
      attendance: {
        totalClasses: 20,
        attended: 18,
        absent: 2,
        attendanceRate: 90
      },
      grades: [
        { subject: 'IELTS Foundation', midterm: 7.5, final: 8.0, average: 7.75 }
      ]
    },
    createdAt: '2024-02-20',
    status: 'active',
    description: 'Học sinh lớp 10, đang học IELTS'
  },
  {
    id: 12,
    email: 'student2@tutorlink.com',
    password: 'student123',
    role: 'student',
    name: 'Nguyễn Thị Con Gái',
    phone: '0911234567',
    avatar: 'https://i.pravatar.cc/150?img=9',
    permissions: [
      'view_own_schedule',
      'view_own_grades',
      'view_own_attendance',
      'view_course_materials',
      'submit_homework'
    ],
    studentInfo: {
      parentId: 9,
      parentName: 'Nguyễn Văn Phụ Huynh',
      parentPhone: '0908901234',
      dateOfBirth: '2012-08-20',
      grade: 'Lớp 8',
      school: 'THCS Lê Quý Đôn',
      studentId: 'HS002',
      enrolledCourses: [],
      attendance: {
        totalClasses: 0,
        attended: 0,
        absent: 0,
        attendanceRate: 0
      },
      grades: []
    },
    createdAt: '2024-02-20',
    status: 'active',
    description: 'Học sinh lớp 8'
  },
  {
    id: 13,
    email: 'student3@tutorlink.com',
    password: 'student123',
    role: 'student',
    name: 'Trần Văn Bé',
    phone: '0912345678',
    avatar: 'https://i.pravatar.cc/150?img=15',
    permissions: [
      'view_own_schedule',
      'view_own_grades',
      'view_own_attendance',
      'view_course_materials',
      'submit_homework'
    ],
    studentInfo: {
      parentId: 10,
      parentName: 'Trần Thị Mẹ',
      parentPhone: '0909012345',
      dateOfBirth: '2011-03-10',
      grade: 'Lớp 9',
      school: 'THCS Trần Hưng Đạo',
      studentId: 'HS003',
      enrolledCourses: [],
      attendance: {
        totalClasses: 0,
        attended: 0,
        absent: 0,
        attendanceRate: 0
      },
      grades: []
    },
    createdAt: '2024-02-25',
    status: 'active',
    description: 'Học sinh lớp 9'
  }
]

/**
 * Authenticate user with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Object|null} User object if authenticated, null otherwise
 */
export const authenticateUser = (email, password) => {
  const user = MOCK_USERS.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  )
  
  if (user) {
    // Không trả về password trong response
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }
  
  return null
}

/**
 * Get user by ID
 * @param {number} userId 
 * @returns {Object|null}
 */
export const getUserById = (userId) => {
  const user = MOCK_USERS.find(u => u.id === userId)
  if (user) {
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }
  return null
}

/**
 * Get all users by role
 * @param {string} role 
 * @returns {Array}
 */
export const getUsersByRole = (role) => {
  return MOCK_USERS
    .filter(u => u.role === role)
    .map(({ password: _, ...user }) => user)
}

/**
 * Mock token generation
 * @param {Object} user 
 * @returns {string}
 */
export const generateMockToken = (user) => {
  return `mock-jwt-token-${user.id}-${Date.now()}`
}

export default MOCK_USERS

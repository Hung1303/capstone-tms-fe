import { createBrowserRouter } from "react-router-dom";

// Auth pages
import AuthPage from "../pages/auth/AuthPage";

// Shared pages (Public)
import HomePage from "../pages/shared/HomePage";
import Centers from "../pages/shared/Centers";
import FindTutor from "../pages/shared/FindTutor";
import NewClasses from "../pages/shared/NewClasses";
import Contact from "../pages/shared/Contact";
import Recruitment from "../pages/shared/Recruitment";
import About from "../pages/shared/About";
import Blog from "../pages/shared/Blog";
import FAQ from "../pages/shared/FAQ";
import RegisterCenter from "../pages/shared/RegisterCenter";

// Dashboard pages
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import StaffDashboard from "../pages/dashboard/StaffDashboard";
import CenterDashboard from "../pages/dashboard/CenterDashboard";
import TeacherDashboard from "../pages/dashboard/TeacherDashboard";
import ParentDashboard from "../pages/dashboard/ParentDashboard";
import StudentDashboard from "../pages/dashboard/StudentDashboard";

// Management pages
import UserManagement from "../pages/management/UserManagement";
import CenterManagement from "../pages/management/CenterManagement";
import ClassManagement from "../pages/management/ClassManagement";
import StudentManagement from "../pages/management/StudentManagement";
import ScheduleManagement from "../pages/management/ScheduleManagement";
import SubjectManagement from "../pages/management/SubjectManagement";
import CourseManagement from "../pages/management/CourseManagement";
import TeacherCourseApproval from "../pages/management/TeacherCourseApproval";
import StaffCourseConfirmation from "../pages/management/StaffCourseConfirmation";
import SubscriptionManagement from "../pages/management/SubscriptionManagement";
import CenterSubscription from "../pages/management/CenterSubscription";
import CenterScheduleAssignment from "../pages/management/CenterScheduleAssignment";
import TeacherManagement from "../pages/management/TeacherManagement";

// Error pages
import NotFound from "../pages/error/NotFound";

// Layouts
import HomeLayout from "../layouts/HomeLayout";
import AdminLayout from "../layouts/AdminLayout";

// Components
import ProtectedRoute from "../components/ProtectedRoute";
import ChildrenManagement from "../pages/management/ChildrenManagement";
import CenterInspectionManagement from "../pages/management/CenterInspectionManagement";
import CourseApprovalManagement from "../pages/management/CourseApprovalManagement";
import ParentCenters from "../pages/dashboard/ParentCenters";
import ParentCourses from "../pages/dashboard/ParentCourses";
import ParentCentersMap from "../pages/dashboard/ParentCentersMap";
import TeacherManagement from "../pages/management/TeacherManagement";
import { AuthProvider } from "../contexts/AuthContext";

export const router = createBrowserRouter([
    // Auth routes (không dùng layout)
    {
        path: "/login",
        element: <AuthProvider><AuthPage /></AuthProvider>,
    },
    {
        path: "/register",
        element: <AuthProvider><AuthPage /></AuthProvider>,
    },
    
    // Public routes (dùng HomeLayout)
    {
        path: "/",
        element: <AuthProvider><HomeLayout /></AuthProvider>,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: "centers",
                element: <Centers />,
            },
            {
                path: "find-tutor",
                element: <FindTutor />,
            },
            {
                path: "new-classes",
                element: <NewClasses />,
            },
            {
                path: "contact",
                element: <Contact />,
            },
            {
                path: "recruitment",
                element: <Recruitment />,
            },
            {
                path: "register-center",
                element: <RegisterCenter />,
            },
            {
                path: "about",
                element: <About />,
            },
            {
                path: "blog",
                element: <Blog />,
            },
            {
                path: "faq",
                element: <FAQ />,
            },
        ],
    },
    
    // Admin routes (dùng AdminLayout)
    {
        path: "/admin",
        element: <AuthProvider><AdminLayout /></AuthProvider>,
        children: [
            {
                index: true,
                element: <ProtectedRoute requiredRole="Admin"><AdminDashboard /></ProtectedRoute>
            },
            {
                path: "users",
                element: <ProtectedRoute requiredRole="Admin"><UserManagement /></ProtectedRoute>
            },
            {
                path: "centers",
                element: <ProtectedRoute requiredRole="Admin"><CenterManagement /></ProtectedRoute>
            },
            {
                path: "students",
                element: <ProtectedRoute requiredRole="Admin"><StudentManagement /></ProtectedRoute>
            },
            {
                path: "classes",
                element: <ProtectedRoute requiredRole="Admin"><ClassManagement /></ProtectedRoute>
            },
            {
                path: "subjects",
                element: <ProtectedRoute requiredRole="Admin"><SubjectManagement /></ProtectedRoute>
            },
            {
                path: "subscriptions",
                element: <ProtectedRoute requiredRole="Admin"><SubscriptionManagement /></ProtectedRoute>
            },
            {
                path: "course-approval",
                element: <ProtectedRoute requiredRole="Admin"><CourseApprovalManagement /></ProtectedRoute>
            }
        ]
    },

    // Staff routes
    {
        path: "/staff",
        element: <AuthProvider><AdminLayout /></AuthProvider>,
        children: [
            {
                index: true,
                element: <ProtectedRoute requiredRole="Staff"><StaffDashboard /></ProtectedRoute>
            },
            {
                path: "students",
                element: <ProtectedRoute requiredRole="Staff"><StudentManagement /></ProtectedRoute>
            },
            {
                path: "schedule",
                element: <ProtectedRoute requiredRole="Staff"><ScheduleManagement /></ProtectedRoute>
            },
            {
                path: "course-confirmation",
                element: <ProtectedRoute requiredRole="Staff"><StaffCourseConfirmation /></ProtectedRoute>
            }
        ]
    },

    // Inspector routes
    {
        path: "/inspector",
        element: <AuthProvider><AdminLayout /></AuthProvider>,
        children: [
            {
                index: true,
                element: <ProtectedRoute requiredRole="Inspector"><StaffDashboard /></ProtectedRoute>
            },
            {
                path: "center",
                element: <ProtectedRoute requiredRole="Inspector"><CenterInspectionManagement /></ProtectedRoute>
            },
            {
                path: "course-approval",
                element: <ProtectedRoute requiredRole="Inspector"><CourseApprovalManagement /></ProtectedRoute>
            }
        ]
    },
    
    // Center routes
    {
        path: "/center",
        element: <AuthProvider><AdminLayout /></AuthProvider>,
        children: [
            {
                index: true,
                element: <ProtectedRoute requiredRole="Center"><CenterDashboard /></ProtectedRoute>
            },
            {
                path: "courses",
                element: <ProtectedRoute requiredRole="Center"><CourseManagement /></ProtectedRoute>
            },
            {
                path: "subscription",
                element: <ProtectedRoute requiredRole="Center"><CenterSubscription /></ProtectedRoute>
            },
            {
                path: "schedule",
                element: <ProtectedRoute requiredRole="Center"><CenterScheduleAssignment /></ProtectedRoute>
            },
            {
                path: "teachers",
                element: <ProtectedRoute requiredRole="Center"><TeacherManagement /></ProtectedRoute>
            }
        ]
    },
    
    // Teacher routes
    {
        path: "/teacher",
        element: <AuthProvider><AdminLayout /></AuthProvider>,
        children: [
            {
                index: true,
                element: <ProtectedRoute requiredRole="Teacher"><TeacherDashboard /></ProtectedRoute>
            }
        ]
    },
    
    // Parent routes
    {
        path: "/parent",
        element: <AuthProvider><AdminLayout /></AuthProvider>,
        children: [
            {
                index: true,
                element: <ProtectedRoute requiredRole="Parent"><ParentDashboard /></ProtectedRoute>
            },
            {
                path: "children",
                element: <ProtectedRoute requiredRole="Parent"><ChildrenManagement /></ProtectedRoute>
            },
            {
                path: "centers",
                element: <ProtectedRoute requiredRole="Parent"><ParentCenters /></ProtectedRoute>
            },
            {
                path: "courses",
                element: <ProtectedRoute requiredRole="Parent"><ParentCourses /></ProtectedRoute>
            }
        ]
    },
    
    // Student routes
    {
        path: "/student",
        element: <AuthProvider><AdminLayout /></AuthProvider>,
        children: [
            {
                index: true,
                element: <ProtectedRoute requiredRole="Student"><StudentDashboard /></ProtectedRoute>
            }
        ]
    },
    
    {
        path: "/unauthorized",
        element: (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Không có quyền truy cập</h1>
                    <p className="text-gray-600 mb-6">Bạn không có quyền truy cập trang này.</p>
                    <a href="/" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                        Về trang chủ
                    </a>
                </div>
            </div>
        ),
    },
    
    // 404 Not Found - Catch all routes (phải để cuối cùng)
    {
        path: "*",
        element: <AuthProvider><NotFound /></AuthProvider>,
    },
]);
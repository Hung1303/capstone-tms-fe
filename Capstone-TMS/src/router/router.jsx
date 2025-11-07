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

// Error pages
import NotFound from "../pages/error/NotFound";

// Layouts
import HomeLayout from "../layouts/HomeLayout";
import AdminLayout from "../layouts/AdminLayout";

// Components
import ProtectedRoute from "../components/ProtectedRoute";

export const router = createBrowserRouter([
    // Auth routes (không dùng layout)
    {
        path: "/login",
        element: <AuthPage />,
    },
    {
        path: "/register",
        element: <AuthPage />,
    },
    
    // Public routes (dùng HomeLayout)
    {
        path: "/",
        element: <HomeLayout />,
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
        element: <AdminLayout />,
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
            }
        ]
    },

    // Staff routes
    {
        path: "/staff",
        element: <AdminLayout />,
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
            }
        ]
    },
    
    // Center routes
    {
        path: "/center",
        element: <AdminLayout />,
        children: [
            {
                index: true,
                element: <ProtectedRoute requiredRole="Center"><CenterDashboard /></ProtectedRoute>
            }
        ]
    },
    
    // Teacher routes
    {
        path: "/teacher",
        element: <AdminLayout />,
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
        element: <AdminLayout />,
        children: [
            {
                index: true,
                element: <ProtectedRoute requiredRole="Parent"><ParentDashboard /></ProtectedRoute>
            }
        ]
    },
    
    // Student routes
    {
        path: "/student",
        element: <AdminLayout />,
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
        element: <NotFound />,
    },
]);

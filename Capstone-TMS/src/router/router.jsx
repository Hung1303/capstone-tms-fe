import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import AuthPage from "../pages/AuthPage";
import Centers from "../pages/Centers";
import FindTutor from "../pages/FindTutor";
import NewClasses from "../pages/NewClasses";
import Contact from "../pages/Contact";
import Recruitment from "../pages/Recruitment";
import About from "../pages/About";
import Blog from "../pages/Blog";
import FAQ from "../pages/FAQ";
import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";
import CenterManagement from "../pages/admin/CenterManagement";
import ClassManagement from "../pages/admin/ClassManagement";
import StaffDashboard from "../pages/staff/StaffDashboard";
import StudentManagement from "../pages/staff/StudentManagement";
import ScheduleManagement from "../pages/staff/ScheduleManagement";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />,
    },
    {
        path: "/login",
        element: <AuthPage />,
    },
    {
        path: "/register",
        element: <AuthPage />,
    },
    {
        path: "/admin",
        element: (
            <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                    <AdminDashboard />
                </AdminLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/admin/users",
        element: (
            <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                    <UserManagement />
                </AdminLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/admin/centers",
        element: (
            <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                    <CenterManagement />
                </AdminLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/admin/students",
        element: (
            <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                    <StudentManagement />
                </AdminLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/admin/classes",
        element: (
            <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                    <ClassManagement />
                </AdminLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/staff",
        element: (
            <ProtectedRoute requiredRole="staff">
                <AdminLayout>
                    <StaffDashboard />
                </AdminLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/staff/students",
        element: (
            <ProtectedRoute requiredRole="staff">
                <AdminLayout>
                    <StudentManagement />
                </AdminLayout>
            </ProtectedRoute>
        ),
    },
    {
        path: "/staff/schedule",
        element: (
            <ProtectedRoute requiredRole="staff">
                <AdminLayout>
                    <ScheduleManagement />
                </AdminLayout>
            </ProtectedRoute>
        ),
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
    {
        path: "/centers",
        element: <Centers />,
    },
    {
        path: "/find-tutor",
        element: <FindTutor />,
    },
    {
        path: "/new-classes",
        element: <NewClasses />,
    },
    {
        path: "/contact",
        element: <Contact />,
    },
    {
        path: "/recruitment",
        element: <Recruitment />,
    },
    {
        path: "/about",
        element: <About />,
    },
    {
        path: "/blog",
        element: <Blog />,
    },
    {
        path: "/faq",
        element: <FAQ />,
    },
]);
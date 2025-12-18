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
import TeacherCourses from "../pages/dashboard/TeacherCourses";
import TeacherSchedule from "../pages/dashboard/TeacherSchedule";
import TeacherGrading from "../pages/dashboard/TeacherGrading";
import ParentDashboard from "../pages/dashboard/ParentDashboard";
import StudentDashboard from "../pages/dashboard/StudentDashboard";
import StudentSchedule from "../pages/dashboard/StudentSchedule";
import StudentCourses from "../pages/dashboard/StudentCourses";
import StudentGrades from "../pages/dashboard/StudentGrades";
import ParentGrades from "../pages/dashboard/ParentGrades";

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
import AdminCourseManagement from "../pages/management/AdminCourseManagement";
import ParentCenters from "../pages/dashboard/ParentCenters";
import ParentCourses from "../pages/dashboard/ParentCourses";
import ParentSchedule from "../pages/dashboard/ParentSchedule";
import ParentCentersMap from "../components/map";
import { AuthProvider } from "../contexts/AuthContext";
import EnrollmentManagement from "../pages/management/EnrollmentManagement";
import PaymentSuccess from "../pages/shared/PaymentSuccess";
import PaymentFailure from "../pages/shared/PaymentFailure";

export const router = createBrowserRouter([

    // ========================
    // AUTH ROUTES (no layout)
    // ========================
    {
        path: "/login",
        element: <AuthPage />,
    },
    {
        path: "/register",
        element: <AuthPage />,
    },

    // ========================
    // PUBLIC ROUTES
    // ========================
    {
        path: "/",
        element: <HomeLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "centers", element: <Centers /> },
            { path: "find-tutor", element: <FindTutor /> },
            { path: "new-classes", element: <NewClasses /> },
            { path: "contact", element: <Contact /> },
            { path: "recruitment", element: <Recruitment /> },
            { path: "register-center", element: <RegisterCenter /> },
            { path: "about", element: <About /> },
            { path: "blog", element: <Blog /> },
            { path: "faq", element: <FAQ /> },
        ],
    },

    // ========================
    // ADMIN ROUTES
    // ========================
    {
        path: "/admin",
        element: (
            <ProtectedRoute requiredRole="Admin">
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <AdminDashboard /> },
            { path: "users", element: <UserManagement /> },
            { path: "centers", element: <CenterManagement /> },
            { path: "courses", element: <AdminCourseManagement /> },
            { path: "classes", element: <ClassManagement /> },
            { path: "subjects", element: <SubjectManagement /> },
            { path: "subscriptions", element: <SubscriptionManagement /> },
        ],
    },

    // ========================
    // STAFF ROUTES
    // ========================
    {
        path: "/staff",
        element: (
            <ProtectedRoute requiredRole="Staff">
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <StaffDashboard /> },
            { path: "students", element: <StudentManagement /> },
            { path: "schedule", element: <ScheduleManagement /> },
            { path: "course-confirmation", element: <StaffCourseConfirmation /> },
        ],
    },

    // ========================
    // INSPECTOR ROUTES
    // ========================
    {
        path: "/inspector",
        element: (
            <ProtectedRoute requiredRole="Inspector">
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <StaffDashboard /> },
            { path: "center", element: <CenterInspectionManagement /> },
            { path: "course-approval", element: <CourseApprovalManagement /> },
        ],
    },

    // ========================
    // CENTER ROUTES
    // ========================
    {
        path: "/center",
        element: (
            <ProtectedRoute requiredRole="Center">
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <CenterDashboard /> },
            { path: "courses", element: <CourseManagement /> },
            { path: "subscription", element: <CenterSubscription /> },
            { path: "schedule", element: <CenterScheduleAssignment /> },
            { path: "teachers", element: <TeacherManagement /> },
            { path: "enrollments", element: <EnrollmentManagement /> },
        ],
    },

    // ========================
    // TEACHER ROUTES
    // ========================
    {
        path: "/teacher",
        element: (
            <ProtectedRoute requiredRole="Teacher">
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <TeacherDashboard /> },
            { path: "courses", element: <TeacherCourses /> },
            { path: "schedule", element: <TeacherSchedule /> },
            { path: "grading", element: <TeacherGrading /> },
        ],
    },

    // ========================
    // PARENT ROUTES
    // ========================
    {
        path: "/parent",
        element: (
            <ProtectedRoute requiredRole="Parent">
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <ParentDashboard /> },
            { path: "children", element: <ChildrenManagement /> },
            { path: "centers", element: <ParentCenters /> },
            { path: "courses", element: <ParentCourses /> },
            { path: "schedule", element: <ParentSchedule /> },
            { path: "grades", element: <ParentGrades /> },
        ],
    },

    // ========================
    // STUDENT ROUTES
    // ========================
    {
        path: "/student",
        element: (
            <ProtectedRoute requiredRole="Student">
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <StudentDashboard /> },
            { path: "courses", element: <StudentCourses /> },
            { path: "schedule", element: <StudentSchedule /> },
            { path: "grades", element: <StudentGrades /> },
        ],
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

    { path: "payment/success", element: <PaymentSuccess /> },
    { path: "payment/failure", element: <PaymentFailure /> },

    // ========================
    // 404
    // ========================
    {
        path: "*",
        element: <NotFound />,
    },
]);
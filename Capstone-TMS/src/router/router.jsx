import { createBrowserRouter } from "react-router-dom";

// Auth pages
import AuthPage from "../pages/auth/AuthPage";

// Shared pages (Public)
import HomePage from "../pages/shared/HomePage";
import Centers from "../pages/shared/Centers";
import Course from "../pages/shared/Course";
import FindTutor from "../pages/shared/FindTutor";
import NewClasses from "../pages/shared/NewClasses";
import Contact from "../pages/shared/Contact";
import Recruitment from "../pages/shared/Recruitment";
import About from "../pages/shared/About";
import Blog from "../pages/shared/Blog";
import CenterBlog from "../pages/shared/CenterBlog";
import BlogDetail from "../pages/shared/BlogDetail";
import CourseDetail from "../pages/shared/CourseDetail";
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
import FeedbackList from "../pages/dashboard/FeedbackList";

// Management pages
import UserManagement from "../pages/management/UserManagement";
import ClassManagement from "../pages/management/ClassManagement";
import StudentManagement from "../pages/management/StudentManagement";
import ScheduleManagement from "../pages/management/ScheduleManagement";
import SubjectManagement from "../pages/management/SubjectManagement";
import CourseManagement from "../pages/management/CourseManagement";
import StaffCourseConfirmation from "../pages/management/StaffCourseConfirmation";
import SubscriptionManagement from "../pages/management/SubscriptionManagement";
import CenterSubscription from "../pages/management/CenterSubscription";
import CenterScheduleAssignment from "../pages/management/CenterScheduleAssignment";

// Error pages
import NotFound from "../pages/error/NotFound";

// Layouts
import HomeLayout from "../layouts/HomeLayout";
import AdminLayout from "../layouts/AdminLayout";

// Components
import ProtectedRoute from "../components/ProtectedRoute";
import ChildrenManagement from "../pages/management/ChildrenManagement";
import AdminCourseManagement from "../pages/management/AdminCourseManagement";
import ParentCenters from "../pages/dashboard/ParentCenters";
import ParentCourses from "../pages/dashboard/ParentCourses";
import ParentSchedule from "../pages/dashboard/ParentSchedule";
import EnrollmentManagement from "../pages/management/EnrollmentManagement";
import PaymentSuccess from "../pages/shared/PaymentSuccess";
import PaymentFailure from "../pages/shared/PaymentFailure";
import ApprovalCourseTab from "../pages/management/ApprovalCourseTab";
import CenterConsultation from "../pages/management/CenterConsultation";
import ParentConsultation from "../pages/management/ParentConsultation";
import BlogManagement from "../pages/management/BlogManagement";
import BlogApproval from "../pages/management/BlogApproval";
import AdminVerification from "../pages/management/AdminVerification";
import InspectorVerification from "../pages/management/InspectorVerification";
import TeacherManagementMain from "../pages/management/TeacherManagementMain";
import CenterManagementProfile from "../pages/management/CenterManagementProfile";

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
            { path: "courses", element: <Course /> },
            { path: "find-tutor", element: <FindTutor /> },
            { path: "new-classes", element: <NewClasses /> },
            { path: "contact", element: <Contact /> },
            { path: "recruitment", element: <Recruitment /> },
            { path: "register-center", element: <RegisterCenter /> },
            { path: "about", element: <About /> },
            { path: "blog", element: <Blog /> },
            { path: "blog/:blogId", element: <BlogDetail /> },
            { path: "blog/center/:centerProfileId", element: <CenterBlog /> },
            { path: "courses", element: <Course /> },
            { path: "courses/:courseId", element: <CourseDetail /> },
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
            { path: "verify", element: <AdminVerification /> },
            { path: "courses", element: <AdminCourseManagement /> },
            { path: "classes", element: <ClassManagement /> },
            { path: "subjects", element: <SubjectManagement /> },
            { path: "subscriptions", element: <SubscriptionManagement /> },
            { path: "blog-approval", element: <BlogApproval /> },
            { path: "feedbacks", element: <FeedbackList /> },
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
            { path: "verify", element: <InspectorVerification /> },
            { path: "course-approval", element: <ApprovalCourseTab /> },
            { path: "feedbacks", element: <FeedbackList /> },
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
            { path: "management", element: <CenterManagementProfile /> },
            { path: "courses", element: <CourseManagement /> },
            { path: "blog", element: <BlogManagement /> },
            { path: "subscription", element: <CenterSubscription /> },
            { path: "schedule", element: <CenterScheduleAssignment /> },
            { path: "teachers", element: <TeacherManagementMain /> },
            { path: "enrollments", element: <EnrollmentManagement /> },
            { path: "consultation", element: <CenterConsultation /> },
            { path: "feedbacks", element: <FeedbackList /> },
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
            { path: "feedbacks", element: <FeedbackList /> },
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
            { path: "consultation", element: <ParentConsultation /> },
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
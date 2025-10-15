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
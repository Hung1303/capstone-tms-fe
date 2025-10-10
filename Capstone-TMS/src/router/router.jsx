import { createBrowserRouter } from "react-router-dom";
import HomePage from "../page/HomePage";
import AuthPage from "../page/AuthPage";

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
    }
]);
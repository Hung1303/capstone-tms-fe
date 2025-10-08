import { createBrowserRouter } from "react-router-dom";
import HomePage from "../page/HomePage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />,
    }
]);
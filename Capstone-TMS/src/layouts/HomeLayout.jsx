import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const HomeLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header cố định ở trên */}
      <NavBar />
      
      {/* Phần nội dung chiếm hết phần còn lại */}
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Footer cố định ở dưới */}
      <Footer />
    </div>
  );
};

export default HomeLayout;

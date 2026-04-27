import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./Page/homePage";
import Login from "./Page/login";
import Booking from "./Page/booking";
import Menu from "./Page/menu";
import Admin from "./Page/Page_admin/admin";
import ForgotPassword from "./Page/forgot";
import Register from "./Page/register";
import Footer from "./components/footer";
import AdminManageTables from "./Page/Page_admin/adminManageTables";
import AdminAddMenu from "./Page/Page_admin/adminAddMenu";
import AdminEditMenu from "./Page/Page_admin/adminEditMenu";
import AdminMenuList from "./Page/Page_admin/adminMenuList";
//Component Bảo vệ: Kiểm tra xem đã (đăng nhập) chưa
const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem("isAdminLoggedIn");
  if (isAuth !== "true") {
    // Chưa đăng nhập thì đuổi về trang /login
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div
        className="App"
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        {/* Vùng chứa nội dung chính (sẽ co giãn để đẩy Footer xuống đáy) */}
        <div style={{ flex: 1 }}>
          <Routes>
            {/* 1. Trang chủ cho khách */}
            <Route path="/" element={<HomePage />} />
            {/* 2. Trang Đăng nhập */}
            <Route path="/login" element={<Login />} />
            {/* 3. Trang Đặt bàn */}
            <Route path="/booking" element={<Booking />} />
            {/* 4. Trang thêm menu (Đã được bọc ổ khóa bảo vệ) */}
            {/* 5. Trang Menu  */}
            <Route path="/menu" element={<Menu />} />{" "}
            <Route
              path="/adminAddMenu"
              element={
                <ProtectedRoute>
                  <AdminAddMenu />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminEditMenu/:id"
              element={
                <ProtectedRoute>
                  <AdminEditMenu />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminManageTables"
              element={
                <ProtectedRoute>
                  <AdminManageTables />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminMenuList"
              element={
                <ProtectedRoute>
                  <AdminMenuList />
                </ProtectedRoute>
              }
            />
            {/* 6. Trang Quên mật khẩu */}
            <Route path="/forgot" element={<ForgotPassword />} />
            {/* 7. Trang Đăng ký tài khoản */}
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

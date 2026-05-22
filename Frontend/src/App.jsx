import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import HomePage from "./Page/homePage";
import Login from "./Page/login";
import Booking from "./Page/booking";
import Menu from "./Page/menu";
import ForgotPassword from "./Page/forgot";
import Register from "./Page/register";
import Footer from "./components/footer";
import AdminManageTables from "./Page/Page_admin/adminManageTables";
import AdminAddMenu from "./Page/Page_admin/adminAddMenu";
import AdminEditMenu from "./Page/Page_admin/adminEditMenu";
import AdminMenuList from "./Page/Page_admin/adminMenuList";
import AdminTablesList from "./Page/Page_admin/adminTablesList";
import AdminEditTableStyle from "./Page/Page_admin/adminEditTableStyle";
import AdminAddTableStyle from "./Page/Page_admin/adminAddTableStyle";
import AdminBooking from "./Page/Page_admin/adminBooking";
//Component Bảo vệ: Kiểm tra xem đã (đăng nhập) chưa
import Chatbot from "./components/Chatbot";

const ADMIN_PATHS = ["/admin", "/adminAddMenu", "/adminEditMenu",
  "/adminManageTables", "/adminMenuList", "/adminTablesList",
  "/adminAddTableStyle", "/adminEditTableStyle"];
const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem("isAdminLoggedIn");
  if (isAuth !== "true") return <Navigate to="/login" replace />;
  return children;
};

// Chỉ hiện chatbot trên trang khách
function AppLayout() {
  const { pathname } = useLocation();
  const isAdmin = ADMIN_PATHS.some((p) => pathname.startsWith(p));

  return (
    <div className="App" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/"        element={<HomePage />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/menu"    element={<Menu />} />
          <Route path="/forgot"   element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />

          <Route path="/adminAddMenu"          element={<ProtectedRoute><AdminAddMenu /></ProtectedRoute>} />
          <Route path="/adminEditMenu/:id"     element={<ProtectedRoute><AdminEditMenu /></ProtectedRoute>} />
          <Route path="/adminManageTables"     element={<ProtectedRoute><AdminManageTables /></ProtectedRoute>} />
          <Route path="/adminMenuList"         element={<ProtectedRoute><AdminMenuList /></ProtectedRoute>} />
          <Route path="/adminTablesList"       element={<ProtectedRoute><AdminTablesList /></ProtectedRoute>} />
          <Route path="/adminAddTableStyle"    element={<ProtectedRoute><AdminAddTableStyle /></ProtectedRoute>} />
          <Route path="/adminEditTableStyle/:id" element={<ProtectedRoute><AdminEditTableStyle /></ProtectedRoute>} />
        </Routes>
      </div>
      <Footer />
      {!isAdmin && <Chatbot />}
    </div>
  );
}

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
            <Route
              path="/adminTablesList"
              element={
                <ProtectedRoute>
                  <AdminTablesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminBooking"
              element={
                <ProtectedRoute>
                  <AdminBooking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminAddTableStyle"
              element={
                <ProtectedRoute>
                  <AdminAddTableStyle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminEditTableStyle/:id"
              element={
                <ProtectedRoute>
                  <AdminEditTableStyle />
                </ProtectedRoute>
              }
            />
            {/* 6. Trang Quên mật khẩu */}
            <Route path="/forgot" element={<ForgotPassword />} />
            {/* 7. Trang Đăng ký tài khoản */}
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </div>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;

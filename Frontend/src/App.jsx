import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// --- IMPORT TRANG KHÁCH ---
import HomePage from "./Page/homePage";
import Login from "./Page/login";
import Booking from "./Page/booking";
import Menu from "./Page/menu";

// --- IMPORT COMPONENTS CHUNG ---
import Footer from "./components/footer";
import Chatbot from "./components/Chatbot";

// --- IMPORT TRANG ADMIN ---
import AdminManageTables from "./Page/Page_admin/adminManageTables";
import AdminAddMenu from "./Page/Page_admin/adminAddMenu";
import AdminEditMenu from "./Page/Page_admin/adminEditMenu";
import AdminMenuList from "./Page/Page_admin/adminMenuList";
import AdminEditTableStyle from "./Page/Page_admin/adminEditTableStyle";
import AdminAddTableStyle from "./Page/Page_admin/adminAddTableStyle";
import AdminTablesList from "./Page/Page_admin/adminTableStyle";

// Bổ sung import AdminBooking bị thiếu
import AdminBooking from "./Page/Page_admin/adminBooking";

// Danh sách các đường dẫn của Admin để ẩn Chatbot
const ADMIN_PATHS = [
  "/admin",
  "/adminAddMenu",
  "/adminEditMenu",
  "/adminManageTables",
  "/adminMenuList",
  "/adminTablesList",
  "/adminAddTableStyle",
  "/adminEditTableStyle",
  "/adminBooking",
];

// Component Bảo vệ: Kiểm tra quyền Admin
const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem("isAdminLoggedIn");
  if (isAuth !== "true") return <Navigate to="/login" replace />;
  return children;
};

// Component chứa nội dung và logic ẩn/hiện Chatbot
function MainLayout() {
  const { pathname } = useLocation();
  const isAdmin = ADMIN_PATHS.some((p) => pathname.startsWith(p));

  return (
    <div
      className="App"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <div style={{ flex: 1 }}>
        <Routes>
          {/* CÁC TRANG CỦA KHÁCH */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/menu" element={<Menu />} />

          {/* CÁC TRANG CỦA ADMIN (Đã được bảo vệ) */}
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
            path="/adminTableStyle"
            element={
              <ProtectedRoute>
                <AdminTablesList />
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
          <Route
            path="/adminBooking"
            element={
              <ProtectedRoute>
                <AdminBooking />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      <Footer />

      {/* Nếu KHÔNG PHẢI là trang admin thì mới render Chatbot */}
      {!isAdmin && <Chatbot />}
    </div>
  );
}

// Hàm khởi chạy App chính
function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}

export default App;

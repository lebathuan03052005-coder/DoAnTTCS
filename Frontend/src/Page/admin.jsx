import React from "react";
import Navbar from "../components/navbar";
import "./admin.css";
import AdminMenuList from "./adminMenuList";

const Admin = () => {
  return (
    <div className="admin-bg">
      <Navbar />

      {/* Dùng Flexbox để chia đôi màn hình: Trái là Sidebar, Phải là Nội dung */}
      <div style={{ display: "flex", paddingTop: "80px", minHeight: "100vh" }}>
        <aside className="BangDK" style={{ width: "250px" }}>
          <nav>
            <ul className="BangDK_list">
              <p
                style={{
                  color: "white",
                  fontWeight: "bold",
                  marginBottom: "20px",
                }}
              >
                BẢNG QUẢN LÝ
              </p>
              <li>
                <a href="/admin" style={{ color: "#d4af37" }}>
                  Danh sách món ăn
                </a>
              </li>
              <li>
                <a href="/adminManageBookings">Thông tin đặt bàn</a>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Khu vực nội dung chính */}
        <main style={{ flex: 1, backgroundColor: "#f4f4f4" }}>
          <AdminMenuList />
        </main>
      </div>
    </div>
  );
};
export default Admin;

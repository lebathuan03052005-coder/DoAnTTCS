import React from "react";
import Navbar from "../components/navbar";
import "./menu.css";

const Menu = () => {
  return (
    <div className="menu-bg">
      <div className="bg-overlay"></div>

      <Navbar />

      <main className="menu-section">
        <div className="menu-container">
          <h2 className="menu-title">Thực Đơn Tinh Hoa</h2>
          <p className="menu-subtitle">
            Trải nghiệm hương vị hoàng gia qua từng món ăn được chế biến từ
            những nguyên liệu thượng hạng nhất.
          </p>

          {/* Khu vực Lưới (Grid) này đã được setup CSS sẵn sàng để tự động dàn hàng ngang/dọc cho món ăn */}
          <div className="menu-grid">
            {/* Dữ liệu món ăn sẽ được đổ vào đây bằng vòng lặp map() */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Menu;

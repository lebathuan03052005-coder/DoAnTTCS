import React, { useState, useEffect } from "react";
import "./admin.css";

const API_BASE = "http://localhost:5000";

const BangDK = () => {
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingReservations = async () => {
    try {
      // 🌟 Sửa đường dẫn thêm /api vào trước /admin/reservations
      const response = await fetch(`${API_BASE}/api/admin/reservations`);

      if (!response.ok) {
        console.error(`API trả về lỗi HTTP: ${response.status}`);
        return;
      }

      const json = await response.json();

      if (json.success && Array.isArray(json.data)) {
        // Lọc các đơn có trạng thái "Pending"
        const count = json.data.filter(
          (res) => res.status === "Pending",
        ).length;
        setPendingCount(count);
      }
    } catch (err) {
      console.error(
        "Lỗi khi lấy số lượng đơn chờ duyệt tại thanh điều hướng:",
        err,
      );
    }
  };

  useEffect(() => {
    fetchPendingReservations();

    // Cơ chế quét tự động sau mỗi 10 giây để cập nhật đơn mới realtime
    const interval = setInterval(fetchPendingReservations, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="BangDK">
      <p
        className="BangDK_title"
        style={{
          textAlign: "center",
          marginBottom: "20px",
          color: "#b5b526",
          fontSize: "20px",
          fontWeight: "bold",
        }}
      >
        BẢNG ĐIỀU KHIỂN
      </p>

      <ul className="BangDK_list">
        <li>
          <a href="/adminManageTables">Quản lý bàn</a>
        </li>
        <li>
          <a href="/adminTableStyle">Quản lý Style bàn</a>
        </li>
        <li>
          <a href="/adminMenuList">Danh sách món ăn</a>
        </li>

        <li className="BangDK_item-booking">
          <a href="/adminBooking">
            <span>Danh sách đặt bàn</span>

            {/* Hiển thị số lượng đơn thực tế quét từ DB */}
            {pendingCount > 0 && (
              <span className="badge-pending">{pendingCount}</span>
            )}
          </a>
        </li>
        <li>
          <a href="/adminAddMenu">Thêm món ăn</a>
        </li>
      </ul>
    </div>
  );
};

export default BangDK;

import React from "react";
import "./admin.css";

const BangDK = () => {
  return (
    <div className="BangDK">
      <p
        style={{
          color: "red",
          fontSize: "1.5rem",
          marginBottom: "20px",
          paddingTop: "20px",
        }}
      >
        BẢNG ĐIỀU KIỂN
      </p>
      <ul className="BangDK_list">
        <li>
          <a href="/adminManageTables">Quản lý bàn</a>
        </li>
        <li>
          <a href="/adminAddMenu">Thêm món ăn</a>
        </li>
        <li>
          <a href="/adminMenuList">Danh sách món ăn</a>
        </li>
        <li>
          <a href="#">Danh Sách khách đặt bàn</a>
        </li>
      </ul>
    </div>
  );
};

export default BangDK;

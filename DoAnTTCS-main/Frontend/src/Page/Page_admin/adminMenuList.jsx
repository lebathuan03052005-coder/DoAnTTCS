import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./adminMenuList.css";
import Admin from "./admin";
import Navbar from "../../components/navbar";

const AdminMenuList = () => {
  const [menuItems, setMenuItems] = useState([]);
  const navigate = useNavigate();

  // Hàm gọi API lấy danh sách món ăn
  const fetchMenu = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/menu");
      const result = await response.json();
      if (result.success) {
        setMenuItems(result.data);
      } else {
        console.error("Backend báo lỗi:", result.message);
        alert("Lỗi tải danh sách: " + result.message);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách món ăn:", error);
      alert("Không thể kết nối đến Backend (Port 5000) để tải danh sách!");
    }
  };

  // Chạy 1 lần ngay khi mở trang
  useEffect(() => {
    fetchMenu();
  }, []);

  // Hàm Xóa món ăn
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa món này không?")) return;
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/menu/${id}`,
        {
          method: "DELETE",
        },
      );
      const result = await response.json();
      if (result.success) {
        alert("Xóa thành công!");
        fetchMenu(); // Load lại danh sách
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (error) {
      alert("Lỗi kết nối Server!");
    }
  };

  // Hàm Bật/Tắt Bestseller
  const handleToggleBestseller = async (id, currentStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/menu/${id}/bestseller`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_best_seller: !currentStatus }),
        },
      );
      const result = await response.json();
      if (result.success) {
        fetchMenu(); // Load lại danh sách để hiện cập nhật tức thì
      }
    } catch (error) {
      alert("Lỗi kết nối Server!");
    }
  };

  return (
    <div className="admin-menu-list-page">
      <div style={{ display: "flex" }}>
        <Admin />

        <div style={{ flex: 1 }}>
          <Navbar />
          <div
            className="container"
            style={{ padding: "20px", maxWidth: "100%" }}
          >
            <div className="header-actions">
              <h2 style={{ color: "#333" }}>Danh Sách Món Ăn Hiện Có</h2>
              <Link to="/adminAddMenu" className="btn-add">
                + Thêm Món Mới
              </Link>
            </div>

            <div className="table-responsive">
              <table className="menu-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Hình ảnh</th>
                    <th>Tên món</th>
                    <th>Giá</th>
                    <th>Bestseller</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.length > 0 ? (
                    menuItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.item_name}
                              className="menu-img"
                            />
                          ) : (
                            "Chưa có ảnh"
                          )}
                        </td>
                        <td>
                          <strong>{item.item_name}</strong>
                        </td>
                        <td>{Number(item.price).toLocaleString()} VNĐ</td>
                        <td>
                          <button
                            className={`btn-bestseller ${item.is_best_seller ? "active" : ""}`}
                            onClick={() =>
                              handleToggleBestseller(
                                item.id,
                                item.is_best_seller,
                              )
                            }
                          >
                            {item.is_best_seller ? "★ Đang Bật" : "☆ Tắt"}
                          </button>
                        </td>
                        <td>
                          <button
                            className="btn-edit"
                            // Chuyển sang trang sửa kèm theo ID của món ăn
                            onClick={() =>
                              navigate(`/adminEditMenu/${item.id}`)
                            }
                          >
                            Sửa
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(item.id)}
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center" }}>
                        Chưa có món ăn nào trong hệ thống.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMenuList;

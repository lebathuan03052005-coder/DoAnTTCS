import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./adminMenuList.css";
import Admin from "./admin";
import Navbar from "../../components/navbar";

const AdminTablesList = () => {
  const [tables, setTables] = useState([]);
  const navigate = useNavigate();

  // Hàm gọi API lấy danh sách bàn
  const fetchTables = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/table_styles",
      );
      if (!response.ok) {
        const text = await response.text();
        console.error("Fetch table_styles failed:", response.status, text);
        alert("Lỗi khi gọi API: " + response.status);
        return;
      }
      const result = await response.json();
      if (result.success) {
        // Sắp xếp theo id giảm dần (đồng nhất các trường id có thể khác tên)
        const sorted = result.data.sort((a, b) => {
          const ida = Number(a.style_id || a.id || a.ID) || 0;
          const idb = Number(b.style_id || b.id || b.ID) || 0;
          return ida - idb; // tăng dần
        });
        setTables(sorted);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách bàn:", error);
      alert("Không thể kết nối đến Backend (Port 5000) để tải danh sách!");
    }
  };

  // Chạy 1 lần ngay khi mở trang
  useEffect(() => {
    fetchTables();
  }, []);

  // Hàm
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bàn này không?")) return;
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/table_styles/${id}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) {
        const txt = await response.text();
        console.error("DELETE failed:", response.status, txt);
        alert("Lỗi server khi xóa: " + response.status);
        return;
      }
      const result = await response.json();
      if (result.success) {
        alert("Xóa thành công!");
        fetchTables(); // Load lại danh sách
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
      // Gọi PUT cập nhật trực tiếp endpoint /admin/table_styles/:id
      const response = await fetch(
        `http://localhost:5000/api/admin/table_styles/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bestseller: !currentStatus }),
        },
      );
      const result = await response.json();
      if (result.success) {
        fetchTables(); // Load lại danh sách để hiện cập nhật tức thì
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
              <h2 style={{ color: "#333" }}>Danh Sách Style Bàn</h2>
              <Link to="/adminAddTableStyle" className="btn-add">
                + Thêm Style Bàn Mới
              </Link>
            </div>

            <div className="table-responsive">
              <table className="menu-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Hình ảnh</th>
                    <th>Phong cách bàn</th>
                    <th>Mô tả</th>
                    <th>Yêu thích</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.length > 0 ? (
                    tables.map((table) => {
                      const id = table.style_id || table.id || table.ID;
                      return (
                        <tr key={id}>
                          <td>{id}</td>
                          <td>
                            {table.image_url ? (
                              <img
                                src={table.image_url}
                                alt={table.style_name}
                                className="menu-img"
                              />
                            ) : (
                              "Chưa có ảnh"
                            )}
                          </td>
                          <td>
                            <strong>{table.style_name}</strong>
                          </td>
                          <td>{table.description} </td>
                          <td>
                            <button
                              className={`btn-bestseller ${table.bestseller ? "active" : ""}`}
                              onClick={() =>
                                handleToggleBestseller(id, table.bestseller)
                              }
                            >
                              {table.bestseller ? "★ Đang Bật" : "☆ Tắt"}
                            </button>
                          </td>
                          <td>
                            <button
                              className="btn-edit"
                              onClick={() =>
                                navigate(`/adminEditTableStyle/${id}`)
                              }
                            >
                              Sửa
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => handleDelete(id)}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      );
                    })
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

export default AdminTablesList;

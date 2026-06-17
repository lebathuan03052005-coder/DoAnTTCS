import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Admin from "./admin";
import Navbar from "../../components/navbar";
import "./adminAddTableStyle.css";

const AdminAddTableStyle = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    style_name: "",
    description: "",
    image_url: "",
    bestseller: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/admin/table_styles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const txt = await res.text();
        console.error("POST create failed:", res.status, txt);
        alert("Lỗi server khi tạo: " + res.status);
        return;
      }
      const result = await res.json();
      if (result.success) {
        alert("Tạo style bàn mới thành công");
        navigate("/adminTablesList");
      } else alert("Lỗi: " + result.message);
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối Server");
    }
  };

  return (
    <div className="admin-edit-page">
      {/* Sidebar Admin bên trái */}
      <Admin />

      <div className="admin-edit-main">
        {/* Thanh điều hướng phía trên */}
        <Navbar />

        {/* Đổi thành container-fluid để dãn tràn khung phải */}
        <div className="container-fluid admin-edit-container">
          <h2>Thêm Style Bàn Mới</h2>

          <form onSubmit={handleSubmit} className="admin-formStyle">
            <div className="form-group">
              <label>Phong cách bàn</label>
              <input
                type="text"
                name="style_name"
                value={form.style_name}
                onChange={handleChange}
                placeholder="Nhập phong cách bàn (ví dụ: Hoàng gia, Sân vườn...)"
              />
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Mô tả chi tiết về style bàn..."
              />
            </div>

            <div className="form-group">
              <label>Ảnh (URL)</label>
              <input
                type="text"
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="Nhập link ảnh (anh/concept/)"
              />
            </div>

            {/* Khu vực checkbox thiết kế riêng không lo bị lệch hàng */}
            <div className="checkbox-wrapper">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="bestseller"
                  checked={form.bestseller}
                  onChange={handleChange}
                />
                Được yêu thích
              </label>
            </div>

            <div
              style={{ marginLeft: "400px", gap: "50px" }}
              className="form-actions"
            >
              <button type="submit" className="btn-add">
                Tạo
              </button>
              <button
                type="button"
                className="btn-delete"
                onClick={() => navigate("/adminTableStyle")}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAddTableStyle;

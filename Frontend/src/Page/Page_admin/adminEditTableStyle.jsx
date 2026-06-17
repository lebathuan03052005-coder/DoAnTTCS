import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Admin from "./admin";
import Navbar from "../../components/navbar";
import "./adminEditTableStyle.css";

const AdminEditTableStyle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    style_name: "",
    description: "",
    image_url: "",
    bestseller: false,
  });

  useEffect(() => {
    const fetchStyle = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/admin/table_styles/${id}`,
        );
        if (!res.ok) {
          const txt = await res.text();
          console.error("Fetch style failed:", res.status, txt);
          alert("Lỗi khi tải dữ liệu style: " + res.status);
          navigate("/adminTablesList");
          return;
        }
        const data = await res.json();
        if (data.success) {
          setForm({
            style_name: data.data.style_name || "",
            description: data.data.description || "",
            image_url: data.data.image_url || "",
            bestseller: !!data.data.bestseller,
          });
        } else {
          alert("Không tìm thấy style");
          navigate("/adminTablesList");
        }
      } catch (err) {
        console.error(err);
        alert("Lỗi kết nối Server");
      }
    };
    fetchStyle();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/table_styles/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      if (!res.ok) {
        const txt = await res.text();
        console.error("PUT update failed:", res.status, txt);
        alert("Lỗi server khi cập nhật: " + res.status);
        return;
      }
      const result = await res.json();
      if (result.success) {
        alert("Cập nhật thành công");
        navigate("/adminTablesList");
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối Server");
    }
  };

  return (
    <div className="admin-edit-page">
      {/* Sidebar Admin cố định bên trái */}
      <Admin />

      <div className="admin-edit-main">
        {/* Navbar phía trên */}
        <Navbar />

        {/* Đổi sang container-fluid và cấu hình bám sát lề */}
        <div className="container-fluid admin-edit-container">
          <h2>Sửa Style Bàn</h2>

          <form onSubmit={handleSubmit} className="admin-form7">
            <div className="form-group">
              <label>Phong cách bàn</label>
              <input
                type="text"
                name="style_name"
                value={form.style_name}
                onChange={handleChange}
                placeholder="Nhập phong cách bàn mới..."
              />
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Chỉnh sửa mô tả chi tiết..."
              />
            </div>

            <div className="form-group">
              <label>Ảnh (URL)</label>
              <input
                type="text"
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="Nhập link ảnh mới..."
              />
            </div>

            {/* Khung checkbox đồng bộ chống lệch dòng */}
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
              className="form-actions"
              style={{ marginLeft: "400px", gap: "50px" }}
            >
              <button type="submit" className="btn-add">
                Lưu
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

export default AdminEditTableStyle;

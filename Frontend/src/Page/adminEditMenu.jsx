import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import "./adminAddMenu.css"; // Dùng chung file CSS của trang thêm món

export default function AdminEditMenu() {
  const { id } = useParams(); // Lấy ID của món ăn từ thanh địa chỉ URL
  const navigate = useNavigate();

  // State lưu danh sách danh mục lấy từ Backend
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    category_id: "",
    item_name: "",
    description: "",
    price: "",
    image_url: "",
    is_best_seller: false,
    ingredients: "",
    allergy_warnings: "",
    is_spicy: false,
    is_vegetarian: false,
    serving_size: "",
  });

  // Hàm tự động chạy khi mở trang để lấy dữ liệu cũ của món ăn
  useEffect(() => {
    const fetchMenuItem = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/admin/menu/${id}`,
        );
        const result = await response.json();

        if (result.success) {
          // Đổ dữ liệu cũ vào các ô nhập
          const data = result.data;
          setFormData({
            category_id: data.category_id || "",
            item_name: data.item_name || "",
            description: data.description || "",
            price: data.price || "",
            image_url: data.image_url || "",
            is_best_seller: data.is_best_seller || false,
            ingredients: data.ingredients || "",
            allergy_warnings: data.allergy_warnings || "",
            is_spicy: data.is_spicy || false,
            is_vegetarian: data.is_vegetarian || false,
            serving_size: data.serving_size || "",
          });
        } else {
          alert("Không tìm thấy món ăn này!");
          navigate("/adminMenuList");
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu món ăn:", error);
      }
    };

    fetchMenuItem();
  }, [id, navigate]);

  // Hàm lấy danh sách danh mục chạy 1 lần khi mở trang
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/categories");

        if (!response.ok) {
          console.error("❌ API lỗi:", response.status);
          return;
        }

        const result = await response.json();
        console.log("✅ Categories:", result);

        if (result.success) {
          setCategories(result.data);
        }
      } catch (error) {
        console.error("❌ Lỗi khi tải danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Hàm gửi dữ liệu lên Backend để CẬP NHẬT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/menu/${id}`,
        {
          method: "PUT", // Chú ý: Dùng PUT cho hành động Sửa
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const result = await response.json();

      if (result.success) {
        alert("Cập nhật thành công!");
        navigate("/adminMenuList"); // Sửa xong thì quay về danh sách
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (error) {
      alert("Không kết nối được tới Backend Server 5000!");
    }
  };

  return (
    <main className="admin-menu-page">
      <Navbar />
      <div className="admin-menu-container">
        <h2 className="admin-menu-title" style={{ color: "#d39e00" }}>
          CẬP NHẬT MÓN ĂN (ID: {id})
        </h2>

        <form onSubmit={handleSubmit} className="admin-menu-form">
          <div className="form-row">
            <div className="form-group">
              <label>
                <b>Tên món ăn (*):</b>
              </label>
              <input
                type="text"
                name="item_name"
                value={formData.item_name}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>
                <b>Giá tiền (*):</b>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>
                <b>Danh mục:</b>
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {/* Thay 'category_name' bằng tên cột lưu tên danh mục trong CSDL của bạn */}
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label>
            <b style={{ color: "#333" }}>Mô tả chung:</b>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-input form-textarea"
          />

          <label>
            <b style={{ color: "#333" }}>Link Hình Ảnh (URL):</b>
          </label>
          <input
            type="text"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="/anh/ten-anh.jpg"
            className="form-input"
          />

          <label>
            <b style={{ color: "#333" }}>Nguyên liệu chi tiết:</b>
          </label>
          <textarea
            name="ingredients"
            value={formData.ingredients}
            onChange={handleChange}
            placeholder="Thịt bò, bơ, tỏi..."
            className="form-input form-textarea"
          />

          <div className="form-row">
            <div className="form-group">
              <label>
                <b style={{ color: "#333" }}>Thực phẩm gây dị ứng:</b>
              </label>
              <input
                type="text"
                name="allergy_warnings"
                value={formData.allergy_warnings}
                onChange={handleChange}
                placeholder="Sữa, Đậu phộng..."
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>
                <b style={{ color: "#333" }}>Khẩu phần ăn:</b>
              </label>
              <input
                type="text"
                name="serving_size"
                value={formData.serving_size}
                onChange={handleChange}
                placeholder="VD: 1-2 người"
                className="form-input"
              />
            </div>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_best_seller"
                checked={formData.is_best_seller}
                onChange={handleChange}
              />{" "}
              Best Seller
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_spicy"
                checked={formData.is_spicy}
                onChange={handleChange}
              />{" "}
              Món cay
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_vegetarian"
                checked={formData.is_vegetarian}
                onChange={handleChange}
              />{" "}
              Món chay
            </label>
          </div>

          {/* Thay đổi màu nút thành màu vàng cho phù hợp với hành động Cập nhật */}
          <button
            type="submit"
            className="submit-btn"
            style={{ backgroundColor: "#ffc107", color: "#333" }}
          >
            LƯU THAY ĐỔI
          </button>
        </form>
      </div>
    </main>
  );
}

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar";
import Admin from "./admin";
// Đã trỏ sang file CSS mới
import "./adminEditMenu.css";

export default function AdminEditMenu() {
  const { id } = useParams(); // Lấy ID của món ăn từ thanh địa chỉ URL
  const navigate = useNavigate();

  // State lưu danh sách danh mục lấy từ Backend
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    category_name: "",
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
          const data = result.data;
          // Đổ dữ liệu cũ vào các ô nhập
          setFormData({
            category_name: data.category_name || "", // Backend truyền về category_name từ câu lệnh lồng JOIN
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
        const response = await fetch(
          "http://localhost:5000/api/admin/categories",
        );

        if (!response.ok) {
          console.error("API lỗi:", response.status);
          return;
        }

        const result = await response.json();
        if (result.success) {
          setCategories(result.data || []);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
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
          method: "PUT", // Sử dụng phương thức PUT để cập nhật bản ghi
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData), // Gửi toàn bộ dữ liệu đi (bao gồm cả category_name mới chọn)
        },
      );

      const result = await response.json();

      if (result.success) {
        alert("Cập nhật món ăn thành công!");
        navigate("/adminMenuList"); // Sửa xong thì quay về danh sách quản lý chung
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (error) {
      alert("Không kết nối được tới Backend Server 5000!");
    }
  };

  return (
    <main className="dish-update-page">
      <Navbar />
      <div className="dish-update-layout">
        <Admin />
        <div className="dish-update-main">
          <div className="dish-update-container">
            <h2 className="dish-update-title">CẬP NHẬT MÓN ĂN (ID: {id})</h2>

            <form onSubmit={handleSubmit} className="dish-update-form">
              <div className="dish-form-grid triple">
                <div className="dish-form-group">
                  <label className="dish-form-label">Tên món ăn (*):</label>
                  <input
                    type="text"
                    name="item_name"
                    value={formData.item_name}
                    onChange={handleChange}
                    required
                    className="dish-form-input"
                  />
                </div>
                <div className="dish-form-group">
                  <label className="dish-form-label">Giá tiền (*):</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="dish-form-input"
                  />
                </div>
                <div className="dish-form-group">
                  <label className="dish-form-label">
                    Danh mục món ăn (*):
                  </label>
                  <select
                    name="category_name"
                    value={formData.category_name}
                    onChange={handleChange}
                    className="dish-form-select"
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id || cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="dish-form-group">
                <label className="dish-form-label-dark">Mô tả chung:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="dish-form-input dish-form-textarea"
                />
              </div>

              <div className="dish-form-group">
                <label className="dish-form-label-dark">
                  Link Hình Ảnh (URL):
                </label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="/anh/ten-anh.jpg"
                  className="dish-form-input"
                />
              </div>

              <div className="dish-form-group">
                <label className="dish-form-label-dark">
                  Nguyên liệu chi tiết:
                </label>
                <textarea
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleChange}
                  placeholder="Thịt bò, bơ, tỏi..."
                  className="dish-form-input dish-form-textarea"
                />
              </div>

              <div className="dish-form-grid double">
                <div className="dish-form-group">
                  <label className="dish-form-label-dark">
                    Thực phẩm gây dị ứng:
                  </label>
                  <input
                    type="text"
                    name="allergy_warnings"
                    value={formData.allergy_warnings}
                    onChange={handleChange}
                    placeholder="Sữa, Đậu phộng..."
                    className="dish-form-input"
                  />
                </div>
                <div className="dish-form-group">
                  <label className="dish-form-label-dark">Khẩu phần ăn:</label>
                  <input
                    type="text"
                    name="serving_size"
                    value={formData.serving_size}
                    onChange={handleChange}
                    placeholder="VD: 1-2 người"
                    className="dish-form-input"
                  />
                </div>
              </div>

              <div className="dish-checkbox-group">
                <label className="dish-checkbox-label">
                  <input
                    type="checkbox"
                    name="is_best_seller"
                    checked={formData.is_best_seller}
                    onChange={handleChange}
                  />{" "}
                  ⭐ Best Seller
                </label>
                <label className="dish-checkbox-label">
                  <input
                    type="checkbox"
                    name="is_spicy"
                    checked={formData.is_spicy}
                    onChange={handleChange}
                  />{" "}
                  🌶️ Món cay
                </label>
                <label className="dish-checkbox-label">
                  <input
                    type="checkbox"
                    name="is_vegetarian"
                    checked={formData.is_vegetarian}
                    onChange={handleChange}
                  />{" "}
                  🥬 Món chay
                </label>
              </div>

              <button type="submit" className="dish-submit-btn">
                LƯU THAY ĐỔI
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

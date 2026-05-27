import React, { useState, useEffect } from "react"; // 🌟 ĐÃ SỬA: Bổ sung thêm useEffect vào đây kẻo lỗi sập trang
import Navbar from "../../components/navbar";
import Admin from "./admin";
import "./adminCommon.css";
import "./adminAddMenu.css";

export default function AdminAddMenu() {
  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/admin/categories",
        );
        const data = await response.json();

        // Kiểm tra cấu trúc data trả về của bạn là mảng trực tiếp hay nằm trong .data
        setCategoriesList(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách danh mục nhà hàng:", error);
      }
    };

    fetchCategories();
  }, []);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Toàn bộ dữ liệu trong formData (bao gồm cả category_name dạng chữ) sẽ được gửi đi
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        // RESET LẠI FORM SẠCH SẼ SAU KHI THÊM THÀNH CÔNG
        setFormData({
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
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (error) {
      alert("Không kết nối được tới Backend Server 5000!");
    }
  };

  return (
    <main className="admin-menu-page">
      <div className="admin-layout">
        <Admin />
        <div className="main-content">
          <Navbar />

          <div className="admin-menu-container">
            <h2 className="admin-menu-title">QUẢN LÝ THỰC ĐƠN CỦA NHÀ HÀNG</h2>

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
                    <b>Danh mục món ăn (*):</b>
                  </label>
                  <select
                    name="category_name"
                    value={formData.category_name}
                    onChange={handleChange}
                    className="form-input"
                    required
                    style={{ cursor: "pointer" }}
                  >
                    <option value="">-- Chọn danh mục món ăn --</option>
                    {/* Vòng lặp tự động rải các danh mục lấy từ cơ sở dữ liệu */}
                    {categoriesList.map((cat) => (
                      <option key={cat.id || cat.name} value={cat.name}>
                        {cat.name}
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
                  ⭐ Best Seller
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_spicy"
                    checked={formData.is_spicy}
                    onChange={handleChange}
                  />{" "}
                  🌶️ Món cay
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_vegetarian"
                    checked={formData.is_vegetarian}
                    onChange={handleChange}
                  />{" "}
                  🥬 Món chay
                </label>
              </div>

              <button type="submit" className="submit-btn">
                LƯU MÓN ĂN VÀO HỆ THỐNG
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

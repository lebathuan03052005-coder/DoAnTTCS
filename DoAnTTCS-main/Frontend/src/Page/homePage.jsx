import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import "./homePage.css";

const HomePage = () => {
  // Tạo state để lưu URL của ảnh khi người dùng muốn phóng to
  const [selectedImage, setSelectedImage] = useState(null);
  // Tạo State lưu trữ danh sách món ăn Best Seller
  const [bestSellers, setBestSellers] = useState([]);
  // Tạo State lưu trữ phong cách bàn ăn
  const [tableStyles, setTableStyles] = useState([]);

  // Hàm xử lý trượt Slider món ăn
  const nextSlide = () => {
    const slider = document.getElementById("food-grid-display");
    if (slider) slider.scrollBy({ left: 300, behavior: "smooth" });
  };

  const prevSlide = () => {
    const slider = document.getElementById("food-grid-display");
    if (slider) slider.scrollBy({ left: -300, behavior: "smooth" });
  };
  // --- LOGIC CHO SLIDER BÀN ĂN ---
  // Tạo state để lưu vị trí hiện tại (nếu bạn đang dùng CSS transform để trượt)
  const [currentStyleIndex, setCurrentStyleIndex] = useState(0);

  // Hàm lùi
  const prevStyleSlide = () => {
    const slider = document.getElementById("style-grid-display");
    if (slider) slider.scrollBy({ left: -300, behavior: "smooth" });
  };

  // Hàm tới
  const nextStyleSlide = () => {
    const slider = document.getElementById("style-grid-display");
    if (slider) slider.scrollBy({ left: 300, behavior: "smooth" });
  };

  // --- LOGIC CHO SLIDER BÀN ĂN ---

  // Gọi API lấy danh sách món ăn khi trang web vừa load xong
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/menu");
        const result = await response.json();
        if (result.success) {
          // Lọc ra những món được Admin bật tick Best Seller
          const best = result.data.filter(
            // Nới lỏng điều kiện kiểm tra (phòng hờ SQL trả về số 1 hoặc chữ 'true')
            (item) => item.is_best_seller == true || item.is_best_seller === 1,
          );
          console.log("Dữ liệu Best Seller từ DB:", best);
          setBestSellers(best);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu món ăn:", error);
      }
    };
    fetchBestSellers();
    // Lấy danh sách style bàn ăn
    // Lấy danh sách style bàn ăn
    const fetchTableStyles = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/table_styles");
        const data = await res.json();

        if (data.success && data.data) {
          // Dùng .map() để tạo mảng mới, chỉ lấy id và image_url
          const imagesOnly = data.data.map((item) => ({
            id: item.id,
            image_url: item.image_url,
            name:
              item.name ||
              item.style_name ||
              item.title ||
              item.description ||
              `Phong cách ${item.id}`,
          }));

          setTableStyles(imagesOnly); // Lưu mảng vừa lọc vào state
        }
      } catch (err) {
        console.error("Lỗi khi tải style bàn ăn:", err);
      }
    };
    fetchTableStyles();
  }, []);

  return (
    <div className="homepage-container">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section id="home" className="hero">
          <div className="hero-content">
            <h1 className="fade-in1">
              <span style={{ color: "#ffffff" }}>Chào Mừng Đến Với </span>
              <span style={{ color: "#f5ebe4" }}>The King</span>

              <span style={{ color: "#d4af37" }}> Restaurant</span>
            </h1>
            <p className="fade-in">
              Nơi khởi đầu của những trải nghiệm ẩm thực đẳng cấp và không gian
              ấm cúng.
            </p>
            <div className="concept">
              <h3 className="mini-title">Phong Cách Bàn Ăn Được Ưu Chuộng</h3>

              <div className="slider-container">
                {/* Nút lùi */}
                <button onClick={prevStyleSlide} className="btn-nav">
                  ❮
                </button>

                {/* Danh sách phong cách bàn ăn */}
                <div id="style-grid-display" className="style-grid">
                  {tableStyles.length > 0 ? (
                    tableStyles.map((style) => (
                      <div key={style.id} className="style-card">
                        <img
                          src={
                            style.image_url || "/anh/ban_an/default-table.jpg"
                          }
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/anh/logo.png";
                          }}
                          alt="Phong cách bàn ăn"
                          className="style-img"
                          onClick={() =>
                            setSelectedImage(
                              style.image_url ||
                                "/anh/ban_an/default-table.jpg",
                            )
                          }
                          style={{
                            width: "100%", // Sẽ ăn theo 320px của .style-card
                            height: "220px", // Đổi thành 220px cho cân đối (tỷ lệ chuẩn)
                            objectFit: "cover", // Cắt cúp ảnh gọn gàng không méo
                            borderRadius: "12px", // Bo góc tròn hơn một chút cho sang trọng
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)", // Thêm chút bóng đổ cho nổi bật
                          }}
                        />
                        <div className="style-caption">{style.name}</div>
                      </div>
                    ))
                  ) : (
                    <p className="loading-text">Đang tải ảnh...</p>
                  )}
                </div>

                {/* Nút tới */}
                <button onClick={nextStyleSlide} className="btn-nav">
                  ❯
                </button>
              </div>
            </div>

            <div className="hero-best-seller">
              <h3 className="mini-title">Món Ăn Được Yêu Thích</h3>

              {/* Gom chung mũi tên và danh sách vào một flex container */}
              <div className="slider-container">
                <button onClick={prevSlide} className="btn-nav">
                  ❮
                </button>

                {/* Sử dụng CSS Grid/Flex để hiển thị danh sách */}
                <div id="food-grid-display" className="food-grid">
                  {bestSellers.length > 0 ? (
                    bestSellers.map((item) => (
                      <div key={item.id} className="food-card">
                        <img
                          src={
                            item.image_url ||
                            "/anh/mon_an/steak/default-food.jpg"
                          }
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/anh/logo.png"; // Hiển thị tạm logo nếu ảnh món ăn bị lỗi
                          }}
                          alt={item.item_name}
                          className="food-img"
                        />
                        <h3 className="food-title">{item.item_name}</h3>
                        <p className="food-price">
                          {Number(item.price).toLocaleString()} VNĐ
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="loading-text">
                      Đang cập nhật danh sách món ăn...
                    </p>
                  )}
                </div>

                <button onClick={nextSlide} className="btn-nav">
                  ❯
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="info-section">
          <div className="about-container-full">
            <div className="overlay-gradient"></div>
            <div className="container">
              <div
                className="about-content box-right"
                style={{
                  marginBottom: "90px",
                  textAlign: "right",
                  marginRight: "300px",
                }}
              >
                <span className="sub-title">— NHÀ HÀNG KING</span>
                <h2 className="section-title">CÂU CHUYỆN CỦA CHÚNG TÔI</h2>
                <p className="section-text">
                  Tại King Restaurant, tinh hoa ẩm thực Pháp hòa quyện cùng
                  hương vị Việt quen thuộc, tạo nên một hành trình trải nghiệm
                  ẩm thực đầy cảm xúc và tinh tế. Mỗi món ăn không chỉ được chăm
                  chút tỉ mỉ trong từng công đoạn chế biến mà còn mang dấu ấn
                  sáng tạo riêng biệt của đội ngũ đầu bếp. Suốt hơn 15 năm,
                  chúng tôi không ngừng gìn giữ, phát triển và nâng tầm giá trị
                  ẩm thực, mang đến cho thực khách những trải nghiệm trọn vẹn,
                  đáng nhớ và đậm chất nghệ thuật.
                </p>
              </div>
            </div>
          </div>

          {/* Khối 2: Background ảnh nhân viên - Chữ bên trái */}

          <div className="overlay-gradient left"></div>
          <div className="container">
            <div
              className="about-content box-left"
              style={{
                marginTop: "90px",
                textAlign: "right",
                marginLeft: "200px",
              }}
            >
              <span className="sub-title">— TRẢI NGHIỆM</span>
              <h2 className="section-title">TRẢI NGHIỆM HOÀNG GIA</h2>
              <p className="section-text">
                Không chỉ là điểm đến của những tinh hoa ẩm thực, The King
                Restaurant còn kiến tạo một không gian sang trọng và ấm cúng,
                nơi từng chi tiết đều được chăm chút tỉ mỉ nhằm mang đến cảm
                giác đẳng cấp và thư thái trọn vẹn. Tại đây, mỗi thực khách được
                đón tiếp như những vị thượng khách, tận hưởng hành trình ẩm thực
                tinh tế với hương vị được tuyển chọn kỹ lưỡng, kết hợp cùng
                phong cách phục vụ chuẩn mực, chuyên nghiệp và tận tâm tuyệt
                đối. The King Restaurant không chỉ mang đến một bữa ăn, mà còn
                tạo nên những trải nghiệm đáng nhớ, nơi cảm xúc và sự hài lòng
                luôn được đặt lên hàng đầu.
              </p>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="gallery-section">
          <h2 className="title-gallery">Không Gian Nhà Hàng</h2>
          <div className="gallery-grid">
            <div className="gallery-item">
              <img src="/anh/khongGian (1).jpg" alt="Gallery 1" />
            </div>
            <div className="gallery-item">
              <img src="/anh/khongGian (2).jpg" alt="Gallery 2" />
            </div>
            <div className="gallery-item">
              <img src="/anh/khongGian(3).jpg" alt="Gallery 3" />
            </div>
          </div>
        </section>
      </main>
      {selectedImage && (
        <div
          className="image-modal-overlay"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="close-modal-btn"
              onClick={() => setSelectedImage(null)}
            >
              &times;
            </span>
            <img
              src={selectedImage}
              alt="Ảnh phóng to"
              className="full-size-img"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;

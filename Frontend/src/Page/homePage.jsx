import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import "./homePage.css";

const HomePage = () => {
  // Tạo State lưu trữ danh sách món ăn Best Seller
  const [bestSellers, setBestSellers] = useState([]);

  // Hàm xử lý trượt Slider món ăn
  const nextSlide = () => {
    const slider = document.getElementById("food-grid-display");
    if (slider) slider.scrollBy({ left: 300, behavior: "smooth" });
  };

  const prevSlide = () => {
    const slider = document.getElementById("food-grid-display");
    if (slider) slider.scrollBy({ left: -300, behavior: "smooth" });
  };

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
          // In dữ liệu ra F12 để kiểm tra xem link ảnh từ Database gửi về là gì
          console.log("Dữ liệu Best Seller từ DB:", best);
          setBestSellers(best);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu món ăn:", error);
      }
    };
    fetchBestSellers();
  }, []);

  return (
    <div className="homepage-container">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section id="home" className="hero">
          <div className="hero-content">
            <h1 className="fade-in1">
              <span style={{ color: "#062c66" }}>Chào Mừng Đến Với </span>
              <span style={{ color: "#f5ebe4" }}>The King</span>

              <span style={{ color: "#d4af37" }}>Restaurant</span>
            </h1>
            <p className="fade-in">
              Nơi khởi đầu của những trải nghiệm ẩm thực đẳng cấp và không gian
              ấm cúng.
            </p>

            <div className="hero-btns">
              <a href="#about" className="btn-outline">
                Khám Phá Ngay
              </a>
              <a href="#gallery" className="btn-outline">
                Không Gian Quán
              </a>
            </div>

            <div className="concept">
              <h3 className="mini-title">Phong Cách Bàn Ăn Được Ưu Chuộng</h3>
              <div className="slider-container">
                <button onClick={prevSlide} className="btn-nav">
                  ❮
                </button>

                <button onClick={nextSlide} className="btn-nav">
                  ❯
                </button>
              </div>
            </div>

            <div className="hero-best-seller">
              <h3 className="mini-title">Món Ăn Bán Chạy</h3>

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

        {/* About Section */}
        <section id="about" className="info-section">
          <div className="container">
            {/* Khối 1: Chữ trái - Ảnh phải */}
            <div className="about-wrapper">
              <div className="about-content">
                <h2 className="section-title">Câu Chuyện Của Chúng Tôi</h2>
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
              <div className="about-image">
                <img src="/anh/anh2.jpg" alt="Ảnh 1" />
              </div>
            </div>

            {/* Khối 2: Ảnh trái - Chữ phải (Ngược lại) */}
            <div className="about-wrapper">
              <div className="about-content">
                <h2 className="section-title1">Trải Nghiệm Hoàng Gia</h2>
                <p className="section-text" style={{ textAlign: "justify" }}>
                  Không chỉ là điểm đến của những tinh hoa ẩm thực, The King
                  Restaurant còn kiến tạo một không gian sang trọng và ấm cúng,
                  nơi từng chi tiết đều được chăm chút tỉ mỉ nhằm mang đến cảm
                  giác đẳng cấp và thư thái trọn vẹn. Tại đây, mỗi thực khách
                  được đón tiếp như những vị thượng khách, tận hưởng hành trình
                  ẩm thực tinh tế với hương vị được tuyển chọn kỹ lưỡng, kết hợp
                  cùng phong cách phục vụ chuẩn mực, chuyên nghiệp và tận tâm
                  tuyệt đối. The King Restaurant không chỉ mang đến một bữa ăn,
                  mà còn tạo nên những trải nghiệm đáng nhớ, nơi cảm xúc và sự
                  hài lòng luôn được đặt lên hàng đầu.
                </p>
              </div>
              <div className="about-image img1">
                <img src="/anh/Nhanvien.jpg" alt="Ảnh 2" />
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="gallery-section">
          <h2 className="section-title1">Không Gian Nhà Hàng</h2>
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
    </div>
  );
};

export default HomePage;

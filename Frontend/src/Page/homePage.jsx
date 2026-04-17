import React from "react";
import Navbar from "../components/navbar";
import "./homePage.css";

const HomePage = () => {
  // Hàm giả lập cho Slider (Thuần có thể viết logic JS sau)
  const nextSlide = () => console.log("Next slide");
  const prevSlide = () => console.log("Prev slide");

  return (
    <div className="homepage-container">
      {/* Background Overlay */}
      <div className="bg-overlay"></div>

      <Navbar />

      <main>
        {/* Hero Section */}
        <section id="home" className="hero">
          <div className="hero-content">
            <h1 className="fade-in">
              Chào Mừng Đến Với The King <span>Restaurant</span>
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

            <div className="hero-best-seller">
              <div className="slider-header">
                <h3 className="mini-title">Món Ăn Bán Chạy</h3>
                <div className="slider-controls">
                  <button onClick={prevSlide} className="btn-nav">
                    ❮
                  </button>
                  <button onClick={nextSlide} className="btn-nav">
                    ❯
                  </button>
                </div>
              </div>

              <div className="slider-container">
                <div id="food-grid-display" className="food-grid">
                  {/* Chỗ này sau này Thuần dùng map() để đổ dữ liệu từ SQL Server nhé */}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="info-section">
          <div className="container">
            <h2 className="section-title">Câu Chuyện Của Chúng Tôi</h2>
            <p className="section-text">
              The King Restaurant sự kết hợp tinh tế giữa ẩm thực Pháp và khẩu
              vị Việt, được gìn giữ và phát triển trong hơn 15 năm. Nổi bật với
              các món ăn đặc trưng chuẩn vị Âu, nhà hàng luôn chú trọng từ khâu
              lựa chọn nguyên liệu đến cách chế biến, mang đến hương vị đậm đà
              và trọn vẹn.
              <br />
              <br />
              Không chỉ là nơi thưởng thức món ăn, The King Restaurant còn là
              không gian ấm cúng, nơi mỗi thực khách đều được phục vụ tận tâm và
              thoải mái như đang dùng bữa tại chính “bàn tiệc của vua”.
              <br />
              <br />
              <strong>
                The King Restaurant – Trải nghiệm hoàng gia, giá không xa hoa.
              </strong>
            </p>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="gallery-section">
          <h2 className="section-title">Không Gian Nhà Hàng</h2>
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

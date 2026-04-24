import React from "react";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Cột 1: Thương Hiệu */}
        <div className="footer-col brand-col">
          <h2 className="footer-logo">
            The King <span>Restaurant</span>
          </h2>
          <p className="footer-desc">
            Trải nghiệm ẩm thực hoàng gia ngay tại trung tâm thành phố. Đẳng
            cấp, tinh tế, giá không xa hoa.
          </p>
          <div className="social-links">
            <a href="#" title="Facebook"></a>
          </div>
        </div>

        {/* Cột 2: Liên Kết Nhanh */}
        <div className="footer-col links-col">
          <h4>Khám Phá</h4>
          <ul>
            <li>
              <a href="/">Trang Chủ</a>
            </li>
            <li>
              <a href="/menu">Thực Đơn</a>
            </li>
            <li>
              <a href="/booking">Đặt Bàn Ngay</a>
            </li>
            <li>
              <a href="/login">Đăng Nhập</a>
            </li>
          </ul>
        </div>

        {/* Cột 3: Thông Tin Liên Hệ */}
        <div className="footer-col contact-col">
          <h4>Liên Hệ</h4>
          <p>
            <strong>📍 Địa chỉ:</strong> 97 Man Thiện, TP Thủ Đức, TP.HCM
          </p>
          <p>
            <strong>📞 Hotline:</strong>{" "}
            <a href="tel:0862680850">0862 680 850</a>
          </p>
          <p>
            <strong>📧 Email:</strong> contact@theking.com
          </p>
          <p>
            <strong>⏰ Mở cửa:</strong> 09:00 AM - 10:30 PM
          </p>
        </div>
      </div>

      {/* Dải bản quyền dưới cùng */}
      <div className="footer-bottom">
        <hr className="footer-line" />
        <p>
          © {new Date().getFullYear()} The King Restaurant. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

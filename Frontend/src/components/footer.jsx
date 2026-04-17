import React from "react";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>
          <strong>Địa chỉ:</strong> 97, Man Thiện, Thủ Đức, TP Hồ Chí Minh
        </p>
        <p>
          <strong>Hotline:</strong> <a href="tel:0862680850">0862 680 850</a>
        </p>
        <p>
          <strong>Giờ mở cửa:</strong> 09:00 AM - 10:30 PM
        </p>

        <div className="copyright">
          <hr className="footer-line" />
          <p>© 2024 The King Restaurant. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

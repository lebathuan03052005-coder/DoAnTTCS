import React from "react";
import "./navbar.css";

const Navbar = () => {
  return (
    <header>
      <nav className="navbar">
        <div className="logo">
          <div className="main-logo">
            The King <span>Restaurant</span>
          </div>
          <span className="tagline">
            Trải nghiệm hoàng gia - Giá không xa hoa
          </span>
        </div>

        <ul className="nav-links">
          <li>
            <a href="/">Trang Chủ</a>
          </li>
          <li>
            <a href="/menu">Menu</a>
          </li>
          <li>
            <a href="/booking">Đặt Bàn</a>
          </li>
        </ul>

        <a href="/login" className="btn-book">
          Đăng nhập
        </a>
      </nav>
    </header>
  );
};

export default Navbar;

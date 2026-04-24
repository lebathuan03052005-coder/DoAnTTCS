import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem("isAdminLoggedIn");
    if (isAuth === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("adminName");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <header>
      <nav className="navbar">
        <div className="logo">
          <div className="main-logo">
            <img
              src="/logo1.png"
              alt="The King Restaurant"
              className="logo-img"
            />
            <div className="logo-text">
              The King <span>Restaurant</span>
            </div>
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

          {/* --- THÊM LỰA CHỌN ADMIN Ở ĐÂY --- */}
          {isLoggedIn && (
            <li>
              <a href="/admin" style={{ color: "rgb(180, 173, 46);#d4af37" }}>
                Quản Lý
              </a>
            </li>
          )}
        </ul>

        {isLoggedIn ? (
          <a href="#" onClick={handleLogout} className="btn-book">
            Đăng xuất
          </a>
        ) : (
          <a href="/login" className="btn-book">
            Đăng nhập
          </a>
        )}
      </nav>
    </header>
  );
};

export default Navbar;

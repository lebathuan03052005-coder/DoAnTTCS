import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
            <Link to="/">Trang Chủ</Link>
          </li>
          <li>
            <Link to="/menu">Menu</Link>
          </li>
          <li>
            <Link to="/booking">Đặt Bàn</Link>
          </li>

          {/* --- THÊM LỰA CHỌN ADMIN Ở ĐÂY --- */}
          {isLoggedIn && (
            <li>
              <Link to="/adminMenuList" style={{ color: "#d4af37" }}>
                Quản Lý
              </Link>
            </li>
          )}
        </ul>

        {isLoggedIn ? (
          <button onClick={handleLogout} className="btn-book">
            Đăng xuất
          </button>
        ) : (
          <Link to="/login" className="btn-book">
            Đăng nhập
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navbar;

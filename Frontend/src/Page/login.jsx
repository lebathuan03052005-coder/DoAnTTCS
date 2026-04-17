import React, { useState } from "react"; // 1. Thêm useState
import { useNavigate } from "react-router-dom"; // 2. Thêm useNavigate
import Navbar from "../components/navbar";
import "./login.css";

const Login = () => {
  // 3. Khai báo các thùng chứa dữ liệu (State)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // 4. Hàm xử lý khi nhấn nút Đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault(); // Ngăn trang web load lại

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success) {
        // Lưu vé vào cổng (LocalStorage)
        localStorage.setItem("isAdminLoggedIn", "true");
        localStorage.setItem("adminName", result.user.full_name);

        alert("Chào sếp " + result.user.full_name);

        // Chuyển sang trang Admin
        navigate("/admin");
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (error) {
      alert("Không kết nối được với Server Backend!");
    }
  };

  return (
    <div className="login-bg">
      <div className="bg-overlay"></div>
      <Navbar />
      <main className="login-page">
        <div className="login-box">
          <h2>Đăng nhập</h2>

          {/* 5. Gắn hàm xử lý vào sự kiện onSubmit của Form */}
          <form className="login-form" onSubmit={handleLogin}>
            <label htmlFor="email">Email hoặc Số điện thoại</label>
            <input
              id="email"
              name="email"
              type="text"
              placeholder="Nhập email hoặc số điện thoại"
              required
              // 6. Kết nối dữ liệu ô input với State
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Mật khẩu"
              required
              // 7. Kết nối dữ liệu ô input mật khẩu với State
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="login-row">
              <label className="remember">
                <input type="checkbox" /> Ghi nhớ tôi
              </label>
              <a className="forgot" href="/forgot">
                Quên mật khẩu?
              </a>
            </div>

            <div className="message" id="login-message"></div>

            <button type="submit" className="btn-submit login-btn">
              ĐĂNG NHẬP
            </button>

            <p className="signup">
              Chưa có tài khoản? <a href="/register">Đăng ký</a>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;

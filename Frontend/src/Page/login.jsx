import React from "react";
import Navbar from "../components/navbar";
import "./login.css"; // nếu bạn có CSS riêng

const Login = () => {
  return (
    <div className="login-bg">
      <div className="bg-overlay"></div>
      <Navbar />
      {/* MAIN */}
      <main className="login-page">
        <div className="login-box">
          <h2>Đăng nhập</h2>

          <form className="login-form">
            <label htmlFor="email">Email hoặc Số điện thoại</label>
            <input
              id="email"
              name="email"
              type="text"
              placeholder="Nhập email hoặc số điện thoại"
              required
            />

            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Mật khẩu"
              required
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

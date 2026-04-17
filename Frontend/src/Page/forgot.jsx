import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [message, setMessage] = useState({ text: "", isOk: false });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex(
      (u) => u.email === email.toLowerCase().trim(),
    );

    if (!isEmailVerified) {
      if (userIndex === -1) {
        setMessage({ text: "Không tìm thấy email!", isOk: false });
      } else {
        setMessage({ text: "Email hợp lệ, hãy nhập mật khẩu mới", isOk: true });
        setIsEmailVerified(true);
      }
      return;
    }

    if (newPass !== confirmPass) {
      setMessage({ text: "Mật khẩu không khớp!", isOk: false });
      return;
    }

    users[userIndex].password = newPass;
    localStorage.setItem("users", JSON.stringify(users));
    setMessage({ text: "Đổi mật khẩu thành công!", isOk: true });
    setTimeout(() => navigate("/login"), 1500);
  };

  return (
    <div className="login-bg">
      <div className="bg-overlay"></div>
      <header>
        <nav className="navbar">
          <div className="main-logo">
            The King <span>Restaurant</span>
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
          </ul>
        </nav>
      </header>
      <main className="login-page">
        <div className="login-box">
          <h2>Khôi phục mật khẩu</h2>
          <form className="login-form" onSubmit={handleSubmit}>
            <label>Email đã đăng ký</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isEmailVerified}
              required
            />

            {isEmailVerified && (
              <>
                <label>Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  required
                />
                <label>Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  required
                />
              </>
            )}
            {message.text && (
              <div
                style={{
                  color: message.isOk ? "#b7d4a0" : "#f4b6b6",
                  textAlign: "center",
                  marginBottom: "10px",
                }}
              >
                {message.text}
              </div>
            )}
            <button type="submit" className="btn-submit">
              {isEmailVerified ? "Cập nhật" : "Gửi"}
            </button>
            <p className="signup">
              Quay lại <Link to="/login">Đăng nhập</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;

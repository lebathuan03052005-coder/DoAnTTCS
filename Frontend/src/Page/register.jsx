import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [message, setMessage] = useState({ text: "", isOk: false });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) {
      setMessage({ text: "Mật khẩu không khớp!", isOk: false });
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find((u) => u.email === formData.email.toLowerCase())) {
      setMessage({ text: "Email này đã tồn tại!", isOk: false });
      return;
    }

    users.push({
      name: formData.name,
      email: formData.email.toLowerCase(),
      password: formData.password,
    });
    localStorage.setItem("users", JSON.stringify(users));
    setMessage({ text: "Đăng ký thành công!", isOk: true });
    setTimeout(() => navigate("/login"), 1200);
  };

  return (
    <div className="login-bg">
      <div className="bg-overlay"></div>
      <main className="login-page">
        <div className="login-box">
          <h2>Đăng ký</h2>
          <form className="login-form" onSubmit={handleSubmit}>
            <label>Họ và tên</label>
            <input
              type="text"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <label>Email</label>
            <input
              type="email"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
            <label>Mật khẩu</label>
            <input
              type="password"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
            <label>Xác nhận mật khẩu</label>
            <input
              type="password"
              onChange={(e) =>
                setFormData({ ...formData, confirm: e.target.value })
              }
              required
            />
            {message.text && (
              <div
                style={{
                  color: message.isOk ? "#b7d4a0" : "#f4b6b6",
                  textAlign: "center",
                }}
              >
                {message.text}
              </div>
            )}
            <button type="submit" className="btn-submit">
              ĐĂNG KÝ
            </button>
            <p className="signup">
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Register;

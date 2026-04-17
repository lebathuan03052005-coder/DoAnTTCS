import React from "react";
import Navbar from "../components/navbar";
import "./booking.css";

const Booking = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Yêu cầu đặt bàn đã được gửi (demo)");
  };

  return (
    <div className="booking-bg">
      <div className="bg-overlay"></div>
      <Navbar />

      <main className="main-content">
        <section className="booking-section">
          <div className="container">
            <h2 className="section-title">Đặt Bàn</h2>

            <div className="booking-container">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Họ và tên</label>
                    <input
                      type="text"
                      placeholder="Nhập họ tên"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="tel"
                      placeholder="Nhập số điện thoại"
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Ngày</label>
                    <input type="date" required className="form-input" />
                  </div>

                  <div className="form-group">
                    <label>Giờ</label>
                    <input type="time" required className="form-input" />
                  </div>

                  <div className="form-group">
                    <label>Số người</label>
                    <select className="form-input">
                      <option value="">Chọn số người</option>
                      <option value="1-2">1 - 2 Người</option>
                      <option value="3-4">3 - 4 Người</option>
                      <option value="5+">5+ Người</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Ghi chú</label>
                  <textarea
                    placeholder="Dị ứng, kỷ niệm..."
                    rows="4"
                    className="form-input"
                  ></textarea>
                </div>

                <button type="submit" className="btn-submit">
                  XÁC NHẬN ĐẶT BÀN
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer></footer>
    </div>
  );
};

export default Booking;

import React from "react";
import Navbar from "../components/navbar";
import "./styleBooking.css";

const Booking = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: xử lý gửi form (API call)
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
                  <input
                    type="text"
                    placeholder="Họ và tên của bạn *"
                    required
                    className="form-input"
                  />
                  <input
                    type="tel"
                    placeholder="Số điện thoại *"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <input type="date" required className="form-input" />
                  <input type="time" required className="form-input" />

                  <select className="form-input">
                    <option value="">Số người</option>
                    <option value="1-2">1 - 2 Người</option>
                    <option value="3-4">3 - 4 Người</option>
                    <option value="5+">5+ Người</option>
                  </select>
                </div>

                <textarea
                  placeholder="Ghi chú đặc biệt (Dị ứng, kỷ niệm, v.v...)"
                  rows="4"
                  className="form-input"
                ></textarea>

                <button type="submit" className="btn-submit">
                  XÁC NHẬN ĐẶT BÀN
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact"></footer>
    </div>
  );
};

export default Booking;

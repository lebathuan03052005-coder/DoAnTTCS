import React, { useState } from "react";
import Navbar from "../components/navbar";
import "./booking.css";
import Swal from "sweetalert2";

const Booking = () => {
  const [formData, setFormData] = useState({
    customer_name: "",
    email: "",
    phone: "",
    booking_date: "",
    booking_time: "",
    guests: "",
    note: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirm = await Swal.fire({
      title: "Xác nhận đặt bàn?",
      text: "Bạn sẽ nhận được thông tin chi tiết qua mail",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/reservations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          title: "Thành công",
          text: result.message,
          icon: "success",
        });

        setFormData({
          customer_name: "",
          email: "",
          phone: "",
          booking_date: "",
          booking_time: "",
          guests: "",
          note: "",
        });
      } else {
        Swal.fire({
          title: "Lỗi",
          text: result.message,
          icon: "error",
        });
      }
    } catch (error) {}
  };
  return (
    <div>
      <Navbar />
      <div className="booking-bg">
        <main className="main-content">
          <section className="booking-section">
            <div className="container">
              <h2 className="section-title" style={{ textAlign: "center" }}>
                Đặt Bàn
              </h2>
              <p className="section-description">
                Chọn thời gian và số lượng phù hợp, chúng tôi sẽ chuẩn bị bàn
                cho bạn.
              </p>
              <div className="booking-container">
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Họ và tên</label>
                      <input
                        type="tel"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        placeholder="Nhập họ tên"
                        required
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Số điện thoại</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Nhập số điện thoại"
                        required
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Nhập email"
                        required
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Ngày</label>
                      <input
                        type="date"
                        name="booking_date"
                        value={formData.booking_date}
                        onChange={handleChange}
                        required
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Giờ</label>
                      <input
                        type="time"
                        name="booking_time"
                        value={formData.booking_time}
                        onChange={handleChange}
                        required
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Số người</label>
                      <select
                        name="guests"
                        value={formData.guests}
                        onChange={handleChange}
                        required
                        className="form-input"
                      >
                        <option value="">Chọn số người</option>
                        <option value="1">1 Người</option>
                        <option value="2">2 Người</option>
                        <option value="3">3 Người</option>
                        <option value="4">4 Người</option>
                        <option value="5">5+ Người</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Ghi chú</label>
                    <textarea
                      placeholder="Dị ứng, kỷ niệm..."
                      rows="4"
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
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
      </div>
    </div>
  );
};

export default Booking;

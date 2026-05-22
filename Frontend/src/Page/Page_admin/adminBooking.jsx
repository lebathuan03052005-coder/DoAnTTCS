import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import Admin from "./admin";
import "./adminBooking.css";

const API_BASE = "http://localhost:5000/api";

export default function AdminBooking() {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho việc xếp khách
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [assignTableNumber, setAssignTableNumber] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [processingIds, setProcessingIds] = useState([]);

  // State cho việc Quản lý Bàn (Xem chi tiết, Đổi style, Xóa bàn)
  const [selectedTableDetails, setSelectedTableDetails] = useState(null);
  const [editTableStyle, setEditTableStyle] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchReservations(), fetchTables(), fetchStyles()]);
    setLoading(false);
  };

  const fetchReservations = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/reservations`);
      const data = await response.json();

      let resData = Array.isArray(data) ? data : data.data || [];

      // Sắp xếp ngày mới nhất lên trên, cùng ngày thì giờ xếp tăng dần
      resData.sort((a, b) => {
        const dateA = new Date(a.booking_date || 0).getTime();
        const dateB = new Date(b.booking_date || 0).getTime();
        if (dateA !== dateB) return dateB - dateA;

        const timeA = a.booking_time || "00:00";
        const timeB = b.booking_time || "00:00";
        return timeA.localeCompare(timeB);
      });
      setReservations(resData);
    } catch (err) {
      console.error(err);
      setReservations([]);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/restaurant_tables`);
      const data = await response.json();
      setTables(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStyles = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/table_styles`);
      const data = await response.json();
      setStyles(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const availableTables = tables.filter(
    (table) => table.status === "Con trong",
  );

  // LOGIC ĐƠN ĐẶT BÀN (XẾP BÀN, DUYỆT, XÓA)

  const handleAssignTable = async () => {
    if (!selectedReservation || !assignTableNumber) {
      setFeedback("Vui lòng chọn bàn trống để xếp khách.");
      return;
    }
    try {
      const tableResponse = await fetch(
        `${API_BASE}/admin/restaurant_tables/${assignTableNumber}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Da dat" }),
        },
      );
      const tableData = await tableResponse.json();
      if (!tableData.success) {
        setFeedback(tableData.message || "Cập nhật trạng thái bàn thất bại.");
        return;
      }
      setFeedback("Xếp bàn thành công.");
      setTimeout(() => {
        setSelectedReservation(null);
        setFeedback(null);
      }, 1200);
      loadData();
    } catch (err) {
      console.error(err);
      setFeedback("Lỗi khi cập nhật bàn.");
    }
  };

  const handleReviewReservation = async (reservation, isApproved) => {
    const newStatus = isApproved ? "Confirmed" : "Cancelled";
    const confirmMessage = isApproved
      ? `DUYỆT đơn của khách ${reservation.customer_name}?`
      : `TỪ CHỐI đơn của khách ${reservation.customer_name}?`;

    if (!window.confirm(confirmMessage)) return;
    setProcessingIds((p) => [...p, reservation.id]);

    try {
      const response = await fetch(
        `${API_BASE}/admin/reservations/${reservation.id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
            email: reservation.email || reservation.email_address,
            customer_name: reservation.customer_name,
            booking_date: reservation.booking_date,
            booking_time: reservation.booking_time,
            approved: isApproved,
          }),
        },
      );
      const data = await response.json();
      if (data.success) {
        alert(`Đã ${isApproved ? "Duyệt" : "Từ chối"} thành công!`);
        await fetchReservations();
      } else {
        alert(data.message || "Thất bại.");
      }
    } catch (err) {
      alert("Lỗi kết nối.");
    } finally {
      setProcessingIds((p) => p.filter((id) => id !== reservation.id));
    }
  };
  // NÚT XÓA ĐƠN ĐẶT BÀN MỚI
  const handleDeleteReservation = async (id) => {
    if (
      !window.confirm(
        " BẠN CÓ CHẮC CHẮN MUỐN XÓA ĐƠN NÀY KHÔNG? Hành động này không thể hoàn tác!",
      )
    )
      return;
    try {
      const response = await fetch(`${API_BASE}/admin/reservations/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setReservations((prev) => prev.filter((r) => r.id !== id));
        alert("Đã xóa đơn đặt bàn thành công.");
      } else {
        alert(data.message || "Không thể xóa đơn.");
      }
    } catch (err) {
      alert("Lỗi khi xóa đơn.");
    }
  };

  // --- HELPERS ---
  const formatDisplayDate = (value) => {
    if (!value) return "-";
    const dateValue = new Date(value);
    return Number.isNaN(dateValue.getTime())
      ? value
      : dateValue.toLocaleDateString("vi-VN");
  };

  const formatDisplayTime = (value) => {
    if (!value) return "-";
    const str = String(value);
    return str.includes("T") ? str.split("T")[1].slice(0, 5) : str.slice(0, 5);
  };

  const normalizeReservationStatus = (res) => {
    const text = String(res.status ?? res.approved ?? "pending").toLowerCase();
    if (text.includes("pending") || text.includes("chờ")) return "Chờ duyệt";
    if (text.includes("confirmed") || text.includes("đã duyệt"))
      return "Đã duyệt";
    if (text.includes("cancelled") || text.includes("từ chối"))
      return "Từ chối";
    if (text.includes("completed")) return "Hoàn thành";
    return "Chờ duyệt";
  };

  return (
    <div>
      <Navbar />
      <div className="admin-layout">
        <Admin />
        <div className="admin-content admin-booking-page">
          <div className="admin-panel-header">
            <div>
              <h2>Quản lý đặt bàn</h2>
              <p>Duyệt đơn, xếp bàn, cập nhật style bàn và dọn dẹp dữ liệu.</p>
            </div>
            <div className="action-row">
              <button className="btn-secondary" onClick={loadData}>
                Làm mới
              </button>
            </div>
          </div>

          <div className="booking-grid">
            {/* CỘT TRÁI: DANH SÁCH ĐƠN ĐẶT */}
            <section className="booking-list card-block">
              <div className="section-title">
                <h3>Danh sách đặt bàn</h3>
                <span>{reservations.length} khách đã đặt</span>
              </div>
              {loading ? (
                <div className="empty-state">Đang tải dữ liệu...</div>
              ) : reservations.length === 0 ? (
                <div className="empty-state">Không có đặt bàn nào.</div>
              ) : (
                <div className="table-wrapper">
                  <table className="booking-table">
                    <thead>
                      <tr>
                        <th>Khách hàng</th>
                        <th>Điện thoại</th>
                        <th>Ghi chú</th>
                        <th>Giờ</th>
                        <th>Khách</th>
                        <th>Trạng thái</th>
                        <th>Bàn</th>
                        <th style={{ minWidth: "220px" }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((reservation, index) => {
                        const currentDateStr = formatDisplayDate(
                          reservation.booking_date,
                        );
                        const prevDateStr =
                          index > 0
                            ? formatDisplayDate(
                                reservations[index - 1].booking_date,
                              )
                            : null;
                        const isNewDay = currentDateStr !== prevDateStr;

                        return (
                          <React.Fragment key={reservation.id}>
                            {isNewDay && (
                              <tr
                                style={{
                                  backgroundColor: "#f0f4f8",
                                  borderTop: "2px solid #cbd5e1",
                                }}
                              >
                                <td
                                  colSpan="8"
                                  style={{
                                    padding: "10px",
                                    fontWeight: "bold",
                                    color: "#1e293b",
                                    textAlign: "left",
                                  }}
                                >
                                  📅 Ngày: {currentDateStr}
                                </td>
                              </tr>
                            )}
                            <tr>
                              <td>{reservation.customer_name || "-"}</td>
                              <td>{reservation.phone || "-"}</td>
                              <td
                                style={{
                                  maxWidth: "150px",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={reservation.note}
                              >
                                {reservation.note || "Không"}
                              </td>
                              <td>
                                <strong>
                                  {formatDisplayTime(reservation.booking_time)}
                                </strong>
                              </td>
                              <td>{reservation.guests || 1}</td>
                              <td>
                                <span
                                  className={`status-badge ${normalizeReservationStatus(reservation) === "Chờ duyệt" ? "status-pending" : normalizeReservationStatus(reservation) === "Đã duyệt" ? "status-approved" : "status-rejected"}`}
                                >
                                  {normalizeReservationStatus(reservation)}
                                </span>
                              </td>
                              <td>
                                {reservation.assigned_table ||
                                  reservation.table_number ||
                                  "Chưa xếp"}
                              </td>
                              <td className="table-actions">
                                <button
                                  className="btn-secondary"
                                  onClick={() => {
                                    setSelectedReservation(reservation);
                                    setAssignTableNumber("");
                                  }}
                                  disabled={
                                    normalizeReservationStatus(reservation) !==
                                    "Chờ duyệt"
                                  }
                                >
                                  Xếp
                                </button>
                                <button
                                  className="btn-approve"
                                  onClick={() =>
                                    handleReviewReservation(reservation, true)
                                  }
                                  disabled={
                                    normalizeReservationStatus(reservation) !==
                                    "Chờ duyệt"
                                  }
                                >
                                  Duyệt
                                </button>
                                {/* NÚT XÓA ĐƠN MỚI THÊM */}
                                <button
                                  className="btn-reject"
                                  onClick={() =>
                                    handleDeleteReservation(reservation.id)
                                  }
                                  style={{ backgroundColor: "#dc2626" }}
                                >
                                  Xóa
                                </button>
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* 1. MODAL XẾP BÀN CHO KHÁCH */}
      {selectedReservation && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>Xếp khách: {selectedReservation.customer_name}</h3>
              <button
                className="close-button"
                onClick={() => setSelectedReservation(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <label>Chọn bàn trống</label>
              <select
                value={assignTableNumber}
                onChange={(e) => setAssignTableNumber(e.target.value)}
              >
                <option value="">-- Chọn bàn --</option>
                {availableTables.map((table) => (
                  <option key={table.table_number} value={table.table_number}>
                    Bàn {table.table_number}
                  </option>
                ))}
              </select>
              {feedback && <p className="modal-feedback">{feedback}</p>}
            </div>
            <div className="modal-actions">
              <button
                className="btn-outline"
                onClick={() => setSelectedReservation(null)}
              >
                Hủy
              </button>
              <button className="btn-primary" onClick={handleAssignTable}>
                Xác nhận xếp bàn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL CHI TIẾT & QUẢN LÝ TỪNG BÀN */}
      {selectedTableDetails && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>Chi tiết Bàn {selectedTableDetails.table_number}</h3>
              <button
                className="close-button"
                onClick={() => setSelectedTableDetails(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>Trạng thái hiện tại:</strong>{" "}
                {selectedTableDetails.status === "Con trong"
                  ? "Đang trống"
                  : "Có khách"}
              </p>
              <p>
                <strong>Style đang dùng:</strong>{" "}
                {selectedTableDetails.table_style ||
                  selectedTableDetails.style_name ||
                  "Chưa có"}
              </p>

              <label style={{ marginTop: "15px", display: "block" }}>
                Thay đổi Style cho bàn này:
              </label>
              <select
                value={editTableStyle}
                onChange={(e) => setEditTableStyle(e.target.value)}
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              >
                <option value="">-- Chọn Style --</option>
                {styles.map((style) => (
                  <option
                    key={style.id || style.style_name}
                    value={style.style_name}
                  >
                    {style.style_name}
                  </option>
                ))}
              </select>
            </div>
            <div
              className="modal-actions"
              style={{ justifyContent: "space-between" }}
            >
              <button
                className="btn-reject"
                style={{ backgroundColor: "#dc2626" }}
                onClick={handleDeleteTable}
              >
                Xóa bàn này
              </button>
              <div>
                <button
                  className="btn-outline"
                  style={{ marginRight: "10px" }}
                  onClick={() => setSelectedTableDetails(null)}
                >
                  Đóng
                </button>
                <button
                  className="btn-primary"
                  onClick={handleUpdateTableStyle}
                >
                  Lưu Style
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

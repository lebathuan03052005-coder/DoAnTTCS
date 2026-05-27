import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import Admin from "./admin";

// ── IMPORT CÁC FILE CSS RIÊNG CỦA BẠN ─────────────────────────────────────────
import "./adminCommon.css";
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

  // State cho việc Quản lý Bàn
  const [selectedTableDetails, setSelectedTableDetails] = useState(null);
  const [editTableStyle, setEditTableStyle] = useState("");

  // State cho việc Xem chi tiết đơn
  const [viewDetailsModal, setViewDetailsModal] = useState(null);

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

      // Sắp xếp ngày mới lên đầu, cùng ngày thì giờ sớm lên đầu
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
      console.error("[AdminBooking] Lỗi lấy đơn đặt bàn:", err);
      setReservations([]);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/restaurant_tables`);
      const data = await response.json();
      setTables(data.data || []);
    } catch (err) {
      console.error("[AdminBooking] Lỗi lấy danh sách bàn:", err);
    }
  };

  const fetchStyles = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/table_styles`);
      const data = await response.json();
      setStyles(data.data || []);
    } catch (err) {
      console.error("[AdminBooking] Lỗi lấy danh sách style bàn:", err);
    }
  };

  const availableTables = tables.filter(
    (table) => table.status === "Con trong",
  );

  // ==========================================================================
  // LOGIC XỬ LÝ HÀNH ĐỘNG
  // ==========================================================================
  const openAssignModal = (reservation) => {
    setSelectedReservation(reservation);
    setAssignTableNumber("");
    setFeedback(null);
  };

  const handleAssignTable = async () => {
    if (!assignTableNumber) {
      setFeedback("Vui lòng chọn một bàn trống!");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/admin/reservations/${selectedReservation.id}/assign-table`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ table_number: assignTableNumber }),
        },
      );

      const data = await response.json();

      if (data.success) {
        alert("🎉 Xếp bàn thành công!");
        setSelectedReservation(null);
        loadData(); // Tải lại dữ liệu để cập nhật số bàn
      } else {
        alert("Thất bại: " + data.message);
        setFeedback(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối API xếp bàn.");
    }
  };

  const handleReviewReservation = async (reservation, isApproved) => {
    if (isApproved) {
      const hasTable =
        reservation.table_number ||
        reservation.assigned_table ||
        reservation.table_id;
      if (!hasTable) {
        alert("⚠️ Vui lòng bấm [Xếp] bàn cho khách trước khi Duyệt đơn!");
        return;
      }
    }

    const newStatus = isApproved ? "Confirmed" : "Cancelled";
    const confirmMessage = isApproved
      ? `Bạn muốn DUYỆT đơn của khách: ${reservation.customer_name}?`
      : `Bạn muốn TỪ CHỐI đơn của khách: ${reservation.customer_name}?`;

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
        alert(`Đã ${isApproved ? "Duyệt" : "Từ chối"} đơn thành công!`);
        await fetchReservations();
      } else {
        alert(data.message || "Xử lý trạng thái thất bại.");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ khi duyệt.");
    } finally {
      setProcessingIds((p) => p.filter((id) => id !== reservation.id));
    }
  };

  const handleDeleteReservation = async (id) => {
    if (
      !window.confirm(
        "🚨 HÀNH ĐỘNG NÀY KHÔNG THỂ HOÀN TÁC! Bạn có chắc muốn xóa đơn này?",
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
        alert("Đã dọn dẹp dữ liệu đơn thành công.");
      } else {
        alert(data.message || "Không thể xóa.");
      }
    } catch (err) {
      alert("Lỗi kết nối khi xóa.");
    }
  };

  const handleUpdateTableStyle = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/admin/restaurant_tables/${selectedTableDetails.id}/style`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ table_style: editTableStyle }),
        },
      );
      const data = await response.json();
      if (data.success) {
        alert("Cập nhật style không gian bàn thành công!");
        setSelectedTableDetails(null);
        loadData();
      }
    } catch (err) {
      alert("Lỗi cập nhật cấu trúc style.");
    }
  };

  const handleDeleteTable = async () => {
    if (!window.confirm("Xóa bỏ bàn này hoàn toàn khỏi sơ đồ nhà hàng?"))
      return;
    try {
      const response = await fetch(
        `${API_BASE}/admin/restaurant_tables/${selectedTableDetails.id}`,
        {
          method: "DELETE",
        },
      );
      const data = await response.json();
      if (data.success) {
        alert("Đã gỡ bàn thành công.");
        setSelectedTableDetails(null);
        loadData();
      }
    } catch (err) {
      alert("Lỗi hệ thống khi gỡ bàn.");
    }
  };

  const openDetails = (reservation) => {
    setViewDetailsModal(reservation);
  };

  // ── HELPERS FORMAT VĂN BẢN ──────────────────────────────────────────────────
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

  const getStatusClass = (status) => {
    const normalized = status.toLowerCase();
    if (normalized.includes("đã duyệt")) return "status-approved";
    if (normalized.includes("từ chối")) return "status-rejected";
    return "status-pending";
  };

  return (
    <div>
      <Navbar />
      <div className="admin-layout">
        <Admin />
        <div className="admin-content admin-booking-page">
          {/* Header Bảng Điều Khiển */}
          <div className="admin-panel-header">
            <div>
              <h2>Quản lý đặt bàn</h2>
              <p>
                Duyệt đơn, xếp bàn trực quan, đồng bộ hóa dữ liệu khách hàng hệ
                thống.
              </p>
            </div>
            <div className="action-row">
              <button className="btn-secondary" onClick={loadData}>
                Làm mới
              </button>
            </div>
          </div>

          {/* Grid Nội Dung Khối Danh Sách */}
          <div className="booking-grid">
            <section className="booking-list card-block">
              <div
                className="section-title"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3>Danh sách khách hàng đặt bàn</h3>
                <span>
                  Có <strong>{reservations.length}</strong> lượt bản ghi
                </span>
              </div>

              {loading ? (
                <div className="empty-state">
                  Đang đồng bộ dữ liệu từ server cơ sở...
                </div>
              ) : reservations.length === 0 ? (
                <div className="empty-state">
                  Hiện tại không có dữ liệu đơn đặt bàn nào được ghi nhận.
                </div>
              ) : (
                <div className="table-wrapper">
                  <table
                    className="booking-table"
                    style={{ tableLayout: "fixed", width: "1200px" }}
                  >
                    <thead>
                      <tr>
                        <th style={{ width: "12%" }}>Khách hàng</th>
                        <th style={{ width: "11%" }}>Điện thoại</th>
                        <th style={{ width: "18%" }}>Ghi chú đặc biệt</th>
                        <th style={{ width: "7%" }}>Giờ</th>
                        <th style={{ width: "6%" }}>Khách</th>
                        <th style={{ width: "10%" }}>Trạng thái</th>
                        <th style={{ width: "8%" }}>Mã bàn</th>
                        <th style={{ width: "28%", textAlign: "center" }}>
                          Hành động xử lý
                        </th>
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

                        const statusText =
                          normalizeReservationStatus(reservation);

                        return (
                          <React.Fragment key={reservation.id}>
                            {/* Thanh phân cách theo từng Ngày riêng biệt */}
                            {isNewDay && (
                              <tr className="date-separator-row">
                                <td
                                  colSpan="8"
                                  className="date-separator-cell"
                                  style={{
                                    padding: "12px 16px",
                                    fontWeight: "bold",
                                    backgroundColor: "#edf4fc",
                                    borderTop: "2px solid #cbd5e1",
                                  }}
                                >
                                  🗓️ Lịch đặt bàn ngày: {currentDateStr}
                                </td>
                              </tr>
                            )}

                            {/* Dòng dữ liệu chính */}
                            <tr>
                              <td
                                style={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={reservation.customer_name}
                              >
                                {reservation.customer_name || "-"}
                              </td>
                              <td>{reservation.phone || "-"}</td>
                              <td
                                style={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={reservation.note}
                              >
                                {reservation.note || "Không có yêu cầu"}
                              </td>
                              <td>
                                <strong>
                                  {formatDisplayTime(reservation.booking_time)}
                                </strong>
                              </td>
                              <td>{reservation.guests || 1} người</td>
                              <td>
                                <span
                                  className={`status-badge ${getStatusClass(statusText)}`}
                                >
                                  {statusText}
                                </span>
                              </td>
                              <td>
                                <strong>
                                  {reservation.assigned_table ||
                                    reservation.table_number ||
                                    "Trống"}
                                </strong>
                              </td>
                              <td className="table-actions">
                                <button
                                  className="btn-outline btn-details"
                                  onClick={() => openDetails(reservation)}
                                >
                                  Chi tiết
                                </button>
                                <button
                                  className="btn-secondary"
                                  onClick={() => openAssignModal(reservation)}
                                  disabled={statusText === "Từ chối"}
                                >
                                  Xếp
                                </button>
                                <button
                                  className="btn-approve"
                                  onClick={() =>
                                    handleReviewReservation(reservation, true)
                                  }
                                  disabled={statusText !== "Chờ duyệt"}
                                >
                                  Duyệt
                                </button>
                                <button
                                  className="btn-reject btn-delete"
                                  onClick={() =>
                                    handleDeleteReservation(reservation.id)
                                  }
                                  style={{
                                    backgroundColor: "#dc2626",
                                    color: "#fff",
                                  }}
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

      {/* ── MODAL 1: XẾP BÀN TRỐNG CHO KHÁCH KHÁCH ──────────────────────────────── */}
      {selectedReservation && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>Xếp mã bàn cho: {selectedReservation.customer_name}</h3>
              <button
                className="close-button"
                onClick={() => setSelectedReservation(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <label
                style={{
                  fontWeight: 600,
                  marginBottom: "8px",
                  display: "block",
                }}
              >
                Danh sách các bàn đang trống hiện tại:
              </label>
              <select
                value={assignTableNumber}
                onChange={(e) => setAssignTableNumber(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px" }}
              >
                <option value="">-- Click chọn vị trí bàn --</option>
                {availableTables.map((table) => (
                  <option key={table.table_number} value={table.table_number}>
                    Bàn số {table.table_number}
                  </option>
                ))}
              </select>
              {feedback && (
                <p
                  className="modal-feedback"
                  style={{
                    color: "#ef4444",
                    marginTop: "8px",
                    fontSize: "13px",
                  }}
                >
                  {feedback}
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button
                className="btn-outline"
                onClick={() => setSelectedReservation(null)}
              >
                Hủy bỏ
              </button>
              <button className="btn-primary" onClick={handleAssignTable}>
                Lưu cấu hình xếp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: XEM TOÀN BỘ CHI TIẾT ĐƠN ĐẶT ────────────────────────────────── */}
      {viewDetailsModal && (
        <div className="admin-modal-backdrop">
          <div
            className="admin-modal details-modal"
            style={{ maxWidth: "550px" }}
          >
            <div className="modal-header">
              <h3>Hồ sơ chi tiết đơn đặt bàn</h3>
              <button
                className="close-button"
                onClick={() => setViewDetailsModal(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div
                style={{
                  backgroundColor: "#f1f5f9",
                  padding: "20px",
                  borderRadius: "12px",
                  color: "#1e293b",
                  lineHeight: "1.8",
                }}
              >
                <p style={{ margin: "0 0 8px 0" }}>
                  <strong>👤 Tên khách hàng:</strong>{" "}
                  {viewDetailsModal.customer_name}
                </p>
                <p style={{ margin: "0 0 8px 0" }}>
                  <strong>📞 Số điện thoại:</strong> {viewDetailsModal.phone}
                </p>
                <p style={{ margin: "0 0 8px 0" }}>
                  <strong>📧 Địa chỉ Email:</strong>{" "}
                  {viewDetailsModal.email || "Không cung cấp"}
                </p>
                <p style={{ margin: "0 0 8px 0" }}>
                  <strong>📅 Lịch hẹn:</strong> Ngày{" "}
                  {formatDisplayDate(viewDetailsModal.booking_date)} vào lúc{" "}
                  {formatDisplayTime(viewDetailsModal.booking_time)}
                </p>
                <p style={{ margin: "0 0 8px 0" }}>
                  <strong>👥 Số lượng khách đến:</strong>{" "}
                  {viewDetailsModal.guests} người lớn
                </p>
                <p style={{ margin: "0 0 8px 0" }}>
                  <strong>📝 Nội dung ghi chú:</strong>{" "}
                  {viewDetailsModal.note ||
                    "Không có yêu cầu đặc biệt nào từ khách"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>🪑 Trạng thái vị trí bàn:</strong> Bàn số{" "}
                  {viewDetailsModal.assigned_table ||
                    viewDetailsModal.table_number ||
                    "Chưa được điều phối"}
                </p>
              </div>
            </div>
            <div className="modal-actions" style={{ justifyContent: "center" }}>
              <button
                className="btn-primary"
                onClick={() => setViewDetailsModal(null)}
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

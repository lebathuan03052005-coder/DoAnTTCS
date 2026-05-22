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

  // ==========================================
  // LOGIC ĐƠN ĐẶT BÀN (XẾP BÀN, DUYỆT, XÓA)
  // ==========================================
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
      // Chỉ cần gọi ĐÚNG 1 API duy nhất này!
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
        loadData(); // Cập nhật lại toàn bộ bảng và danh sách bàn
      } else {
        alert(" Lỗi: " + data.message);
        setFeedback(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi kết nối API! Hãy kiểm tra Server Backend.");
      setFeedback("Lỗi kết nối đến máy chủ.");
    }
  };

  const handleReviewReservation = async (reservation, isApproved) => {
    if (isApproved) {
      const hasTable =
        reservation.table_number ||
        reservation.assigned_table ||
        reservation.table_id;
      if (!hasTable) {
        alert(
          "⚠️ CHÚ Ý: Vui lòng [Xếp bàn] cho khách hàng này trước khi bấm Duyệt đơn!",
        );
        return;
      }
    }

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

  const handleDeleteReservation = async (id) => {
    if (
      !window.confirm(
        "🚨 BẠN CÓ CHẮC CHẮN MUỐN XÓA ĐƠN NÀY KHÔNG? Hành động này không thể hoàn tác!",
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

  // ==========================================
  // HÀM MỚI: XEM CHI TIẾT
  // ==========================================
  const openDetails = (reservation) => {
    setViewDetailsModal(reservation);
  };

  // ==========================================
  // LOGIC CHI TIẾT BÀN CỘT PHẢI
  // ==========================================
  const openTableDetailsModal = (table) => {
    setSelectedTableDetails(table);
    setEditTableStyle(table.table_style || table.style_name || "");
  };

  const handleUpdateTableStyle = async () => {
    if (!selectedTableDetails || !editTableStyle) return;
    try {
      const response = await fetch(
        `${API_BASE}/admin/restaurant_tables/${selectedTableDetails.table_number}/style`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ style_name: editTableStyle }),
        },
      );
      const data = await response.json();
      if (data.success) {
        alert("Đã cập nhật Style cho bàn thành công!");
        setSelectedTableDetails(null);
        fetchTables();
      } else {
        alert(data.message || "Cập nhật Style thất bại.");
      }
    } catch (err) {
      alert("Lỗi kết nối khi cập nhật Style.");
    }
  };

  const handleDeleteTable = async () => {
    if (!window.confirm(`XÓA Bàn số ${selectedTableDetails.table_number}?`))
      return;
    try {
      const response = await fetch(
        `${API_BASE}/admin/restaurant_tables/${selectedTableDetails.table_number}`,
        { method: "DELETE" },
      );
      const data = await response.json();
      if (data.success) {
        alert("Xóa bàn thành công.");
        setSelectedTableDetails(null);
        fetchTables();
      } else {
        alert(data.message || "Xóa bàn thất bại.");
      }
    } catch (err) {
      alert("Lỗi kết nối khi xóa bàn.");
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
                  <table
                    className="booking-table"
                    style={{ tableLayout: "fixed", width: "1200px" }}
                  >
                    <thead>
                      <tr>
                        <th style={{ width: "16%" }}>Khách hàng</th>
                        <th style={{ width: "12%" }}>Điện thoại</th>
                        <th style={{ width: "18%" }}>Ghi chú</th>
                        <th style={{ width: "8%" }}>Giờ</th>
                        <th style={{ width: "8%" }}>Khách</th>
                        <th style={{ width: "13%" }}>Trạng thái</th>
                        <th style={{ width: "8%" }}>Bàn</th>
                        <th style={{ width: "17%", textAlign: "center" }}>
                          Hành động
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

                        return (
                          <React.Fragment key={reservation.id}>
                            {isNewDay && (
                              <tr className="date-separator-row">
                                <td
                                  colSpan="8"
                                  className="date-separator-cell"
                                  style={{
                                    padding: "10px",
                                    fontWeight: "bold",
                                    backgroundColor: "#f0f4f8",
                                    borderTop: "2px solid #cbd5e1",
                                  }}
                                >
                                  📅 Ngày: {currentDateStr}
                                </td>
                              </tr>
                            )}
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
                                className="note-cell"
                                style={{
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
                                  className={`status-badge ${getStatusClass(normalizeReservationStatus(reservation))}`}
                                >
                                  {normalizeReservationStatus(reservation)}
                                </span>
                              </td>
                              <td>
                                {reservation.assigned_table ||
                                  reservation.table_number ||
                                  "Chưa xếp"}
                              </td>

                              <td
                                className="table-actions"
                                style={{ justifyContent: "center" }}
                              >
                                <button
                                  className="btn-outline btn-details"
                                  onClick={() => openDetails(reservation)}
                                >
                                  Chi tiết
                                </button>
                                <button
                                  className="btn-secondary"
                                  onClick={() => openAssignModal(reservation)}
                                  disabled={
                                    normalizeReservationStatus(reservation) ===
                                    "Từ chối"
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
                                <button
                                  className="btn-reject btn-delete"
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

      {/* 2. MODAL CHI TIẾT ĐƠN (Đã bỏ phần nhập ghi chú style) */}
      {viewDetailsModal && (
        <div className="admin-modal-backdrop">
          <div
            className="admin-modal details-modal"
            style={{ maxWidth: "550px" }}
          >
            <div className="modal-header">
              <h3>Chi tiết đơn đặt bàn</h3>
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
                  padding: "16px 20px",
                  borderRadius: "12px",
                  marginBottom: "10px",
                }}
              >
                <p style={{ margin: "0 0 10px 0" }}>
                  <strong>Khách hàng:</strong> {viewDetailsModal.customer_name}
                </p>
                <p style={{ margin: "0 0 10px 0" }}>
                  <strong>Số điện thoại:</strong> {viewDetailsModal.phone}
                </p>
                <p style={{ margin: "0 0 10px 0" }}>
                  <strong>Ngày & Giờ:</strong>{" "}
                  {formatDisplayDate(viewDetailsModal.booking_date)} lúc{" "}
                  {formatDisplayTime(viewDetailsModal.booking_time)}
                </p>
                <p style={{ margin: "0 0 10px 0" }}>
                  <strong>Số người:</strong> {viewDetailsModal.guests} người
                </p>
                <p style={{ margin: "0 0 10px 0" }}>
                  <strong>Ghi chú:</strong>{" "}
                  {viewDetailsModal.note || "Không có"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Bàn đã xếp:</strong>{" "}
                  {viewDetailsModal.assigned_table ||
                    viewDetailsModal.table_number ||
                    "Chưa xếp"}
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

      {/* 3. MODAL CHI TIẾT & QUẢN LÝ TỪNG BÀN */}
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
                <strong>Trạng thái:</strong>{" "}
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
                Xóa bàn
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

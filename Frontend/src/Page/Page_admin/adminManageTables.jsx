import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import "./adminManageTables.css";
import Admin from "./admin";
const AdminManageTables = () => {
  const [filterType, setFilterType] = useState("all");
  const [tables, setTables] = useState([]);
  const [styles, setStyles] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );

  // State điều khiển Modal cập nhật
  const [selectedTable, setSelectedTable] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [newStyleId, setNewStyleId] = useState(null);

  const fetchTables = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/restaurant_tables?date=${selectedDate}`,
      );
      const result = await response.json();

      if (result.success) {
        console.log("Dữ liệu bàn:", result.data);
        setTables(result.data);
      } else {
        console.error("Lỗi:", result.message);
      }
    } catch (error) {
      console.error("Không kết nối được Backend:", error);
    }
  };
  // Gọi API
  useEffect(() => {
    fetchTables();
    // fetch styles for selection (only once)
    const fetchStyles = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/table_styles");
        const data = await res.json();
        if (data.success) setStyles(data.data);
      } catch (err) {
        console.error("Không lấy được styles:", err);
      }
    };
    fetchStyles();
  }, [selectedDate]);

  // Filter theo trạng thái + khu vực
  const filteredTables = tables.filter((table) => {
    if (filterType === "all") return true;
    if (filterType === "available") return table.status === "Con trong";
    if (filterType === "occupied") return table.status === "Dang su dung";
    if (filterType === "reserved") return table.status === "Da dat";
    if (filterType === "indoor") return table.location !== "Ngoai san";
    if (filterType === "outdoor") return table.location === "Ngoai san";
    return true;
  });

  //  Map status -> class màu
  const getStatusClass = (status) => {
    switch (status) {
      case "Con trong":
        return "available";
      case "Dang su dung":
        return "occupied";
      case "Da dat":
        return "reserved";
      default:
        return "unknown";
    }
  };

  // Mở modal cập nhật trạng thái bàn
  const handleOpenModal = (table) => {
    setSelectedTable(table);
    setNewStatus(table.status);
    setNewStyleId(table.style_id || null);
  };

  // Đóng modal
  const handleCloseModal = () => {
    setSelectedTable(null);
  };

  const handleUpdateStatus = async () => {
    // 🌟 Chặn logic: Nếu từ Đã đặt mà cố tình chuyển về Còn trống
    if (selectedTable.status === "Da dat" && newStatus === "Con trong") {
      alert(
        "Không thể chuyển trực tiếp từ trạng thái 'Đã đặt' về 'Còn trống'!",
      );
      return; // Dừng hàm, không gửi API lên backend
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/restaurant_tables/${selectedTable.table_number}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
            style_id: newStyleId,
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        await fetchTables();
        handleCloseModal();
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (error) {
      alert("Không kết nối được Backend!");
    }
  };

  return (
    <div className="admin-layoutTables">
      <Admin />

      <div className="main-content-tables">
        <Navbar />
        <main>
          <div className="admin-tables-container">
            <h2 className="admin-tables-title">Sơ Đồ Bàn Nhà Hàng</h2>
            <div className="table-date-picker">
              <label htmlFor="date-select" className="table-date-label">
                Chọn ngày:
              </label>
              <input
                id="date-select"
                type="date"
                className="table-date-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            {/*  Filter */}
            <div className="filter-group">
              <button
                className={`filter-btn ${filterType === "all" ? "active" : ""}`}
                onClick={() => setFilterType("all")}
              >
                Tất cả
              </button>

              <button
                className={`filter-btn ${filterType === "available" ? "active" : ""}`}
                onClick={() => setFilterType("available")}
              >
                Còn trống
              </button>

              <button
                className={`filter-btn ${filterType === "occupied" ? "active" : ""}`}
                onClick={() => setFilterType("occupied")}
              >
                Đang sử dụng
              </button>

              <button
                className={`filter-btn ${filterType === "reserved" ? "active" : ""}`}
                onClick={() => setFilterType("reserved")}
              >
                Đã đặt
              </button>

              <button
                className={`filter-btn ${filterType === "indoor" ? "active" : ""}`}
                onClick={() => setFilterType("indoor")}
              >
                Trong nhà
              </button>

              <button
                className={`filter-btn ${filterType === "outdoor" ? "active" : ""}`}
                onClick={() => setFilterType("outdoor")}
              >
                Ngoài sân
              </button>
            </div>

            {/*  GRID */}
            <div className="tables-grid">
              {filteredTables.map((table) => (
                <div
                  key={table.table_number}
                  className={`table-card ${getStatusClass(table.status)}`}
                  onClick={() => handleOpenModal(table)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="table-header">
                    <h3>{table.table_number}</h3>
                    <span className="table-location">{table.location}</span>
                  </div>

                  <div className="table-body">
                    <p className="status-text">{table.status}</p>

                    {table.customer_name && (
                      <p className="customer-text">
                        <strong>Tên:</strong> {table.customer_name}
                      </p>
                    )}

                    {table.phone && (
                      <p className="phone-text">
                        <strong>SĐT:</strong> {table.phone}
                      </p>
                    )}
                    {table.booking_time && (
                      <p className="time-text">
                        <strong>Giờ đặt:</strong>{" "}
                        {table.booking_time.split("T")[1]?.slice(0, 5)}
                      </p>
                    )}

                    {table.note && (
                      <p className="note-text">
                        <strong>Ghi chú:</strong> {table.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/*  MODAL CẬP NHẬT TRẠNG THÁI */}
          {selectedTable && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3
                  style={{
                    marginTop: "0",
                    color: "#2c3e50",
                    marginBottom: "20px",
                  }}
                >
                  Cập nhật Bàn {selectedTable.table_number}
                </h3>

                {selectedTable.note && (
                  <div
                    style={{
                      backgroundColor: "#f5f5f5",
                      padding: "12px",
                      borderRadius: "6px",
                      marginBottom: "15px",
                      borderLeft: "4px solid #2c3e50",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 8px 0",
                        color: "#666",
                        fontSize: "0.9rem",
                      }}
                    >
                      <strong>Ghi chú hiện tại:</strong>
                    </p>
                    <p
                      style={{
                        margin: "0",
                        color: "#333",
                        fontSize: "0.95rem",
                        fontStyle: "italic",
                      }}
                    >
                      {selectedTable.note}
                    </p>
                    <p
                      style={{
                        margin: "10px 0 0 0",
                        color: "#666",
                        fontSize: "0.9rem",
                      }}
                    >
                      <strong>Khách hàng:</strong> {selectedTable.customer_name}
                    </p>
                    <p
                      style={{
                        margin: "5px 0 0 0",
                        color: "#666",
                        fontSize: "0.9rem",
                      }}
                    >
                      <strong>SĐT:</strong> {selectedTable.phone}
                    </p>
                  </div>
                )}

                <select
                  className="modal-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {/* Nếu trạng thái gốc ban đầu của bàn là "Da dat", 
    thì ẩn hoặc vô hiệu hóa (disabled) lựa chọn "Còn trống"
  */}
                  <option
                    value="Con trong"
                    disabled={selectedTable.status === "Da dat"}
                  >
                    🟢 Còn trống{" "}
                    {selectedTable.status === "Da dat" &&
                      "(Không thể chuyển về trống)"}
                  </option>

                  <option value="Dang su dung">🔴 Đang sử dụng</option>
                  <option value="Da dat">🟡 Đã đặt</option>
                </select>
                <div className="modal-actions">
                  <button className="btn-cancel" onClick={handleCloseModal}>
                    Hủy
                  </button>
                  <button className="btn-save" onClick={handleUpdateStatus}>
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminManageTables;

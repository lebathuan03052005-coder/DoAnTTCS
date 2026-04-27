import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import "./adminManageTables.css";
import Admin from "./admin";
const AdminManageTables = () => {
  const [filterType, setFilterType] = useState("all");
  const [tables, setTables] = useState([]);

  // State điều khiển Modal cập nhật
  const [selectedTable, setSelectedTable] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // 🔥 Gọi API
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/admin/restaurant_tables",
        );
        const result = await response.json();

        if (result.success) {
          setTables(result.data);
        } else {
          console.error("Lỗi:", result.message);
        }
      } catch (error) {
        console.error("Không kết nối được Backend:", error);
      }
    };

    fetchTables();
  }, []);

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

  // 🔥 Map status -> class màu
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
  };

  // Đóng modal
  const handleCloseModal = () => {
    setSelectedTable(null);
  };

  // Gửi API cập nhật trạng thái lên Backend
  const handleUpdateStatus = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/restaurant_tables/${selectedTable.table_number}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      const result = await response.json();

      if (result.success) {
        setTables((prev) =>
          prev.map((t) =>
            t.table_number === selectedTable.table_number
              ? { ...t, status: newStatus }
              : t,
          ),
        );
        handleCloseModal();
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (error) {
      alert("Không kết nối được Backend!");
    }
  };

  return (
    <div className="admin-layout">
      <Admin />

      <div className="main-content">
        <Navbar />
        <main style={{ flex: 1, backgroundColor: "#f4f4f4", padding: "20px" }}>
          <div className="admin-tables-container">
            <h2 className="admin-tables-title">Sơ Đồ Bàn Nhà Hàng</h2>

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
                    <p>
                      Số chỗ: <strong>{table.capacity}</strong>
                    </p>
                    <p className="status-text">{table.status}</p>
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
                <select
                  className="modal-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="Con trong">🟢 Còn trống</option>
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

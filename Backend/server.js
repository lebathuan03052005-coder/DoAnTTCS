// File: server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Nhập các module đã tách
const { connectDB } = require("./config/database");
console.log("🔥 ĐÃ LOAD adminRoutes");
const adminRoutes = require("./routes/adminRoutes");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Kích hoạt kết nối Database
connectDB();

// Gắn bộ định tuyến (Router) vào đường dẫn '/api'
app.use("/api", adminRoutes);

// Khởi động Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server Backend đang chạy tại: http://localhost:${PORT}`);
});

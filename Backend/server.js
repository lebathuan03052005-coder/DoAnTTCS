// File: server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Nhập các module đã tách
const { connectDB } = require("./config/database");

console.log("ĐÃ LOAD adminRoutes");

const adminRoutes = require("./routes/adminRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối database
connectDB();

// Routes
app.use("/api/v2/categories", categoryRoutes);
app.use("/api", adminRoutes);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Backend đang chạy tại: http://localhost:${PORT}`);
});

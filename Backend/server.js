// File: server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Nhập các module đã tách
const { connectDB } = require("./config/database");
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

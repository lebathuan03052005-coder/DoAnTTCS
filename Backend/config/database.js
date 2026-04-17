// File: config/db.js
const sql = require("mssql");
require("dotenv").config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Hàm kết nối
async function connectDB() {
  try {
    await sql.connect(dbConfig);
    console.log("-----------------------------------------");
    console.log("✅ KẾT NỐI DATABASE THEKING_TTCS THÀNH CÔNG!");
    console.log("-----------------------------------------");
  } catch (err) {
    console.error("❌ LỖI KẾT NỐI SQL SERVER:", err.message);
  }
}

// Xuất biến sql và hàm connectDB ra để file khác dùng
module.exports = { sql, connectDB };

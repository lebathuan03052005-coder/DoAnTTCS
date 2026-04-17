const express = require("express");
const sql = require("mssql");
require("dotenv").config();

const app = express();

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

// Hàm kích hoạt kết nối
async function startServer() {
  try {
    await sql.connect(dbConfig);
    console.log("-----------------------------------------");
    console.log(" KẾT NỐI DATABASE THEKING_TTCS THÀNH CÔNG!");
    console.log("-----------------------------------------");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(` Server đang chạy tại: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(" LỖI KẾT NỐI SQL SERVER:");
    console.error(err.message);
  }
}

startServer();

// File: config/database.js
import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  server: process.env.DB_SERVER,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const connectDB = async () => {
  try {
    await sql.connect(config);
    console.log(" Kết nối SQL Server thành công!");
  } catch (error) {
    console.error(" Lỗi kết nối SQL Server:", error);
  }
};

// Đã đổi sang export mới
export { sql, connectDB };

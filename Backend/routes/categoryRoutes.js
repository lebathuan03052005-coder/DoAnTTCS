import express from "express";
import { sql } from "../config/database.js"; // Import kết nối DB có sẵn từ file config

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Không cần gọi sql.connect ở đây nữa vì đã kết nối ở server.js rồi
    const request = new sql.Request();
    const result = await request.query(`
      SELECT * FROM categories
    `);

    // Trả về thẳng mảng dữ liệu
    res.json(result.recordset);
  } catch (err) {
    console.error("Lỗi khi lấy danh mục:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

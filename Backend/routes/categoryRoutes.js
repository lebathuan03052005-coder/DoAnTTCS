const express = require("express");
const router = express.Router();
const sql = require("mssql");
const config = require("../config/database");

router.get("/", async (req, res) => {
  try {
    await sql.connect(config);

    const result = await sql.query(`
      SELECT * FROM categories
    `);

    res.json(result.recordset);
  } catch (err) {
    console.log(err);
    // SỬA DÒNG NÀY: Trả về JSON thay vì text thuần
    res.status(500).json({ success: false, message: err.message }); 
  }
});

module.exports = router;
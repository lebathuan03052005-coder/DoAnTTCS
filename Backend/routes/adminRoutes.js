// File: routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { sql } = require("../config/database"); // Lấy công cụ SQL từ file db.js sang đây

// 1. API: Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const query = `SELECT id, username, full_name FROM admins WHERE username = @username AND password = @password`;
    const request = new sql.Request();
    request.input("username", sql.VarChar, username);
    request.input("password", sql.VarChar, password);

    const result = await request.query(query);

    if (result.recordset.length > 0) {
      res.json({
        success: true,
        message: "Đăng nhập thành công!",
        user: result.recordset[0],
      });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Sai tài khoản hoặc mật khẩu!" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi Database: " + err.message });
  }
});

// 2. API: Thêm món ăn
router.post("/admin/menu", async (req, res) => {
  try {
    const {
      category_id,
      item_name,
      description,
      price,
      image_url,
      is_best_seller,
      ingredients,
      allergy_warnings,
      is_spicy,
      is_vegetarian,
      serving_size,
    } = req.body;

    const query = `
            INSERT INTO menu (category_id, item_name, description, price, image_url, is_best_seller, ingredients, allergy_warnings, is_spicy, is_vegetarian, serving_size)
            VALUES (@category_id, @item_name, @description, @price, @image_url, @is_best_seller, @ingredients, @allergy_warnings, @is_spicy, @is_vegetarian, @serving_size)
        `;
    const request = new sql.Request();

    request.input("category_id", sql.Int, category_id ? category_id : null);
    request.input("item_name", sql.NVarChar, item_name);
    request.input(
      "description",
      sql.NVarChar,
      description ? description : null,
    );
    request.input("price", sql.Decimal, price);
    request.input("image_url", sql.VarChar, image_url ? image_url : null);
    request.input("is_best_seller", sql.Bit, is_best_seller ? 1 : 0);
    request.input(
      "ingredients",
      sql.NVarChar,
      ingredients ? ingredients : null,
    );
    request.input(
      "allergy_warnings",
      sql.NVarChar,
      allergy_warnings ? allergy_warnings : null,
    );
    request.input("is_spicy", sql.Bit, is_spicy ? 1 : 0);
    request.input("is_vegetarian", sql.Bit, is_vegetarian ? 1 : 0);
    request.input(
      "serving_size",
      sql.NVarChar,
      serving_size ? serving_size : null,
    );

    await request.query(query);
    res.json({
      success: true,
      message: " Đã nạp món ăn vào Database thành công!",
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi Database: " + err.message });
  }
});

module.exports = router; // Xuất cái router này ra

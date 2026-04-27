// File: routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { sql } = require("../config/database"); // Lấy công cụ SQL từ file db.js sang đây
console.log("🔥 FILE adminRoutes.js ĐANG CHẠY");
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
// 3. API: Lấy danh sách toàn bộ món ăn
router.get("/admin/menu", async (req, res) => {
  try {
    // Lấy tất cả món ăn, sắp xếp món mới thêm lên đầu (dựa vào id)
    const request = new sql.Request();
    const result = await request.query("SELECT * FROM menu ORDER BY id DESC");
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi Database: " + err.message });
  }
});

// 4. API: Cập nhật nhanh trạng thái Bestseller
router.put("/admin/menu/:id/bestseller", async (req, res) => {
  try {
    const { id } = req.params;
    const { is_best_seller } = req.body;

    const query = `UPDATE menu SET is_best_seller = @is_best_seller WHERE id = @id`;
    const request = new sql.Request();
    request.input("id", sql.Int, id);
    request.input("is_best_seller", sql.Bit, is_best_seller ? 1 : 0);

    await request.query(query);
    res.json({ success: true, message: "Cập nhật Bestseller thành công!" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi Database: " + err.message });
  }
});

// 5. API: Xóa món ăn
router.delete("/admin/menu/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = `DELETE FROM menu WHERE id = @id`;
    const request = new sql.Request();
    request.input("id", sql.Int, id);

    await request.query(query);
    res.json({ success: true, message: "Xóa món ăn thành công!" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi Database: " + err.message });
  }
});

// 6. API: Lấy thông tin 1 món ăn để sửa
router.get("/admin/menu/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM menu WHERE id = @id`;
    const request = new sql.Request();
    request.input("id", sql.Int, id);

    const result = await request.query(query);
    if (result.recordset.length > 0) {
      res.json({ success: true, data: result.recordset[0] });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Không tìm thấy món ăn!" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi Database: " + err.message });
  }
});

// 7. API: Cập nhật thông tin món ăn
router.put("/admin/menu/:id", async (req, res) => {
  try {
    const { id } = req.params;
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
      UPDATE menu 
      SET category_id = @category_id, 
          item_name = @item_name, 
          description = @description, 
          price = @price, 
          image_url = @image_url, 
          is_best_seller = @is_best_seller, 
          ingredients = @ingredients, 
          allergy_warnings = @allergy_warnings, 
          is_spicy = @is_spicy, 
          is_vegetarian = @is_vegetarian, 
          serving_size = @serving_size
      WHERE id = @id
    `;

    const request = new sql.Request();
    request.input("id", sql.Int, id);
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
    res.json({ success: true, message: "Cập nhật món ăn thành công!" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi Database: " + err.message });
  }
});

// 8. API: Lấy danh sách danh mục
router.get("/categories", (req, res) => {
  console.log(" HIT CATEGORIES");
  res.send("OK CATEGORY");
});

// 9. API: Lấy danh sách sơ đồ bàn
// API: Lấy danh sách sơ đồ bàn
router.get("/admin/restaurant_tables", async (req, res) => {
  try {
    const request = new sql.Request();

    const result = await request.query(`
      SELECT 
        table_number,
        style,
        location,
        capacity,
        status
      FROM restaurant_tables
      ORDER BY location ASC, table_number ASC
    `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi Database: " + err.message,
    });
  }
});

// 10. API: Cập nhật trạng thái bàn
router.put(
  "/admin/restaurant_tables/:table_number/status",
  async (req, res) => {
    try {
      const { table_number } = req.params;
      const { status } = req.body;

      const query = `UPDATE restaurant_tables SET status = @status WHERE table_number = @table_number`;
      const request = new sql.Request();
      request.input("status", sql.NVarChar, status);
      request.input("table_number", sql.NVarChar, table_number);

      await request.query(query);
      res.json({
        success: true,
        message: "Cập nhật trạng thái bàn thành công!",
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Lỗi Database: " + err.message });
    }
  },
);

module.exports = router; // Xuất cái router này ra

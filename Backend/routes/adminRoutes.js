// File: routes/adminRoutes.js
import express from "express";
import { sql } from "../config/database.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Sửa lại để tìm đúng chữ SMTP_USER và SMTP_PASS trong file .env
const isMailConfigured = Boolean(
  process.env.SMTP_USER && process.env.SMTP_PASS,
);

const mailTransport = isMailConfigured
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

async function sendStatusEmail({ to, subject, html }) {
  if (!mailTransport) {
    console.warn("Chưa cấu hình Email. Bỏ qua gửi email trạng thái.");
    return;
  }

  return mailTransport.sendMail({
    from: `"The King Restaurant" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

console.log(" FILE adminRoutes.js ĐANG CHẠY");

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
/// 9. API: Lấy danh sách sơ đồ bàn
router.get("/admin/restaurant_tables", async (req, res) => {
  try {
    const request = new sql.Request();

    const result = await request.query(`
      SELECT 
        rt.table_number,
        rt.location,
        rt.capacity,
        rt.status,

        ts.id AS style_id,
        ts.style_name,
        ts.description,
        ts.image_url

      FROM restaurant_tables rt

      LEFT JOIN table_styles ts
      ON rt.style_id = ts.id

      ORDER BY rt.location ASC, rt.table_number ASC
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

// 10b. API: Cập nhật thông tin bàn (status, note, style_id, capacity, location)
router.put("/admin/restaurant_tables/:table_number", async (req, res) => {
  try {
    const { table_number } = req.params;
    const { status, note, style_id, capacity, location } = req.body;

    const request = new sql.Request();
    request.input("table_number", sql.NVarChar, table_number);
    request.input("status", sql.NVarChar, status || null);
    request.input("note", sql.NVarChar, note || null);
    request.input("style_id", sql.Int, style_id || null);
    request.input("capacity", sql.Int, capacity || null);
    request.input("location", sql.NVarChar, location || null);

    // Build update dynamically to only set provided fields
    const updates = [];
    if (status !== undefined) updates.push("status = @status");
    if (note !== undefined) updates.push("note = @note");
    if (style_id !== undefined) updates.push("style_id = @style_id");
    if (capacity !== undefined) updates.push("capacity = @capacity");
    if (location !== undefined) updates.push("location = @location");

    if (updates.length === 0) {
      return res.json({
        success: true,
        message: "Không có trường để cập nhật.",
      });
    }

    const query = `UPDATE restaurant_tables SET ${updates.join(", ")} WHERE table_number = @table_number`;

    await request.query(query);

    res.json({ success: true, message: "Cập nhật thông tin bàn thành công!" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi Database: " + err.message });
  }
});

// 11: API lấy style bàn ăn
router.get("/admin/table_styles", async (req, res) => {
  try {
    const request = new sql.Request();

    const result = await request.query(`
      SELECT *
      FROM table_styles
      ORDER BY id DESC
    `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// API: Lấy 1 style theo id
router.get("/admin/table_styles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const request = new sql.Request();
    request.input("id", sql.Int, id);
    const result = await request.query(
      `SELECT * FROM table_styles WHERE id = @id`,
    );
    if (result.recordset.length > 0) {
      res.json({ success: true, data: result.recordset[0] });
    } else {
      res.status(404).json({ success: false, message: "Không tìm thấy style" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// API: Xóa 1 style bàn ăn
router.delete("/admin/table_styles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const request = new sql.Request();
    request.input("id", sql.Int, id);
    await request.query(`DELETE FROM table_styles WHERE id = @id`);
    res.json({ success: true, message: "Xóa style bàn thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 12: API: Thêm sửa style bàn ăn
router.put("/admin/table_styles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { style_name, description, image_url, bestseller } = req.body;

    const request = new sql.Request();

    await request
      .input("id", sql.Int, id)
      .input("style_name", sql.NVarChar, style_name)
      .input("description", sql.NVarChar, description)
      .input("image_url", sql.VarChar, image_url)
      .input("bestseller", sql.Bit, bestseller ? 1 : 0).query(`
        UPDATE table_styles
        SET
          style_name = @style_name,
          description = @description,
          image_url = @image_url,
          bestseller = @bestseller 
        WHERE id = @id
      `);

    res.json({
      success: true,
      message: "Cập nhật style thành công",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// 13, API: Đặt bàn ăn
router.post("/admin/reservations", async (req, res) => {
  try {
    const {
      customer_name,
      phone,
      email,
      booking_date,
      booking_time,
      guests,
      note,
    } = req.body;

    const guestNumber = parseInt(guests, 10) || 1;

    const emailColumnResult = await new sql.Request().query(`
      SELECT COUNT(*) AS count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'reservations'
        AND COLUMN_NAME = 'email'
    `);
    const hasEmailColumn = emailColumnResult.recordset[0].count > 0;

    const request = new sql.Request()
      .input("customer_name", sql.NVarChar, customer_name)
      .input("phone", sql.VarChar, phone)
      .input("booking_date", sql.Date, booking_date)
      .input("booking_time", sql.VarChar, booking_time)
      .input("guests", sql.Int, guestNumber)
      .input("note", sql.NVarChar, note || null)
      .input("email", sql.VarChar, email || null);

    let insertQuery = `
      INSERT INTO reservations (customer_name, phone, booking_date, booking_time, guests, note, email)
      VALUES (@customer_name, @phone, @booking_date, @booking_time, @guests, @note, @email)
    `;

    await request.query(insertQuery);

    res.status(201).json({
      success: true,
      message: "Đặt bàn thành công! Chúng tôi sẽ liên hệ lại để xác nhận.",
    });
  } catch (err) {
    console.error(">>> CHI TIẾT LỖI:", err.message);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// API: Xếp bàn cho khách (Lưu table_id vào reservations)
// API: Xếp bàn cho khách (Lưu table_id vào reservations + Đổi status bàn)
router.put("/admin/reservations/:id/assign-table", async (req, res) => {
  try {
    const { id } = req.params;
    const { table_number } = req.body;

    if (!table_number) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin bàn." });
    }

    const request = new sql.Request();
    request.input("res_id", sql.Int, id);
    request.input("table_num", sql.NVarChar, String(table_number));

    // Lệnh SQL: Xử lý cả 2 việc cùng 1 lúc trong DB cho an toàn
    const result = await request.query(`
      DECLARE @tableId INT;
      SELECT @tableId = id FROM restaurant_tables WHERE table_number = @table_num;

      IF @tableId IS NOT NULL
      BEGIN
        -- 1. Lưu bàn vào đơn đặt
        UPDATE reservations SET table_id = @tableId WHERE id = @res_id;
        
        -- 2. Đổi trạng thái bàn thành "Da dat" luôn
        UPDATE restaurant_tables SET status = N'Da dat' WHERE id = @tableId;

        SELECT 1 AS success_flag;
      END
      ELSE
      BEGIN
        SELECT 0 AS success_flag;
      END
    `);

    if (result.recordset[0]?.success_flag === 1) {
      res.json({ success: true, message: "Xếp bàn thành công!" });
    } else {
      res
        .status(400)
        .json({
          success: false,
          message: `Không tìm thấy bàn ${table_number} trong CSDL!`,
        });
    }
  } catch (err) {
    console.error(">>> Lỗi ngầm khi xếp bàn:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 14, API: Lấy danh sách đặt bàn
router.get("/admin/reservations", async (req, res) => {
  try {
    const request = new sql.Request();
    const result = await request.query(`
      SELECT 
          r.*, 
          t.table_number 
      FROM reservations r
      LEFT JOIN restaurant_tables t ON r.table_id = t.id
      ORDER BY r.created_at DESC
    `);
    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// API: Xóa đơn đặt bàn
router.delete("/admin/reservations/:id", async (req, res) => {
  try {
    await sql.query(`DELETE FROM reservations WHERE id = ${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// API: Xếp bàn cho khách (Lưu table_id vào reservations)
router.put("/admin/reservations/:id/assign-table", async (req, res) => {
  try {
    const { id } = req.params;
    const { table_number } = req.body;

    if (!table_number) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin bàn." });
    }

    const request = new sql.Request();
    request.input("res_id", sql.Int, id);
    request.input("table_num", sql.Int, table_number);

    // Lệnh SQL: Tìm id của bàn và Update vào bảng reservations
    await request.query(`
      DECLARE @tableId INT;
      
      SELECT @tableId = id FROM restaurant_tables WHERE table_number = @table_num;

      IF @tableId IS NOT NULL
      BEGIN
        UPDATE reservations 
        SET table_id = @tableId 
        WHERE id = @res_id;
      END
    `);

    res.json({ success: true, message: "Xếp bàn và lưu Database thành công!" });
  } catch (err) {
    console.error("Lỗi khi xếp bàn:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
export default router;

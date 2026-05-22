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

// 8. API: Lấy danh sách danh mục
router.get("/categories", (req, res) => {
  console.log(" HIT CATEGORIES");
  res.send("OK CATEGORY");
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

// 13b. API: Cập nhật thông tin đặt bàn
router.put("/admin/reservations/:id", async (req, res) => {
  const { id } = req.params;
  const { assigned_table } = req.body;

  try {
    await db.query("UPDATE reservations SET assigned_table = ? WHERE id = ?", [
      assigned_table,
      id,
    ]);

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      message: "Update failed",
    });
  }
});

// 13c. API: Duyệt hoặc từ chối thông báo đặt bàn
router.put("/admin/reservations/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Giá trị từ Frontend gửi lên: "Confirmed" hoặc "Cancelled"

    const reservationRequest = new sql.Request();
    reservationRequest.input("id", sql.Int, id);
    const reservationResult = await reservationRequest.query(
      `SELECT * FROM reservations WHERE id = @id`,
    );

    if (reservationResult.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đặt bàn." });
    }

    const reservation = reservationResult.recordset[0];

    const statusUpdateRequest = new sql.Request()
      .input("id", sql.Int, id)
      .input("status", sql.NVarChar, status);

    const updateResult = await statusUpdateRequest.query(`
      IF EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('reservations')
          AND name = 'status'
      )
      BEGIN
        UPDATE reservations
        SET status = @status
        WHERE id = @id;
        SELECT 1 AS updated;
      END
      ELSE
      BEGIN
        SELECT 0 AS updated;
      END
    `);

    const updated = updateResult.recordset?.[0]?.updated;
    if (!updated) {
      return res.status(400).json({
        success: false,
        message:
          "Bảng reservations chưa có cột status. Vui lòng kiểm tra cấu trúc database.",
      });
    }

    const recipientEmail =
      String(reservation.email || req.body.email || "").trim() || null;

    if (recipientEmail) {
      // 1. SỬA LOGIC: Khớp chính xác với trạng thái "Confirmed" từ Frontend truyền xuống
      const isApproved = status === "Confirmed" || req.body.approved === true;

      // 2. SỬA ĐỊNH DẠNG NGÀY: Ép kiểu hiển thị ngày thành dạng dd/mm/yyyy gọn gàng
      const displayDate = reservation.booking_date
        ? new Date(reservation.booking_date).toLocaleDateString("vi-VN")
        : "Không có";

      // 3. SỬA ĐỊNH DẠNG GIỜ: Loại bỏ phần chuỗi ngày tháng mặc định (1970-01-01T...) của SQL Server
      let displayTime = "Không có";
      if (reservation.booking_time) {
        const timeStr =
          reservation.booking_time instanceof Date
            ? reservation.booking_time.toISOString()
            : String(reservation.booking_time);

        if (timeStr.includes("T")) {
          displayTime = timeStr.split("T")[1].substring(0, 5); // Lấy chính xác hh:mm
        } else {
          displayTime = timeStr.substring(0, 5);
        }
      }

      // Xác định tiêu đề thư dựa trên trạng thái đúng
      const subject = isApproved
        ? "Yêu cầu đặt bàn của bạn đã được duyệt - The King Restaurant"
        : "Thông báo về yêu cầu đặt bàn - The King Restaurant";

      // Cấu trúc lại giao diện Form HTML bằng danh sách có dấu chấm đầu dòng cho rõ ràng
      const html = `
        <p>Xin chào <strong>${reservation.customer_name || "khách hàng"}</strong>,</p>
        <p>Yêu cầu đặt bàn của bạn vào ngày <strong>${displayDate}</strong> lúc <strong>${displayTime}</strong> đã được nhà hàng <strong>${
          isApproved ? "DUYỆT THÀNH CÔNG" : "TỪ CHỐI TIẾP NHẬN"
        }</strong>.</p>
        
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p><strong>Chi tiết thông tin lịch đặt của bạn:</strong></p>
        <ul style="list-style-type: none; padding-left: 0;">
          <li style="margin-bottom: 8px;">• <strong>Tên khách hàng:</strong> ${reservation.customer_name || "Khách hàng"}</li>
          <li style="margin-bottom: 8px;">• <strong>Số điện thoại:</strong> ${reservation.phone || "Không có"}</li>
          <li style="margin-bottom: 8px;">• <strong>Ngày đặt bàn:</strong> ${displayDate}</li>
          <li style="margin-bottom: 8px;">• <strong>Giờ nhận bàn:</strong> ${displayTime}</li>
          <li style="margin-bottom: 8px;">• <strong>Số lượng khách:</strong> ${reservation.guests || 1} người</li>
          <li style="margin-bottom: 8px;">• <strong>Ghi chú đi kèm:</strong> ${reservation.note || "Không có"}</li>
        </ul>
        <hr style="border: none; border-top: 1px solid #eee;" />

        <p>Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi.</p>
        <p>Mọi thắc mắc hoặc cần hỗ trợ thay đổi thông tin gấp, vui lòng liên hệ hotline nhà hàng qua số <strong>0862680850</strong>.</p>
        <br />
        <p>Trân trọng,</p>
        <p><strong>Ban quản lý The King Restaurant</strong></p>
        <p style="font-size: 0.8rem; color: #888;">(Email này được gửi tự động, vui lòng không trả lời trực tiếp Xin Cảm Ơn)</p>
      `;

      await sendStatusEmail({
        to: recipientEmail,
        subject,
        html,
      });
    }

    res.json({
      success: true,
      message: "Cập nhật trạng thái đặt bàn và gửi email thành công!",
    });
  } catch (err) {
    console.error("Lỗi xử lý duyệt đơn:", err);
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

// API: THÊM MỚI style bàn ăn (Đón request POST từ Frontend)
router.post("/admin/table_styles", async (req, res) => {
  try {
    const { style_name, description, image_url, bestseller } = req.body;

    const request = new sql.Request();

    await request
      .input("style_name", sql.NVarChar, style_name)
      .input("description", sql.NVarChar, description)
      .input("image_url", sql.VarChar, image_url)
      .input("bestseller", sql.Bit, bestseller ? 1 : 0).query(`
        INSERT INTO table_styles (style_name, description, image_url, bestseller)
        VALUES (@style_name, @description, @image_url, @bestseller)
      `);

    res.json({
      success: true,
      message: "Thêm style bàn mới thành công",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
// API: Cập nhật style bàn ăn cho 1 bàn cụ thể
router.put(
  "/admin/restaurant_tables/:table_number/table_style",
  async (req, res) => {
    try {
      const { style_name } = req.body;
      await sql.query(
        `UPDATE restaurant_tables SET table_style = '${style_name}' WHERE table_number = ${req.params.table_number}`,
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);
// API: Xóa đơn đặt bàn
router.delete("/admin/reservations/:id", async (req, res) => {
  try {
    await sql.query(`DELETE FROM reservations WHERE id = ${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// API: XẾP BÀN CHO KHÁCH (Lưu vào Database)
router.put("/admin/reservations/:id/assign", async (req, res) => {
  try {
    const { id } = req.params; // ID của đơn đặt bàn (reservations.id)
    const { table_id } = req.body; // Đây là số bàn (table_number) từ Frontend gửi lên

    if (!table_id) {
      return res.status(400).json({ success: false, message: "Thiếu số bàn." });
    }

    const updateRequest = new sql.Request();
    updateRequest.input("res_id", sql.Int, id);
    updateRequest.input("table_num", sql.Int, table_id);

    // Lệnh SQL: Tìm 'id' của bàn dựa trên 'table_number', sau đó UPDATE vào bảng reservations
    await updateRequest.query(`
      DECLARE @tableId INT;
      
      -- 1. Tìm khóa chính (id) của bàn
      SELECT @tableId = id FROM restaurant_tables WHERE table_number = @table_num;

      -- 2. Nếu tìm thấy bàn, tiến hành cập nhật vào đơn đặt
      IF @tableId IS NOT NULL
      BEGIN
        UPDATE reservations 
        SET table_id = @tableId 
        WHERE id = @res_id;
      END
    `);

    res.json({
      success: true,
      message: "Đã lưu thông tin xếp bàn vào Database!",
    });
  } catch (err) {
    console.error("Lỗi khi lưu xếp bàn:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
export default router;

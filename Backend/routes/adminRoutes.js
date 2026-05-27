// File: routes/adminRoutes.js
import express from "express";
import { sql } from "../config/database.js";
import nodemailer from "nodemailer";

const router = express.Router();

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

console.log(" FILE adminRoutes.js ĐANG CHẠY ỔN ĐỊNH");

// 1. API: Đăng nhập Admin
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

// 2. API: Cập nhật thông tin món ăn toàn diện (Nhận vào category_name)
router.put("/admin/menu/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_name,
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
      SET category_id = (SELECT id FROM categories WHERE name = @category_name), 
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

    //  Đổi trường nạp dữ liệu đầu vào thành NVarChar cho chuỗi chữ tiếng Việt
    request.input(
      "category_name",
      sql.NVarChar,
      category_name ? category_name : null,
    );

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
      message: "Cập nhật thông tin món ăn theo danh mục thành công!",
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi Database: " + err.message });
  }
});
// 2b. API: Thêm món ăn mới toàn diện (Đồng bộ quy đổi danh mục qua category_name)
router.post("/admin/menu", async (req, res) => {
  try {
    const {
      category_name,
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

    // 🌟 SỬA ĐOẠN INSERT: Dùng Subquery lồng trực tiếp vào câu lệnh VALUES để quy đổi tự động
    const query = `
      INSERT INTO menu (
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
        serving_size
      )
      VALUES (
        (SELECT id FROM categories WHERE name = @category_name), 
        @item_name, 
        @description, 
        @price, 
        @image_url, 
        @is_best_seller, 
        @ingredients, 
        @allergy_warnings, 
        @is_spicy, 
        @is_vegetarian, 
        @serving_size
      )
    `;

    const request = new sql.Request();

    // Ép kiểu NVarChar để SQL Server đọc hiểu chính xác tiếng Việt có dấu của tên danh mục
    request.input(
      "category_name",
      sql.NVarChar,
      category_name ? category_name : null,
    );

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
      message: "Đã nạp món ăn mới vào hệ thống dữ liệu nhà hàng thành công!",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi Database khi thêm món: " + err.message,
    });
  }
});

// 3. API: Lấy danh sách toàn bộ món ăn (Đã sửa đổi bổ sung LEFT JOIN lấy tên danh mục)
router.get("/admin/menu", async (req, res) => {
  try {
    const request = new sql.Request();

    //  Thêm LEFT JOIN để lấy ra cột c.name AS category_name
    const result = await request.query(`
      SELECT 
        m.*,
        c.name AS category_name
      FROM menu m
      LEFT JOIN categories c ON m.category_id = c.id
      ORDER BY m.id DESC
    `);

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

// 5. API: Xóa món ăn khỏi danh sách
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

// 6. API: Lấy thông tin chi tiết 1 món ăn để sửa (Đã nâng cấp LEFT JOIN để đồng bộ form sửa)
router.get("/admin/menu/:id", async (req, res) => {
  try {
    const { id } = req.params;

    //  Thêm liên kết LEFT JOIN sang bảng danh mục
    const query = `
      SELECT 
        m.*, 
        c.name AS category_name 
      FROM menu m
      LEFT JOIN categories c ON m.category_id = c.id 
      WHERE m.id = @id
    `;

    const request = new sql.Request();
    request.input("id", sql.Int, id);

    const result = await request.query(query);
    if (result.recordset.length > 0) {
      res.json({ success: true, data: result.recordset[0] });
    } else {
      res
        .status(404)
        .json({
          success: false,
          message: "Không tìm thấy dữ liệu món ăn này!",
        });
    }
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi Database: " + err.message });
  }
});
// 7. API Lấy danh sách toàn bộ danh mục món ăn cho Ô chọn Frontend
router.get("/admin/categories", async (req, res) => {
  try {
    const request = new sql.Request();
    // Lấy ra ID và Tên danh mục từ bảng categories để hiển thị lên thẻ select
    const result = await request.query(
      "SELECT id, name FROM categories ORDER BY name ASC",
    );

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi Database khi tải danh mục: " + err.message,
    });
  }
});

//  8.  API LẤY DANH SÁCH ĐẶT BÀN CHO FRONTEND DISPLAY
router.get("/admin/reservations", async (req, res) => {
  try {
    const request = new sql.Request();
    // INNER JOIN hoặc LEFT JOIN với sơ đồ bàn để lấy kèm tên số bàn hiển thị
    const result = await request.query(`
      SELECT 
        r.id, r.customer_name, r.phone, r.email, r.booking_date, r.booking_time, r.guests, r.note, r.status,
        rt.table_number AS assigned_table
      FROM reservations r
      LEFT JOIN restaurant_tables rt ON r.table_id = rt.id
      ORDER BY r.booking_date DESC, r.booking_time ASC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi Database khi lấy danh sách đặt bàn: " + err.message,
    });
  }
});

// 9. API: Lấy danh sách sơ đồ bàn (Có bổ sung rt.id làm style details)
router.get("/admin/restaurant_tables", async (req, res) => {
  try {
    const request = new sql.Request();
    const result = await request.query(`
      SELECT 
        rt.id,
        rt.table_number,
        rt.location,
        rt.capacity,
        rt.status,
        ts.id AS style_id,
        ts.style_name,
        ts.description,
        ts.image_url,
        r.note
      FROM restaurant_tables rt
      LEFT JOIN table_styles ts ON rt.style_id = ts.id
      LEFT JOIN reservations r ON rt.id = r.table_id
      ORDER BY rt.location ASC, rt.table_number ASC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi Database: " + err.message });
  }
});

// 10. API: Cập nhật trạng thái trống/bận của bàn công nghiệp
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

// 10b. API: Cập nhật thông tin chi tiết cấu trúc bàn
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

// 11: API lấy toàn bộ style không gian bàn ăn
router.get("/admin/table_styles", async (req, res) => {
  try {
    const request = new sql.Request();
    const result = await request.query(
      `SELECT * FROM table_styles ORDER BY id DESC`,
    );
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// API: Lấy thông tin 1 style cụ thể theo ID phục vụ trang sửa
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

// API: Xóa 1 dạng style bàn
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

// 12: API: Cập nhật hoặc lưu đè thông tin style bàn
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
        SET style_name = @style_name, description = @description, image_url = @image_url, bestseller = @bestseller 
        WHERE id = @id
      `);

    res.json({ success: true, message: "Cập nhật style thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 13: API: Khách hàng tạo đơn đặt bàn mới từ Client Form
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

    const request = new sql.Request()
      .input("customer_name", sql.NVarChar, customer_name)
      .input("phone", sql.VarChar, phone)
      .input("booking_date", sql.Date, booking_date)
      .input("booking_time", sql.VarChar, booking_time)
      .input("guests", sql.Int, guestNumber)
      .input("note", sql.NVarChar, note || null)
      .input("email", sql.VarChar, email || null);

    let insertQuery = `
      INSERT INTO reservations (customer_name, phone, booking_date, booking_time, guests, note, email, status)
      VALUES (@customer_name, @phone, @booking_date, @booking_time, @guests, @note, @email, 'Pending')
    `;

    await request.query(insertQuery);
    res.status(201).json({
      success: true,
      message: "Đặt bàn thành công! Chúng tôi sẽ liên hệ lại để xác nhận.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🌟 14. API GỘP NHẤT QUÁN: ĐIỀU PHỐI / XẾP VỊ TRÍ BÀN CHO KHÁCH (ĐÃ KHỬ TRÙNG LẶP) 🌟
router.put("/admin/reservations/:id/assign-table", async (req, res) => {
  try {
    const { id } = req.params;
    const { table_number } = req.body;

    if (!table_number) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin số bàn." });
    }

    const request = new sql.Request();
    request.input("res_id", sql.Int, id);
    request.input("table_num", sql.NVarChar, String(table_number));

    const result = await request.query(`
      DECLARE @newTableId INT;
      DECLARE @oldTableId INT;

      SELECT @newTableId = id FROM restaurant_tables WHERE table_number = @table_num;
      SELECT @oldTableId = table_id FROM reservations WHERE id = @res_id;

      IF @newTableId IS NOT NULL
      BEGIN
        -- Gỡ bàn cũ nếu có sang trạng thái trống
        IF @oldTableId IS NOT NULL
        BEGIN
          UPDATE restaurant_tables SET status = N'Con trong' WHERE id = @oldTableId;
        END

        -- Chuyển đơn sang ID của bàn mới
        UPDATE reservations SET table_id = @newTableId WHERE id = @res_id;

        -- Khóa bàn mới thành 'Da dat'
        UPDATE restaurant_tables SET status = N'Da dat' WHERE id = @newTableId;

        SELECT 1 AS success_flag;
      END
      ELSE
      BEGIN
        SELECT 0 AS success_flag;
      END
    `);

    if (result.recordset[0]?.success_flag === 1) {
      res.json({
        success: true,
        message: "Xếp bàn vào Database và khóa sơ đồ thành công!",
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Không tìm thấy bàn mang số hiệu ${table_number} trong hệ thống.`,
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 15. API: Xóa bản ghi lịch sử đặt bàn
router.delete("/admin/reservations/:id", async (req, res) => {
  try {
    const request = new sql.Request();
    request.input("id", sql.Int, req.params.id);
    await request.query(`DELETE FROM reservations WHERE id = @id`);
    res.json({ success: true, message: "Đã xóa bản ghi đơn thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 16. API: Duyệt hoặc từ chối đơn hàng + Kích hoạt gửi Gmail tự động qua Nodemailer
router.put("/admin/reservations/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = new sql.Request();
    request.input("id", sql.Int, id);

    const reservationResult = await request.query(
      `SELECT * FROM reservations WHERE id = @id`,
    );

    if (reservationResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dữ liệu đơn đặt bàn.",
      });
    }

    const reservation = reservationResult.recordset[0];

    request.input("status", sql.NVarChar, status);
    await request.query(
      `UPDATE reservations SET status = @status WHERE id = @id`,
    );

    const recipientEmail = String(
      reservation.email || req.body.email || "",
    ).trim();
    let emailStatusMsg = "Khách hàng không để lại email.";

    if (
      recipientEmail &&
      recipientEmail !== "undefined" &&
      recipientEmail !== "null"
    ) {
      try {
        const isApproved = status === "Confirmed" || req.body.approved === true;
        const displayDate = reservation.booking_date
          ? new Date(reservation.booking_date).toLocaleDateString("vi-VN")
          : "Chưa xác định";

        let displayTime = "Chưa rõ";
        if (reservation.booking_time) {
          const timeStr =
            reservation.booking_time instanceof Date
              ? reservation.booking_time.toISOString()
              : String(reservation.booking_time);
          displayTime = timeStr.includes("T")
            ? timeStr.split("T")[1].substring(0, 5)
            : timeStr.substring(0, 5);
        }

        const subject = isApproved
          ? "Yêu cầu đặt bàn đã được duyệt - The King Restaurant"
          : "Thông báo về yêu cầu đặt bàn - The King Restaurant";
        const html = `
          <p>Xin chào <strong>${reservation.customer_name || "Quý khách"}</strong>,</p>
          <p>Yêu cầu đặt bàn của bạn vào ngày <strong>${displayDate}</strong> lúc <strong>${displayTime}</strong> đã được nhà hàng <strong>${isApproved ? "DUYỆT THÀNH CÔNG" : "TỪ CHỐI TIẾP NHẬN"}</strong>.</p>
          <hr/>
          <p><strong>Chi tiết lịch đặt bàn:</strong></p>
          <ul>
            <li>Tên khách hàng: ${reservation.customer_name}</li>
            <li>Số điện thoại: ${reservation.phone}</li>
            <li>Thời gian nhận bàn: ${displayTime} ngày ${displayDate}</li>
            <li>Số lượng khách: ${reservation.guests} người</li>
            <li>Ghi chú đi kèm: ${reservation.note || "Không"}</li>
          </ul>
          <hr/>
          <p>Mọi thắc mắc vui lòng liên hệ hotline nhà hàng qua số <strong>0862680850</strong>.</p>
          <p>Trân trọng,<br/><strong>Ban quản lý The King Restaurant</strong></p>
        `;

        await sendStatusEmail({ to: recipientEmail, subject, html });
        emailStatusMsg =
          "Hệ thống đã tự động gửi thư điện tử thông báo lịch trình thành công!";
      } catch (emailErr) {
        emailStatusMsg = "Lỗi cổng SMTP gửi mail.";
      }
    }

    res.json({
      success: true,
      message: `Xử lý cập nhật trạng thái đơn thành công! (${emailStatusMsg})`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

# The King Restaurant - Đồ Án Thực Tập Cơ Sở

Hệ thống ứng dụng Web Full-Stack quản lý thực đơn, điều phối sơ đồ vị trí bàn ăn hoàng gia và tích hợp **Trợ lý tư vấn ảo thông minh bằng Gemini AI API**.

---

## Được thực hiển bởi các thành viên:

- Lê Bá Thuần; đảm nhiệm phần homePage, admin, booking.
- Trần Cao Nguyên; đảm nhiệm phần chatBox, menu.
- Đậu Quốc Dũng; hỗ trợ viết file báo cáo lần 2.

# Với sự hướng dẫn của giảng viên: Nguyễn Anh Hào

---

## Giới Thiệu Dự Án

Dự án được xây dựng nhằm mục đích số hóa và tối ưu hóa toàn diện quy trình vận hành nội bộ của nhà hàng. Ứng dụng giải quyết triệt để các bài toán thực tế về điều phối chỗ ngồi, tự động hóa gửi email lịch hẹn thông báo hành trình cho thực khách thông qua giao diện quản trị Admin trực quan và hệ thống bộ lọc thực đơn thông minh phía Client. (cụ thể có trong file báo cáo)

---

## Thành Phần Công Nghệ (Tech Stack)

- **Frontend (Client & Admin Panel):** ReactJS, Vite, React Router DOM, Canvas API (Hiệu ứng hạt bụi vàng), CSS3 Glassmorphism phong cách sang trọng.
- **Backend API Server:** NodeJS, ExpressJS, Nodemailer (Cổng SMTP tự động gửi thư thông báo thư điện tử).
- **Cơ Sở Dữ Liệu:** Microsoft SQL Server (`mssql` driver).
- **Trí Tuệ Nhân Tạo:** Google Gemini API (Triển khai mô hình tích hợp Context-Aware Prompting / Naive RAG).

---

## Kiến Trúc Thư Mục Hệ Thống

```tree
DoAnTTCS/
├── backend/
│   ├── config/
│   │   └── database.js       # Cấu hình kết nối Microsoft SQL Server
│   ├── routes/
│   │   └── adminRoutes.js    # Hệ thống Router xử lý 16 API quản trị cốt lõi
│   ├── .env                  # Lưu trữ biến môi trường bảo mật (Cổng kết nối, SMTP, AI Key)
│   └── server.js             # Khởi chạy Express Server & Middleware CORS
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── navbar.jsx    # Thanh điều hướng đồng bộ các trang
    │   ├── pages/
    |   |   |
    |   |   ├── page_admin     # Điều hành các hoạt động của hệ thống
    │   │   ├── menu.jsx      # Thực đơn phía khách hàng tích hợp đa bộ lọc chuỗi ký tự
    │   │   ├── homepage.jsx  # Trang chủ giao diện, thông tin nhà hàng, besterseller, style bàn ăn
    │   │   ├──...            # các trang chức năng khác
    │   │
    │   │
    │   ├── App.jsx
    │   └── main.jsx
```

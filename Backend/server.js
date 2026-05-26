<<<<<<< HEAD
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import adminRoutes from "./routes/adminRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import chatRoute from "./routes/chatRoute.js";

dotenv.config();
console.log("GEMINI KEY:", process.env.GEMINI_API_KEY); 

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/v2/categories", categoryRoutes);
app.use("/api", adminRoutes);
app.use("/api", chatRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server Backend đang chạy tại: http://localhost:${PORT}`);
});
=======
// File: server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Nhập các module đã tách (Bắt buộc phải có đuôi .js)
import { connectDB } from "./config/database.js";
import adminRoutes from "./routes/adminRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import chatRoute from "./routes/chatRoute.js"; // ← Đã thêm chatRoute chuẩn ES6

// Khởi tạo biến môi trường
dotenv.config();

// Khởi tạo Express
const app = express();

// Cấu hình Middleware
app.use(cors());
app.use(express.json()); // Đọc dữ liệu JSON từ Frontend gửi lên

// Kết nối database
connectDB();

// Định tuyến Routes
app.use("/api/v2/categories", categoryRoutes);
app.use("/api", adminRoutes);
app.use("/api", chatRoute); // ← Đã gắn route chat vào hệ thống

// Khởi động server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server Backend đang chạy tại: http://localhost:${PORT}`);
});
>>>>>>> 8db61718420d4a354702b0b9fa7586c47e330e91

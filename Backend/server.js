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
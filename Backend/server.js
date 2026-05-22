const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./config/database");
<<<<<<< HEAD
// Kết nối database
connectDB();

// Routes
=======

const adminRoutes    = require("./routes/adminRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const chatRoute      = require("./routes/chatRoute");      // ← thêm

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

>>>>>>> 3b1847d ( update)
app.use("/api/v2/categories", categoryRoutes);
app.use("/api", adminRoutes);
app.use("/api", chatRoute);                                // ← thêm

<<<<<<< HEAD
// Start server
=======
>>>>>>> 3b1847d ( update)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server Backend đang chạy tại: http://localhost:${PORT}`);
});

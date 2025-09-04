// OLD (ES Modules):
// import express from "express";

// NEW (CommonJS):
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const itemRoutes = require("./routes/itemRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const chatRoutes = require("./routes/chatRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const rentalRoutes = require("./routes/rentalRoutes");
const adminRoutes = require("./routes/adminRoutesSimple");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Add request logging
app.use((req, res, next) => {
    console.log(`📞 ${req.method} ${req.path}`);
    next();
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Test admin route directly in server.js
app.get("/api/admin/test-direct", (req, res) => {
  console.log("📞 Direct admin test route called");
  res.json({ message: "Direct admin route working!" });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/rentals", rentalRoutes);
console.log("🔧 Registering admin routes...");
app.use("/api/admin", adminRoutes);
console.log("✅ Admin routes registered");

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

app.get("/", (req, res) => {
  res.send("Backend is running!");
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server started on port ${PORT}`);
});

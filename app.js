require('dotenv').config();
const express = require('express');
const app = express();
const connectDB = require('./config/db');
const cors = require("cors");
const auth = require("./middleware/auth");

const allowedOrigins = ["http://localhost:4200"];

// Connect to MongoDB
connectDB();

app.use(express.json());

// ✅ CORS Configuration (important for Angular frontend)
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// ✅ Routes
const webhookRoutes = require('./routes/webhook.routes');
app.use("/webhook", webhookRoutes);
console.log("webhookRoutes type:", typeof webhookRoutes);

// ✅ User Routes
const userRoutes = require('./routes/user');
app.use("/api/users", userRoutes);

// (Optional) Protected test route using auth middleware
app.get("/protected", auth, (req, res) => {
  res.json({ msg: "Protected route accessed successfully" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

module.exports = app;
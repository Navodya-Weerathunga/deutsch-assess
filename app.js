require('dotenv').config();
const express = require('express');
const app = express();
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

app.use(express.json());


const webhookRoutes = require('./routes/webhook.routes');
app.use("/webhook", webhookRoutes);
console.log("webhookRoutes type:", typeof webhookRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

module.exports = app;
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const connectDB = require("./config/db");


// Load .env from Backend folder (works when you run "node server.js" from Backend)
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: "./.env" });
  console.log("Loaded .env from:", envPath);
} else {
  require("dotenv").config({ path: path.join(process.cwd(), ".env") });
  require("dotenv").config({ path: path.join(process.cwd(), "Backend", ".env") });
  console.log("Tried loading .env from cwd");
}

const authRoutes = require("./routes/authRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const profileRoutes = require("./routes/profileRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const ambulanceRoutes = require("./routes/ambulanceRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", settingsRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ambulance", ambulanceRoutes);
app.use("/api/medicine", medicineRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/hospital", hospitalRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Help Desk System API Running");
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  const hasEmail = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  console.log(hasEmail ? `Email: configured (${process.env.EMAIL_USER})` : "Email: NOT configured – check Backend/.env has EMAIL_USER and EMAIL_PASS (no spaces around =)");
  if (!hasEmail) console.log("Current EMAIL_USER:", process.env.EMAIL_USER ? "set" : "missing", "| EMAIL_PASS:", process.env.EMAIL_PASS ? "set" : "missing");
});
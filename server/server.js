const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

dotenv.config();

const connectDB = require("./config/db");

// Route Imports
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const internshipRoutes = require("./routes/internshipRoutes");
const reportRoutes = require("./routes/reportRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const managerRoutes = require("./routes/managerRoutes");

// Error Middleware
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Connect Database
connectDB();

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use("/uploads",express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/student-dashboard", dashboardRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/manager", managerRoutes);

// Home Route
app.get("/", (req, res) => {
  res.send("InternTrack Backend Running");
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});
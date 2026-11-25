const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const { clientUrl } = require("./config/env");
const loggerMiddleware = require("./middleware/loggerMiddleware");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const userRoutes = require("./routes/userRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const settingRoutes = require("./routes/settingRoutes");

const app = express();

app.use(helmet());
app.use(cors({ origin: clientUrl, credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(loggerMiddleware);

app.get("/", (req, res) => {
    res.send("Hospital Management System API Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/settings", settingRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

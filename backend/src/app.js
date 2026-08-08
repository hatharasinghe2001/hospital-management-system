const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const { clientUrl } = require("./config/env");
const loggerMiddleware = require("./middleware/loggerMiddleware");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");

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

app.use(notFound);
app.use(errorHandler);

module.exports = app;

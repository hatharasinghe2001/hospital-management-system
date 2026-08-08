const { nodeEnv } = require("../config/env");

function notFound(req, res, next) {
    res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Server error";

    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors).map((e) => e.message).join(", ");
    }

    if (err.code === 11000) {
        statusCode = 409;
        message = `Duplicate value for field: ${Object.keys(err.keyValue).join(", ")}`;
    }

    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    res.status(statusCode).json({
        success: false,
        message,
        stack: nodeEnv === "development" ? err.stack : undefined,
    });
}

module.exports = { notFound, errorHandler };

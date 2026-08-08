const dotenv = require("dotenv");

dotenv.config();

module.exports = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || "development",
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    defaultAdmin: {
        username: process.env.DEFAULT_ADMIN_USERNAME || "admin",
        password: process.env.DEFAULT_ADMIN_PASSWORD || "Admin@123",
        email: process.env.DEFAULT_ADMIN_EMAIL || "admin@hospital.com",
    },
};

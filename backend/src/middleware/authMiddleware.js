const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const User = require("../models/User");

async function protect(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }

    try {
        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, jwtSecret);

        const user = await User.findById(decoded.id);
        if (!user || !user.isActive) {
            return res.status(401).json({ success: false, message: "Not authorized, user not found" });
        }

        req.user = { id: user._id.toString(), role: user.role };
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Not authorized, invalid token" });
    }
}

module.exports = protect;

const jwt = require("jsonwebtoken");
const { jwtSecret, jwtExpiresIn } = require("../config/env");

function generateToken(user) {
    return jwt.sign(
        { id: user._id, role: user.role },
        jwtSecret,
        { expiresIn: jwtExpiresIn }
    );
}

module.exports = generateToken;

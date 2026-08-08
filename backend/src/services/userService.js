const User = require("../models/User");

async function listUsers() {
    const users = await User.find({}).sort({ role: 1, name: 1 }).select("name username email role isActive");
    return users.map((u) => u.toSafeObject());
}

module.exports = { listUsers };

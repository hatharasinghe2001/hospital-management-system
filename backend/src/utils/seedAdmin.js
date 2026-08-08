const User = require("../models/User");
const { defaultAdmin } = require("../config/env");

async function seedAdmin() {
    const existing = await User.findOne({ role: "admin" });
    if (existing) return;

    await User.create({
        name: "System Administrator",
        username: defaultAdmin.username,
        email: defaultAdmin.email,
        password: defaultAdmin.password,
        role: "admin",
    });

    console.log(
        `Seeded default admin account -> username: ${defaultAdmin.username}, password: ${defaultAdmin.password}`
    );
}

module.exports = seedAdmin;

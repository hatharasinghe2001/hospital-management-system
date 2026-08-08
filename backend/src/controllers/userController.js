const userService = require("../services/userService");
const asyncHandler = require("../utils/asyncHandler");

const getUsers = asyncHandler(async (req, res) => {
    const users = await userService.listUsers();
    res.status(200).json({ success: true, users });
});

module.exports = { getUsers };

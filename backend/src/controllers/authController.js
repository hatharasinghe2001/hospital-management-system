const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");

const login = asyncHandler(async (req, res) => {
    const { username, password, portal } = req.body;
    const { token, user } = await authService.login({ username, password, portal });
    res.status(200).json({ success: true, token, user });
});

const register = asyncHandler(async (req, res) => {
    const creatorRole = req.user?.role;
    const { token, user } = await authService.register(req.body, creatorRole);
    res.status(201).json({ success: true, token, user });
});

const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user: user.toSafeObject() });
});

const updateProfile = asyncHandler(async (req, res) => {
    const { name, email, avatar } = req.body;
    const user = await authService.updateProfile(req.user.id, { name, email, avatar });
    res.status(200).json({ success: true, user });
});

module.exports = { login, register, getMe, updateProfile };

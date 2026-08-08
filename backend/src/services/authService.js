const User = require("../models/User");
const { INTERNAL_ROLES } = User;
const generateToken = require("../utils/generateToken");

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

async function login({ username, password, portal }) {
    if (!username || !password || !portal) {
        throw new AppError("Username, password and portal are required", 400);
    }

    const user = await User.findOne({
        username: username.trim().toLowerCase(),
    }).select("+password");

    if (!user || !user.isActive) {
        throw new AppError("Invalid credentials", 401);
    }

    const isInternalUser = INTERNAL_ROLES.includes(user.role);
    const isInternalPortal = portal === "internal";
    if (isInternalUser !== isInternalPortal) {
        throw new AppError("Invalid credentials", 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new AppError("Invalid credentials", 401);
    }

    const token = generateToken(user);
    return { token, user: user.toSafeObject() };
}

async function register({ name, username, email, password, role, phone }, creatorRole) {
    if (!name || !username || !email || !password || !role) {
        throw new AppError("Name, username, email, password and role are required", 400);
    }

    if (role !== "patient" && creatorRole !== "admin") {
        throw new AppError("Only an admin can create staff accounts", 403);
    }

    const existing = await User.findOne({
        $or: [{ username: username.trim().toLowerCase() }, { email: email.trim().toLowerCase() }],
    });
    if (existing) {
        throw new AppError("Username or email already in use", 409);
    }

    const user = await User.create({ name, username, email, password, role, phone });
    const token = generateToken(user);
    return { token, user: user.toSafeObject() };
}

async function updateProfile(userId, { name, email, avatar }) {
    const update = {};
    if (name !== undefined) update.name = name;
    if (avatar !== undefined) update.avatar = avatar;

    if (email !== undefined) {
        const normalizedEmail = email.trim().toLowerCase();
        const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: userId } });
        if (existing) {
            throw new AppError("Email already in use", 409);
        }
        update.email = normalizedEmail;
    }

    const user = await User.findByIdAndUpdate(userId, update, { new: true, runValidators: true });
    if (!user) {
        throw new AppError("User not found", 404);
    }
    return user.toSafeObject();
}

module.exports = { login, register, updateProfile, AppError };

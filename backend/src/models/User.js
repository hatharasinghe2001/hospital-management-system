const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ROLES = ["admin", "doctor", "receptionist", "nurse", "patient"];
const INTERNAL_ROLES = ROLES.filter((role) => role !== "patient");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ROLES,
            required: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        avatar: {
            type: String,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
    return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
    return {
        id: this._id,
        name: this.name,
        username: this.username,
        email: this.email,
        role: this.role,
        phone: this.phone,
        avatar: this.avatar,
        isActive: this.isActive,
    };
};

module.exports = mongoose.model("User", userSchema);
module.exports.ROLES = ROLES;
module.exports.INTERNAL_ROLES = INTERNAL_ROLES;

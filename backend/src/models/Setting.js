const mongoose = require("mongoose");

// Simple key/value store for system-wide settings editable by admins (e.g. hospital charge).
const settingSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);

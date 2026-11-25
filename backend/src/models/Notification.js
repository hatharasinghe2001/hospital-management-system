const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipientUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        recipientRole: {
            type: String,
            enum: ["admin", "doctor", "receptionist", "nurse", "patient"],
        },
        type: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);

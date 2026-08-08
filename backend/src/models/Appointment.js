const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        specialty: {
            type: String,
            trim: true,
        },
        day: {
            type: String,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        reason: {
            type: String,
            trim: true,
            default: "",
        },
        fee: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled"],
            default: "pending",
        },
        appointmentNumber: {
            type: Number,
        },
        confirmedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        confirmedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);

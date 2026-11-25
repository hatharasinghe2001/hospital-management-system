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
        date: {
            type: Date,
            required: true,
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
        // Doctor's consultation fee at booking time
        fee: {
            type: Number,
            required: true,
            min: 0,
        },
        // Hospital charge at booking time (admin-configurable); older appointments default to 0
        hospitalCharge: {
            type: Number,
            default: 0,
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
        cancelledAt: {
            type: Date,
        },
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        cancelledByRole: {
            type: String,
            enum: ["admin", "doctor", "receptionist", "nurse", "patient"],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);

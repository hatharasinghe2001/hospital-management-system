const mongoose = require("mongoose");

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const doctorProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        specialty: {
            type: String,
            trim: true,
            default: "General Physician",
        },
        consultationFee: {
            type: Number,
            default: 0,
            min: 0,
        },
        availableDays: {
            type: [String],
            enum: DAYS,
            default: [],
        },
        startTime: {
            type: String,
            default: "",
        },
        endTime: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

doctorProfileSchema.methods.toSafeObject = function toSafeObject() {
    return {
        id: this._id,
        user: this.user,
        specialty: this.specialty,
        consultationFee: this.consultationFee,
        availableDays: this.availableDays,
        startTime: this.startTime,
        endTime: this.endTime,
    };
};

module.exports = mongoose.model("Doctor", doctorProfileSchema);
module.exports.DAYS = DAYS;

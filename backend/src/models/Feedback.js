const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);

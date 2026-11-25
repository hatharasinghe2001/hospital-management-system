const Feedback = require("../models/Feedback");

function populateFields(query) {
    return query.populate("user", "name username role avatar");
}

async function createFeedback(userId, { message, rating }) {
    const feedback = await Feedback.create({
        user: userId,
        message: message.trim(),
        rating: rating || undefined,
    });
    return populateFields(Feedback.findById(feedback._id));
}

async function getAllFeedback() {
    return populateFields(Feedback.find({}).sort({ createdAt: -1 }));
}

module.exports = {
    createFeedback,
    getAllFeedback,
};

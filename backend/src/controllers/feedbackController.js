const feedbackService = require("../services/feedbackService");
const asyncHandler = require("../utils/asyncHandler");

const createFeedback = asyncHandler(async (req, res) => {
    const feedback = await feedbackService.createFeedback(req.user.id, req.body);
    res.status(201).json({ success: true, feedback });
});

const getAllFeedback = asyncHandler(async (req, res) => {
    const feedback = await feedbackService.getAllFeedback();
    res.status(200).json({ success: true, feedback });
});

module.exports = {
    createFeedback,
    getAllFeedback,
};

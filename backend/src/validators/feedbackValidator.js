const { body } = require("express-validator");

const createFeedbackValidator = [
    body("message").trim().notEmpty().withMessage("Feedback message is required").isLength({ max: 1000 }),
    body("rating").optional().isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
];

module.exports = { createFeedbackValidator };

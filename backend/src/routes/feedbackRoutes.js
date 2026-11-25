const express = require("express");
const { createFeedback, getAllFeedback } = require("../controllers/feedbackController");
const protect = require("../middleware/authMiddleware");
const restrictTo = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");
const { createFeedbackValidator } = require("../validators/feedbackValidator");

const router = express.Router();

router.post(
    "/",
    protect,
    restrictTo("admin", "doctor", "nurse", "patient"),
    createFeedbackValidator,
    validate,
    createFeedback
);
router.get("/", protect, getAllFeedback);

module.exports = router;

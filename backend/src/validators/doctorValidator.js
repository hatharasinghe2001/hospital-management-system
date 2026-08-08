const { body } = require("express-validator");
const { DAYS } = require("../models/Doctor");

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

const updateScheduleValidator = [
    body("specialty").optional().trim().notEmpty().withMessage("Specialty cannot be empty"),
    body("consultationFee").optional().isFloat({ min: 0 }).withMessage("Consultation fee must be a positive number"),
    body("availableDays").optional().isArray().withMessage("Available days must be a list"),
    body("availableDays.*").optional().isIn(DAYS).withMessage(`Each day must be one of: ${DAYS.join(", ")}`),
    body("startTime").optional().matches(TIME_RE).withMessage("Start time must be in HH:MM format"),
    body("endTime").optional().matches(TIME_RE).withMessage("End time must be in HH:MM format"),
];

module.exports = { updateScheduleValidator, TIME_RE };

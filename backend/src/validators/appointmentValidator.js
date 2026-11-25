const { body } = require("express-validator");

const createAppointmentValidator = [
    body("doctorId").trim().notEmpty().withMessage("Doctor is required"),
    body("date").isISO8601().withMessage("Date must be a valid date (YYYY-MM-DD)"),
    body("time")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("Time must be in HH:MM format"),
    body("reason").optional().trim(),
    body("patientName")
        .isString()
        .withMessage("Patient name is required")
        .trim()
        .notEmpty()
        .withMessage("Patient name is required")
        .isLength({ max: 100 })
        .withMessage("Patient name must be 100 characters or fewer"),
    body("patientAge")
        .isInt({ min: 0, max: 150 })
        .withMessage("Age must be a whole number between 0 and 150")
        .toInt(),
    body("patientAddress")
        .isString()
        .withMessage("Address is required")
        .trim()
        .notEmpty()
        .withMessage("Address is required")
        .isLength({ max: 300 })
        .withMessage("Address must be 300 characters or fewer"),
];

module.exports = { createAppointmentValidator };

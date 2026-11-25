const { body } = require("express-validator");

const createAppointmentValidator = [
    body("doctorId").trim().notEmpty().withMessage("Doctor is required"),
    body("date").isISO8601().withMessage("Date must be a valid date (YYYY-MM-DD)"),
    body("time")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("Time must be in HH:MM format"),
    body("reason").optional().trim(),
];

module.exports = { createAppointmentValidator };

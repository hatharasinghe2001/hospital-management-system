const { body } = require("express-validator");
const { DAYS } = require("../models/Doctor");

const createAppointmentValidator = [
    body("doctorId").trim().notEmpty().withMessage("Doctor is required"),
    body("day").isIn(DAYS).withMessage(`Day must be one of: ${DAYS.join(", ")}`),
    body("time")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("Time must be in HH:MM format"),
    body("reason").optional().trim(),
];

module.exports = { createAppointmentValidator };

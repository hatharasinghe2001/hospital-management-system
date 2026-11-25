const { body } = require("express-validator");

const hospitalChargeValidator = [
    body("hospitalCharge")
        .exists({ values: "null" })
        .withMessage("Hospital charge is required")
        .bail()
        .isFloat({ min: 0, max: 1000000 })
        .withMessage("Hospital charge must be a number of 0 or more")
        .toFloat(),
];

module.exports = { hospitalChargeValidator };

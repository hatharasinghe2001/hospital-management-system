const { body } = require("express-validator");

const sendMessageValidator = [
    body("body")
        .isString()
        .withMessage("Message is required")
        .trim()
        .notEmpty()
        .withMessage("Message is required")
        .isLength({ max: 2000 })
        .withMessage("Message must be 2000 characters or fewer"),
];

module.exports = { sendMessageValidator };

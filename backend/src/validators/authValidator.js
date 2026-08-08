const { body } = require("express-validator");
const { ROLES } = require("../models/User");

const loginValidator = [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
    body("portal").isIn(["internal", "external"]).withMessage("Portal must be one of: internal, external"),
];

const registerValidator = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("username").trim().isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
    body("email").trim().isEmail().withMessage("A valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").isIn(ROLES).withMessage(`Role must be one of: ${ROLES.join(", ")}`),
];

const profileValidator = [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("email").optional().trim().isEmail().withMessage("A valid email is required"),
    body("avatar").optional().isString().withMessage("Avatar must be a string"),
];

module.exports = { loginValidator, registerValidator, profileValidator };

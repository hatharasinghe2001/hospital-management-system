const express = require("express");
const { login, register, getMe, updateProfile } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const restrictTo = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");
const { loginValidator, registerValidator, profileValidator } = require("../validators/authValidator");

const router = express.Router();

// Public: patients self-register (role is force-checked as "patient" in the service layer)
router.post("/register", registerValidator, validate, register);

// Admin-only: create doctor / receptionist / admin accounts
router.post("/create-staff", protect, restrictTo("admin"), registerValidator, validate, register);

router.post("/login", loginValidator, validate, login);
router.get("/me", protect, getMe);
router.put("/profile", protect, profileValidator, validate, updateProfile);

module.exports = router;

const express = require("express");
const { getDoctors, getDoctor, getMyProfile, updateMyProfile } = require("../controllers/doctorController");
const protect = require("../middleware/authMiddleware");
const restrictTo = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");
const { updateScheduleValidator } = require("../validators/doctorValidator");

const router = express.Router();

router.get("/me", protect, restrictTo("doctor"), getMyProfile);
router.put("/me", protect, restrictTo("doctor"), updateScheduleValidator, validate, updateMyProfile);

router.get("/", protect, getDoctors);
router.get("/:id", protect, getDoctor);

module.exports = router;

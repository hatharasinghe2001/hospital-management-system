const express = require("express");
const { getHospitalCharge, updateHospitalCharge } = require("../controllers/settingController");
const protect = require("../middleware/authMiddleware");
const restrictTo = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");
const { hospitalChargeValidator } = require("../validators/settingValidator");

const router = express.Router();

// Any signed-in user can see the charge (patients see it before booking); only admins change it.
router.get("/hospital-charge", protect, getHospitalCharge);
router.put("/hospital-charge", protect, restrictTo("admin"), hospitalChargeValidator, validate, updateHospitalCharge);

module.exports = router;

const express = require("express");
const {
    createAppointment,
    getMyAppointments,
    getDoctorAppointments,
    getAllAppointments,
    confirmAppointment,
} = require("../controllers/appointmentController");
const protect = require("../middleware/authMiddleware");
const restrictTo = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");
const { createAppointmentValidator } = require("../validators/appointmentValidator");

const router = express.Router();

router.post("/", protect, restrictTo("patient"), createAppointmentValidator, validate, createAppointment);
router.get("/mine", protect, restrictTo("patient"), getMyAppointments);
router.get("/doctor-mine", protect, restrictTo("doctor"), getDoctorAppointments);
router.get("/", protect, restrictTo("receptionist", "admin"), getAllAppointments);
router.patch("/:id/confirm", protect, restrictTo("receptionist", "admin"), confirmAppointment);

module.exports = router;

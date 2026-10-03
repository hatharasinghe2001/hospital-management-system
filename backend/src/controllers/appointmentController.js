const appointmentService = require("../services/appointmentService");
const asyncHandler = require("../utils/asyncHandler");

const createAppointment = asyncHandler(async (req, res) => {
    const appointment = await appointmentService.createAppointment(req.user.id, req.body);
    res.status(201).json({ success: true, appointment });
});

const getMyAppointments = asyncHandler(async (req, res) => {
    const appointments = await appointmentService.getMyAppointments(req.user.id);
    res.status(200).json({ success: true, appointments });
});

const getDoctorAppointments = asyncHandler(async (req, res) => {
    const appointments = await appointmentService.getDoctorAppointments(req.user.id);
    res.status(200).json({ success: true, appointments });
});

const getAllAppointments = asyncHandler(async (req, res) => {
    const appointments = await appointmentService.getAllAppointments();
    res.status(200).json({ success: true, appointments });
});

const getStats = asyncHandler(async (req, res) => {
    const stats = await appointmentService.getStats();
    res.status(200).json({ success: true, stats });
});

const confirmAppointment = asyncHandler(async (req, res) => {
    const appointment = await appointmentService.confirmAppointment(req.params.id, req.user.id);
    res.status(200).json({ success: true, appointment });
});

module.exports = {
    createAppointment,
    getMyAppointments,
    getDoctorAppointments,
    getAllAppointments,
    getStats,
    confirmAppointment,
};

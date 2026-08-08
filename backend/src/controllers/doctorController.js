const doctorService = require("../services/doctorService");
const asyncHandler = require("../utils/asyncHandler");

const getDoctors = asyncHandler(async (req, res) => {
    const doctors = await doctorService.listDoctors();
    res.status(200).json({ success: true, doctors });
});

const getDoctor = asyncHandler(async (req, res) => {
    const doctor = await doctorService.getDoctorById(req.params.id);
    res.status(200).json({ success: true, doctor });
});

const getMyProfile = asyncHandler(async (req, res) => {
    const profile = await doctorService.getMyProfile(req.user.id);
    res.status(200).json({ success: true, profile });
});

const updateMyProfile = asyncHandler(async (req, res) => {
    const profile = await doctorService.updateMyProfile(req.user.id, req.body);
    res.status(200).json({ success: true, profile });
});

module.exports = { getDoctors, getDoctor, getMyProfile, updateMyProfile };

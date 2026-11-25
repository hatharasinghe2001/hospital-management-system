const settingService = require("../services/settingService");
const asyncHandler = require("../utils/asyncHandler");

const getHospitalCharge = asyncHandler(async (req, res) => {
    const hospitalCharge = await settingService.getHospitalCharge();
    res.status(200).json({ success: true, hospitalCharge });
});

const updateHospitalCharge = asyncHandler(async (req, res) => {
    const hospitalCharge = await settingService.setHospitalCharge(req.body.hospitalCharge, req.user.id);
    res.status(200).json({ success: true, hospitalCharge });
});

module.exports = {
    getHospitalCharge,
    updateHospitalCharge,
};

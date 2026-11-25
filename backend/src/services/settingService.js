const Setting = require("../models/Setting");

const HOSPITAL_CHARGE_KEY = "hospitalCharge";
const DEFAULT_HOSPITAL_CHARGE = 1000;

// Hospital charge added to every appointment on top of the doctor's consultation fee.
async function getHospitalCharge() {
    const setting = await Setting.findOne({ key: HOSPITAL_CHARGE_KEY }).lean();
    const value = Number(setting?.value);
    return Number.isFinite(value) && value >= 0 ? value : DEFAULT_HOSPITAL_CHARGE;
}

async function setHospitalCharge(amount, adminId) {
    const value = Number(amount);
    await Setting.findOneAndUpdate(
        { key: HOSPITAL_CHARGE_KEY },
        { value, updatedBy: adminId },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return value;
}

module.exports = {
    getHospitalCharge,
    setHospitalCharge,
};

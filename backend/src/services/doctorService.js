const Doctor = require("../models/Doctor");
const User = require("../models/User");
const { AppError } = require("./authService");

async function listDoctors() {
    const doctors = await User.find({ role: "doctor", isActive: true }).select("name username email avatar");

    const profiles = await Doctor.find({ user: { $in: doctors.map((d) => d._id) } });
    const profileByUserId = new Map(profiles.map((p) => [p.user.toString(), p]));

    return doctors.map((doctor) => {
        const profile = profileByUserId.get(doctor._id.toString());
        return {
            id: doctor._id,
            name: doctor.name,
            avatar: doctor.avatar,
            specialty: profile?.specialty || "General Physician",
            consultationFee: profile?.consultationFee ?? 0,
            availableDays: profile?.availableDays || [],
            startTime: profile?.startTime || "",
            endTime: profile?.endTime || "",
        };
    });
}

async function getDoctorById(userId) {
    const doctor = await User.findOne({ _id: userId, role: "doctor", isActive: true }).select(
        "name username email avatar"
    );
    if (!doctor) {
        throw new AppError("Doctor not found", 404);
    }

    const profile = await Doctor.findOne({ user: doctor._id });

    return {
        id: doctor._id,
        name: doctor.name,
        avatar: doctor.avatar,
        specialty: profile?.specialty || "General Physician",
        consultationFee: profile?.consultationFee ?? 0,
        availableDays: profile?.availableDays || [],
        startTime: profile?.startTime || "",
        endTime: profile?.endTime || "",
    };
}

async function getMyProfile(userId) {
    let profile = await Doctor.findOne({ user: userId });
    if (!profile) {
        profile = await Doctor.create({ user: userId });
    }
    return profile.toSafeObject();
}

async function updateMyProfile(userId, { specialty, consultationFee, availableDays, startTime, endTime }) {
    const update = {};
    if (specialty !== undefined) update.specialty = specialty;
    if (consultationFee !== undefined) update.consultationFee = consultationFee;
    if (availableDays !== undefined) update.availableDays = availableDays;
    if (startTime !== undefined) update.startTime = startTime;
    if (endTime !== undefined) update.endTime = endTime;

    const profile = await Doctor.findOneAndUpdate(
        { user: userId },
        { $set: update, $setOnInsert: { user: userId } },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return profile.toSafeObject();
}

module.exports = { listDoctors, getDoctorById, getMyProfile, updateMyProfile };

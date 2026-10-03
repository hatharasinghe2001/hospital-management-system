const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const { AppError } = require("./authService");

function populateFields(query) {
    return query
        .populate("patient", "name username email phone")
        .populate("doctor", "name")
        .populate("confirmedBy", "name username");
}

async function createAppointment(patientId, { doctorId, day, time, reason }) {
    if (!doctorId || !day || !time) {
        throw new AppError("Doctor, day and time are required", 400);
    }

    const doctorUser = await User.findOne({ _id: doctorId, role: "doctor", isActive: true });
    if (!doctorUser) {
        throw new AppError("Doctor not found", 404);
    }

    const profile = await Doctor.findOne({ user: doctorId });
    if (!profile || !profile.availableDays.includes(day)) {
        throw new AppError("Doctor is not available on that day", 400);
    }
    if (!profile.startTime || !profile.endTime || time < profile.startTime || time > profile.endTime) {
        throw new AppError("Selected time is outside the doctor's availability", 400);
    }

    const existingCount = await Appointment.countDocuments({ doctor: doctorId, day });

    const appointment = await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        specialty: profile.specialty,
        day,
        time,
        reason: reason || "",
        fee: profile.consultationFee,
        appointmentNumber: existingCount + 1,
    });

    return populateFields(Appointment.findById(appointment._id));
}

async function getMyAppointments(patientId) {
    return populateFields(Appointment.find({ patient: patientId }).sort({ createdAt: -1 }));
}

async function getDoctorAppointments(doctorId) {
    return populateFields(Appointment.find({ doctor: doctorId }).sort({ createdAt: -1 }));
}

async function getAllAppointments() {
    return populateFields(Appointment.find({}).sort({ status: 1, createdAt: -1 }));
}

async function getStats() {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

    const [patientCount, doctorCount, todayAppointments, pendingAppointments, revenueResult] = await Promise.all([
        User.countDocuments({ role: "patient" }),
        User.countDocuments({ role: "doctor", isActive: true }),
        Appointment.countDocuments({ day: today }),
        Appointment.countDocuments({ status: "pending" }),
        Appointment.aggregate([
            { $match: { status: "confirmed" } },
            { $group: { _id: null, total: { $sum: "$fee" } } },
        ]),
    ]);

    return {
        patientCount,
        doctorCount,
        todayAppointments,
        pendingAppointments,
        revenue: revenueResult[0]?.total || 0,
    };
}

async function confirmAppointment(appointmentId, receptionistId) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        throw new AppError("Appointment not found", 404);
    }
    if (appointment.status === "confirmed") {
        throw new AppError("Appointment is already confirmed", 409);
    }

    appointment.status = "confirmed";
    appointment.confirmedBy = receptionistId;
    appointment.confirmedAt = new Date();
    await appointment.save();

    return populateFields(Appointment.findById(appointment._id));
}

module.exports = {
    createAppointment,
    getMyAppointments,
    getDoctorAppointments,
    getAllAppointments,
    getStats,
    confirmAppointment,
};

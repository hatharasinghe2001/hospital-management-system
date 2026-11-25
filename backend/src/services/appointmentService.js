const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const { AppError } = require("./authService");
const notificationService = require("./notificationService");
const { getHospitalCharge } = require("./settingService");

function populateFields(query) {
    return query
        .populate("patient", "name username email phone")
        .populate("doctor", "name")
        .populate("confirmedBy", "name username")
        .populate("cancelledBy", "name username role");
}

function startOfUtcDay(input) {
    const d = new Date(input);
    d.setUTCHours(0, 0, 0, 0);
    return d;
}

function endOfUtcDay(input) {
    const d = new Date(input);
    d.setUTCHours(23, 59, 59, 999);
    return d;
}

function weekdayOf(date) {
    return date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
}

function formatDateLabel(date) {
    return new Date(date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    });
}

async function createAppointment(patientId, { doctorId, date, time, reason }) {
    if (!doctorId || !date || !time) {
        throw new AppError("Doctor, date and time are required", 400);
    }

    const appointmentDate = startOfUtcDay(date);
    if (Number.isNaN(appointmentDate.getTime())) {
        throw new AppError("Invalid date", 400);
    }
    if (appointmentDate < startOfUtcDay(new Date())) {
        throw new AppError("Appointment date cannot be in the past", 400);
    }

    const doctorUser = await User.findOne({ _id: doctorId, role: "doctor", isActive: true });
    if (!doctorUser) {
        throw new AppError("Doctor not found", 404);
    }

    const day = weekdayOf(appointmentDate);

    const profile = await Doctor.findOne({ user: doctorId });
    if (!profile || !profile.availableDays.includes(day)) {
        throw new AppError("Doctor is not available on that day", 400);
    }
    if (!profile.startTime || !profile.endTime || time < profile.startTime || time > profile.endTime) {
        throw new AppError("Selected time is outside the doctor's availability", 400);
    }

    const [existingCount, hospitalCharge] = await Promise.all([
        Appointment.countDocuments({ doctor: doctorId, date: appointmentDate }),
        getHospitalCharge(),
    ]);

    const appointment = await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        specialty: profile.specialty,
        date: appointmentDate,
        day,
        time,
        reason: reason || "",
        fee: profile.consultationFee,
        hospitalCharge,
        appointmentNumber: existingCount + 1,
    });

    return populateFields(Appointment.findById(appointment._id));
}

async function getMyAppointments(patientId) {
    return populateFields(Appointment.find({ patient: patientId }).sort({ date: 1, time: 1 }));
}

async function getDoctorAppointments(doctorId) {
    return populateFields(Appointment.find({ doctor: doctorId }).sort({ date: 1, time: 1 }));
}

async function getAllAppointments() {
    return populateFields(Appointment.find({}).sort({ date: 1, time: 1 }));
}

async function getStats() {
    const now = new Date();

    const [patientCount, doctorCount, todayAppointments, pendingAppointments, cancelledAppointments, revenueResult] =
        await Promise.all([
            User.countDocuments({ role: "patient" }),
            User.countDocuments({ role: "doctor", isActive: true }),
            Appointment.countDocuments({
                date: { $gte: startOfUtcDay(now), $lte: endOfUtcDay(now) },
                status: { $ne: "cancelled" },
            }),
            Appointment.countDocuments({ status: "pending" }),
            Appointment.countDocuments({ status: "cancelled" }),
            Appointment.aggregate([
                { $match: { status: "confirmed" } },
                {
                    $group: {
                        _id: null,
                        doctorFees: { $sum: "$fee" },
                        hospitalCharges: { $sum: { $ifNull: ["$hospitalCharge", 0] } },
                    },
                },
            ]),
        ]);

    return {
        patientCount,
        doctorCount,
        todayAppointments,
        pendingAppointments,
        cancelledAppointments,
        doctorFeeRevenue: revenueResult[0]?.doctorFees || 0,
        hospitalChargeRevenue: revenueResult[0]?.hospitalCharges || 0,
        revenue: (revenueResult[0]?.doctorFees || 0) + (revenueResult[0]?.hospitalCharges || 0),
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

async function cancelAppointment(appointmentId, patientId) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        throw new AppError("Appointment not found", 404);
    }
    if (String(appointment.patient) !== String(patientId)) {
        throw new AppError("You can only cancel your own appointments", 403);
    }
    if (appointment.status === "cancelled") {
        throw new AppError("Appointment is already cancelled", 409);
    }

    appointment.status = "cancelled";
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = patientId;
    appointment.cancelledByRole = "patient";
    await appointment.save();

    const populated = await populateFields(Appointment.findById(appointment._id));

    const message = `${populated.patient.name} cancelled their appointment with Dr. ${populated.doctor.name} on ${formatDateLabel(populated.date)} at ${populated.time}.`;

    await Promise.all([
        notificationService.createNotification({
            recipientUser: appointment.doctor,
            type: "appointment_cancelled",
            message,
            appointment: appointment._id,
        }),
        notificationService.createNotification({
            recipientRole: "receptionist",
            type: "appointment_cancelled",
            message,
            appointment: appointment._id,
        }),
    ]);

    return populated;
}

module.exports = {
    createAppointment,
    getMyAppointments,
    getDoctorAppointments,
    getAllAppointments,
    getStats,
    confirmAppointment,
    cancelAppointment,
};

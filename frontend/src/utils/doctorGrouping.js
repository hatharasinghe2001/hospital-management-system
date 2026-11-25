export function groupAppointmentsByDoctor(appointments) {
  const groups = new Map();
  for (const appt of appointments) {
    const key = appt.doctor?._id || appt.doctor;
    if (!groups.has(key)) {
      groups.set(key, { doctorId: key, doctorName: appt.doctor?.name || "Unassigned", appointments: [] });
    }
    groups.get(key).appointments.push(appt);
  }
  return [...groups.values()].sort((a, b) => a.doctorName.localeCompare(b.doctorName));
}

const UNSCHEDULED = "unscheduled";

export function appointmentDateKey(appt) {
  const parsed = appt.date ? new Date(appt.date) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString().slice(0, 10) : UNSCHEDULED;
}

export function groupAppointmentsByDate(appointments) {
  const groups = new Map();
  for (const appt of appointments) {
    const key = appointmentDateKey(appt);
    if (!groups.has(key)) {
      groups.set(key, { date: key, appointments: [] });
    }
    groups.get(key).appointments.push(appt);
  }
  return [...groups.values()].sort((a, b) => {
    if (a.date === UNSCHEDULED) return 1;
    if (b.date === UNSCHEDULED) return -1;
    return a.date.localeCompare(b.date);
  });
}

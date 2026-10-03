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

// Appointment charge = doctor's consultation fee + hospital charge.

export function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

export function appointmentCharges(appt) {
  const doctorFee = Number(appt?.fee) || 0;
  const hospitalCharge = Number(appt?.hospitalCharge) || 0;
  return { doctorFee, hospitalCharge, total: doctorFee + hospitalCharge };
}

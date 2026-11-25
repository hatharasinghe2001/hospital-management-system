// Name entered on the booking form, falling back to the account name for older appointments.
export function patientDisplayName(appt) {
  return appt?.patientName || appt?.patient?.name || "";
}

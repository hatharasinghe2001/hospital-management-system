export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const SPECIALTIES = [
  "General Physician",
  "Cardiologist",
  "Dentist",
  "Dermatologist",
  "Neurologist",
  "Orthopedic",
  "Pediatrician",
  "Gynecologist",
  "ENT Specialist",
  "Psychiatrist",
];

// 30-minute slots between start ("HH:MM") and end ("HH:MM"), inclusive of start, exclusive of end.
export function generateTimeSlots(startTime, endTime) {
  if (!startTime || !endTime) return [];

  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  const slots = [];
  let minutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (minutes < endMinutes) {
    const h = String(Math.floor(minutes / 60)).padStart(2, "0");
    const m = String(minutes % 60).padStart(2, "0");
    slots.push(`${h}:${m}`);
    minutes += 30;
  }

  return slots;
}

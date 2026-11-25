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

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

export function weekdayOf(dateValue) {
  const d = typeof dateValue === "string" ? new Date(`${dateValue}T00:00:00Z`) : new Date(dateValue);
  return d.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
}

export function formatDateLabel(dateValue) {
  if (!dateValue) return "Date TBD";
  const d = typeof dateValue === "string" ? new Date(`${dateValue}T00:00:00Z`) : new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "Date TBD";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

// The next `count` calendar dates (YYYY-MM-DD) that fall on one of the doctor's available weekdays.
export function getUpcomingDates(availableDays, count = 10, horizonDays = 90) {
  const results = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let i = 0; i < horizonDays && results.length < count; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + i);
    const value = toDateInputValue(d);
    const weekday = weekdayOf(value);
    if (availableDays.includes(weekday)) {
      results.push({ value, weekday, label: formatDateLabel(value) });
    }
  }

  return results;
}

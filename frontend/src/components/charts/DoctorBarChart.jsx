import "./DoctorBarChart.css";

export function groupAppointmentsByDoctor(appointments) {
  const counts = new Map();
  for (const appt of appointments) {
    const name = appt.doctor?.name || "Unassigned";
    counts.set(name, (counts.get(name) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function groupRevenueByDoctor(appointments) {
  const revenue = new Map();
  for (const appt of appointments) {
    if (appt.status !== "confirmed") continue;
    const name = appt.doctor?.name || "Unassigned";
    revenue.set(name, (revenue.get(name) || 0) + (appt.fee || 0));
  }
  return [...revenue.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export default function DoctorBarChart({ rows, formatValue = (v) => v, emptyMessage = "No data yet." }) {
  const max = Math.max(...rows.map((r) => r.value), 1);

  if (rows.length === 0) {
    return <p className="doctor-bar-chart__empty">{emptyMessage}</p>;
  }

  return (
    <div className="doctor-bar-chart">
      {rows.map((row) => (
        <div key={row.name} className="doctor-bar-chart__row">
          <span className="doctor-bar-chart__label">Dr. {row.name}</span>
          <div className="doctor-bar-chart__track">
            <div
              className="doctor-bar-chart__fill"
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </div>
          <span className="doctor-bar-chart__value">{formatValue(row.value)}</span>
        </div>
      ))}
    </div>
  );
}

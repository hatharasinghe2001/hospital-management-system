import "./AppointmentList.css";
import "./AppointmentTable.css";

export default function AppointmentTable({ appointments }) {
  if (appointments.length === 0) {
    return <p className="appointment-table__empty">No appointments for this doctor.</p>;
  }

  return (
    <div className="appointment-table-wrap">
      <table className="appointment-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Phone</th>
            <th>Appt #</th>
            <th>Day</th>
            <th>Time</th>
            <th>Payment</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt) => (
            <tr key={appt._id}>
              <td>{appt.patient?.name}</td>
              <td>{appt.patient?.phone || "—"}</td>
              <td className="appointment-table__num">{appt.appointmentNumber ?? "—"}</td>
              <td>{appt.day}</td>
              <td>{appt.time}</td>
              <td className="appointment-table__num">${appt.fee}</td>
              <td>
                <span className={`appointment-status appointment-status--${appt.status}`}>{appt.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

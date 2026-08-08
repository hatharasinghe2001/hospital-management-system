import "./AppointmentList.css";

function StatusBadge({ status }) {
  return <span className={`appointment-status appointment-status--${status}`}>{status}</span>;
}

export default function AppointmentList({ appointments, viewerRole, onConfirm, confirmingId }) {
  if (appointments.length === 0) {
    return <p>No appointments yet.</p>;
  }

  return (
    <div className="appointment-list">
      {appointments.map((appt) => (
        <div key={appt._id} className="appointment-row">
          <div className="appointment-row__main">
            {viewerRole === "receptionist" && (
              <span className="appointment-row__title">{appt.patient?.name}</span>
            )}
            {viewerRole === "patient" && <span className="appointment-row__title">Dr. {appt.doctor?.name}</span>}
            {viewerRole === "receptionist" && (
              <span className="appointment-row__subtitle">with Dr. {appt.doctor?.name}</span>
            )}
            <span className="appointment-row__subtitle">{appt.specialty}</span>
          </div>

          <div className="appointment-row__meta">
            <span>{appt.day}</span>
            <span>{appt.time}</span>
            <span>${appt.fee}</span>
          </div>

          <div className="appointment-row__status">
            <StatusBadge status={appt.status} />
            {appt.status === "confirmed" && (
              <span className="appointment-row__number">#{appt.appointmentNumber}</span>
            )}
          </div>

          {viewerRole === "receptionist" && appt.status === "pending" && (
            <button
              type="button"
              className="appointment-row__confirm"
              onClick={() => onConfirm(appt._id)}
              disabled={confirmingId === appt._id}
            >
              {confirmingId === appt._id ? "Confirming..." : "Confirm"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

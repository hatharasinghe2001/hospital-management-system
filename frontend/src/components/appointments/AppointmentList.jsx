import { groupAppointmentsByDoctor } from "../../utils/doctorGrouping";
import "./AppointmentList.css";

function StatusBadge({ status }) {
  return <span className={`appointment-status appointment-status--${status}`}>{status}</span>;
}

function AppointmentRow({ appt, viewerRole, onConfirm, confirmingId }) {
  return (
    <div className="appointment-row">
      <div className="appointment-row__main">
        {viewerRole === "receptionist" && (
          <span className="appointment-row__title">{appt.patient?.name}</span>
        )}
        {viewerRole === "patient" && <span className="appointment-row__title">Dr. {appt.doctor?.name}</span>}
        <span className="appointment-row__subtitle">{appt.specialty}</span>
      </div>

      <div className="appointment-row__meta">
        <span>{appt.day}</span>
        <span>{appt.time}</span>
        <span>${appt.fee}</span>
      </div>

      <div className="appointment-row__status">
        <StatusBadge status={appt.status} />
        {appt.appointmentNumber != null && (
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
  );
}

export default function AppointmentList({ appointments, viewerRole, onConfirm, confirmingId }) {
  if (appointments.length === 0) {
    return <p>No appointments yet.</p>;
  }

  if (viewerRole === "receptionist") {
    const groups = groupAppointmentsByDoctor(appointments);
    return (
      <div className="appointment-groups">
        {groups.map((group) => (
          <div key={group.doctorName} className="appointment-group">
            <h3 className="appointment-group__title">
              Dr. {group.doctorName}
              <span className="appointment-group__count">{group.appointments.length}</span>
            </h3>
            <div className="appointment-list">
              {group.appointments.map((appt) => (
                <AppointmentRow
                  key={appt._id}
                  appt={appt}
                  viewerRole={viewerRole}
                  onConfirm={onConfirm}
                  confirmingId={confirmingId}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="appointment-list">
      {appointments.map((appt) => (
        <AppointmentRow
          key={appt._id}
          appt={appt}
          viewerRole={viewerRole}
          onConfirm={onConfirm}
          confirmingId={confirmingId}
        />
      ))}
    </div>
  );
}

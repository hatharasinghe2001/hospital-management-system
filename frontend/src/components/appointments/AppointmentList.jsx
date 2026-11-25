import { groupAppointmentsByDoctor, groupAppointmentsByDate } from "../../utils/doctorGrouping";
import { formatDateLabel } from "../../config/schedule";
import { appointmentCharges, formatMoney } from "../../utils/charges";
import ChargeBreakdown from "./ChargeBreakdown";
import "./AppointmentList.css";

function StatusBadge({ status }) {
  return <span className={`appointment-status appointment-status--${status}`}>{status}</span>;
}

function AppointmentRow({ appt, viewerRole, onConfirm, confirmingId, onCancel, cancelingId }) {
  const charges = appointmentCharges(appt);
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
        <span>{formatDateLabel(appt.date)}</span>
        <span>{appt.time}</span>
        {viewerRole !== "patient" && (
          <span title={`Doctor ${formatMoney(charges.doctorFee)} + Hospital ${formatMoney(charges.hospitalCharge)}`}>
            {formatMoney(charges.total)}
          </span>
        )}
      </div>

      {viewerRole === "patient" && (
        <ChargeBreakdown compact doctorFee={charges.doctorFee} hospitalCharge={charges.hospitalCharge} />
      )}

      <div className="appointment-row__status">
        <StatusBadge status={appt.status} />
        {appt.status === "cancelled" && viewerRole === "receptionist" && appt.cancelledByRole && (
          <span className="appointment-row__cancelled-by">by {appt.cancelledByRole}</span>
        )}
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

      {viewerRole === "patient" && (appt.status === "pending" || appt.status === "confirmed") && (
        <button
          type="button"
          className="appointment-row__cancel"
          onClick={() => onCancel(appt._id)}
          disabled={cancelingId === appt._id}
        >
          {cancelingId === appt._id ? "Cancelling..." : "Cancel"}
        </button>
      )}
    </div>
  );
}

export default function AppointmentList({ appointments, viewerRole, onConfirm, confirmingId, onCancel, cancelingId }) {
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
            {groupAppointmentsByDate(group.appointments).map((dateGroup) => (
              <div key={dateGroup.date} className="appointment-date-group">
                <h4 className="appointment-date-group__title">{formatDateLabel(dateGroup.date)}</h4>
                <div className="appointment-list">
                  {dateGroup.appointments.map((appt) => (
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
          onCancel={onCancel}
          cancelingId={cancelingId}
        />
      ))}
    </div>
  );
}

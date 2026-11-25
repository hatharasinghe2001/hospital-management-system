import { formatDateLabel } from "../../config/schedule";
import { appointmentCharges, formatMoney } from "../../utils/charges";
import { patientDisplayName } from "../../utils/patientDetails";
import "./AppointmentList.css";
import "./AppointmentTable.css";

export default function AppointmentTable({ appointments, hideDate = false }) {
  if (appointments.length === 0) {
    return <p className="appointment-table__empty">No appointments for this doctor.</p>;
  }

  return (
    <div className="appointment-table-wrap">
      <table className="appointment-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Age</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Appt #</th>
            {!hideDate && <th>Date</th>}
            <th>Time</th>
            <th>Doctor Fee</th>
            <th>Hospital Charge</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt) => {
            const charges = appointmentCharges(appt);
            return (
            <tr key={appt._id}>
              <td>
                {patientDisplayName(appt)}
                {appt.patientName && appt.patient?.name && appt.patientName !== appt.patient.name && (
                  <span className="appointment-table__booked-by">booked by {appt.patient.name}</span>
                )}
              </td>
              <td className="appointment-table__num">{appt.patientAge ?? "—"}</td>
              <td className="appointment-table__address">{appt.patientAddress || "—"}</td>
              <td>{appt.patient?.phone || "—"}</td>
              <td className="appointment-table__num">{appt.appointmentNumber ?? "—"}</td>
              {!hideDate && <td>{formatDateLabel(appt.date)}</td>}
              <td>{appt.time}</td>
              <td className="appointment-table__num">{formatMoney(charges.doctorFee)}</td>
              <td className="appointment-table__num">{formatMoney(charges.hospitalCharge)}</td>
              <td className="appointment-table__num appointment-table__total">{formatMoney(charges.total)}</td>
              <td>
                <span className={`appointment-status appointment-status--${appt.status}`}>{appt.status}</span>
                {appt.status === "cancelled" && appt.cancelledByRole && (
                  <span className="appointment-row__cancelled-by"> by {appt.cancelledByRole}</span>
                )}
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

import { formatMoney } from "../../utils/charges";
import "./ChargeBreakdown.css";

// Shows doctor fee + hospital charge = total, e.g. on the booking screen and in a patient's appointments.
export default function ChargeBreakdown({ doctorFee, hospitalCharge, compact = false }) {
  const total = (Number(doctorFee) || 0) + (Number(hospitalCharge) || 0);
  return (
    <dl className={compact ? "charge-breakdown charge-breakdown--compact" : "charge-breakdown"}>
      <div className="charge-breakdown__row">
        <dt>Doctor fee</dt>
        <dd>{formatMoney(doctorFee)}</dd>
      </div>
      <div className="charge-breakdown__row">
        <dt>Hospital charge</dt>
        <dd>{formatMoney(hospitalCharge)}</dd>
      </div>
      <div className="charge-breakdown__row charge-breakdown__row--total">
        <dt>Total</dt>
        <dd>{formatMoney(total)}</dd>
      </div>
    </dl>
  );
}

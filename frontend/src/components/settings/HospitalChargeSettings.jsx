import { useEffect, useState } from "react";
import { fetchHospitalCharge, updateHospitalCharge } from "../../api/settingsApi";
import { formatMoney } from "../../utils/charges";

// Admin form for the hospital charge added to every new appointment on top of the doctor's fee.
export default function HospitalChargeSettings() {
  const [current, setCurrent] = useState(null);
  const [amount, setAmount] = useState("");
  const [loadError, setLoadError] = useState("");
  const [status, setStatus] = useState({ error: "", success: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHospitalCharge()
      .then((value) => {
        setCurrent(value);
        setAmount(String(value));
      })
      .catch(() => setLoadError("Failed to load the hospital charge."));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const value = Number(amount);
    if (amount.trim() === "" || !Number.isFinite(value) || value < 0) {
      setStatus({ error: "Enter a valid amount of 0 or more.", success: "" });
      return;
    }
    setSaving(true);
    setStatus({ error: "", success: "" });
    try {
      const saved = await updateHospitalCharge(value);
      setCurrent(saved);
      setAmount(String(saved));
      setStatus({ error: "", success: `Hospital charge updated to ${formatMoney(saved)}.` });
    } catch (err) {
      setStatus({ error: err.response?.data?.message || "Failed to update the hospital charge.", success: "" });
    } finally {
      setSaving(false);
    }
  }

  if (loadError) return <p className="dashboard-form__error">{loadError}</p>;
  if (current === null) return <p>Loading…</p>;

  return (
    <form className="dashboard-form" onSubmit={handleSubmit}>
      <h2>Appointment Charges</h2>
      <p className="dashboard-form__hint">
        Patients pay the doctor's consultation fee plus this hospital charge. Changes apply to new bookings only;
        existing appointments keep the charge they were booked with.
      </p>

      <label>
        Hospital charge ($)
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </label>

      <p className="dashboard-form__hint">Current charge: {formatMoney(current)}</p>

      {status.error && <p className="dashboard-form__error">{status.error}</p>}
      {status.success && <p className="dashboard-form__success">{status.success}</p>}

      <button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save Charge"}
      </button>
    </form>
  );
}

import { useEffect, useState } from "react";
import { fetchDoctors } from "../../api/doctorApi";
import { createAppointment } from "../../api/appointmentApi";
import { fetchHospitalCharge } from "../../api/settingsApi";
import { formatMoney } from "../../utils/charges";
import ChargeBreakdown from "./ChargeBreakdown";
import { generateTimeSlots, getUpcomingDates, weekdayOf } from "../../config/schedule";
import "./DoctorDirectory.css";

function formatTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return "No hours set yet";
  return `${startTime} – ${endTime}`;
}

function formatDays(days) {
  if (!days || days.length === 0) return "No days set yet";
  return days.join(", ");
}

function todayInputValue() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export default function DoctorDirectory({ onBooked }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [hospitalCharge, setHospitalCharge] = useState(0);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [view, setView] = useState("list"); // list | detail | book

  const [bookingForm, setBookingForm] = useState({ date: "", time: "", reason: "" });
  const [bookingStatus, setBookingStatus] = useState({ error: "", success: "" });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  useEffect(() => {
    fetchHospitalCharge()
      .then(setHospitalCharge)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchDoctors()
      .then(setDoctors)
      .catch(() => setLoadError("Failed to load doctors."))
      .finally(() => setLoading(false));
  }, []);

  function openDoctor(doctor) {
    setSelectedDoctor(doctor);
    setView("detail");
    setBookingStatus({ error: "", success: "" });
  }

  function openBooking() {
    const upcoming = getUpcomingDates(selectedDoctor.availableDays, 1);
    setBookingForm({ date: upcoming[0]?.value || "", time: "", reason: "" });
    setView("book");
  }

  function backToList() {
    setSelectedDoctor(null);
    setView("list");
  }

  function backToDetail() {
    setView("detail");
    setBookingStatus({ error: "", success: "" });
  }

  function handleBookingFieldChange(e) {
    const { name, value } = e.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleBookingSubmit(e) {
    e.preventDefault();
    setBookingStatus({ error: "", success: "" });
    setBookingSubmitting(true);
    try {
      await createAppointment({
        doctorId: selectedDoctor.id,
        date: bookingForm.date,
        time: bookingForm.time,
        reason: bookingForm.reason,
      });
      setBookingStatus({
        error: "",
        success: "Appointment requested! You'll see it in the Appointments tab once the receptionist confirms it.",
      });
      onBooked?.();
    } catch (err) {
      setBookingStatus({ error: err.response?.data?.message || "Failed to request appointment.", success: "" });
    } finally {
      setBookingSubmitting(false);
    }
  }

  if (loading) return <p>Loading doctors…</p>;
  if (loadError) return <p className="dashboard-form__error">{loadError}</p>;

  if (view === "list") {
    return (
      <div className="doctor-directory">
        <h2>Our Doctors</h2>
        {doctors.length === 0 ? (
          <p>No doctors available right now.</p>
        ) : (
          <div className="doctor-directory__grid">
            {doctors.map((doctor) => (
              <button
                key={doctor.id}
                type="button"
                className="doctor-card"
                onClick={() => openDoctor(doctor)}
              >
                {doctor.avatar ? (
                  <img src={doctor.avatar} alt={doctor.name} className="doctor-card__avatar" />
                ) : (
                  <div className="doctor-card__avatar doctor-card__avatar--placeholder" aria-hidden="true">
                    {doctor.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="doctor-card__name">{doctor.name}</span>
                <span className="doctor-card__specialty">{doctor.specialty}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === "detail" && selectedDoctor) {
    return (
      <div className="doctor-directory">
        <button type="button" className="doctor-directory__back" onClick={backToList}>
          ← All doctors
        </button>

        <div className="doctor-detail">
          {selectedDoctor.avatar ? (
            <img src={selectedDoctor.avatar} alt={selectedDoctor.name} className="doctor-detail__avatar" />
          ) : (
            <div className="doctor-detail__avatar doctor-detail__avatar--placeholder" aria-hidden="true">
              {selectedDoctor.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h2>{selectedDoctor.name}</h2>
          <p className="doctor-detail__specialty">{selectedDoctor.specialty}</p>

          <button type="button" className="appointment-bar" onClick={openBooking}>
            <span className="appointment-bar__label">Appointment</span>
            <span className="appointment-bar__fee">
              {formatMoney((Number(selectedDoctor.consultationFee) || 0) + hospitalCharge)}
              <span className="appointment-bar__fee-note">
                {" "}
                (doctor {formatMoney(selectedDoctor.consultationFee)} + hospital {formatMoney(hospitalCharge)})
              </span>
            </span>
            <span className="appointment-bar__days">{formatDays(selectedDoctor.availableDays)}</span>
            <span className="appointment-bar__hours">{formatTimeRange(selectedDoctor.startTime, selectedDoctor.endTime)}</span>
          </button>
        </div>
      </div>
    );
  }

  if (view === "book" && selectedDoctor) {
    const timeSlots = generateTimeSlots(selectedDoctor.startTime, selectedDoctor.endTime);
    const selectedWeekday = bookingForm.date ? weekdayOf(bookingForm.date) : "";
    const dateUnavailable = Boolean(bookingForm.date) && !selectedDoctor.availableDays.includes(selectedWeekday);

    return (
      <div className="doctor-directory">
        <button type="button" className="doctor-directory__back" onClick={backToDetail}>
          ← {selectedDoctor.name}
        </button>

        {bookingStatus.success ? (
          <div className="dashboard-form">
            <h2>Request Sent</h2>
            <p className="dashboard-form__success">{bookingStatus.success}</p>
            <button type="button" onClick={backToList}>
              Book Another Doctor
            </button>
          </div>
        ) : (
          <form className="dashboard-form" onSubmit={handleBookingSubmit}>
            <h2>Book Appointment with {selectedDoctor.name}</h2>
            <p className="dashboard-form__hint">
              {formatDays(selectedDoctor.availableDays)} ·{" "}
              {formatTimeRange(selectedDoctor.startTime, selectedDoctor.endTime)}
            </p>

            <ChargeBreakdown doctorFee={selectedDoctor.consultationFee} hospitalCharge={hospitalCharge} />

            <label>
              Date
              <input
                type="date"
                name="date"
                min={todayInputValue()}
                value={bookingForm.date}
                onChange={handleBookingFieldChange}
                required
              />
            </label>

            {dateUnavailable && (
              <p className="dashboard-form__error">
                Dr. {selectedDoctor.name} doesn't see patients on {selectedWeekday}s. Available days:{" "}
                {formatDays(selectedDoctor.availableDays)}.
              </p>
            )}

            <label>
              Time
              <select name="time" value={bookingForm.time} onChange={handleBookingFieldChange} required>
                <option value="" disabled>
                  Select a time
                </option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Reason (optional)
              <textarea
                name="reason"
                rows={3}
                value={bookingForm.reason}
                onChange={handleBookingFieldChange}
                placeholder="Briefly describe your reason for visiting"
              />
            </label>

            {bookingStatus.error && <p className="dashboard-form__error">{bookingStatus.error}</p>}

            <button
              type="submit"
              disabled={bookingSubmitting || timeSlots.length === 0 || !bookingForm.date || dateUnavailable}
            >
              {bookingSubmitting ? "Requesting..." : "Confirm Appointment"}
            </button>
          </form>
        )}
      </div>
    );
  }

  return null;
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPortal } from "../../config/portals";
import { updateProfileRequest } from "../../api/authApi";
import { fetchMyDoctorProfile, updateMyDoctorProfile } from "../../api/doctorApi";
import { DAYS, SPECIALTIES } from "../../config/schedule";
import ThemeToggle from "../../components/ThemeToggle";
import "./DoctorDashboard.css";

// Doctor dashboard tabs: Profile, Overview, Schedule, Theme, Sign Out
const TABS = [
  { key: "profile", label: "Profile" },
  { key: "overview", label: "Overview" },
  { key: "schedule", label: "Schedule" },
  { key: "theme", label: "Theme" },
  { key: "sign-out", label: "Sign Out" },
];

const EMPTY_SCHEDULE = {
  specialty: "General Physician",
  consultationFee: 0,
  availableDays: [],
  startTime: "",
  endTime: "",
};

export default function DoctorDashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const portal = getPortal(user.role);

  const [activeTab, setActiveTab] = useState("overview");

  const [profileForm, setProfileForm] = useState({ name: user.name, email: user.email });
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || "");
  const [profileStatus, setProfileStatus] = useState({ error: "", success: "" });
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const [scheduleForm, setScheduleForm] = useState(EMPTY_SCHEDULE);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleStatus, setScheduleStatus] = useState({ error: "", success: "" });
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);

  useEffect(() => {
    fetchMyDoctorProfile()
      .then((profile) =>
        setScheduleForm({
          specialty: profile.specialty,
          consultationFee: profile.consultationFee,
          availableDays: profile.availableDays,
          startTime: profile.startTime,
          endTime: profile.endTime,
        })
      )
      .catch(() => setScheduleStatus({ error: "Failed to load schedule.", success: "" }))
      .finally(() => setScheduleLoading(false));
  }, []);

  function handleScheduleFieldChange(e) {
    const { name, value } = e.target;
    setScheduleForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleDayToggle(day) {
    setScheduleForm((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }));
  }

  async function handleScheduleSave(e) {
    e.preventDefault();
    setScheduleStatus({ error: "", success: "" });
    setScheduleSubmitting(true);
    try {
      await updateMyDoctorProfile({
        ...scheduleForm,
        consultationFee: Number(scheduleForm.consultationFee) || 0,
      });
      setScheduleStatus({ error: "", success: "Schedule updated successfully." });
    } catch (err) {
      setScheduleStatus({ error: err.response?.data?.message || "Failed to update schedule.", success: "" });
    } finally {
      setScheduleSubmitting(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  function handleTabClick(tabKey) {
    if (tabKey === "sign-out") {
      handleLogout();
      return;
    }
    setActiveTab(tabKey);
  }

  function handleProfileFormChange(e) {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileStatus({ error: "", success: "" });
    setProfileSubmitting(true);
    try {
      const { user: updated } = await updateProfileRequest({
        name: profileForm.name,
        email: profileForm.email,
        avatar: avatarPreview,
      });
      updateUser(updated);
      setProfileStatus({ error: "", success: "Profile updated successfully." });
    } catch (err) {
      setProfileStatus({ error: err.response?.data?.message || "Failed to update profile.", success: "" });
    } finally {
      setProfileSubmitting(false);
    }
  }

  return (
    <section className="dashboard">
      <header className="dashboard__header">
        <div>
          <span aria-hidden="true">{portal.icon}</span> {portal.label} Dashboard
        </div>
      </header>

      <div className="dashboard__layout">
        <div className="dashboard__body">
          {activeTab === "overview" && (
            <>
              <h1>Welcome, {user.name}</h1>
              <p>You are signed in as {portal.label} ({user.username}).</p>
            </>
          )}

          {activeTab === "profile" && (
            <form className="dashboard-form" onSubmit={handleProfileSave}>
              <h2>Profile</h2>

              <div className="profile-avatar">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="profile-avatar__img" />
                ) : (
                  <div className="profile-avatar__placeholder" aria-hidden="true">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
              </div>

              <label>
                Name
                <input name="name" value={profileForm.name} onChange={handleProfileFormChange} required />
              </label>

              <label>
                Email
                <input type="email" name="email" value={profileForm.email} onChange={handleProfileFormChange} required />
              </label>

              <label>
                Role
                <input value={portal.label} disabled readOnly />
              </label>

              {profileStatus.error && <p className="dashboard-form__error">{profileStatus.error}</p>}
              {profileStatus.success && <p className="dashboard-form__success">{profileStatus.success}</p>}

              <button type="submit" disabled={profileSubmitting}>
                {profileSubmitting ? "Saving..." : "Save Profile"}
              </button>
            </form>
          )}

          {activeTab === "schedule" && (
            <form className="dashboard-form" onSubmit={handleScheduleSave}>
              <h2>Schedule</h2>
              <p className="dashboard-form__hint">
                This is what patients see when browsing doctors and booking an appointment.
              </p>

              <label>
                Specialty
                <select name="specialty" value={scheduleForm.specialty} onChange={handleScheduleFieldChange}>
                  {SPECIALTIES.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Consultation Fee
                <input
                  type="number"
                  name="consultationFee"
                  min="0"
                  step="0.01"
                  value={scheduleForm.consultationFee}
                  onChange={handleScheduleFieldChange}
                />
              </label>

              <div className="schedule-days">
                <span className="schedule-days__label">Available Days</span>
                <div className="schedule-days__options">
                  {DAYS.map((day) => (
                    <label key={day} className="schedule-day-checkbox">
                      <input
                        type="checkbox"
                        checked={scheduleForm.availableDays.includes(day)}
                        onChange={() => handleDayToggle(day)}
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>

              <label>
                Start Time
                <input type="time" name="startTime" value={scheduleForm.startTime} onChange={handleScheduleFieldChange} />
              </label>

              <label>
                End Time
                <input type="time" name="endTime" value={scheduleForm.endTime} onChange={handleScheduleFieldChange} />
              </label>

              {scheduleStatus.error && <p className="dashboard-form__error">{scheduleStatus.error}</p>}
              {scheduleStatus.success && <p className="dashboard-form__success">{scheduleStatus.success}</p>}

              <button type="submit" disabled={scheduleSubmitting || scheduleLoading}>
                {scheduleSubmitting ? "Saving..." : "Save Schedule"}
              </button>
            </form>
          )}

          {activeTab === "theme" && <ThemeToggle />}
        </div>

        <nav className="dashboard__tabs" aria-label="Doctor dashboard navigation">
          <div className="dashboard__profile-summary">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile" className="dashboard__profile-summary-img" />
            ) : (
              <div className="dashboard__profile-summary-placeholder" aria-hidden="true">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="dashboard__profile-summary-name">{user.name}</span>
          </div>

          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={activeTab === tab.key ? "dashboard__tab dashboard__tab--active" : "dashboard__tab"}
              onClick={() => handleTabClick(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPortal } from "../../config/portals";
import { updateProfileRequest } from "../../api/authApi";
import { fetchAllAppointments, confirmAppointment } from "../../api/appointmentApi";
import ThemeToggle from "../../components/ThemeToggle";
import AppointmentList from "../../components/appointments/AppointmentList";
import "./ReceptionistDashboard.css";

// Receptionist dashboard tabs: Profile, Overview, Appointments, Theme, Sign Out
const TABS = [
  { key: "profile", label: "Profile" },
  { key: "overview", label: "Overview" },
  { key: "appointments", label: "Appointments" },
  { key: "theme", label: "Theme" },
  { key: "sign-out", label: "Sign Out" },
];

export default function ReceptionistDashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const portal = getPortal(user.role);

  const [activeTab, setActiveTab] = useState("overview");

  const [profileForm, setProfileForm] = useState({ name: user.name, email: user.email });
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || "");
  const [profileStatus, setProfileStatus] = useState({ error: "", success: "" });
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);

  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  function loadAppointments() {
    setAppointmentsLoading(true);
    setAppointmentsError("");
    fetchAllAppointments()
      .then(setAppointments)
      .catch(() => setAppointmentsError("Failed to load appointments."))
      .finally(() => setAppointmentsLoading(false));
  }

  // Load on mount so the pending count is visible on the tab as soon as the receptionist logs in.
  useEffect(() => {
    loadAppointments();
  }, []);

  async function handleConfirm(appointmentId) {
    setConfirmingId(appointmentId);
    try {
      const updated = await confirmAppointment(appointmentId);
      setAppointments((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));
    } catch {
      setAppointmentsError("Failed to confirm appointment.");
    } finally {
      setConfirmingId(null);
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
    if (tabKey === "appointments") {
      loadAppointments();
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

          {activeTab === "appointments" && (
            <div className="dashboard-form">
              <h2>Appointments</h2>
              {appointmentsLoading && <p>Loading…</p>}
              {appointmentsError && <p className="dashboard-form__error">{appointmentsError}</p>}
              {!appointmentsLoading && !appointmentsError && (
                <AppointmentList
                  appointments={appointments}
                  viewerRole="receptionist"
                  onConfirm={handleConfirm}
                  confirmingId={confirmingId}
                />
              )}
            </div>
          )}

          {activeTab === "theme" && <ThemeToggle />}
        </div>

        <nav className="dashboard__tabs" aria-label="Receptionist dashboard navigation">
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
              {tab.key === "appointments" && pendingCount > 0 && (
                <span className="dashboard__tab-badge">{pendingCount}</span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}

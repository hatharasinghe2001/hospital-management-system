import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPortal } from "../../config/portals";
import { updateProfileRequest } from "../../api/authApi";
import { fetchAllAppointments, fetchAppointmentStats, confirmAppointment } from "../../api/appointmentApi";
import ThemeToggle from "../../components/ThemeToggle";
import AppointmentList from "../../components/appointments/AppointmentList";
import AppointmentTable from "../../components/appointments/AppointmentTable";
import StatusDonutChart from "../../components/charts/StatusDonutChart";
import DoctorBarChart, { groupAppointmentsByDoctor, groupRevenueByDoctor } from "../../components/charts/DoctorBarChart";
import { groupAppointmentsByDoctor as groupByDoctor } from "../../utils/doctorGrouping";
import "./ReceptionistDashboard.css";

// Receptionist dashboard tabs: Profile, Overview, Appointments, Records, Theme, Sign Out
const TABS = [
  { key: "profile", label: "Profile" },
  { key: "overview", label: "Overview" },
  { key: "appointments", label: "Appointments" },
  { key: "records", label: "Records" },
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

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [doctorFilter, setDoctorFilter] = useState("all");
  const [nameSearch, setNameSearch] = useState("");

  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  const recordGroups = groupByDoctor(
    appointments.filter((a) => a.patient?.name?.toLowerCase().includes(nameSearch.trim().toLowerCase()))
  ).filter((group) => doctorFilter === "all" || group.doctorName === doctorFilter);

  function loadAppointments() {
    setAppointmentsLoading(true);
    setAppointmentsError("");
    fetchAllAppointments()
      .then(setAppointments)
      .catch(() => setAppointmentsError("Failed to load appointments."))
      .finally(() => setAppointmentsLoading(false));
  }

  function loadStats() {
    setStatsLoading(true);
    setStatsError("");
    fetchAppointmentStats()
      .then(setStats)
      .catch(() => setStatsError("Failed to load dashboard stats."))
      .finally(() => setStatsLoading(false));
  }

  // Load on mount so the pending count/stats are visible as soon as the receptionist logs in.
  useEffect(() => {
    loadAppointments();
    loadStats();
  }, []);

  async function handleConfirm(appointmentId) {
    setConfirmingId(appointmentId);
    try {
      const updated = await confirmAppointment(appointmentId);
      setAppointments((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));
      loadStats();
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
    if (tabKey === "appointments" || tabKey === "records") {
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
            <div className="dashboard-overview">
              <h1>Welcome, {user.name}</h1>
              <p>You are signed in as {portal.label} ({user.username}).</p>

              {statsLoading && <p>Loading dashboard…</p>}
              {statsError && <p className="dashboard-form__error">{statsError}</p>}
              {!statsLoading && !statsError && stats && (
                <div className="stat-grid">
                  <div className="stat-card">
                    <span className="stat-card__label">Patients</span>
                    <span className="stat-card__value">{stats.patientCount}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-card__label">Doctors</span>
                    <span className="stat-card__value">{stats.doctorCount}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-card__label">Today's Appointments</span>
                    <span className="stat-card__value">{stats.todayAppointments}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-card__label">Pending Appointments</span>
                    <span className="stat-card__value">{stats.pendingAppointments}</span>
                  </div>
                  <div className="stat-card stat-card--wide">
                    <span className="stat-card__label">Revenue (confirmed)</span>
                    <span className="stat-card__value">${stats.revenue}</span>
                  </div>
                </div>
              )}

              {!appointmentsLoading && (
                <div className="chart-grid">
                  <div className="chart-card">
                    <h2>Appointments by Status</h2>
                    <StatusDonutChart appointments={appointments} />
                  </div>
                  <div className="chart-card">
                    <h2>Appointments by Doctor</h2>
                    <DoctorBarChart
                      rows={groupAppointmentsByDoctor(appointments)}
                      emptyMessage="No appointments yet."
                    />
                  </div>
                  <div className="chart-card chart-card--wide">
                    <h2>Revenue by Doctor</h2>
                    <DoctorBarChart
                      rows={groupRevenueByDoctor(appointments)}
                      formatValue={(v) => `$${v}`}
                      emptyMessage="No confirmed appointments yet."
                    />
                  </div>
                </div>
              )}
            </div>
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

          {activeTab === "records" && (
            <div className="records-panel">
              <h2>Appointment Records</h2>

              <div className="records-filters">
                <label className="records-filter">
                  Filter by doctor
                  <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)}>
                    <option value="all">All Doctors</option>
                    {groupByDoctor(appointments).map((group) => (
                      <option key={group.doctorId} value={group.doctorName}>
                        Dr. {group.doctorName}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="records-filter">
                  Search by patient name
                  <input
                    type="text"
                    placeholder="e.g. John"
                    value={nameSearch}
                    onChange={(e) => setNameSearch(e.target.value)}
                  />
                </label>
              </div>

              {appointmentsLoading && <p>Loading…</p>}
              {appointmentsError && <p className="dashboard-form__error">{appointmentsError}</p>}
              {!appointmentsLoading && !appointmentsError && (
                <div className="records-groups">
                  {recordGroups.length === 0 && <p>No matching appointments.</p>}
                  {recordGroups.map((group) => (
                    <div key={group.doctorId} className="records-group">
                      <h3 className="appointment-group__title">
                        Dr. {group.doctorName}
                        <span className="appointment-group__count">{group.appointments.length}</span>
                      </h3>
                      <AppointmentTable appointments={group.appointments} />
                    </div>
                  ))}
                </div>
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

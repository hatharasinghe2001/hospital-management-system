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
import { groupAppointmentsByDoctor as groupByDoctor, groupAppointmentsByDate, appointmentDateKey } from "../../utils/doctorGrouping";
import { formatDateLabel } from "../../config/schedule";
import { formatMoney } from "../../utils/charges";
import FeedbackPanel from "../../components/feedback/FeedbackPanel";
import MessagesPanel from "../../components/messages/MessagesPanel";
import useUnreadMessages from "../../components/messages/useUnreadMessages";
import HamburgerIcon from "../../components/icons/HamburgerIcon";
import NotificationBell from "../../components/notifications/NotificationBell";
import "./ReceptionistDashboard.css";

// Receptionist dashboard tabs: Profile, Overview, Appointments, Upcoming Records, Past Records, Messages, Feedback, Theme, Sign Out
const TABS = [
  { key: "profile", label: "Profile" },
  { key: "overview", label: "Overview" },
  { key: "appointments", label: "Appointments" },
  { key: "upcoming-records", label: "Upcoming Records" },
  { key: "past-records", label: "Past Records" },
  { key: "messages", label: "Messages" },
  { key: "feedback", label: "Feedback" },
  { key: "theme", label: "Theme" },
  { key: "sign-out", label: "Sign Out" },
];

// Today's calendar date in the user's timezone, as YYYY-MM-DD (matches appointment date keys).
function localDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function previousDateKey(dateKey) {
  const d = new Date(`${dateKey}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export default function ReceptionistDashboard() {
  const [unreadMessages, refreshUnreadMessages] = useUnreadMessages();
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const portal = getPortal(user.role);

  const [activeTab, setActiveTab] = useState("overview");
  const [tabsOpen, setTabsOpen] = useState(true);

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
  const [dateFilter, setDateFilter] = useState("");

  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  // Records are split into two tabs: today + upcoming (incl. unscheduled), and past.
  const isPastRecords = activeTab === "past-records";
  const todayKey = localDateKey(new Date());
  const isPastAppointment = (a) => {
    const key = appointmentDateKey(a);
    return key !== "unscheduled" && key < todayKey;
  };

  const periodAppointments = appointments.filter((a) => isPastAppointment(a) === isPastRecords);

  const recordGroups = groupByDoctor(
    periodAppointments.filter(
      (a) =>
        a.patient?.name?.toLowerCase().includes(nameSearch.trim().toLowerCase()) &&
        (!dateFilter || appointmentDateKey(a) === dateFilter)
    )
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

  function refreshSilently() {
    fetchAllAppointments().then(setAppointments).catch(() => {});
    fetchAppointmentStats().then(setStats).catch(() => {});
  }

  // Load on mount so the pending count/stats are visible as soon as the receptionist logs in,
  // then poll quietly so revenue/charts reflect cancellations etc. without a manual refresh.
  useEffect(() => {
    loadAppointments();
    loadStats();
    const interval = setInterval(refreshSilently, 30000);
    return () => clearInterval(interval);
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
    if (tabKey === "upcoming-records" || tabKey === "past-records") {
      setDateFilter("");
    }
    if (tabKey === "appointments" || tabKey === "upcoming-records" || tabKey === "past-records") {
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
        <div className="dashboard__header-actions">
          <NotificationBell />
          <button
            type="button"
            className="dashboard__tabs-toggle"
            onClick={() => setTabsOpen((open) => !open)}
            aria-label={tabsOpen ? "Hide navigation tabs" : "Show navigation tabs"}
            title={tabsOpen ? "Hide tabs" : "Show tabs"}
          >
            <HamburgerIcon />
          </button>
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
                  <div className="stat-card">
                    <span className="stat-card__label">Cancelled Appointments</span>
                    <span className="stat-card__value">{stats.cancelledAppointments}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-card__label">Doctor Fee Revenue (confirmed)</span>
                    <span className="stat-card__value">{formatMoney(stats.doctorFeeRevenue)}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-card__label">Hospital Charge Revenue (confirmed)</span>
                    <span className="stat-card__value">{formatMoney(stats.hospitalChargeRevenue)}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-card__label">Total Revenue (confirmed)</span>
                    <span className="stat-card__value">{formatMoney(stats.revenue)}</span>
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
                    <h2>Doctor Fee Revenue by Doctor</h2>
                    <DoctorBarChart
                      rows={groupRevenueByDoctor(appointments, "fee")}
                      formatValue={formatMoney}
                      emptyMessage="No confirmed appointments yet."
                    />
                  </div>
                  <div className="chart-card chart-card--wide">
                    <h2>Hospital Charge Revenue by Doctor</h2>
                    <DoctorBarChart
                      rows={groupRevenueByDoctor(appointments, "hospitalCharge")}
                      formatValue={formatMoney}
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

          {(activeTab === "upcoming-records" || activeTab === "past-records") && (
            <div className="records-panel">
              <h2>{isPastRecords ? "Past Appointments" : "Today & Upcoming Appointments"}</h2>
              <p className="records-subtitle">
                {isPastRecords
                  ? `Appointments before today, most recent first (${periodAppointments.length}).`
                  : `Appointments from today onwards, soonest first (${periodAppointments.length}).`}
              </p>

              <div className="records-filters">
                <label className="records-filter">
                  Filter by doctor
                  <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)}>
                    <option value="all">All Doctors</option>
                    {groupByDoctor(periodAppointments).map((group) => (
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

                <label className="records-filter">
                  Filter by date
                  <input
                    type="date"
                    value={dateFilter}
                    min={isPastRecords ? undefined : todayKey}
                    max={isPastRecords ? previousDateKey(todayKey) : undefined}
                    onChange={(e) => setDateFilter(e.target.value)}
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
                      {(isPastRecords
                        ? groupAppointmentsByDate(group.appointments).reverse()
                        : groupAppointmentsByDate(group.appointments)
                      ).map((dateGroup) => (
                        <div key={dateGroup.date} className="records-date-group">
                          <h4 className="appointment-date-group__title">
                            {formatDateLabel(dateGroup.date)}
                            {dateGroup.date === todayKey && <span className="records-today-tag">Today</span>}
                          </h4>
                          <AppointmentTable appointments={dateGroup.appointments} hideDate />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "messages" && <MessagesPanel onRead={refreshUnreadMessages} />}

          {activeTab === "feedback" && <FeedbackPanel readOnly />}

          {activeTab === "theme" && <ThemeToggle />}
        </div>

        {tabsOpen && (
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
              <span className="dashboard__profile-summary-username">@{user.username}</span>
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
                {tab.key === "messages" && unreadMessages > 0 && (
                  <span className="dashboard__tab-badge">{unreadMessages}</span>
                )}
              </button>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}

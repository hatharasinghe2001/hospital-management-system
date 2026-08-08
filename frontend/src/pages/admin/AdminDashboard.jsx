import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPortal } from "../../config/portals";
import { createStaffRequest, updateProfileRequest } from "../../api/authApi";
import { fetchUsers } from "../../api/userApi";
import { SPECIALTIES } from "../../config/schedule";
import ThemeToggle from "../../components/ThemeToggle";
import "./AdminDashboard.css";

// Admin dashboard tabs: Profile, Overview, Add User, Users, Theme, Sign Out
const TABS = [
  { key: "profile", label: "Profile" },
  { key: "overview", label: "Overview" },
  { key: "add-user", label: "Add User" },
  { key: "users", label: "Users" },
  { key: "theme", label: "Theme" },
  { key: "sign-out", label: "Sign Out" },
];

const STAFF_ROLES = ["admin", "doctor", "receptionist", "nurse"];

const EMPTY_STAFF_FORM = {
  name: "",
  username: "",
  email: "",
  password: "",
  phone: "",
  role: "doctor",
  specialty: SPECIALTIES[0],
};

export default function AdminDashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const portal = getPortal(user.role);

  const [activeTab, setActiveTab] = useState("overview");

  const [staffForm, setStaffForm] = useState(EMPTY_STAFF_FORM);
  const [staffStatus, setStaffStatus] = useState({ error: "", success: "" });
  const [staffSubmitting, setStaffSubmitting] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: user.name, email: user.email });
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || "");
  const [profileStatus, setProfileStatus] = useState({ error: "", success: "" });
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  function loadUsers() {
    setUsersLoading(true);
    setUsersError("");
    fetchUsers()
      .then(setUsers)
      .catch(() => setUsersError("Failed to load users."))
      .finally(() => setUsersLoading(false));
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
    if (tabKey === "users") {
      loadUsers();
    }
    setActiveTab(tabKey);
  }

  function handleStaffFormChange(e) {
    const { name, value } = e.target;
    setStaffForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleAddUser(e) {
    e.preventDefault();
    setStaffStatus({ error: "", success: "" });
    setStaffSubmitting(true);
    try {
      await createStaffRequest(staffForm);
      setStaffStatus({ error: "", success: `${staffForm.role} account "${staffForm.username}" created successfully.` });
      setStaffForm(EMPTY_STAFF_FORM);
    } catch (err) {
      setStaffStatus({ error: err.response?.data?.message || "Failed to create user.", success: "" });
    } finally {
      setStaffSubmitting(false);
    }
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

          {activeTab === "add-user" && (
            <form className="dashboard-form" onSubmit={handleAddUser}>
              <h2>Add User</h2>

              <label>
                Role
                <select name="role" value={staffForm.role} onChange={handleStaffFormChange}>
                  {STAFF_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </label>

              {staffForm.role === "doctor" && (
                <label>
                  Position
                  <select name="specialty" value={staffForm.specialty} onChange={handleStaffFormChange}>
                    {SPECIALTIES.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label>
                Name
                <input name="name" value={staffForm.name} onChange={handleStaffFormChange} required />
              </label>

              <label>
                Username
                <input name="username" value={staffForm.username} onChange={handleStaffFormChange} required />
              </label>

              <label>
                Email
                <input type="email" name="email" value={staffForm.email} onChange={handleStaffFormChange} required />
              </label>

              <label>
                Password
                <input type="password" name="password" value={staffForm.password} onChange={handleStaffFormChange} required />
              </label>

              <label>
                Phone
                <input name="phone" value={staffForm.phone} onChange={handleStaffFormChange} />
              </label>

              {staffStatus.error && <p className="dashboard-form__error">{staffStatus.error}</p>}
              {staffStatus.success && <p className="dashboard-form__success">{staffStatus.success}</p>}

              <button type="submit" disabled={staffSubmitting}>
                {staffSubmitting ? "Creating..." : "Create User"}
              </button>
            </form>
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

          {activeTab === "users" && (
            <div className="users-panel">
              <h2>Users</h2>
              {usersLoading && <p>Loading…</p>}
              {usersError && <p className="dashboard-form__error">{usersError}</p>}
              {!usersLoading && !usersError && (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.username}</td>
                        <td>{u.name}</td>
                        <td>
                          <span className={`role-badge role-badge--${u.role}`}>{u.role}</span>
                        </td>
                        <td>{u.isActive ? "Active" : "Inactive"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === "theme" && <ThemeToggle />}
        </div>

        <nav className="dashboard__tabs" aria-label="Admin dashboard navigation">
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

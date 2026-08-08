import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPortal } from "../../config/portals";
import { updateProfileRequest } from "../../api/authApi";
import "./DoctorDashboard.css";

// Doctor dashboard tabs: Profile, Overview, Sign Out
const TABS = [
  { key: "profile", label: "Profile" },
  { key: "overview", label: "Overview" },
  { key: "sign-out", label: "Sign Out" },
];

export default function DoctorDashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const portal = getPortal(user.role);

  const [activeTab, setActiveTab] = useState("overview");

  const [profileForm, setProfileForm] = useState({ name: user.name, email: user.email });
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || "");
  const [profileStatus, setProfileStatus] = useState({ error: "", success: "" });
  const [profileSubmitting, setProfileSubmitting] = useState(false);

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

import { useNavigate } from "react-router-dom";
import { PORTAL_GROUPS } from "../config/portals";
import "./PortalSelect.css";

export default function PortalSelect() {
  const navigate = useNavigate();

  return (
    <section className="portal-select">
      <div className="portal-select__header">
        <h1>Hospital Management System</h1>
        <p>Choose your portal to sign in</p>
      </div>

      <div className="portal-grid">
        {PORTAL_GROUPS.map((group) => (
          <button
            key={group.key}
            type="button"
            className="portal-card"
            onClick={() => navigate(`/login/${group.key}`)}
          >
            <span className="portal-card__icon" aria-hidden="true">
              {group.icon}
            </span>
            <h2>{group.label}</h2>
            <p>{group.description}</p>
            <span className="portal-card__cta">Continue as {group.label} →</span>
          </button>
        ))}
      </div>
    </section>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPortalGroup, PORTAL_GROUPS } from "../config/portals";

export default function LoginForm({ portal }) {
  const group = getPortalGroup(portal);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ username, password, portal });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const otherGroup = PORTAL_GROUPS.find((g) => g.key !== portal);

  return (
    <section className="login-page">
      <div className="login-card">
        <Link to="/" className="login-back">
          ← All portals
        </Link>

        <div className="login-card__header">
          <span className="login-card__icon" aria-hidden="true">
            {group.icon}
          </span>
          <h1>{group.label} Login</h1>
          <p>{group.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="login-error">{error}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {portal === "external" && (
          <div className="login-switch">
            New patient? <Link to="/register/external">Create an account</Link>
          </div>
        )}

        <div className="login-switch">
          Not {group.label.toLowerCase()}? <Link to={`/login/${otherGroup.key}`}>{otherGroup.label}</Link>
        </div>
      </div>
    </section>
  );
}

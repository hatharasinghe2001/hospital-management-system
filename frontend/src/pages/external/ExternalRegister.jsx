import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPortal } from "../../config/portals";
import "./ExternalLogin.css";

const EMPTY_FORM = { name: "", username: "", email: "", password: "", phone: "" };

export default function ExternalRegister() {
  const portal = getPortal("patient");
  const { registerPatient } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await registerPatient(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="login-page">
      <div className="login-card">
        <Link to="/" className="login-back">
          ← All portals
        </Link>

        <div className="login-card__header">
          <span className="login-card__icon" aria-hidden="true">
            {portal.icon}
          </span>
          <h1>Patient Registration</h1>
          <p>Create an account to book appointments and view your records</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" type="text" value={form.name} onChange={handleChange} required />

          <label htmlFor="username">Username</label>
          <input id="username" name="username" type="text" autoComplete="username" value={form.username} onChange={handleChange} required />

          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            required
          />

          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />

          {error && <p className="login-error">{error}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="login-switch">
          Already have an account? <Link to="/login/external">Sign in</Link>
        </div>
      </div>
    </section>
  );
}

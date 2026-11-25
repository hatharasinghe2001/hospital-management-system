import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { createFeedback, fetchAllFeedback } from "../../api/feedbackApi";
import "./FeedbackPanel.css";

function StarRating({ value, onChange }) {
  return (
    <div className="feedback-stars" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={n <= value ? "feedback-stars__star feedback-stars__star--filled" : "feedback-stars__star"}
          onClick={() => onChange(n === value ? 0 : n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          aria-pressed={n <= value}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function FeedbackPanel({ readOnly = false }) {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function loadFeedback() {
    setLoading(true);
    setError("");
    fetchAllFeedback()
      .then(setItems)
      .catch(() => setError("Failed to load feedback."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadFeedback();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitError("");
    setSubmitting(true);
    try {
      const created = await createFeedback({ message: message.trim(), rating: rating || undefined });
      setItems((prev) => [created, ...prev]);
      setMessage("");
      setRating(0);
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="feedback-panel">
      <h2>Feedback</h2>
      <p className="feedback-panel__subtitle">
        {readOnly
          ? "Feedback shared by everyone across the system."
          : "Shared across every role — everyone can read what's posted here."}
      </p>

      {!readOnly && (
        <form className="feedback-form" onSubmit={handleSubmit}>
          <label>
            Posting as {user.name}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share feedback, a suggestion, or an issue..."
              maxLength={1000}
              rows={3}
              required
            />
          </label>

          <div className="feedback-form__row">
            <StarRating value={rating} onChange={setRating} />
            <button type="submit" disabled={submitting || !message.trim()}>
              {submitting ? "Posting..." : "Post Feedback"}
            </button>
          </div>

          {submitError && <p className="dashboard-form__error">{submitError}</p>}
        </form>
      )}

      {loading && <p>Loading…</p>}
      {error && <p className="dashboard-form__error">{error}</p>}

      {!loading && !error && (
        <div className="feedback-list">
          {items.length === 0 && <p>No feedback yet. Be the first to share something.</p>}
          {items.map((item) => (
            <div key={item._id} className="feedback-item">
              <div className="feedback-item__avatar" aria-hidden="true">
                {item.user?.avatar ? (
                  <img src={item.user.avatar} alt="" />
                ) : (
                  item.user?.name?.charAt(0).toUpperCase() || "?"
                )}
              </div>
              <div className="feedback-item__body">
                <div className="feedback-item__header">
                  <span className="feedback-item__name">{item.user?.name || "Unknown"}</span>
                  <span className={`feedback-item__role feedback-item__role--${item.user?.role}`}>
                    {item.user?.role}
                  </span>
                  <span className="feedback-item__time">{timeAgo(item.createdAt)}</span>
                </div>
                {item.rating > 0 && (
                  <div className="feedback-stars feedback-stars--readonly">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className={n <= item.rating ? "feedback-stars__star feedback-stars__star--filled" : "feedback-stars__star"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                )}
                <p className="feedback-item__message">{item.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

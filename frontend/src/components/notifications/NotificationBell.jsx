import { useEffect, useRef, useState } from "react";
import { fetchNotifications, markNotificationRead } from "../../api/notificationApi";
import "./NotificationBell.css";

function BellIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M8 1.5c-1.9 0-3.4 1.5-3.4 3.4v1.6c0 .7-.3 1.4-.8 1.9l-.6.6c-.5.5-.1 1.3.6 1.3h9.6c.7 0 1.1-.8.6-1.3l-.6-.6c-.5-.5-.8-1.2-.8-1.9V4.9c0-1.9-1.5-3.4-3.4-3.4H8Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M6.3 12.7a1.7 1.7 0 0 0 3.4 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
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

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  function load() {
    fetchNotifications()
      .then(setItems)
      .catch(() => {});
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const unreadCount = items.filter((n) => !n.read).length;

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      const unread = items.filter((n) => !n.read);
      setItems((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })));
      unread.forEach((n) => markNotificationRead(n._id).catch(() => {}));
    }
  }

  return (
    <div className="notification-bell" ref={containerRef}>
      <button
        type="button"
        className="notification-bell__trigger"
        onClick={toggleOpen}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        title="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && <span className="notification-bell__badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-bell__panel">
          <h4 className="notification-bell__title">Notifications</h4>
          {items.length === 0 && <p className="notification-bell__empty">No notifications yet.</p>}
          {items.map((n) => (
            <div key={n._id} className="notification-bell__item">
              <p className="notification-bell__message">{n.message}</p>
              <span className="notification-bell__time">{timeAgo(n.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchConversation, fetchMessageContacts, sendMessage } from "../../api/messageApi";
import "./MessagesPanel.css";

const CONTACTS_POLL_MS = 10000;
const CONVERSATION_POLL_MS = 5000;

function formatTime(dateString) {
  const date = new Date(dateString);
  const sameDay = date.toDateString() === new Date().toDateString();
  return sameDay
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function byLatest(a, b) {
  const at = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
  const bt = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
  return bt - at || a.name.localeCompare(b.name);
}

function Avatar({ person }) {
  return (
    <div className="msg-avatar" aria-hidden="true">
      {person?.avatar ? <img src={person.avatar} alt="" /> : person?.name?.charAt(0).toUpperCase() || "?"}
    </div>
  );
}

// Staff-only direct messaging: contact list on the left, conversation on the right.
export default function MessagesPanel({ onRead }) {
  const { user } = useAuth();
  const myId = String(user.id || user._id);

  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactsError, setContactsError] = useState("");
  const [search, setSearch] = useState("");

  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [conversationError, setConversationError] = useState("");

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const threadEndRef = useRef(null);
  const onReadRef = useRef(onRead);
  useEffect(() => {
    onReadRef.current = onRead;
  }, [onRead]);

  const activeContact = contacts.find((c) => c._id === activeId);

  // Load + poll the contact list
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetchMessageContacts()
        .then((list) => {
          if (cancelled) return;
          setContacts(list);
          setContactsError("");
        })
        .catch(() => {
          if (!cancelled) setContactsError("Failed to load staff list.");
        })
        .finally(() => {
          if (!cancelled) setContactsLoading(false);
        });
    load();
    const interval = setInterval(load, CONTACTS_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Load + poll the open conversation (fetching it marks incoming messages as read)
  useEffect(() => {
    if (!activeId) return undefined;
    let cancelled = false;
    const load = () =>
      fetchConversation(activeId)
        .then((list) => {
          if (cancelled) return;
          setMessages((prev) => {
            const unchanged =
              prev.length === list.length &&
              prev.at(-1)?._id === list.at(-1)?._id &&
              prev.at(-1)?.read === list.at(-1)?.read;
            return unchanged ? prev : list;
          });
          setConversationError("");
          setContacts((prev) => prev.map((c) => (c._id === activeId ? { ...c, unread: 0 } : c)));
          onReadRef.current?.();
        })
        .catch(() => {
          if (!cancelled) setConversationError("Failed to load conversation.");
        })
        .finally(() => {
          if (!cancelled) setConversationLoading(false);
        });
    load();
    const interval = setInterval(load, CONVERSATION_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeId]);

  // Keep the newest message in view
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  function openConversation(contactId) {
    if (contactId === activeId) return;
    setActiveId(contactId);
    setMessages([]);
    setDraft("");
    setSendError("");
    setConversationError("");
    setConversationLoading(true);
  }

  async function handleSend(e) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !activeId || sending) return;
    setSending(true);
    setSendError("");
    try {
      const created = await sendMessage(activeId, body);
      setMessages((prev) => [...prev, created]);
      setDraft("");
      setContacts((prev) =>
        prev
          .map((c) =>
            c._id === activeId ? { ...c, lastMessage: { body, createdAt: created.createdAt, fromMe: true } } : c
          )
          .sort(byLatest)
      );
    } catch (err) {
      setSendError(err.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSend(e);
    }
  }

  const term = search.trim().toLowerCase();
  const visibleContacts = term
    ? contacts.filter((c) => c.name.toLowerCase().includes(term) || c.role.includes(term))
    : contacts;

  return (
    <div className="messages-panel">
      <h2>Messages</h2>
      <p className="messages-panel__subtitle">Private messages between staff members.</p>

      <div className={activeId ? "messages-layout messages-layout--open" : "messages-layout"}>
        <aside className="messages-contacts">
          <input
            type="search"
            className="messages-contacts__search"
            placeholder="Search staff by name or role"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {contactsLoading && <p className="messages-muted">Loading…</p>}
          {contactsError && <p className="dashboard-form__error">{contactsError}</p>}
          {!contactsLoading && !contactsError && visibleContacts.length === 0 && (
            <p className="messages-muted">No staff members found.</p>
          )}

          <ul className="messages-contacts__list">
            {visibleContacts.map((c) => (
              <li key={c._id}>
                <button
                  type="button"
                  className={c._id === activeId ? "messages-contact messages-contact--active" : "messages-contact"}
                  onClick={() => openConversation(c._id)}
                >
                  <Avatar person={c} />
                  <span className="messages-contact__body">
                    <span className="messages-contact__top">
                      <span className="messages-contact__name">{c.name}</span>
                      {c.lastMessage && (
                        <span className="messages-contact__time">{formatTime(c.lastMessage.createdAt)}</span>
                      )}
                    </span>
                    <span className="messages-contact__bottom">
                      <span className="messages-contact__preview">
                        {c.lastMessage ? (
                          `${c.lastMessage.fromMe ? "You: " : ""}${c.lastMessage.body}`
                        ) : (
                          <span className={`msg-role msg-role--${c.role}`}>{c.role}</span>
                        )}
                      </span>
                      {c.unread > 0 && <span className="messages-badge">{c.unread}</span>}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="messages-thread">
          {!activeContact ? (
            <div className="messages-thread__empty">Select a staff member to start a conversation.</div>
          ) : (
            <>
              <header className="messages-thread__header">
                <button
                  type="button"
                  className="messages-thread__back"
                  onClick={() => setActiveId(null)}
                  aria-label="Back to staff list"
                >
                  ←
                </button>
                <Avatar person={activeContact} />
                <div>
                  <div className="messages-thread__name">{activeContact.name}</div>
                  <span className={`msg-role msg-role--${activeContact.role}`}>{activeContact.role}</span>
                </div>
              </header>

              <div className="messages-thread__body">
                {conversationLoading && <p className="messages-muted">Loading…</p>}
                {conversationError && <p className="dashboard-form__error">{conversationError}</p>}
                {!conversationLoading && !conversationError && messages.length === 0 && (
                  <p className="messages-muted">No messages yet. Say hello to {activeContact.name}.</p>
                )}
                {messages.map((m) => {
                  const mine = String(m.sender) === myId;
                  return (
                    <div key={m._id} className={mine ? "msg-bubble msg-bubble--mine" : "msg-bubble"}>
                      <p className="msg-bubble__text">{m.body}</p>
                      <span className="msg-bubble__time">
                        {formatTime(m.createdAt)}
                        {mine && m.read ? " · Seen" : ""}
                      </span>
                    </div>
                  );
                })}
                <div ref={threadEndRef} />
              </div>

              <form className="messages-compose" onSubmit={handleSend}>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${activeContact.name}… (Enter to send, Shift+Enter for new line)`}
                  maxLength={2000}
                  rows={2}
                />
                <button type="submit" disabled={sending || !draft.trim()}>
                  {sending ? "Sending…" : "Send"}
                </button>
              </form>
              {sendError && <p className="dashboard-form__error messages-send-error">{sendError}</p>}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import { fetchUnreadMessageCount } from "../../api/messageApi";

// Polls the unread direct-message count for the signed-in staff member.
export default function useUnreadMessages(intervalMs = 15000) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    fetchUnreadMessageCount()
      .then(setCount)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetchUnreadMessageCount()
        .then((n) => {
          if (!cancelled) setCount(n);
        })
        .catch(() => {});
    load();
    const interval = setInterval(load, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [intervalMs]);

  return [count, refresh];
}

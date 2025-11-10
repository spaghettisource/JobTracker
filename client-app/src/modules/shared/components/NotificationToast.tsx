import React, { useEffect, useState } from "react";
import { getNotifications } from "../../../api/notificationsApi";

export default function NotificationToast() {
  const [messages, setMessages] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);
  const [latest, setLatest] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
  
    const load = async () => {
      try {
        const data = await getNotifications();
        if (!mounted) return;
  
        if (data.length > messages.length) {
          const newMsg = data[data.length - 1];
          setLatest(newMsg);
          setVisible(true);
          setTimeout(() => setVisible(false), 4000);
          setMessages(data);
        }
      } catch (e) {
        console.error("Failed to load notifications:", e);
      }
    };
  
    load();
    const t = setInterval(load, 10000); // на всеки 10 сек
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []); // 👈 празен dependency масив
  

  if (!visible || !latest) return null;

  return (
    <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 2000 }}>
      <div className="toast show align-items-center text-bg-primary border-0 shadow" role="alert">
        <div className="d-flex">
          <div className="toast-body">{latest}</div>
          <button
            type="button"
            className="btn-close btn-close-white me-2 m-auto"
            aria-label="Close"
            onClick={() => setVisible(false)}
          />
        </div>
      </div>
    </div>
  );
}

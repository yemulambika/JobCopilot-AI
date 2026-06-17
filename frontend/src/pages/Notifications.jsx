import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("jwt");
    if (!token) return;
    const resp = await fetch("https://ai-resume-backend-1i32.onrender.com/api/scanner/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await resp.json();
    setNotifications(data.notifications || []);
    setUnreadCount((data.notifications || []).filter((n) => !n.read).length);
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleMarkRead = async (id) => {
    const token = localStorage.getItem("jwt");
    await fetch(`https://ai-resume-backend-1i32.onrender.com/api/scanner/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchNotifications();
  };

  const handleRunScan = async () => {
    const token = localStorage.getItem("jwt");
    const resp = await fetch("https://ai-resume-backend-1i32.onrender.com/api/scanner/run", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await resp.json();
    alert(`Scan complete. Checked ${result.scannedCount} new jobs, found ${result.notifiedCount} matches.`);
    fetchNotifications();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Job Scanner & Notifications</h2>

      <div className="mb-4">
        <p className="text-sm text-slate-600">
          Scanner runs automatically every 6 hours. You can also trigger a manual scan.
        </p>
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={handleRunScan}
            className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
          >
            Run Scan Now
          </button>
          <p className="text-sm">
            <strong>{unreadCount}</strong> unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-2">Notification History</h3>

      {notifications.length === 0 && (
        <p className="text-sm text-slate-500">No notifications yet.</p>
      )}

      <ul className="space-y-3">
        {notifications.map((n) => (
          <li
            key={n._id}
            className={`p-4 rounded border ${n.read ? "bg-white border-slate-200" : "bg-cyan-50 border-cyan-200"}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-slate-600">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(n.sentAt).toLocaleString()}
                </p>
              </div>
              {!n.read && (
                <button
                  onClick={() => handleMarkRead(n._id)}
                  className="text-xs text-cyan-600 hover:text-cyan-800"
                >
                  Mark Read
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsPage;
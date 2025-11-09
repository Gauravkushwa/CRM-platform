import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications, markAllRead } from "../store/slices/notificationsSlice";
import { Link } from "react-router-dom";

export default function NotificationsDropdown() {
  const dispatch = useDispatch();
  const { items, unreadCount, status } = useSelector(state => state.notifications);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (status === "idle") dispatch(fetchNotifications());
  }, [status, dispatch]);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const toggle = () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen) dispatch(markAllRead());
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle} className="relative p-2 rounded hover:bg-gray-100" aria-label="Notifications">
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center text-xs font-bold h-5 w-5 rounded-full bg-red-500 text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white border rounded shadow-lg z-50">
          <div className="p-3 border-b font-semibold">Notifications</div>
          <div className="max-h-72 overflow-auto">
            {items.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No notifications</div>
            ) : (
              items.map(n => (
                <Link
                  key={n.id}
                  to={n.leadId ? `/leads/${n.leadId}` : "/"}
                  className={`block hover:bg-gray-50 p-3 border-b ${n.read ? "" : "bg-gray-50"}`}
                >
                  <div className="text-sm font-medium">{n.message}</div>
                  <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
                </Link>
              ))
            )}
          </div>
          <div className="p-2 text-center text-sm">
            <Link to="/activities" className="text-blue-600">View all activities</Link>
          </div>
        </div>
      )}
    </div>
  );
}

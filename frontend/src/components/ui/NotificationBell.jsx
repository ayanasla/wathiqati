import React, { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { getNotifications, getUnreadNotificationCount, markNotificationAsRead, markAllNotificationsRead } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getNotifications(true);
      setNotifications(data.notifications || data);
      const count = await getUnreadNotificationCount();
      setUnread(count.unreadCount ?? count);
    } catch (err) {
      console.error('Load notifications failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      const iv = setInterval(loadNotifications, 15000);
      return () => clearInterval(iv);
    }
  }, [user]);

  const onMarkRead = async (id) => {
    if (!user) return;

    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnread((count) => Math.max(0, count - 1));
    } catch (err) {
      console.error('Mark notification read failed', err);
    }
  };

  const onMarkAll = async () => {
    if (!user) return;

    try {
      await markAllNotificationsRead();
      setUnread(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Mark all notifications failed', err);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="relative p-2 text-slate-600 hover:text-[#9B1C1C] rounded-lg transition-colors">
        <Bell className="w-5 h-5" />
        {unread > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center px-1 font-semibold">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-2xl border border-slate-200 z-50">
          <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Notifications</h3>
            <button onClick={onMarkAll} className="text-xs text-slate-500 hover:text-slate-700">Mark all read</button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-xs text-slate-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-xs text-slate-500">No new notifications</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`px-4 py-3 border-b border-slate-100 ${n.isRead ? 'bg-white' : 'bg-red-50'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-slate-400">{n.type?.toUpperCase()}</p>
                      <p className="text-sm text-slate-800 font-medium">{n.title}</p>
                      <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                    </div>
                    {!n.isRead && (
                      <button onClick={() => onMarkRead(n.id)} className="text-green-600 hover:text-green-700" title="Mark read"><Check className="w-4 h-4" /></button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-2 text-right text-xs text-slate-500">Auto refresh every 15s</div>
        </div>
      )}
    </div>
  );
}
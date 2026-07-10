import React, { useState, useEffect } from "react";
import { Bell, User as UserIcon, LogOut, Megaphone } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      api.get("/notices/")
        .then((res) => {
          setNotices(res.data.slice(0, 3)); // show top 3 notices
        })
        .catch(() => {});
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="sticky top-0 right-0 z-10 w-full h-16 bg-white border-b border-primary/5 px-8 flex items-center justify-between shadow-soft">
      {/* Welcome Banner */}
      <div>
        <h2 className="text-base font-semibold text-text-light">
          Welcome back, <span className="text-primary-dark font-bold">{user.full_name}</span>
        </h2>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-6 relative">
        {/* Notification Icon */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-xl hover:bg-background-soft text-text-light hover:text-primary transition-colors"
          >
            <Bell className="h-5 w-5" />
            {notices.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-premium border border-primary/5 py-4 px-3 flex flex-col gap-3">
              <span className="text-sm font-bold text-text border-b border-primary/5 pb-2 px-2 flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" /> Notice Board Highlights
              </span>
              {notices.length === 0 ? (
                <span className="text-xs text-text-light text-center py-4">No recent notices available.</span>
              ) : (
                notices.map((notice) => (
                  <div key={notice.id} className="p-2 rounded-lg bg-background-soft flex flex-col gap-1">
                    <span className="text-xs font-bold text-primary-dark">{notice.title}</span>
                    <span className="text-[11px] text-text-light line-clamp-2">{notice.content}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1 px-3 border border-primary/10 rounded-xl hover:bg-background-soft transition-colors text-text-light"
          >
            <div className="h-7 w-7 rounded-lg bg-primary-light/25 flex items-center justify-center text-primary-dark font-bold text-sm">
              {user.full_name.charAt(0)}
            </div>
            <span className="text-sm font-semibold hidden md:inline">{user.full_name.split(" ")[0]}</span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-premium border border-primary/5 py-2 flex flex-col">
              <div className="px-4 py-2 border-b border-primary/5 flex flex-col mb-1.5">
                <span className="text-xs font-bold text-text">{user.full_name}</span>
                <span className="text-[11px] text-text-light truncate">{user.email}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 text-left w-full font-medium"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

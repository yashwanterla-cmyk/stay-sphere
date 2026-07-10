import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Home,
  Bed,
  Users,
  CreditCard,
  FileText,
  UserCheck,
  Wrench,
  CalendarCheck,
  Megaphone,
  TrendingDown,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  // Navigation schema depending on user role
  const allNavItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard, roles: ["super_admin", "owner", "staff", "tenant"] },
    { name: "Properties", path: "/properties", icon: Home, roles: ["super_admin", "owner"] },
    { name: "Rooms & Beds", path: "/rooms", icon: Bed, roles: ["owner", "staff"] },
    { name: "Tenants", path: "/tenants", icon: Users, roles: ["owner", "staff"] },
    { name: "Rent & Bills", path: "/rent", icon: CreditCard, roles: ["owner", "staff", "tenant"] },
    { name: "Agreements", path: "/agreements", icon: FileText, roles: ["owner", "tenant"] },
    { name: "Visitors", path: "/visitors", icon: UserCheck, roles: ["owner", "staff"] },
    { name: "Maintenance", path: "/maintenance", icon: Wrench, roles: ["owner", "staff", "tenant"] },
    { name: "Attendance", path: "/attendance", icon: CalendarCheck, roles: ["owner", "staff", "tenant"] },
    { name: "Notice Board", path: "/notices", icon: Megaphone, roles: ["super_admin", "owner", "staff", "tenant"] },
    { name: "Expenses", path: "/expenses", icon: TrendingDown, roles: ["owner", "staff"] },
    { name: "Reports", path: "/reports", icon: BarChart3, roles: ["super_admin", "owner"] },
  ];

  const filteredNavItems = allNavItems.filter((item) => item.roles.includes(user.role));

  return (
    <motion.div
      animate={{ width: isCollapsed ? 76 : 260 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 25 }}
      className="sticky top-0 left-0 h-screen bg-background-soft border-r border-primary/5 flex flex-col z-20"
    >
      {/* Header / Logo */}
      <div className="flex items-center justify-between p-6 border-b border-primary/5">
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold text-primary-dark tracking-wide flex items-center gap-2"
          >
            <span className="bg-primary text-white p-1.5 rounded-lg">SS</span>
            StaySphere
          </motion.span>
        )}
        {isCollapsed && (
          <span className="bg-primary text-white p-1.5 rounded-lg text-sm font-bold mx-auto">SS</span>
        )}
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="rounded-lg p-1.5 hover:bg-primary-light/10 text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="absolute -right-3 top-8 bg-white border border-primary/10 rounded-full p-1 shadow-soft text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link key={item.name} to={item.path}>
              <div
                className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 select-none ${
                  isActive
                    ? "bg-primary text-white shadow-soft"
                    : "text-text-light hover:bg-primary-light/10 hover:text-primary-dark"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Profile & Logout Info */}
      <div className="p-4 border-t border-primary/5 space-y-4">
        {!isCollapsed && (
          <div className="bg-primary-light/10 p-3 rounded-xl flex flex-col">
            <span className="text-sm font-semibold text-primary-dark truncate">
              {user.full_name}
            </span>
            <span className="text-xs text-text-light capitalize font-medium opacity-75">
              {user.role.replace("_", " ")}
            </span>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center gap-4 px-3.5 py-3 rounded-xl text-red-500 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="font-semibold text-sm">Logout</span>}
        </button>
      </div>
    </motion.div>
  );
};

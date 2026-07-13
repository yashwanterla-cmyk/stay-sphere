import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, token, loading } = useAuth();

  // While AuthContext initializes from localStorage on mount, show a spinner
  if (loading) {
    console.log("[ProtectedRoute] Auth still loading, showing spinner...");
    return (
      <div className="min-h-screen bg-background-soft flex items-center justify-center">
        <svg
          className="animate-spin h-8 w-8 text-primary"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  // Primary check: React context state
  // Fallback check: localStorage (covers the brief window in React 19 where
  // setState has been called but the re-render hasn't propagated yet)
  const localToken = localStorage.getItem("token");
  const localUserRaw = localStorage.getItem("user");
  const localUser = localUserRaw ? JSON.parse(localUserRaw) : null;

  const effectiveToken = token || localToken;
  const effectiveUser = user || localUser;

  console.log("[ProtectedRoute] Check — context token:", !!token, "| localStorage token:", !!localToken, "| user:", effectiveUser?.email);

  if (!effectiveToken || !effectiveUser) {
    console.warn("[ProtectedRoute] No valid session found, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(effectiveUser.role)) {
    console.warn("[ProtectedRoute] Role", effectiveUser.role, "not in allowedRoles:", allowedRoles, "— redirecting to /");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

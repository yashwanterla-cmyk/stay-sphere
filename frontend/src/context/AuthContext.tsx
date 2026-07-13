import React, { createContext, useContext, useState, useEffect } from "react";


interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  status: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (token: string, userProfile: UserProfile) => void;
  logout: () => void;
  updateUser: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserRaw = localStorage.getItem("user");
    console.log("[AuthContext] Initializing — stored token present:", !!storedToken, "| stored user present:", !!storedUserRaw);

    if (storedToken && storedUserRaw) {
      try {
        const storedUser = JSON.parse(storedUserRaw);
        setToken(storedToken);
        setUser(storedUser);
        console.log("[AuthContext] Restored session for:", storedUser.email, "| role:", storedUser.role);
      } catch (e) {
        console.error("[AuthContext] Failed to parse stored user, clearing session:", e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } else {
      console.log("[AuthContext] No stored session found.");
    }
    setLoading(false);
  }, []);

  const login = (jwtToken: string, userProfile: UserProfile) => {
    console.log("[AuthContext] login() called for:", userProfile.email, "| role:", userProfile.role);
    // Write to localStorage FIRST (synchronous) so ProtectedRoute can read it
    // even during the React 19 concurrent render window before state propagates
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userProfile));
    console.log("[AuthContext] localStorage updated. Now updating React state...");
    setToken(jwtToken);
    setUser(userProfile);
    console.log("[AuthContext] React state updated. Login complete.");
  };

  const logout = () => {
    console.log("[AuthContext] logout() called — clearing session.");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (profile: Partial<UserProfile>) => {
    if (user) {
      const updated = { ...user, ...profile };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
      console.log("[AuthContext] updateUser() — profile updated for:", updated.email);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

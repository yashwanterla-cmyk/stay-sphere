import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

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
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (jwtToken: string, userProfile: UserProfile) => {
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userProfile));
    setToken(jwtToken);
    setUser(userProfile);
  };

  const logout = () => {
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

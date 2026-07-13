import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Lock, Mail, Key } from "lucide-react";
import api from "../../services/api";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("[Login] Submitting login for:", email);
      const formPayload = new URLSearchParams();
      formPayload.append("username", email);
      formPayload.append("password", password);

      const response = await api.post(
        "/auth/login",
        formPayload.toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      console.log("[Login] Response status:", response.status, "data:", response.data);

      const { access_token, role, full_name, user_id } = response.data;
      login(access_token, { id: user_id, email, full_name, role, status: "active" });
      navigate("/");
    } catch (err: any) {
      console.error("[Login] Error during login:", err);
      setError(err.response?.data?.detail || "Invalid login credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-soft flex items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white border border-primary/5 rounded-2xl p-8 shadow-premium"
      >
        <div className="text-center mb-8">
          <span className="bg-primary text-white p-2.5 rounded-xl text-lg font-bold inline-block mb-3 shadow-soft">SS</span>
          <h2 className="text-2xl font-bold text-primary-dark">Welcome to StaySphere</h2>
          <p className="text-text-light text-sm mt-1.5 font-medium">Smart PG & Hostel Management Platform</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm mb-6 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-light uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text placeholder-text-muted text-sm transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Password</label>
              <button
                type="button"
                onClick={() => alert("Simulation: Reset email link generated!")}
                className="text-xs text-primary hover:text-primary-dark font-semibold"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text placeholder-text-muted text-sm transition-colors"
              />
            </div>
          </div>

          <Button type="submit" isLoading={loading} className="w-full py-3.5 text-base font-bold shadow-soft mt-3">
            Sign In
          </Button>
        </form>

        <div className="mt-6 border-t border-primary/5 pt-6 text-center">
          <p className="text-sm text-text-light font-medium">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:text-primary-dark font-bold">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Demo Credentials Box */}
        <div className="mt-8 p-4 bg-primary-light/5 border border-primary-light/15 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-primary-dark font-bold text-xs uppercase tracking-wider">
            <Key className="h-4 w-4" /> Demo Credentials (Password: password123)
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-text-light font-medium">
            <div>
              <span className="font-bold text-primary-dark">Owner:</span> owner@staysphere.com
            </div>
            <div>
              <span className="font-bold text-primary-dark">Tenant:</span> tenant@staysphere.com
            </div>
            <div>
              <span className="font-bold text-primary-dark">Staff:</span> staff@staysphere.com
            </div>
            <div>
              <span className="font-bold text-primary-dark">Admin:</span> admin@staysphere.com
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

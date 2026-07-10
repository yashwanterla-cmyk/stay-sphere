import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/Button";
import { UserPlus, Mail, Lock, User as UserIcon, Phone, UserSquare2 } from "lucide-react";
import api from "../../services/api";

export const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("tenant"); // tenant or owner
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/auth/signup", {
        email,
        password,
        full_name: fullName,
        phone,
        role,
        status: "active",
      });

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Signup failed. Please try again.");
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
          <h2 className="text-2xl font-bold text-primary-dark">Create your Account</h2>
          <p className="text-text-light text-sm mt-1.5 font-medium">Join StaySphere management platform</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm mb-6 font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-xl text-sm mb-6 font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-light uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-3.5 h-5 w-5 text-text-muted" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-3 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text placeholder-text-muted text-sm transition-colors"
              />
            </div>
          </div>

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
            <label className="text-xs font-bold text-text-light uppercase tracking-wider">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 h-5 w-5 text-text-muted" />
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-11 pr-4 py-3 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text placeholder-text-muted text-sm transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-light uppercase tracking-wider">Password</label>
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

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-light uppercase tracking-wider">Join As</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("tenant")}
                className={`py-3 rounded-xl font-bold border transition-colors ${
                  role === "tenant"
                    ? "bg-primary/10 border-primary text-primary-dark"
                    : "border-primary/10 bg-background-soft text-text-light"
                }`}
              >
                Tenant / PG Guest
              </button>
              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`py-3 rounded-xl font-bold border transition-colors ${
                  role === "owner"
                    ? "bg-primary/10 border-primary text-primary-dark"
                    : "border-primary/10 bg-background-soft text-text-light"
                }`}
              >
                Property Owner
              </button>
            </div>
          </div>

          <Button type="submit" isLoading={loading} className="w-full py-3.5 text-base font-bold shadow-soft mt-3">
            Register Account
          </Button>
        </form>

        <div className="mt-6 border-t border-primary/5 pt-6 text-center">
          <p className="text-sm text-text-light font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:text-primary-dark font-bold">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

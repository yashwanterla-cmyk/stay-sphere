import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { DashboardSkeleton } from "../../components/ui/LoadingSkeleton";
import {
  Home,
  Bed,
  Users,
  DollarSign,
  Clock,
  Wrench,
  UserCheck,
  Plus,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [tenantStats, setTenantStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/reports/dashboard-stats");
        if (user?.role === "tenant") {
          setTenantStats(res.data);
        } else {
          setStats(res.data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <DashboardSkeleton />;

  // Render Tenant View
  if (user?.role === "tenant" && tenantStats) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-primary-dark">Tenant Dashboard</h1>
          <p className="text-text-light text-sm">Manage your billing, requests, and lease settings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-text-light">Current Bed Room Allocation</span>
            <span className="text-3xl font-extrabold text-primary-dark">
              Room {tenantStats.room_number || "N/A"}
            </span>
            <span className="text-sm font-semibold text-text">Bed: {tenantStats.bed_number || "N/A"}</span>
          </Card>

          <Card className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-text-light">Pending Balance Due</span>
            <span className="text-3xl font-extrabold text-red-500">
              ₹{(tenantStats.pending_rent || 0).toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-text-light">Due by 5th of this month</span>
          </Card>

          <Card className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-text-light">Active Complaints File</span>
            <span className="text-3xl font-extrabold text-primary">
              {tenantStats.active_complaints || 0}
            </span>
            <span className="text-sm font-semibold text-text-light">Tickets in resolution queue</span>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-text">Quick Tenant Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => window.location.href = "/rent"} variant="primary" className="py-3">
                Pay Rent Invoice
              </Button>
              <Button onClick={() => window.location.href = "/maintenance"} variant="secondary" className="py-3">
                File a Complaint
              </Button>
            </div>
          </Card>
          
          <Card className="flex flex-col justify-center p-6 text-center border border-dashed border-primary/20 bg-primary-light/5">
            <h4 className="text-sm font-bold text-primary-dark mb-1">Need Digital Signatures?</h4>
            <p className="text-xs text-text-light mb-4">You have active lease agreement documents waiting to be reviewed.</p>
            <Button onClick={() => window.location.href = "/agreements"} variant="outline" className="w-fit mx-auto text-xs py-2 px-4">
              View Agreement
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Render Owner / Admin / Staff Dashboard
  if (!stats) return <DashboardSkeleton />;

  const COLORS = ["#556B2F", "#8F9779", "#3D5229", "#1F2937"];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">StaySphere Management</h1>
          <p className="text-text-light text-sm">Overall dashboard analytics and property performance tracking.</p>
        </div>
        {user?.role !== "staff" && (
          <Button onClick={() => window.location.href = "/properties"} variant="primary" className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Property
          </Button>
        )}
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Home className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-text-light font-bold uppercase tracking-wider block">Properties</span>
            <span className="text-2xl font-bold text-text">{stats.metrics?.total_properties || 0}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Bed className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-text-light font-bold uppercase tracking-wider block">Beds (Vacant)</span>
            <span className="text-2xl font-bold text-text">
              {stats.metrics?.occupied_beds || 0}/{stats.metrics?.total_beds || 0}{" "}
              <span className="text-xs text-primary font-semibold">({stats.metrics?.vacant_beds || 0} vacant)</span>
            </span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-text-light font-bold uppercase tracking-wider block">Monthly Revenue</span>
            <span className="text-2xl font-bold text-text">₹{(stats.metrics?.monthly_revenue || 0).toLocaleString()}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-500 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-text-light font-bold uppercase tracking-wider block">Pending Rent</span>
            <span className="text-2xl font-bold text-red-500">₹{(stats.metrics?.pending_rent || 0).toLocaleString()}</span>
          </div>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Performance Chart */}
        <Card className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-primary/5 pb-4">
            <h3 className="font-bold text-text">Revenue vs Expense Performance</h3>
            <span className="text-xs text-text-light font-medium bg-background-soft px-3 py-1 rounded-full">Last 6 Months</span>
          </div>
          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.revenue_chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#556B2F" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="expenses" stroke="#8F9779" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Occupancy Breakdown Pie Chart */}
        <Card className="space-y-6">
          <div className="flex items-center justify-between border-b border-primary/5 pb-4">
            <h3 className="font-bold text-text">Occupancy Category</h3>
            <span className="text-xs text-text-light font-medium bg-background-soft px-3 py-1 rounded-full">Active Allocations</span>
          </div>
          <div className="h-60 w-full flex items-center justify-center text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.occupancy_chart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.occupancy_chart?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-text-light">
            {stats.occupancy_chart?.map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                {entry.name}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tables Row: Recent Payments and Operational stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="space-y-6">
            <div className="flex items-center justify-between border-b border-primary/5 pb-4">
              <h3 className="font-bold text-text">Recent Transactions</h3>
              <Button onClick={() => window.location.href = "/rent"} variant="outline" className="text-xs py-1.5 px-3">
                View All Transactions
              </Button>
            </div>
            <Table headers={["Tenant", "Amount Paid", "Date Logged"]}>
              {stats.recent_payments?.map((pay: any) => (
                <tr key={pay.id}>
                  <td className="px-6 py-4 text-sm font-semibold text-primary-dark">{pay.tenant_name}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-text">₹{pay.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs text-text-light">{pay.paid_at}</td>
                </tr>
              ))}
              {(!stats.recent_payments || stats.recent_payments.length === 0) && (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-xs text-text-light font-medium">No recent transactions recorded.</td>
                </tr>
              )}
            </Table>
          </Card>
        </div>

        <Card className="flex flex-col justify-between">
          <div className="border-b border-primary/5 pb-4 mb-4">
            <h3 className="font-bold text-text">Platform Logs</h3>
            <p className="text-xs text-text-light">Daily visitor count & maintenance tickets stats.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-background-soft border border-primary/5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <UserCheck className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-text">Visitors Today</span>
              </div>
              <span className="text-base font-extrabold text-primary-dark">{stats.metrics?.visitors_today || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-background-soft border border-primary/5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Wrench className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-text">Active Complaints</span>
              </div>
              <span className="text-base font-extrabold text-red-500">{stats.metrics?.maintenance_requests || 0}</span>
            </div>
          </div>
          <Button onClick={() => window.location.href = "/maintenance"} variant="outline" className="w-full text-xs font-bold mt-6 flex items-center justify-center gap-1.5">
            Resolve Open Tickets <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      </div>
    </div>
  );
};

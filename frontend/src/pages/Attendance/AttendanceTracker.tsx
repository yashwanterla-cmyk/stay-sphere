import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { CalendarCheck, ShieldCheck, HelpCircle } from "lucide-react";

export const AttendanceTracker: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      const res = await api.get("/attendance/");
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleCheckIn = async () => {
    try {
      await api.post("/attendance/check-in");
      alert("Successfully checked in for today!");
      fetchAttendance();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to check in.");
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.post("/attendance/check-out");
      alert("Successfully checked out for today!");
      fetchAttendance();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to check out.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">QR Entry/Exit Attendance</h1>
          <p className="text-text-light text-sm">Register daily checks log records automatically.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleCheckIn} variant="primary" className="text-sm">
            Check In
          </Button>
          <Button onClick={handleCheckOut} variant="secondary" className="text-sm">
            Check Out
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse bg-primary-light/10 h-64 rounded-xl" />
      ) : logs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-primary/20 bg-primary-light/5">
          <CalendarCheck className="h-12 w-12 text-primary-light mb-3" />
          <h3 className="text-base font-bold text-text mb-1">No Attendance Registered</h3>
          <p className="text-xs text-text-light">Daily check-in logs will appear here.</p>
        </Card>
      ) : (
        <Table headers={["Log ID", "Check-In Timestamp", "Check-Out Timestamp", "Shift Status"]}>
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-background-soft/50 transition-colors">
              <td className="px-6 py-4 text-xs font-bold text-primary-dark">ATT-{String(log.id).padStart(4, "0")}</td>
              <td className="px-6 py-4 text-xs text-text-light">{new Date(log.check_in).toLocaleString()}</td>
              <td className="px-6 py-4 text-xs text-text-light">
                {log.check_out ? new Date(log.check_out).toLocaleString() : "Active Shift Session"}
              </td>
              <td className="px-6 py-4">
                <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  log.status === "present"
                    ? "bg-green-100 text-green-700"
                    : log.status === "late"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {log.status}
                </span>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { FileText, FileSpreadsheet, ShieldAlert, BarChart } from "lucide-react";

export const ReportsPanel: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/reports/dashboard-stats")
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportExcel = () => {
    alert("Export CSV/Excel spreadsheet simulation completed!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Analytical Reports Panel</h1>
          <p className="text-text-light text-sm">Download statistics, revenues summaries, and platform logs databases.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2 text-xs py-2 px-3">
            <FileText className="h-4.5 w-4.5" /> Export PDF
          </Button>
          <Button onClick={handleExportExcel} variant="primary" className="flex items-center gap-2 text-xs py-2 px-3">
            <FileSpreadsheet className="h-4.5 w-4.5" /> Export CSV / Excel
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse bg-primary-light/10 h-64 rounded-xl" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="space-y-4">
            <h3 className="font-bold text-primary-dark flex items-center gap-2">
              <BarChart className="h-5 w-5" /> Operational Statistics Summary
            </h3>
            <div className="space-y-3 text-xs font-semibold text-text-light border-t border-primary/5 pt-4">
              <div className="flex justify-between">
                <span>Total Registered Properties:</span>
                <span className="text-text font-bold">{stats?.metrics?.total_properties}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Floor Rooms:</span>
                <span className="text-text font-bold">{stats?.metrics?.total_rooms}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Beds Allocated:</span>
                <span className="text-text font-bold">{stats?.metrics?.occupied_beds}</span>
              </div>
              <div className="flex justify-between">
                <span>Vacant Beds Remaining:</span>
                <span className="text-text font-bold text-primary">{stats?.metrics?.vacant_beds}</span>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="font-bold text-primary-dark flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" /> Financial Balance Sheets
            </h3>
            <div className="space-y-3 text-xs font-semibold text-text-light border-t border-primary/5 pt-4">
              <div className="flex justify-between">
                <span>Total Payments Revenue Billed:</span>
                <span className="text-text font-bold">₹{(stats?.metrics?.monthly_revenue || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Outstanding Overdue Rent:</span>
                <span className="text-red-500 font-bold">₹{(stats?.metrics?.pending_rent || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Water/Electricity Expenses Logged:</span>
                <span className="text-text font-bold">₹18,000</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

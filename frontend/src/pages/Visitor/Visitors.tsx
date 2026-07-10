import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Dialog } from "../../components/ui/Dialog";
import { UserCheck, ShieldCheck, Plus, QrCode } from "lucide-react";

export const Visitors: React.FC = () => {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");

  const fetchVisitors = async () => {
    try {
      const res = await api.get("/visitors/");
      setVisitors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
    api.get("/properties/")
      .then((res) => {
        setProperties(res.data);
        if (res.data.length > 0) setSelectedPropertyId(res.data[0].id);
      })
      .catch(console.error);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyId) return;

    try {
      await api.post("/visitors/", {
        name,
        phone,
        purpose,
        property_id: selectedPropertyId,
      });
      setIsModalOpen(false);
      setName("");
      setPhone("");
      setPurpose("");
      fetchVisitors();
    } catch (err) {
      alert("Failed to record visitor.");
    }
  };

  const handleCheckout = async (visitorId: number) => {
    try {
      await api.put(`/visitors/${visitorId}/checkout`);
      alert("Visitor checked out successfully.");
      fetchVisitors();
    } catch (err) {
      alert("Checkout action failed.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Visitor Pass Registers</h1>
          <p className="text-text-light text-sm">Review, register entry, and approve gates checkpoints passes.</p>
        </div>
        {user?.role !== "tenant" && (
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Check In Visitor
          </Button>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse bg-primary-light/10 h-64 rounded-xl" />
      ) : visitors.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-primary/20 bg-primary-light/5">
          <UserCheck className="h-12 w-12 text-primary-light mb-3" />
          <h3 className="text-base font-bold text-text mb-1">No Active Visitors</h3>
          <p className="text-xs text-text-light">Gate log files will appear once visitors checkout inputs are processed.</p>
        </Card>
      ) : (
        <Table headers={["Visitor Name", "Phone", "Purpose", "Entry Time", "Exit Time", "Status", "Actions"]}>
          {visitors.map((v) => (
            <tr key={v.id} className="hover:bg-background-soft/50 transition-colors">
              <td className="px-6 py-4 text-sm font-bold text-primary-dark">{v.name}</td>
              <td className="px-6 py-4 text-xs text-text-light font-medium">{v.phone}</td>
              <td className="px-6 py-4 text-xs text-text-light font-medium">{v.purpose}</td>
              <td className="px-6 py-4 text-xs text-text-muted">{new Date(v.entry_time).toLocaleString()}</td>
              <td className="px-6 py-4 text-xs text-text-muted">
                {v.exit_time ? new Date(v.exit_time).toLocaleString() : "Still On-Premise"}
              </td>
              <td className="px-6 py-4">
                <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  v.status === "approved" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                }`}>
                  {v.status.replace("_", " ")}
                </span>
              </td>
              <td className="px-6 py-4">
                {v.status === "approved" ? (
                  <Button onClick={() => handleCheckout(v.id)} variant="secondary" className="text-xs py-1 px-2.5">
                    Log Checkout
                  </Button>
                ) : (
                  <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                    <ShieldCheck className="h-4.5 w-4.5" /> Checked Out
                  </span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Check In Modal */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New Visitor Entry">
        <form onSubmit={handleCreate} className="space-y-4 text-sm font-sans">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-light uppercase tracking-wider">Target Property Location</label>
            <select
              value={selectedPropertyId || ""}
              onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Visitor Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohan Sharma"
                className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Phone number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 90000 00000"
                className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-light uppercase tracking-wider">Purpose of visit</label>
            <textarea
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Courier Delivery / Family Member Visit for Room 101"
              rows={3}
              className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
            />
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-xl p-3.5 flex items-center justify-between text-xs font-bold text-primary-dark">
            <span className="flex items-center gap-1.5"><QrCode className="h-4.5 w-4.5" /> Auto-Generate QR Entry Pass</span>
            <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full uppercase">Enabled</span>
          </div>

          <Button type="submit" className="w-full py-3 font-bold mt-2 shadow-soft">
            Confirm & Log Entry
          </Button>
        </form>
      </Dialog>
    </div>
  );
};

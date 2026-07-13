import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Dialog } from "../../components/ui/Dialog";
import { Plus, Users, Search, Filter } from "lucide-react";

export const TenantManagement: React.FC = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [bedNumber, setBedNumber] = useState("");
  const [fee, setFee] = useState("");

  const fetchTenants = async () => {
    try {
      const res = await api.get("/tenants/", {
        params: { search, status_filter: filter },
      });
      setTenants(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [search, filter]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/tenants/register", {
        email,
        full_name: fullName,
        phone,
        password,
        emergency_contact: emergencyContact,
        guardian_name: guardianName,
        guardian_phone: guardianPhone,
        room_number: roomNumber,
        bed_number: bedNumber,
        fee: Number(fee) || 0,
      });
      setIsModalOpen(false);
      setEmail("");
      setFullName("");
      setPhone("");
      setPassword("");
      setEmergencyContact("");
      setGuardianName("");
      setGuardianPhone("");
      setRoomNumber("");
      setBedNumber("");
      setFee("");
      fetchTenants();
    } catch (err) {
      alert("Failed to register tenant profile.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Tenants</h1>
          <p className="text-text-light text-sm">Review, register, and monitor resident lease statuses.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Tenant
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full pl-10 pr-4 py-2 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full md:w-48 px-4 py-2 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm font-semibold transition-colors"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="left">Checked Out</option>
          <option value="evict">Evicted</option>
        </select>
      </div>

      {loading ? (
        <div className="animate-pulse bg-primary-light/10 h-64 rounded-xl" />
      ) : tenants.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-primary/20 bg-primary-light/5">
          <Users className="h-12 w-12 text-primary-light mb-3" />
          <h3 className="text-base font-bold text-text mb-1">No Tenants Logged</h3>
          <p className="text-xs text-text-light mb-4">Start allocating beds by registering a tenant profile.</p>
          <Button onClick={() => setIsModalOpen(true)} variant="primary">
            Register Tenant
          </Button>
        </Card>
      ) : (
        <Table headers={["Name", "Contact Details", "Emergency Contact", "Guardian Info", "Room / Bed", "Fee", "Status"]}>
          {tenants.map((t) => (
            <tr key={t.id} className="hover:bg-background-soft/50 transition-colors">
              <td className="px-6 py-4 text-sm font-bold text-primary-dark">
                {t.user?.full_name}
                <span className="block text-[11px] font-normal text-text-light">{t.user?.email}</span>
              </td>
              <td className="px-6 py-4 text-xs text-text-light font-medium">{t.user?.phone || "N/A"}</td>
              <td className="px-6 py-4 text-xs text-text-light font-medium">{t.emergency_contact || "N/A"}</td>
              <td className="px-6 py-4 text-xs text-text-light font-medium">
                {t.guardian_name || "N/A"}
                {t.guardian_phone && <span className="block text-[10px] text-text-muted">({t.guardian_phone})</span>}
              </td>
              <td className="px-6 py-4 text-xs text-text-light font-medium">
                {t.room_number || "N/A"} / {t.bed_number || "N/A"}
              </td>
              <td className="px-6 py-4 text-xs text-text-light font-medium">₹{t.fee || 0}</td>
              <td className="px-6 py-4">
                <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  t.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {t.status}
                </span>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Add Tenant Modal */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Tenant">
        <form onSubmit={handleRegister} className="space-y-4 text-sm font-sans">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Liam Sterling"
                className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="liam@gmail.com"
                className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Phone</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 99999 88888"
                className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Sign In Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-light uppercase tracking-wider">Emergency Contact</label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="Contact Name & Number"
              className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Guardian Name</label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="Parent/Guardian"
                className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Guardian Phone</label>
              <input
                type="text"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Room Number</label>
              <input
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="101"
                className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Bed Number</label>
              <input
                type="text"
                required
                value={bedNumber}
                onChange={(e) => setBedNumber(e.target.value)}
                placeholder="101-A"
                className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Fee</label>
              <input
                type="number"
                required
                min="0"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="2500"
                className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
              />
            </div>
          </div>

          <Button type="submit" className="w-full py-3 font-bold mt-2 shadow-soft">
            Register Resident Profile
          </Button>
        </form>
      </Dialog>
    </div>
  );
};

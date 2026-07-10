import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Dialog } from "../../components/ui/Dialog";
import { Plus, Wrench, AlertTriangle, ShieldCheck } from "lucide-react";

export const MaintenanceList: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);

  // Create complaint form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [propertyId, setPropertyId] = useState<number | null>(null);

  // Edit action states
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("pending");
  const [notes, setNotes] = useState("");

  const fetchRequests = async () => {
    try {
      const res = await api.get("/maintenance/");
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    if (user?.role === "tenant") {
      api.get("/properties/")
        .then((res) => {
          setProperties(res.data);
          if (res.data.length > 0) setPropertyId(res.data[0].id);
        })
        .catch(console.error);
    }
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) return;

    try {
      await api.post("/maintenance/", {
        title,
        description,
        priority,
        property_id: propertyId,
      });
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      fetchRequests();
    } catch (err) {
      alert("Failed to submit request.");
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;

    try {
      await api.put(`/maintenance/${editingRequest.id}`, {
        status: newStatus,
        resolution_notes: notes,
      });
      setEditingRequest(null);
      setNotes("");
      fetchRequests();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Maintenance Complaints</h1>
          <p className="text-text-light text-sm">Submit, track, and assign technical/facilities tickets.</p>
        </div>
        {user?.role === "tenant" && (
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> File Ticket
          </Button>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse bg-primary-light/10 h-64 rounded-xl" />
      ) : requests.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-primary/20 bg-primary-light/5">
          <Wrench className="h-12 w-12 text-primary-light mb-3" />
          <h3 className="text-base font-bold text-text mb-1">No Maintenance Complaints</h3>
          <p className="text-xs text-text-light mb-4">No facilities complaints are currently pending resolution.</p>
        </Card>
      ) : (
        <Table headers={["Ticket ID", "Issue Title", "Description", "Priority", "Status", "Resolution Notes", "Actions"]}>
          {requests.map((req) => (
            <tr key={req.id} className="hover:bg-background-soft/50 transition-colors">
              <td className="px-6 py-4 text-xs font-bold text-primary-dark">TCK-{String(req.id).padStart(4, "0")}</td>
              <td className="px-6 py-4 text-sm font-bold text-text">{req.title}</td>
              <td className="px-6 py-4 text-xs text-text-light max-w-xs truncate">{req.description}</td>
              <td className="px-6 py-4 text-xs capitalize font-semibold">
                <span className={`flex items-center gap-1 ${
                  req.priority === "high" ? "text-red-600" : "text-yellow-600"
                }`}>
                  <AlertTriangle className="h-4 w-4 shrink-0" /> {req.priority}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  req.status === "resolved"
                    ? "bg-green-100 text-green-700"
                    : req.status === "in_progress"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {req.status.replace("_", " ")}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-text-light italic">{req.resolution_notes || "N/A"}</td>
              <td className="px-6 py-4">
                {user?.role !== "tenant" && req.status !== "resolved" ? (
                  <Button
                    onClick={() => {
                      setEditingRequest(req);
                      setNewStatus(req.status);
                    }}
                    variant="outline"
                    className="text-xs py-1.5 px-3"
                  >
                    Update
                  </Button>
                ) : (
                  <span className="text-xs text-text-light font-medium flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-green-600" /> Completed
                  </span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Create Ticket Modal */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="File Maintenance Complaint">
        <form onSubmit={handleCreate} className="space-y-4 text-sm font-sans">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-light uppercase tracking-wider">Property Location</label>
            <select
              value={propertyId || ""}
              onChange={(e) => setPropertyId(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-light uppercase tracking-wider">Issue Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bathroom sink leaking"
              className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-light uppercase tracking-wider">Description of Issue</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed note about the malfunction..."
              rows={3}
              className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-light uppercase tracking-wider">Priority Level</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
            >
              <option value="low">Low (Standard Maintenance)</option>
              <option value="medium">Medium (Requires attention)</option>
              <option value="high">High (Urgent Repair)</option>
            </select>
          </div>

          <Button type="submit" className="w-full py-3 font-bold mt-2 shadow-soft">
            Submit Ticket
          </Button>
        </form>
      </Dialog>

      {/* Edit Status Modal */}
      {editingRequest && (
        <Dialog isOpen={true} onClose={() => setEditingRequest(null)} title="Update Ticket Status">
          <form onSubmit={handleUpdateStatus} className="space-y-4 text-sm font-sans">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Resolution Notes</label>
              <textarea
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What was the resolution method?"
                rows={3}
                className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
              />
            </div>

            <Button type="submit" className="w-full py-3 font-bold mt-2 shadow-soft">
              Update Ticket
            </Button>
          </form>
        </Dialog>
      )}
    </div>
  );
};

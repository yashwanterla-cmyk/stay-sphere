import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { Megaphone, AlertCircle, Calendar, Pin, Plus } from "lucide-react";

export const NoticeBoard: React.FC = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("announcement");
  const [isPinned, setIsPinned] = useState(false);

  const fetchNotices = async () => {
    try {
      const res = await api.get("/notices/");
      setNotices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/notices/", {
        title,
        content,
        type,
        is_pinned: isPinned,
      });
      setIsModalOpen(false);
      setTitle("");
      setContent("");
      setIsPinned(false);
      fetchNotices();
    } catch (err) {
      alert("Failed to post notice.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Notice Board</h1>
          <p className="text-text-light text-sm">Official announcements, emergency notice pins, and community news.</p>
        </div>
        {user?.role !== "tenant" && (
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Notice
          </Button>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse bg-primary-light/10 h-64 rounded-xl" />
      ) : notices.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-primary/20 bg-primary-light/5">
          <Megaphone className="h-12 w-12 text-primary-light mb-3" />
          <h3 className="text-base font-bold text-text mb-1">Notice Board is Empty</h3>
          <p className="text-xs text-text-light">No announcements or notices have been posted yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notices.map((n) => (
            <Card key={n.id} className={`relative flex flex-col justify-between ${
              n.type === "emergency" ? "border-l-4 border-l-red-500" : ""
            }`}>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      n.type === "emergency"
                        ? "bg-red-50 text-red-600"
                        : n.type === "event"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-primary-light/20 text-primary-dark"
                    }`}>
                      {n.type}
                    </span>
                    <h3 className="text-base font-extrabold text-primary-dark">{n.title}</h3>
                  </div>
                  {n.is_pinned && <Pin className="h-4.5 w-4.5 text-primary shrink-0" />}
                </div>
                <p className="text-xs text-text-light leading-relaxed">{n.content}</p>
              </div>
              <div className="border-t border-primary/5 pt-4 mt-4 flex items-center justify-between text-[11px] text-text-muted font-semibold">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Published</span>
                <span>{new Date(n.created_at).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Notice Modal */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Announcement">
        <form onSubmit={handleCreate} className="space-y-4 text-sm font-sans">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-light uppercase tracking-wider">Announcement Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wi-Fi router maintenance"
              className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-light uppercase tracking-wider">Content text</label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide information update details..."
              rows={4}
              className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Notice Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
              >
                <option value="announcement">Announcement</option>
                <option value="event">Community Event</option>
                <option value="emergency">Emergency Alert</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mt-5">
              <input
                type="checkbox"
                id="pinNotice"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="h-4.5 w-4.5 border-primary/20 text-primary focus:ring-primary rounded"
              />
              <label htmlFor="pinNotice" className="text-xs font-bold text-text-light select-none">
                Pin Notice to Top
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full py-3 font-bold mt-2 shadow-soft">
            Publish Notice
          </Button>
        </form>
      </Dialog>
    </div>
  );
};

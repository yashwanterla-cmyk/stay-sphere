import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Dialog } from "../../components/ui/Dialog";
import { Plus, Home, MapPin, Building } from "lucide-react";

export const PropertyManagement: React.FC = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState("pg");
  const [amenities, setAmenities] = useState("");
  const [images, setImages] = useState("");

  const fetchProperties = async () => {
    try {
      const res = await api.get("/properties/");
      setProperties(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/properties/", {
        name,
        address,
        type,
        amenities,
        images,
      });
      setIsModalOpen(false);
      setName("");
      setAddress("");
      setAmenities("");
      setImages("");
      fetchProperties();
    } catch (err) {
      alert("Failed to create property.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Properties</h1>
          <p className="text-text-light text-sm">Add, remove, and manage your PG and hostel locations.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Property
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="animate-pulse bg-primary-light/10 h-48 rounded-xl" />
          <div className="animate-pulse bg-primary-light/10 h-48 rounded-xl" />
        </div>
      ) : properties.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-primary/20 bg-primary-light/5">
          <Building className="h-12 w-12 text-primary-light mb-3" />
          <h3 className="text-base font-bold text-text mb-1">No Properties Found</h3>
          <p className="text-xs text-text-light mb-4">Get started by creating your first PG/Hostel listing.</p>
          <Button onClick={() => setIsModalOpen(true)} variant="primary">
            Create Property
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {properties.map((prop) => (
            <Card key={prop.id} className="space-y-4">
              <div className="h-48 w-full rounded-xl overflow-hidden bg-primary-light/15">
                <img
                  src={prop.images || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"}
                  alt={prop.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-primary-dark text-lg">{prop.name}</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-primary-light/20 text-primary-dark rounded-full capitalize">
                    {prop.type}
                  </span>
                </div>
                <p className="text-xs text-text-light flex items-center gap-1">
                  <MapPin className="h-4.5 w-4.5 shrink-0 text-text-muted" /> {prop.address}
                </p>
              </div>
              <div className="border-t border-primary/5 pt-4 flex flex-wrap gap-1.5">
                {prop.amenities?.split(",").map((am: string) => (
                  <span key={am} className="text-[11px] font-medium bg-background-soft border border-primary/5 px-2.5 py-0.5 rounded-md text-text">
                    {am.trim()}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog Modal */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Property">
        <form onSubmit={handleCreate} className="space-y-4 font-sans text-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-light uppercase tracking-wider">Property Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Greenview Executive PG"
              className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-light uppercase tracking-wider">Address Location</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 10th Cross, Indiranagar, Bangalore"
              className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Property Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
              >
                <option value="pg">PG (Paying Guest)</option>
                <option value="hostel">Hostel</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Cover Image URL</label>
              <input
                type="text"
                value={images}
                onChange={(e) => setImages(e.target.value)}
                placeholder="Optional image path"
                className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-light uppercase tracking-wider">Amenities (Comma separated)</label>
            <input
              type="text"
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
              placeholder="Wi-Fi, AC, Power Backup, Laundry"
              className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
            />
          </div>

          <Button type="submit" className="w-full py-3 font-bold mt-2 shadow-soft">
            Save Property
          </Button>
        </form>
      </Dialog>
    </div>
  );
};

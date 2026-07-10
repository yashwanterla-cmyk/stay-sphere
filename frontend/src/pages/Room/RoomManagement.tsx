import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Dialog } from "../../components/ui/Dialog";
import { Plus, LayoutGrid, AlertCircle, Bed as BedIcon } from "lucide-react";

export const RoomManagement: React.FC = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Forms
  const [roomNumber, setRoomNumber] = useState("");
  const [floor, setFloor] = useState(1);
  const [roomType, setRoomType] = useState("double");
  const [price, setPrice] = useState(7000);
  const [capacity, setCapacity] = useState(2);

  useEffect(() => {
    api.get("/properties/")
      .then((res) => {
        setProperties(res.data);
        if (res.data.length > 0) {
          setSelectedPropertyId(res.data[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fetchRooms = (propId: number) => {
    api.get(`/rooms/property/${propId}`)
      .then((res) => setRooms(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    if (selectedPropertyId) {
      fetchRooms(selectedPropertyId);
    }
  }, [selectedPropertyId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyId) return;

    try {
      await api.post(`/rooms/property/${selectedPropertyId}`, {
        room_number: roomNumber,
        floor: Number(floor),
        room_type: roomType,
        price_per_bed: Number(price),
        capacity: Number(capacity),
      });
      setIsModalOpen(false);
      setRoomNumber("");
      fetchRooms(selectedPropertyId);
    } catch (err) {
      alert("Error generating room.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Room & Bed Inventories</h1>
          <p className="text-text-light text-sm">Organize layouts, pricing thresholds, and vacant beds.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPropertyId || ""}
            onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
            className="px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm font-semibold transition-colors"
          >
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Room
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse bg-primary-light/10 h-64 rounded-xl" />
      ) : rooms.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-primary/20 bg-primary-light/5">
          <LayoutGrid className="h-12 w-12 text-primary-light mb-3" />
          <h3 className="text-base font-bold text-text mb-1">No Rooms Added Yet</h3>
          <p className="text-xs text-text-light mb-4">Initialize property floor layouts by creating room keys.</p>
          <Button onClick={() => setIsModalOpen(true)} variant="primary">
            Create Room
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card key={room.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-primary-dark text-lg">Room {room.room_number}</h3>
                  <span className="text-xs text-text-light font-medium block">Floor {room.floor}</span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-primary-light/20 text-primary-dark rounded-full capitalize">
                  {room.room_type}
                </span>
              </div>
              <div className="space-y-2 border-t border-primary/5 pt-4">
                <div className="flex items-center justify-between text-xs font-semibold text-text-light">
                  <span>Price per bed:</span>
                  <span className="text-primary font-bold">₹{room.price_per_bed.toLocaleString()}/mo</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-text-light">
                  <span>Total Beds Capacity:</span>
                  <span>{room.capacity} beds</span>
                </div>
              </div>
              {/* Bed status simulation placeholder */}
              <div className="bg-background-soft border border-primary/5 rounded-xl p-3 flex items-center justify-between text-xs font-bold text-primary-dark">
                <span className="flex items-center gap-1"><BedIcon className="h-4.5 w-4.5" /> Beds List Generated</span>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase">Vacant/Occupied</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Room Dialog */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Room">
        <form onSubmit={handleCreate} className="space-y-4 text-sm font-sans">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Room Number</label>
              <input
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. 101"
                className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Floor Level</label>
              <input
                type="number"
                required
                value={floor}
                onChange={(e) => setFloor(Number(e.target.value))}
                min={0}
                className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Sharing Style</label>
              <select
                value={roomType}
                onChange={(e) => {
                  setRoomType(e.target.value);
                  const caps: Record<string, number> = { single: 1, double: 2, triple: 3, quad: 4 };
                  setCapacity(caps[e.target.value] || 2);
                }}
                className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
              >
                <option value="single">Single Sharing</option>
                <option value="double">Double Sharing</option>
                <option value="triple">Triple Sharing</option>
                <option value="quad">Four Sharing</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Max Capacity</label>
              <input
                type="number"
                required
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                min={1}
                className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-light uppercase tracking-wider">Price per Bed (Monthly)</label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              min={100}
              placeholder="e.g. 7500"
              className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
            />
          </div>

          <Button type="submit" className="w-full py-3 font-bold mt-2 shadow-soft">
            Save & Build Beds
          </Button>
        </form>
      </Dialog>
    </div>
  );
};

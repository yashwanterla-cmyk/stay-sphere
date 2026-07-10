import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Dialog } from "../../components/ui/Dialog";
import { TrendingDown, IndianRupee, Plus } from "lucide-react";

export const ExpenseTracker: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  // Form states
  const [category, setCategory] = useState("maintenance");
  const [amount, setAmount] = useState(1000);
  const [description, setDescription] = useState("");

  const fetchExpenses = async () => {
    try {
      const res = await api.get("/expenses/");
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
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
      await api.post("/expenses/", {
        category,
        amount: Number(amount),
        description,
        property_id: selectedPropertyId,
      });
      setIsModalOpen(false);
      setDescription("");
      setAmount(1000);
      fetchExpenses();
    } catch (err) {
      alert("Failed to log expense.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Operations Budget & Expenses</h1>
          <p className="text-text-light text-sm">Register water, electricity, salaries, and maintenance bills costs.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Record Expense
        </Button>
      </div>

      {loading ? (
        <div className="animate-pulse bg-primary-light/10 h-64 rounded-xl" />
      ) : expenses.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-primary/20 bg-primary-light/5">
          <TrendingDown className="h-12 w-12 text-primary-light mb-3" />
          <h3 className="text-base font-bold text-text mb-1">No Expenses Recorded</h3>
          <p className="text-xs text-text-light">Operational cost histories will appear once logs are saved.</p>
        </Card>
      ) : (
        <Table headers={["Log ID", "Category", "Amount", "Description", "Date Billed"]}>
          {expenses.map((exp) => (
            <tr key={exp.id} className="hover:bg-background-soft/50 transition-colors">
              <td className="px-6 py-4 text-xs font-bold text-primary-dark">EXP-{String(exp.id).padStart(4, "0")}</td>
              <td className="px-6 py-4 text-xs font-bold capitalize">
                <span className="bg-primary-light/10 text-primary-dark border border-primary/5 px-2 py-0.5 rounded-full">
                  {exp.category}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-text flex items-center gap-0.5">
                <IndianRupee className="h-3.5 w-3.5 text-text-light shrink-0" /> {exp.amount.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-xs text-text-light font-medium">{exp.description || "N/A"}</td>
              <td className="px-6 py-4 text-xs text-text-muted">{new Date(exp.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </Table>
      )}

      {/* Record Expense Modal */}
      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New Expense">
        <form onSubmit={handleCreate} className="space-y-4 text-sm font-sans">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-light uppercase tracking-wider">Property Location</label>
            <select
              value={selectedPropertyId || ""}
              onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors font-semibold"
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
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Cost Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
              >
                <option value="maintenance">Maintenance</option>
                <option value="salary">Staff Salary</option>
                <option value="electricity">Electricity Bill</option>
                <option value="water">Water Bill</option>
                <option value="other">Other Expense</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Amount (INR)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={1}
                className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-light uppercase tracking-wider">Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Paid plumbing plumber replacement charges"
              rows={3}
              className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors"
            />
          </div>

          <Button type="submit" className="w-full py-3 font-bold mt-2 shadow-soft">
            Save Record
          </Button>
        </form>
      </Dialog>
    </div>
  );
};

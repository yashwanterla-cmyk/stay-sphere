import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { CreditCard, FileText, ArrowRight, DollarSign } from "lucide-react";

export const RentCollection: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      const res = await api.get("/rent/invoices");
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleGenerateInvoices = async () => {
    try {
      const res = await api.post("/rent/invoices/generate-monthly");
      alert(res.data.message);
      fetchInvoices();
    } catch (err) {
      alert("Failed to auto-generate invoices.");
    }
  };

  const handlePay = async (invoiceId: number) => {
    try {
      const payRes = await api.post(`/rent/invoices/${invoiceId}/pay`);
      const { order_id, amount } = payRes.data;
      
      // Simulate Razorpay Checkout Screen Mock
      const confirmPay = window.confirm(
        `StaySphere Payment Checkout Screen (Mock)\n\nOrder ID: ${order_id}\nAmount Due: ₹${amount.toLocaleString()}\n\nDo you want to confirm checkout payment simulation?`
      );

      if (confirmPay) {
        const mockPaymentId = `pay_sim_${Math.random().toString(36).substring(2, 9)}`;
        await api.post(`/rent/invoices/${invoiceId}/verify`, null, {
          params: { payment_id: mockPaymentId }
        });
        alert("Payment completed successfully! Receipt generated.");
        fetchInvoices();
      }
    } catch (err) {
      alert("Checkout simulation failed.");
    }
  };

  const handleDownloadReceipt = async (invoiceId: number) => {
    try {
      const res = await api.get(`/rent/invoices/${invoiceId}/receipt`);
      const receipt = res.data;
      
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>StaySphere Rent Receipt - ${receipt.receipt_no}</title>
              <style>
                body { font-family: 'Outfit', sans-serif; padding: 40px; color: #1F2937; line-height: 1.6; }
                .header { border-bottom: 2px solid #556B2F; padding-bottom: 20px; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #556B2F; }
                .meta { float: right; text-align: right; font-size: 14px; color: #4B5563; }
                .section { margin-bottom: 20px; }
                .label { font-weight: bold; color: #3D5229; }
                .amount-box { background: #F8F9F5; border: 1px solid rgba(85,107,47,0.1); padding: 20px; border-radius: 12px; font-size: 20px; font-weight: bold; margin-top: 30px; }
                .footer { margin-top: 50px; font-size: 12px; color: #9CA3AF; text-align: center; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="meta">
                  Receipt No: ${receipt.receipt_no}<br>
                  Date Paid: ${receipt.paid_at}
                </div>
                <div class="logo">StaySphere Receipt</div>
              </div>
              <div class="section">
                <p><span class="label">Resident Tenant Name:</span> ${receipt.tenant_name}</p>
                <p><span class="label">Allocated Room Number:</span> Room ${receipt.room_number}</p>
                <p><span class="label">Transaction Reference:</span> ${receipt.payment_id}</p>
              </div>
              <div class="amount-box">
                Total Rent Paid: ₹${receipt.total.toLocaleString()} INR
              </div>
              <div class="footer">
                Thank you for choosing StaySphere Smart PG Platform. This is a computer generated receipt.
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (err) {
      alert("Error printing receipt details.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Rent & Invoices</h1>
          <p className="text-text-light text-sm">Monitor billing summaries, check payment statuses, and print receipts.</p>
        </div>
        {user?.role !== "tenant" && (
          <Button onClick={handleGenerateInvoices} className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Auto-Generate Rent Bills
          </Button>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse bg-primary-light/10 h-64 rounded-xl" />
      ) : invoices.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-primary/20 bg-primary-light/5">
          <CreditCard className="h-12 w-12 text-primary-light mb-3" />
          <h3 className="text-base font-bold text-text mb-1">No Invoices Generated</h3>
          <p className="text-xs text-text-light mb-4">Invoice logs will appear once rent generation runs.</p>
        </Card>
      ) : (
        <Table headers={["Invoice Ref", "Billed Amount", "Late Fee", "Due Date", "Status", "Actions"]}>
          {invoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-background-soft/50 transition-colors">
              <td className="px-6 py-4 text-sm font-bold text-primary-dark">INV-{String(inv.id).padStart(6, "0")}</td>
              <td className="px-6 py-4 text-sm font-semibold text-text">₹{inv.amount.toLocaleString()}</td>
              <td className="px-6 py-4 text-xs text-red-500 font-semibold">₹{inv.late_fee || 0}</td>
              <td className="px-6 py-4 text-xs text-text-light">{new Date(inv.due_date).toLocaleDateString()}</td>
              <td className="px-6 py-4">
                <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  inv.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : inv.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {inv.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  {inv.status === "pending" && user?.role === "tenant" && (
                    <Button onClick={() => handlePay(inv.id)} variant="primary" className="text-xs py-1.5 px-3">
                      Pay Now
                    </Button>
                  )}
                  {inv.status === "paid" && (
                    <Button onClick={() => handleDownloadReceipt(inv.id)} variant="outline" className="text-xs py-1.5 px-3 flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" /> Receipt
                    </Button>
                  )}
                  {inv.status !== "paid" && user?.role !== "tenant" && (
                    <span className="text-xs text-text-light italic font-medium">Awaiting Resident Action</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

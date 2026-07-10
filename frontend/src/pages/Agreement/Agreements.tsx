import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Table } from "../../components/ui/Table";
import { Dialog } from "../../components/ui/Dialog";
import { FileText, Award, Edit3, ShieldAlert } from "lucide-react";

export const Agreements: React.FC = () => {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingAgreement, setSigningAgreement] = useState<any>(null);
  const [signatureText, setSignatureText] = useState("");

  const fetchAgreements = async () => {
    try {
      const res = await api.get("/agreements/");
      setAgreements(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, []);

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signingAgreement) return;

    try {
      // Create a mock signature image URL using custom text canvas
      const signatureImgUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        signatureText
      )}&background=ffffff&color=556B2F&font-family=Outfit&bold=true`;

      await api.put(`/agreements/${signingAgreement.id}/sign`, {
        signature_img_url: signatureImgUrl,
      });

      setSigningAgreement(null);
      setSignatureText("");
      alert("Agreement signed digitally!");
      fetchAgreements();
    } catch (err) {
      alert("Failed to submit digital signature.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Lease Agreements</h1>
          <p className="text-text-light text-sm">Review, sign, and download your legally binding contracts.</p>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse bg-primary-light/10 h-64 rounded-xl" />
      ) : agreements.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-primary/20 bg-primary-light/5">
          <FileText className="h-12 w-12 text-primary-light mb-3" />
          <h3 className="text-base font-bold text-text mb-1">No Lease Agreements Found</h3>
          <p className="text-xs text-text-light mb-4">You do not have any lease agreements drafts assigned.</p>
        </Card>
      ) : (
        <Table headers={["Agreement Ref", "Date Created", "Status", "Date Signed", "Lease PDF", "Actions"]}>
          {agreements.map((ag) => (
            <tr key={ag.id} className="hover:bg-background-soft/50 transition-colors">
              <td className="px-6 py-4 text-sm font-bold text-primary-dark">AGR-{String(ag.id).padStart(4, "0")}</td>
              <td className="px-6 py-4 text-xs text-text-light">{new Date(ag.created_at).toLocaleDateString()}</td>
              <td className="px-6 py-4">
                <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  ag.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {ag.status.replace("_", " ")}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-text-light">
                {ag.signed_at ? new Date(ag.signed_at).toLocaleDateString() : "Pending Signature"}
              </td>
              <td className="px-6 py-4">
                <a
                  href={ag.agreement_pdf_url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                >
                  <Award className="h-4.5 w-4.5" /> lease_document.pdf
                </a>
              </td>
              <td className="px-6 py-4">
                {ag.status === "pending_signature" && user?.role === "tenant" ? (
                  <Button onClick={() => setSigningAgreement(ag)} variant="primary" className="text-xs py-1.5 px-3 flex items-center gap-1">
                    <Edit3 className="h-3.5 w-3.5" /> Sign Document
                  </Button>
                ) : ag.status === "active" ? (
                  <span className="text-xs text-green-600 font-bold flex items-center gap-1">✔ Verified Secure</span>
                ) : (
                  <span className="text-xs text-text-light italic font-semibold">Awaiting Tenant signature</span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Signing Dialog Modal */}
      {signingAgreement && (
        <Dialog isOpen={true} onClose={() => setSigningAgreement(null)} title="Sign Lease Agreement">
          <form onSubmit={handleSign} className="space-y-4 text-sm font-sans">
            <div className="bg-primary-light/5 border border-primary-light/15 rounded-xl p-4 text-xs text-text-light mb-4 space-y-2">
              <span className="font-bold text-primary-dark block">LEASE CONTRACT CLAUSE PREVIEW</span>
              <p className="italic">
                "I hereby declare that I will abide by all terms of the occupancy residency policies including timely monthly rent clearance by the 5th of each calendar month. This acts as a legal signature validation."
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-light uppercase tracking-wider">Type Your Full Name (Digital Signature)</label>
              <input
                type="text"
                required
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder="Type your name to sign"
                className="w-full px-4 py-2.5 bg-background-soft border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-text text-sm transition-colors font-semibold"
              />
            </div>

            <Button type="submit" className="w-full py-3 font-bold mt-2 shadow-soft">
              Confirm Digital Signature
            </Button>
          </form>
        </Dialog>
      )}
    </div>
  );
};

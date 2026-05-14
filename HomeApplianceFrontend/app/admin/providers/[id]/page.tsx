"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { adminApi, ProviderDetailResponse } from "@/lib/api";
import {
  BadgeCheck, XCircle, ArrowLeft, Loader2, AlertCircle, CheckCircle2,
  User, Phone, Mail, MapPin, Store, Briefcase, Star, FileText, Shield,
  Building2, Clock, ToggleLeft, ToggleRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE_URL = "http://localhost:8080";

export default function ProviderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [provider, setProvider] = useState<ProviderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<"approve" | "reject" | "toggle" | null>(null);
  const [success, setSuccess] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    if (!id) return;
    adminApi.getProviderDetail(id)
      .then((res) => setProvider(res.data))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load provider"))
      .finally(() => setLoading(false));
  }, [id]);

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3500);
  };

  const handleApprove = async () => {
    if (!provider) return;
    setActionLoading("approve");
    setError("");
    try {
      const res = await adminApi.approveProvider(provider.providerId);
      setProvider(res.data);
      setShowRejectForm(false);
      flash("Provider approved successfully!");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Approval failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!provider) return;
    setActionLoading("reject");
    setError("");
    try {
      const res = await adminApi.rejectProvider(provider.providerId, rejectNotes);
      setProvider(res.data);
      setShowRejectForm(false);
      setRejectNotes("");
      flash("Provider rejected.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Rejection failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async () => {
    if (!provider) return;
    setActionLoading("toggle");
    setError("");
    try {
      const res = await adminApi.toggleProviderActive(provider.providerId, !provider.active);
      // toggleProviderActive returns ProviderResponse, update only active field
      setProvider((prev) => prev ? { ...prev, active: !prev.active } : prev);
      flash(provider.active ? "Provider deactivated." : "Provider activated.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Toggle failed");
    } finally {
      setActionLoading(null);
    }
  };

  // Cloudinary URLs are already absolute https:// URLs
  const docUrl = (url?: string) => url || null;

  if (loading) return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="admin" />
      <main className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">Loading provider details…</span>
        </div>
      </main>
    </div>
  );

  if (error && !provider) return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="admin" />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <p className="text-red-600 font-medium">{error}</p>
          <button onClick={() => router.back()} className="text-sm text-primary hover:underline flex items-center gap-1 mx-auto">
            <ArrowLeft className="w-4 h-4" /> Back to providers
          </button>
        </div>
      </main>
    </div>
  );

  if (!provider) return null;

  const statusBadge = provider.verified
    ? <span className="text-xs px-3 py-1 rounded-full font-semibold bg-green-100 text-green-700">✓ Verified</span>
    : provider.adminNotes
    ? <span className="text-xs px-3 py-1 rounded-full font-semibold bg-red-100 text-red-700">✗ Rejected</span>
    : <span className="text-xs px-3 py-1 rounded-full font-semibold bg-yellow-100 text-yellow-700">⏳ Pending</span>;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="admin" />
      <main className="flex-1 p-8 overflow-y-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/admin/providers")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{provider.name}</h1>
              {statusBadge}
              {!provider.active && (
                <span className="text-xs px-3 py-1 rounded-full font-semibold bg-gray-100 text-gray-500">Inactive</span>
              )}
            </div>
            <p className="text-muted-foreground text-sm mt-1">{provider.categoryName} · {provider.serviceArea || "No area set"}</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — Personal + Professional + Shop */}
          <div className="lg:col-span-2 space-y-6">

            {/* Personal Info */}
            <section className="bg-card rounded-2xl border border-border shadow-sm p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Profile Photo */}
                {provider.profilePhotoUrl && (
                  <div className="sm:col-span-2 flex items-center gap-4 bg-muted/30 rounded-xl p-4 mb-2">
                    <img src={provider.profilePhotoUrl} alt="Profile" className="w-16 h-16 rounded-xl object-cover border-2 border-border shadow" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Profile Photo</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">{provider.name}</p>
                    </div>
                  </div>
                )}
                <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={provider.email}>
                  {provider.emailVerified
                    ? <span className="text-xs text-green-600 font-medium ml-1">✓ verified</span>
                    : <span className="text-xs text-yellow-600 font-medium ml-1">unverified</span>}
                </InfoRow>
                <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={provider.phone}>
                  {provider.phoneVerified
                    ? <span className="text-xs text-green-600 font-medium ml-1">✓ verified</span>
                    : <span className="text-xs text-yellow-600 font-medium ml-1">unverified</span>}
                </InfoRow>
                <InfoRow icon={<Clock className="w-4 h-4" />} label="Registered" value={
                  provider.registeredAt
                    ? new Date(provider.registeredAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                    : "—"
                } />
                <InfoRow icon={<MapPin className="w-4 h-4" />} label="Address" value={provider.userAddress || "—"} />
              </div>
            </section>

            {/* Professional Info */}
            <section className="bg-card rounded-2xl border border-border shadow-sm p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" /> Professional Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={<Building2 className="w-4 h-4" />} label="Category" value={provider.categoryName || "—"} />
                <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Experience" value={provider.experienceYears != null ? `${provider.experienceYears} years` : "—"} />
                <InfoRow icon={<Star className="w-4 h-4" />} label="Rating" value={provider.rating ? `⭐ ${provider.rating.toFixed(1)}` : "New"} />
              </div>
            </section>

            {/* Shop & Location */}
            <section className="bg-card rounded-2xl border border-border shadow-sm p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Store className="w-4 h-4 text-primary" /> Shop & Location
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={<Store className="w-4 h-4" />} label="Shop Name" value={provider.shopName || "—"} />
                <InfoRow icon={<MapPin className="w-4 h-4" />} label="Service Area" value={provider.serviceArea || "—"} />
                <div className="sm:col-span-2">
                  <InfoRow icon={<MapPin className="w-4 h-4" />} label="Shop Address" value={provider.shopAddress || "—"} />
                </div>
                {provider.latitude && provider.longitude && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground font-medium mb-1">GPS Coordinates</p>
                    <a
                      href={`https://www.google.com/maps?q=${provider.latitude},${provider.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {provider.latitude.toFixed(6)}, {provider.longitude.toFixed(6)} ↗
                    </a>
                  </div>
                )}
              </div>
            </section>

            {/* Documents */}
            <section className="bg-card rounded-2xl border border-border shadow-sm p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Uploaded Documents
              </h2>
              {!provider.govtIdDocumentUrl && !provider.businessCertificateUrl && !provider.addressProofUrl ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <FileText className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-sm">No documents uploaded yet</p>
                  <p className="text-xs mt-1">Provider hasn&apos;t submitted verification documents</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <DocItem
                    label="Government ID (Aadhaar / PAN / Passport)"
                    url={docUrl(provider.govtIdDocumentUrl)}
                  />
                  <DocItem
                    label="Business Certificate / GST"
                    url={docUrl(provider.businessCertificateUrl)}
                  />
                  <DocItem
                    label="Address Proof"
                    url={docUrl(provider.addressProofUrl)}
                  />
                </div>
              )}
            </section>

            {/* Admin Notes */}
            {provider.adminNotes && (
              <section className="bg-red-50 rounded-2xl border border-red-200 p-6">
                <h2 className="text-base font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Admin Notes / Rejection Reason
                </h2>
                <p className="text-sm text-red-600">{provider.adminNotes}</p>
              </section>
            )}
          </div>

          {/* RIGHT — Actions */}
          <div className="space-y-4">
            <section className="bg-card rounded-2xl border border-border shadow-sm p-6 sticky top-6">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Verification Actions
              </h2>

              {/* Approve */}
              {!provider.verified && (
                <button
                  onClick={handleApprove}
                  disabled={actionLoading !== null}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed mb-3"
                >
                  {actionLoading === "approve" ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}
                  {actionLoading === "approve" ? "Approving…" : "Approve Provider"}
                </button>
              )}
              {provider.verified && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-xl px-4 py-3 mb-3 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" /> This provider is verified
                </div>
              )}

              {/* Reject */}
              {!showRejectForm ? (
                <button
                  onClick={() => setShowRejectForm(true)}
                  disabled={actionLoading !== null}
                  className="w-full flex items-center justify-center gap-2 border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed mb-3"
                >
                  <XCircle className="w-4 h-4" /> Reject Provider
                </button>
              ) : (
                <div className="border border-red-200 rounded-xl p-4 mb-3 space-y-3">
                  <p className="text-sm font-medium text-red-700">Rejection Reason (optional)</p>
                  <textarea
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    placeholder="e.g. Document unclear, please resubmit Aadhaar card"
                    rows={3}
                    className="w-full text-sm border border-input rounded-lg px-3 py-2 bg-background outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleReject}
                      disabled={actionLoading !== null}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-60"
                    >
                      {actionLoading === "reject" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                      Confirm Reject
                    </button>
                    <button
                      onClick={() => { setShowRejectForm(false); setRejectNotes(""); }}
                      className="px-3 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-4 mt-2">
                <p className="text-xs text-muted-foreground mb-3 font-medium">Account Status</p>
                <button
                  onClick={handleToggleActive}
                  disabled={actionLoading !== null}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-xl border transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
                    provider.active
                      ? "border-gray-300 text-gray-600 hover:bg-gray-50"
                      : "border-blue-300 text-blue-600 hover:bg-blue-50"
                  )}
                >
                  {actionLoading === "toggle" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : provider.active ? (
                    <ToggleRight className="w-4 h-4" />
                  ) : (
                    <ToggleLeft className="w-4 h-4" />
                  )}
                  {actionLoading === "toggle"
                    ? "Updating…"
                    : provider.active ? "Deactivate Account" : "Activate Account"}
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function InfoRow({
  icon, label, value, children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
        <span className="text-muted-foreground/60">{icon}</span> {label}
      </p>
      <p className="text-sm text-foreground font-medium">
        {value}{children}
      </p>
    </div>
  );
}

function DocItem({ label, url }: { label: string; url: string | null }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
      <div className="flex items-center gap-3">
        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-foreground">{label}</span>
      </div>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary font-medium hover:underline shrink-0 ml-2"
        >
          View ↗
        </a>
      ) : (
        <span className="text-xs text-muted-foreground italic">Not uploaded</span>
      )}
    </div>
  );
}

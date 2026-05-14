"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import { providerApi, ProviderResponse } from "@/lib/api";
import { Store, MapPin, Briefcase, BadgeCheck, Save, Loader2, AlertCircle, CheckCircle2, Shield, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function ProviderProfilePage() {
  const [provider, setProvider] = useState<ProviderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    serviceArea: "", experienceYears: "", shopName: "", shopAddress: "", latitude: "", longitude: "",
  });

  useEffect(() => {
    providerApi.getProfile()
      .then((res) => {
        const p = res.data;
        setProvider(p);
        setForm({
          serviceArea: p.serviceArea ?? "",
          experienceYears: p.experienceYears != null ? String(p.experienceYears) : "",
          shopName: p.shopName ?? "",
          shopAddress: p.shopAddress ?? "",
          latitude: p.latitude != null ? String(p.latitude) : "",
          longitude: p.longitude != null ? String(p.longitude) : "",
        });
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await providerApi.updateProfile({
        serviceArea: form.serviceArea || undefined,
        experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
        shopName: form.shopName || undefined,
        shopAddress: form.shopAddress || undefined,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
      });
      setProvider(res.data);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="provider" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Shop Profile</h1>
            <p className="text-muted-foreground mt-1">Update your business details, service area, and location.</p>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading…
            </div>
          ) : (
            <div className="flex flex-col gap-6">

              {/* Verification Status Banner */}
              {provider && (
                <div className={`flex items-center justify-between rounded-2xl border px-5 py-4 ${
                  provider.verified
                    ? "bg-green-50 border-green-200"
                    : "bg-amber-50 border-amber-200"
                }`}>
                  <div className="flex items-center gap-3">
                    {provider.verified
                      ? <BadgeCheck className="w-5 h-5 text-green-600 shrink-0" />
                      : <Shield className="w-5 h-5 text-amber-600 shrink-0" />
                    }
                    <div>
                      <p className={`text-sm font-semibold ${provider.verified ? "text-green-700" : "text-amber-700"}`}>
                        {provider.verified ? "Account Verified ✓" : "Verification Pending"}
                      </p>
                      <p className={`text-xs mt-0.5 ${provider.verified ? "text-green-600" : "text-amber-600"}`}>
                        {provider.verified
                          ? "You're verified and visible to customers."
                          : "Upload your documents to get verified by admin."}
                      </p>
                    </div>
                  </div>
                  {!provider.verified && (
                    <Link href="/provider/documents"
                      className="text-xs text-amber-700 border border-amber-400 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 shrink-0">
                      Upload Docs <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              )}

              {/* Alerts */}
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
                </div>
              )}

              {/* Shop Details */}
              <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <h2 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
                  <Store className="w-4 h-4 text-primary" /> Shop Details
                </h2>
                <div className="grid gap-5">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Shop Name</label>
                    <input value={form.shopName} onChange={set("shopName")}
                      className="w-full text-sm border border-input rounded-xl px-4 py-2.5 bg-background outline-none focus:ring-2 focus:ring-ring"
                      placeholder="e.g. Kumar Electricals" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Shop Address</label>
                    <textarea value={form.shopAddress} onChange={set("shopAddress")} rows={2}
                      className="w-full text-sm border border-input rounded-xl px-4 py-2.5 bg-background outline-none focus:ring-2 focus:ring-ring resize-none"
                      placeholder="Full shop address" />
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <h2 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" /> Professional Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Years of Experience</label>
                    <input type="number" min={0} max={50} value={form.experienceYears} onChange={set("experienceYears")}
                      className="w-full text-sm border border-input rounded-xl px-4 py-2.5 bg-background outline-none focus:ring-2 focus:ring-ring"
                      placeholder="e.g. 5" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Service Area</label>
                    <input value={form.serviceArea} onChange={set("serviceArea")}
                      className="w-full text-sm border border-input rounded-xl px-4 py-2.5 bg-background outline-none focus:ring-2 focus:ring-ring"
                      placeholder="e.g. Andheri, Mumbai" />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <h2 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> GPS Location
                </h2>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Latitude</label>
                    <input type="number" step="any" value={form.latitude} onChange={set("latitude")}
                      className="w-full text-sm border border-input rounded-xl px-4 py-2.5 bg-background outline-none focus:ring-2 focus:ring-ring"
                      placeholder="e.g. 19.0760" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Longitude</label>
                    <input type="number" step="any" value={form.longitude} onChange={set("longitude")}
                      className="w-full text-sm border border-input rounded-xl px-4 py-2.5 bg-background outline-none focus:ring-2 focus:ring-ring"
                      placeholder="e.g. 72.8777" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Used to help customers find you via nearby search.</p>
              </div>

              <button onClick={handleSave} disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Profile</>}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

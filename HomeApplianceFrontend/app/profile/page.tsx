"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import { userApi, UserResponse } from "@/lib/api";
import PhoneVerificationModal from "@/components/auth/phone-verification-modal";
import { Camera, Loader2, Save, CheckCircle2, AlertCircle, BadgeCheck, Phone, User, MapPin } from "lucide-react";
import { useAuth } from "../login/auth-context";

const MAX_PHOTO_KB = 500;

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const role = authUser?.role?.toLowerCase() as "user" | "provider" | "admin" | undefined;

  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);

  const [form, setForm] = useState({ name: "", address: "" });

  useEffect(() => {
    userApi.getProfile()
      .then((res) => {
        const p = res.data;
        setProfile(p);
        setForm({ name: p.name ?? "", address: p.address ?? "" });
        if (p.profilePhoto) setPhotoPreview(p.profilePhoto);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPhotoError("Only JPEG, PNG, or WebP images are allowed.");
      return;
    }
    if (file.size > MAX_PHOTO_KB * 1024) {
      setPhotoError(`Photo is ${(file.size / 1024).toFixed(1)} KB — max allowed is ${MAX_PHOTO_KB} KB.`);
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload via backend (secure — goes through JWT-authenticated endpoint)
    try {
      setUploadingPhoto(true);
      const res = await userApi.uploadProfilePhoto(file);
      setProfile(res.data);
      setSuccess("Profile photo updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setPhotoPreview(profile?.profilePhoto ?? null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      // Build multipart form (backend expects multipart for profile updates)
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const formData = new FormData();
      const blob = new Blob([JSON.stringify({ name: form.name, address: form.address })], { type: "application/json" });
      formData.append("data", blob);
      const res = await fetch("http://localhost:8080/user/profile", {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(err?.message ?? "Update failed");
      }
      const data = await res.json() as { data: UserResponse };
      setProfile(data.data);
      setSuccess("Profile saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={role ?? "user"} />
      <main className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading profile…
        </div>
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={role ?? "user"} />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">My Account</h1>
            <p className="text-muted-foreground mt-1">Manage your personal details and profile photo.</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
            </div>
          )}

          {/* Profile Photo Card */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" /> Profile Photo
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-24 h-24 rounded-2xl object-cover border-2 border-border shadow" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-muted border-2 border-border flex items-center justify-center">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
                {uploadingPhoto && (
                  <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="inline-flex items-center gap-2 cursor-pointer bg-muted hover:bg-muted/70 text-foreground text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-border">
                  <Camera className="w-4 h-4" /> {uploadingPhoto ? "Uploading…" : "Change Photo"}
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
                    onChange={handlePhotoChange} disabled={uploadingPhoto} />
                </label>
                <p className="text-xs text-muted-foreground mt-2">JPEG, PNG, or WebP · Max {MAX_PHOTO_KB} KB</p>
                {photoError && <p className="text-xs text-red-600 mt-1">{photoError}</p>}
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6 mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Personal Details
            </h2>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full text-sm border border-input rounded-xl px-4 py-2.5 bg-background outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                <div className="flex items-center gap-2">
                  <input value={profile?.email ?? ""} disabled
                    className="flex-1 text-sm border border-input rounded-xl px-4 py-2.5 bg-muted text-muted-foreground cursor-not-allowed" />
                  {profile?.emailVerified && (
                    <BadgeCheck className="w-5 h-5 text-green-500 shrink-0" />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> Phone Number
                  {profile?.phoneVerified
                    ? <span className="text-xs text-green-600 font-medium">✓ Verified</span>
                    : <button onClick={() => setPhoneModalOpen(true)} className="text-xs text-primary underline hover:no-underline">Verify now</button>
                  }
                </label>
                <input value={profile?.phone ?? ""} disabled
                  className="w-full text-sm border border-input rounded-xl px-4 py-2.5 bg-muted text-muted-foreground cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> Address
                </label>
                <input
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full text-sm border border-input rounded-xl px-4 py-2.5 bg-background outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Your address"
                />
              </div>
            </div>
          </div>

          {/* Save */}
          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>

          {role === "provider" && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              To upload verification documents, go to{" "}
              <a href="/provider/documents" className="text-primary underline">My Documents</a>.
            </p>
          )}
        </div>
      </main>
      {/* {phoneModalOpen && (
        <PhoneVerificationModal
          onClose={() => setPhoneModalOpen(false)}
          onVerified={() => {
            setPhoneModalOpen(false);
            setProfile((p) => p ? { ...p, phoneVerified: true } : p);
          }}
        />
      )} */}
    </div>
  );
}

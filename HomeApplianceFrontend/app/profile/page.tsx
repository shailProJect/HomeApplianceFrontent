"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import {
  Camera,
  Lock,
  CheckCircle,
  BadgeCheck,
  Upload,
  FileText,
} from "lucide-react";
import imageCompression from "browser-image-compression";
import { useAuth } from "../login/auth-context";

export default function ProfilePage() {
  const { user } = useAuth();

  const [passwordModalOpen, setPasswordModalOpen] =
    useState(false);

  const [saved, setSaved] = useState(false);

  const [profilePhoto, setProfilePhoto] =
    useState<File | null>(null);

  const [documents, setDocuments] = useState({
    aadhaar: null as File | null,
    marksheet: null as File | null,
    experienceCertificate: null as File | null,
  });

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: "",
    address: "",

    // Provider
    shopName: "",
    shopAddress: "",
    workExperience: "",
    verified: false,
  });

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({
        ...f,
        [k]: e.target.value,
      }));

  // Profile photo compression
  const handleProfilePhotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      const compressedFile =
        await imageCompression(file, {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        });

      setProfilePhoto(compressedFile);
    } catch (error) {
      alert("Failed to process image");
    }
  };

  // Document compression
  const handleFileChange =
    (key: keyof typeof documents) =>
    async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {

      const file = e.target.files?.[0];

      if (!file) return;

      try {

        let finalFile: File = file;

        // Compress image files only
        if (file.type.startsWith("image/")) {

          finalFile =
            await imageCompression(file, {
              maxSizeMB: 0.5,
              maxWidthOrHeight: 1200,
              useWebWorker: true,
            });
        }

        setDocuments((prev) => ({
          ...prev,
          [key]: finalFile,
        }));

      } catch (error) {
        alert("Failed to process file");
      }
    };

  const handleSave = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        role={
          user?.role === "PROVIDER"
            ? "provider"
            : user?.role === "ADMIN"
            ? "admin"
            : "user"
        }
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">

          <h1 className="text-2xl font-bold text-foreground">
            Profile Settings
          </h1>

          <p className="text-muted-foreground mt-1">
            Manage your profile and business
            information.
          </p>
        </div>

        <div className="max-w-3xl flex flex-col gap-6">

          {/* Profile Photo */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">

            <h2 className="font-semibold text-foreground mb-5">
              Profile Photo
            </h2>

            <div className="flex items-center gap-5">

              <div className="relative">

                {profilePhoto ? (
                  <img
                    src={URL.createObjectURL(
                      profilePhoto
                    )}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl">
                    {initials}
                  </div>
                )}

                <label className="absolute bottom-0 right-0 w-7 h-7 bg-card border-2 border-background rounded-full flex items-center justify-center hover:bg-muted transition-colors shadow-sm cursor-pointer">

                  <Camera className="w-3.5 h-3.5 text-foreground" />

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={
                      handleProfilePhotoChange
                    }
                  />
                </label>
              </div>

              <div>

                <p className="font-medium text-foreground">
                  {user?.name}
                </p>

                <p className="text-sm text-muted-foreground">
                  {user?.email}
                </p>

                <div className="flex items-center gap-2 mt-1 flex-wrap">

                  <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    {user?.role}
                  </span>

                  {user?.role === "PROVIDER" && (
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                        form.verified
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      <BadgeCheck className="w-3 h-3" />

                      {form.verified
                        ? "Verified Provider"
                        : "Verification Pending"}
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-1">
                  Images are automatically
                  compressed before upload
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">

            <h2 className="font-semibold text-foreground mb-5">
              Personal Information
            </h2>

            <form
              onSubmit={handleSave}
              className="flex flex-col gap-4"
            >

              {saved && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">

                  <CheckCircle className="w-4 h-4" />

                  Profile updated successfully!
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="flex flex-col gap-1.5">

                  <label className="text-sm font-medium text-foreground">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={set("name")}
                    className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex flex-col gap-1.5">

                  <label className="text-sm font-medium text-foreground">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="+91 9876543210"
                    className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">

                <label className="text-sm font-medium text-foreground">
                  Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="flex flex-col gap-1.5">

                <label className="text-sm font-medium text-foreground">
                  Address
                </label>

                <input
                  type="text"
                  value={form.address}
                  onChange={set("address")}
                  placeholder="Your address"
                  className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="flex gap-3 mt-2">

                <button
                  type="submit"
                  className="bg-primary text-primary-foreground text-sm font-medium px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Shop Information */}
          {user?.role === "PROVIDER" && (
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">

              <h2 className="font-semibold text-foreground mb-5">
                Shop / Business Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="flex flex-col gap-1.5">

                  <label className="text-sm font-medium text-foreground">
                    Shop Name
                  </label>

                  <input
                    type="text"
                    value={form.shopName}
                    onChange={set("shopName")}
                    placeholder="ABC Electrical Works"
                    className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex flex-col gap-1.5">

                  <label className="text-sm font-medium text-foreground">
                    Work Experience (Years)
                  </label>

                  <input
                    type="number"
                    value={form.workExperience}
                    onChange={set("workExperience")}
                    placeholder="5"
                    className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-4">

                <label className="text-sm font-medium text-foreground">
                  Shop Address
                </label>

                <input
                  type="text"
                  value={form.shopAddress}
                  onChange={set("shopAddress")}
                  placeholder="Shop address"
                  className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          )}

          {/* Documents */}
          {user?.role === "PROVIDER" && (
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">

              <h2 className="font-semibold text-foreground mb-5">
                Verification Documents
              </h2>

              <div className="flex flex-col gap-5">

                {/* Aadhaar */}
                <div className="flex flex-col gap-2">

                  <label className="text-sm font-medium text-foreground">
                    Aadhaar Card
                  </label>

                  <label className="border border-dashed border-border rounded-xl p-4 cursor-pointer hover:bg-muted transition-colors">

                    <div className="flex items-center gap-3">

                      <Upload className="w-5 h-5 text-muted-foreground" />

                      <div>

                        <p className="text-sm font-medium">
                          Upload Aadhaar Card
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Auto compressed before upload
                        </p>
                      </div>
                    </div>

                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange(
                        "aadhaar"
                      )}
                    />
                  </label>

                  {documents.aadhaar && (
                    <div className="flex items-center gap-2 text-sm text-green-700">

                      <FileText className="w-4 h-4" />

                      {documents.aadhaar.name}
                    </div>
                  )}
                </div>

                {/* Marksheet */}
                <div className="flex flex-col gap-2">

                  <label className="text-sm font-medium text-foreground">
                    Marksheet / Qualification Certificate
                  </label>

                  <label className="border border-dashed border-border rounded-xl p-4 cursor-pointer hover:bg-muted transition-colors">

                    <div className="flex items-center gap-3">

                      <Upload className="w-5 h-5 text-muted-foreground" />

                      <div>

                        <p className="text-sm font-medium">
                          Upload Marksheet
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Auto compressed before upload
                        </p>
                      </div>
                    </div>

                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange(
                        "marksheet"
                      )}
                    />
                  </label>

                  {documents.marksheet && (
                    <div className="flex items-center gap-2 text-sm text-green-700">

                      <FileText className="w-4 h-4" />

                      {documents.marksheet.name}
                    </div>
                  )}
                </div>

                {/* Experience Certificate */}
                <div className="flex flex-col gap-2">

                  <label className="text-sm font-medium text-foreground">
                    Experience Certificate
                  </label>

                  <label className="border border-dashed border-border rounded-xl p-4 cursor-pointer hover:bg-muted transition-colors">

                    <div className="flex items-center gap-3">

                      <Upload className="w-5 h-5 text-muted-foreground" />

                      <div>

                        <p className="text-sm font-medium">
                          Upload Experience Certificate
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Auto compressed before upload
                        </p>
                      </div>
                    </div>

                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange(
                        "experienceCertificate"
                      )}
                    />
                  </label>

                  {documents.experienceCertificate && (
                    <div className="flex items-center gap-2 text-sm text-green-700">

                      <FileText className="w-4 h-4" />

                      {
                        documents
                          .experienceCertificate
                          .name
                      }
                    </div>
                  )}
                </div>

                <button className="bg-primary text-primary-foreground text-sm font-medium px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
                  Submit Documents
                </button>
              </div>
            </div>
          )}

          {/* Security */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">

            <h2 className="font-semibold text-foreground mb-5">
              Security
            </h2>

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-foreground">
                  Password
                </p>

                <p className="text-xs text-muted-foreground mt-0.5">
                  Keep your account secure
                </p>
              </div>

              <button
                onClick={() =>
                  setPasswordModalOpen(true)
                }
                className="flex items-center gap-2 border border-border text-sm font-medium px-4 py-2 rounded-xl hover:bg-muted transition-colors"
              >
                <Lock className="w-4 h-4" />
                Change Password
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { providerApi } from "@/lib/api";
import {
  FileText, Upload, CheckCircle2, AlertCircle, Loader2, Shield, X, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DocKey = "govtId" | "businessCertificate" | "addressProof";

const DOC_CONFIG: { key: DocKey; label: string; hint: string; icon: string }[] = [
  { key: "govtId", label: "Government-issued ID", hint: "Aadhaar card, PAN card, Passport, or Voter ID", icon: "🪪" },
  { key: "businessCertificate", label: "Business Certificate / GST", hint: "GST registration, shop licence, or trade certificate", icon: "📋" },
  { key: "addressProof", label: "Address Proof", hint: "Utility bill, bank statement, or rental agreement (last 3 months)", icon: "🏠" },
];

const MAX_KB = 500;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export default function ProviderDocumentsPage() {
  const [files, setFiles] = useState<Partial<Record<DocKey, File>>>({});
  const [previews, setPreviews] = useState<Partial<Record<DocKey, string>>>({});
  const [fileErrors, setFileErrors] = useState<Partial<Record<DocKey, string>>>({});
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileSelect = (key: DocKey, file: File | null) => {
    if (!file) return;
    setFileErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileErrors((prev) => ({ ...prev, [key]: `File type "${file.type}" not allowed. Use JPEG, PNG, WebP, or PDF.` }));
      return;
    }
    if (file.size > MAX_KB * 1024) {
      setFileErrors((prev) => ({ ...prev, [key]: `File is ${(file.size / 1024).toFixed(1)} KB — max allowed is ${MAX_KB} KB.` }));
      return;
    }

    setFiles((prev) => ({ ...prev, [key]: file }));
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviews((prev) => ({ ...prev, [key]: e.target?.result as string }));
      reader.readAsDataURL(file);
    } else {
      setPreviews((prev) => ({ ...prev, [key]: "pdf" }));
    }
  };

  const removeFile = (key: DocKey) => {
    setFiles((prev) => { const n = { ...prev }; delete n[key]; return n; });
    setPreviews((prev) => { const n = { ...prev }; delete n[key]; return n; });
    setFileErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const handleUpload = async () => {
    if (Object.keys(files).length === 0) {
      setError("Please select at least one document to upload.");
      return;
    }
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      await providerApi.uploadDocuments(files);
      setSuccess("✅ Documents submitted successfully! Admin will review them within 24 hours.");
      setFiles({});
      setPreviews({});
      setFileErrors({});
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="provider" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Verification Documents</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Upload documents for admin verification · Max 500 KB each</p>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 text-sm text-blue-700">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Files are uploaded securely to Cloudinary via our server using your JWT token.
              <strong> Cloudinary credentials are never exposed to the browser.</strong>
              Only admins can view your documents.
            </span>
          </div>

          {/* Alerts */}
          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> {success}
            </div>
          )}

          {/* Upload cards */}
          <div className="space-y-4 mb-8">
            {DOC_CONFIG.map(({ key, label, hint, icon }) => {
              const file = files[key];
              const preview = previews[key];
              const fileError = fileErrors[key];

              return (
                <div key={key} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                  <div className="flex items-start justify-between px-5 pt-5 pb-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
                      </div>
                    </div>
                    {file && (
                      <button onClick={() => removeFile(key)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="px-5 pb-5">
                    {fileError && (
                      <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                        <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {fileError}
                      </div>
                    )}

                    {!file ? (
                      <label className={cn(
                        "flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl cursor-pointer py-7 transition-colors",
                        fileError ? "border-red-300 bg-red-50/30 hover:border-red-400" : "border-border hover:border-primary/50 hover:bg-muted/30"
                      )}>
                        <Upload className={cn("w-6 h-6", fileError ? "text-red-400" : "text-muted-foreground")} />
                        <span className="text-sm font-medium text-muted-foreground">Click to upload or drag & drop</span>
                        <span className="text-xs text-muted-foreground">JPEG · PNG · WebP · PDF · Max <strong>500 KB</strong></span>
                        <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only"
                          onChange={(e) => handleFileSelect(key, e.target.files?.[0] ?? null)} />
                      </label>
                    ) : (
                      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                        {preview === "pdf"
                          ? <FileText className="w-10 h-10 text-red-500 shrink-0" />
                          : <img src={preview} alt="preview" className="w-12 h-12 rounded-lg object-cover shrink-0 border border-border" />
                        }
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB
                            <span className="ml-2 text-green-600 font-medium">✓ Within 500 KB</span>
                          </p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit */}
          <button onClick={handleUpload} disabled={uploading || Object.keys(files).length === 0}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed">
            {uploading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading securely…</>
              : <><Upload className="w-4 h-4" /> Submit Documents for Verification</>
            }
          </button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Your files are validated server-side, stored privately on Cloudinary, and are only accessible to admins.
          </p>
        </div>
      </main>
    </div>
  );
}

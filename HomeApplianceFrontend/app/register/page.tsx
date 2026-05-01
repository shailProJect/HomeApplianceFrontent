"use client";

import { useState } from "react";
import Link from "next/link";
import { Wrench, User, Phone, Mail, Lock, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "user" | "provider";

export default function RegisterPage() {
  const [role, setRole] = useState<Role>("user");

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ServeEase</span>
          </Link>
          <p className="text-muted-foreground text-sm mt-2">Create your account</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          <h1 className="text-2xl font-bold text-foreground mb-6">Get started</h1>

          {/* Role Toggle */}
          <div className="flex gap-2 bg-muted p-1 rounded-xl mb-6">
            {(["user", "provider"] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
                  role === r
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r === "user" ? "I need services" : "I provide services"}
              </button>
            ))}
          </div>

          <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <div className="flex items-center gap-3 border border-input rounded-xl px-3 py-2.5 bg-background focus-within:ring-2 focus-within:ring-ring">
                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                <input type="text" placeholder="John Doe" className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Phone Number</label>
              <div className="flex items-center gap-3 border border-input rounded-xl px-3 py-2.5 bg-background focus-within:ring-2 focus-within:ring-ring">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <input type="tel" placeholder="+91 9876543210" className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="flex items-center gap-3 border border-input rounded-xl px-3 py-2.5 bg-background focus-within:ring-2 focus-within:ring-ring">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <input type="email" placeholder="you@example.com" className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="flex items-center gap-3 border border-input rounded-xl px-3 py-2.5 bg-background focus-within:ring-2 focus-within:ring-ring">
                <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                <input type="password" placeholder="Create a strong password" className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>

            {/* Provider-only fields */}
            {role === "provider" && (
              <>
                <div className="h-px bg-border" />
                <p className="text-sm font-semibold text-foreground">Provider Details</p>

                {/* Service Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Service Category</label>
                  <select className="border border-input rounded-xl px-3 py-2.5 bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-ring appearance-none">
                    <option value="">Select a category</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                  </select>
                </div>

                {/* Experience */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Years of Experience</label>
                  <input type="number" min="0" placeholder="e.g. 5" className="border border-input rounded-xl px-3 py-2.5 bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" />
                </div>

                {/* Service Area */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Service Area</label>
                  <input type="text" placeholder="e.g. Koramangala, Bangalore" className="border border-input rounded-xl px-3 py-2.5 bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" />
                </div>

                {/* Upload ID */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Upload ID Proof</label>
                  <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:bg-muted transition-colors">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload or drag & drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to 5MB</p>
                  </div>
                </div>
              </>
            )}

            <Link
              href={role === "provider" ? "/provider/dashboard" : "/dashboard"}
              className="w-full bg-primary text-primary-foreground text-sm font-medium py-3 rounded-xl text-center hover:opacity-90 transition-opacity"
            >
              Create Account
            </Link>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wrench, User, Phone, Mail, Lock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api";
import { useAuth } from "../login/auth-context";

type Role = "USER" | "PROVIDER";

const SERVICE_CATEGORIES = [
  "ELECTRICIAN", "PLUMBER", "CARPENTER", "PAINTER",
  "CLEANER", "AC_TECHNICIAN", "APPLIANCE_REPAIR", "OTHER",
];

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [role, setRole] = useState<Role>("USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    serviceCategory: "",
    yearsOfExperience: "",
    serviceArea: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.phone) {
      setError("Please fill in all required fields.");
      return;
    }
    if (role === "PROVIDER" && !form.serviceCategory) {
      setError("Please select a service category.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const body: Parameters<typeof authApi.register>[0] = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role,
        ...(role === "PROVIDER" && {
          serviceCategory: form.serviceCategory,
          yearsOfExperience: form.yearsOfExperience ? parseInt(form.yearsOfExperience) : undefined,
          serviceArea: form.serviceArea || undefined,
        }),
      };

      const res = await authApi.register(body);
      const { accessToken, refreshToken } = res.data;

      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const user = {
        id: payload.sub,
        name: form.name,
        email: form.email,
        role: payload.role as "USER" | "PROVIDER" | "ADMIN",
      };

      login(user, accessToken, refreshToken);

      if (role === "PROVIDER") router.push("/provider/dashboard");
      else router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ApnaAdmi</span>
          </Link>
          <p className="text-muted-foreground text-sm mt-2">Create your account</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          <h1 className="text-2xl font-bold text-foreground mb-6">Get started</h1>

          {/* Role Toggle */}
          <div className="flex gap-2 bg-muted p-1 rounded-xl mb-6">
            {(["USER", "PROVIDER"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                  role === r
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r === "USER" ? "I need services" : "I provide services"}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Full Name *</label>
              <div className="flex items-center gap-3 border border-input rounded-xl px-3 py-2.5 bg-background focus-within:ring-2 focus-within:ring-ring">
                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={set("name")}
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Phone Number *</label>
              <div className="flex items-center gap-3 border border-input rounded-xl px-3 py-2.5 bg-background focus-within:ring-2 focus-within:ring-ring">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChange={set("phone")}
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Email *</label>
              <div className="flex items-center gap-3 border border-input rounded-xl px-3 py-2.5 bg-background focus-within:ring-2 focus-within:ring-ring">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set("email")}
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Password *</label>
              <div className="flex items-center gap-3 border border-input rounded-xl px-3 py-2.5 bg-background focus-within:ring-2 focus-within:ring-ring">
                <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type="password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={set("password")}
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {role === "PROVIDER" && (
              <>
                <div className="h-px bg-border" />
                <p className="text-sm font-semibold text-foreground">Provider Details</p>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Service Category *</label>
                  <select
                    value={form.serviceCategory}
                    onChange={set("serviceCategory")}
                    className="border border-input rounded-xl px-3 py-2.5 bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select a category</option>
                    {SERVICE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    value={form.yearsOfExperience}
                    onChange={set("yearsOfExperience")}
                    className="border border-input rounded-xl px-3 py-2.5 bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Service Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Koramangala, Bangalore"
                    value={form.serviceArea}
                    onChange={set("serviceArea")}
                    className="border border-input rounded-xl px-3 py-2.5 bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground text-sm font-medium py-3 rounded-xl text-center hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {loading ? "Creating account…" : "Create Account"}
            </button>
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
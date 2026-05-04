"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wrench, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { authApi, getUser } from "@/lib/api";
import { useAuth } from "./auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const res = await authApi.login(email, password);

    console.log("LOGIN RESPONSE:", res); // 🔥 MUST LOG

    const data = res.data;
    console.log("EXTRACTED DATA:", data); // 🔥 MUST LOG

    if (!data || !data.accessToken) {
      throw new Error("Invalid login response");
    }

    const user = {
      id: data.userId,
      name: email.split("@")[0],
      email,
      role: data.role,
    };

    // 🔥 THIS is what saves token
    login(user, data.accessToken, data.refreshToken);

    if (user.role === "ADMIN") router.push("/admin");
    else if (user.role === "PROVIDER") router.push("/provider/dashboard");
    else router.push("/dashboard");

  } catch (err: any) {
    console.error(err);
    setError(err.message);
  }
};

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ApnaAdmi</span>
          </Link>
          <p className="text-muted-foreground text-sm mt-2">Sign in to your account</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          <h1 className="text-2xl font-bold text-foreground mb-6">Welcome back</h1>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleLogin}>
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="email">Email</label>
              <div className="flex items-center gap-3 border border-input rounded-xl px-3 py-2.5 bg-background focus-within:ring-2 focus-within:ring-ring transition-shadow">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="password">Password</label>
              <div className="flex items-center gap-3 border border-input rounded-xl px-3 py-2.5 bg-background focus-within:ring-2 focus-within:ring-ring transition-shadow">
                <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

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
              {loading ? "Signing in…" : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
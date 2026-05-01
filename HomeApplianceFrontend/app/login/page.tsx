"use client";

import { useState } from "react";
import Link from "next/link";
import { Wrench, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ServeEase</span>
          </Link>
          <p className="text-muted-foreground text-sm mt-2">Sign in to your account</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          <h1 className="text-2xl font-bold text-foreground mb-6">Welcome back</h1>

          <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded" /> Remember me
              </label>
              <button type="button" className="text-sm text-primary font-medium hover:underline">Forgot password?</button>
            </div>

            <Link
              href="/dashboard"
              className="w-full bg-primary text-primary-foreground text-sm font-medium py-3 rounded-xl text-center hover:opacity-90 transition-opacity"
            >
              Login
            </Link>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Register here
              </Link>
            </p>
          </div>

          {/* Demo Roles */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">Quick access (demo)</p>
            <div className="flex gap-2">
              <Link href="/dashboard" className="flex-1 text-center text-xs border border-border rounded-lg py-2 text-muted-foreground hover:bg-muted transition-colors">
                User
              </Link>
              <Link href="/provider/dashboard" className="flex-1 text-center text-xs border border-border rounded-lg py-2 text-muted-foreground hover:bg-muted transition-colors">
                Provider
              </Link>
              <Link href="/admin" className="flex-1 text-center text-xs border border-border rounded-lg py-2 text-muted-foreground hover:bg-muted transition-colors">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench, Mail, Lock, Eye, EyeOff, AlertCircle, Phone, MessageSquare,
} from "lucide-react";
import {
  RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { authApi, getUser } from "@/lib/api";
import { useAuth } from "./auth-context";

declare global {
  interface Window { recaptchaVerifier: RecaptchaVerifier; }
}

type Tab = "email" | "phone";
type PhoneStep = "input" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  // ── Shared ──────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Email login ──────────────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ── Phone login ──────────────────────────────────────────────────────────
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("input");
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  // ── Redirect helper ───────────────────────────────────────────────────────
  const redirectByRole = (role: string) => {
    if (role === "ADMIN") router.push("/admin");
    else if (role === "PROVIDER") router.push("/provider/dashboard");
    else router.push("/dashboard");
  };

  // ── Email login ───────────────────────────────────────────────────────────
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const data = res.data;
      if (!data?.accessToken) throw new Error("Invalid login response");
      const user = { id: data.userId, name: email.split("@")[0], email, role: data.role };
      login(user, data.accessToken, data.refreshToken);
      redirectByRole(data.role);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Phone login: step 1 — send OTP ───────────────────────────────────────
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  };

  const handleSendOtp = async () => {
    setError("");
    if (!phone || phone.length < 10) {
      setError("Enter a valid phone number with country code (e.g. +919876543210)");
      return;
    }
    setLoading(true);
    try {
      setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      confirmationRef.current = result;
      setPhoneStep("otp");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── Phone login: step 2 — verify OTP & call backend ──────────────────────
  const handleVerifyOtp = async () => {
    setError("");
    if (!confirmationRef.current) { setError("Send OTP first"); return; }
    if (otp.length !== 6) { setError("Enter the 6-digit OTP"); return; }
    setLoading(true);
    try {
      const result = await confirmationRef.current.confirm(otp);
      const firebaseToken = await result.user.getIdToken();

      // Exchange Firebase token for app JWT
      const res = await authApi.loginWithPhone(firebaseToken);
      const data = res.data;
      if (!data?.accessToken) throw new Error("Invalid response from server");

      const user = {
        id: data.userId,
        name: phone,
        email: "",
        role: data.role,
      };
      login(user, data.accessToken, data.refreshToken);
      redirectByRole(data.role);
    } catch (err: any) {
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
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

          {/* Tab switcher */}
          <div className="flex rounded-xl border border-border overflow-hidden mb-6">
            <button
              onClick={() => { setTab("email"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                tab === "email"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <Mail className="w-4 h-4" /> Email
            </button>
            <button
              onClick={() => { setTab("phone"); setError(""); setPhoneStep("input"); setOtp(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                tab === "phone"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <Phone className="w-4 h-4" /> Mobile OTP
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* ── Email login form ── */}
          {tab === "email" && (
            <form className="flex flex-col gap-5" onSubmit={handleEmailLogin}>
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
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground text-sm font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>}
                {loading ? "Signing in…" : "Login"}
              </button>
            </form>
          )}

          {/* ── Phone login form ── */}
          {tab === "phone" && (
            <div className="flex flex-col gap-5">
              {phoneStep === "input" ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Mobile Number</label>
                    <div className="flex items-center gap-3 border border-input rounded-xl px-3 py-2.5 bg-background focus-within:ring-2 focus-within:ring-ring transition-shadow">
                      <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                      <input
                        type="tel"
                        placeholder="+919876543210"
                        value={phone}
                        onChange={(e) => {
                          let v = e.target.value;
                          if (!v.startsWith("+")) v = "+" + v.replace(/\D/g, "");
                          setPhone(v);
                        }}
                        className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground tracking-wide"
                        maxLength={14}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Include country code, e.g. +919876543210</p>
                  </div>

                  <button
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground text-sm font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>}
                    {loading ? "Sending OTP…" : "Send OTP"}
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      OTP sent to <span className="font-medium text-foreground">{phone}</span>
                    </p>
                    <button
                      onClick={() => { setPhoneStep("input"); setOtp(""); setError(""); }}
                      className="text-xs text-primary hover:underline mt-1"
                    >
                      Change number
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Enter 6-digit OTP</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="••••••"
                      value={otp}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "");
                        setOtp(v);
                      }}
                      className="w-full border border-input rounded-xl px-4 py-3 text-center text-2xl tracking-[12px] font-mono bg-background outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-primary text-primary-foreground text-sm font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>}
                    {loading ? "Verifying…" : "Verify & Login"}
                  </button>
                </>
              )}
            </div>
          )}

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

      {/* Invisible reCAPTCHA container for Firebase phone auth */}
      <div id="recaptcha-container" />
    </div>
  );
}

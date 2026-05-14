"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench, Mail, Lock, Eye, EyeOff, AlertCircle, Phone, MessageSquare,
  KeyRound, ArrowLeft, CheckCircle2, ShieldCheck,
} from "lucide-react";
import {
  RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { authApi } from "@/lib/api";
import { useAuth } from "./auth-context";

declare global {
  interface Window { recaptchaVerifier: RecaptchaVerifier; }
}

type Tab = "email" | "phone";
type PhoneStep = "input" | "otp";
type ForgotStep = "email" | "otp" | "password" | "done";

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [tab, setTab] = useState<Tab>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("input");
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const redirectByRole = (role: string) => {
    if (role === "ADMIN") router.push("/admin");
    else if (role === "PROVIDER") router.push("/provider/dashboard");
    else router.push("/dashboard");
  };

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

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
    }
  };

  const handleSendOtp = async () => {
    setError("");
    if (!phone || phone.length < 10) { setError("Enter a valid phone number with country code"); return; }
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

  const handleVerifyOtp = async () => {
    setError("");
    if (!confirmationRef.current) { setError("Send OTP first"); return; }
    if (otp.length !== 6) { setError("Enter the 6-digit OTP"); return; }
    setLoading(true);
    try {
      const result = await confirmationRef.current.confirm(otp);
      const firebaseToken = await result.user.getIdToken();
      const res = await authApi.loginWithPhone(firebaseToken);
      const data = res.data;
      if (!data?.accessToken) throw new Error("Invalid response from server");
      const user = { id: data.userId, name: phone, email: "", role: data.role };
      login(user, data.accessToken, data.refreshToken);
      redirectByRole(data.role);
    } catch (err: any) {
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequest = async () => {
    setForgotError("");
    if (!forgotEmail) { setForgotError("Enter your email address"); return; }
    setForgotLoading(true);
    try {
      await authApi.forgotPassword(forgotEmail);
      setForgotStep("otp");
    } catch (err: any) {
      setForgotError(err.message || "Failed to send reset email");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotVerifyOtp = () => {
    setForgotError("");
    if (forgotOtp.length !== 6) { setForgotError("Enter the 6-digit OTP"); return; }
    setForgotStep("password");
  };

  const handleResetPassword = async () => {
    setForgotError("");
    if (newPassword.length < 6) { setForgotError("Password must be at least 6 characters"); return; }
    setForgotLoading(true);
    try {
      await authApi.resetPassword(forgotEmail, forgotOtp, newPassword);
      setForgotStep("done");
    } catch (err: any) {
      setForgotError(err.message || "Failed to reset password");
      if (err.message?.toLowerCase().includes("otp") || err.message?.toLowerCase().includes("invalid")) {
        setForgotStep("otp");
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgot = () => {
    setShowForgot(false);
    setForgotStep("email");
    setForgotEmail("");
    setForgotOtp("");
    setNewPassword("");
    setForgotError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
              <Wrench className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">ApnaAdmi</span>
          </Link>
          <p className="text-muted-foreground text-sm mt-2">Your trusted home services partner</p>
        </div>

        <div className="bg-card/80 backdrop-blur-sm rounded-3xl border border-border/60 shadow-xl shadow-black/5 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to manage your services</p>
          </div>

          <div className="flex rounded-2xl bg-muted p-1 mb-6 gap-1">
            {(["email", "phone"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); setPhoneStep("input"); setOtp(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-all ${
                  tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "email" ? <><Mail className="w-4 h-4" /> Email</> : <><Phone className="w-4 h-4" /> Mobile OTP</>}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {tab === "email" && (
            <form className="flex flex-col gap-4" onSubmit={handleEmailLogin}>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="email">Email address</label>
                <div className="flex items-center gap-3 border border-input rounded-2xl px-4 py-3 bg-background focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input id="email" type="email" placeholder="you@example.com" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                    autoComplete="email" required />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground" htmlFor="password">Password</label>
                  <button type="button" onClick={() => { setShowForgot(true); setForgotEmail(email); }}
                    className="text-xs text-primary hover:underline font-medium">
                    Forgot password?
                  </button>
                </div>
                <div className="flex items-center gap-3 border border-input rounded-2xl px-4 py-3 bg-background focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all">
                  <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                    autoComplete="current-password" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-primary text-primary-foreground text-sm font-semibold py-3 rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-1 shadow-sm shadow-primary/30">
                {loading && <Spinner />}{loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          )}

          {tab === "phone" && (
            <div className="flex flex-col gap-4">
              {phoneStep === "input" ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Mobile Number</label>
                    <div className="flex items-center gap-3 border border-input rounded-2xl px-4 py-3 bg-background focus-within:ring-2 focus-within:ring-ring transition-all">
                      <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                      <input type="tel" placeholder="+919876543210" value={phone}
                        onChange={(e) => {
                          let v = e.target.value;
                          if (!v.startsWith("+")) v = "+" + v.replace(/\D/g, "");
                          setPhone(v);
                        }}
                        className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground tracking-wide" maxLength={14} />
                    </div>
                    <p className="text-xs text-muted-foreground">Include country code, e.g. +919876543210</p>
                  </div>
                  <button onClick={handleSendOtp} disabled={loading}
                    className="w-full bg-primary text-primary-foreground text-sm font-semibold py-3 rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm shadow-primary/30">
                    {loading && <Spinner />}{loading ? "Sending OTP…" : "Send OTP"}
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center py-2">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-7 h-7 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      OTP sent to <span className="font-semibold text-foreground">{phone}</span>
                    </p>
                    <button onClick={() => { setPhoneStep("input"); setOtp(""); setError(""); }}
                      className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1">
                      <ArrowLeft className="w-3 h-3" /> Change number
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Enter 6-digit OTP</label>
                    <input type="text" inputMode="numeric" maxLength={6} placeholder="••••••"
                      value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-full border border-input rounded-2xl px-4 py-3 text-center text-2xl tracking-[12px] font-mono bg-background outline-none focus:ring-2 focus:ring-ring transition-all" />
                  </div>
                  <button onClick={handleVerifyOtp} disabled={loading || otp.length !== 6}
                    className="w-full bg-primary text-primary-foreground text-sm font-semibold py-3 rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm shadow-primary/30">
                    {loading && <Spinner />}{loading ? "Verifying…" : "Verify & Sign In"}
                  </button>
                </>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">Create account</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> Secured with 256-bit encryption
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl border border-border shadow-2xl w-full max-w-sm p-7 relative">
            {forgotStep !== "done" && (
              <button onClick={closeForgot}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-xl hover:bg-muted text-lg leading-none">
                ✕
              </button>
            )}

            {forgotStep === "email" && (
              <>
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <KeyRound className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-1">Forgot password?</h2>
                <p className="text-sm text-muted-foreground mb-5">Enter your registered email and we&apos;ll send a reset OTP.</p>
                {forgotError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-4">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {forgotError}
                  </div>
                )}
                <div className="flex flex-col gap-1.5 mb-5">
                  <label className="text-sm font-medium text-foreground">Email address</label>
                  <div className="flex items-center gap-3 border border-input rounded-2xl px-4 py-3 bg-background focus-within:ring-2 focus-within:ring-ring transition-all">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input type="email" placeholder="you@example.com" value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                      onKeyDown={(e) => e.key === "Enter" && handleForgotRequest()}
                      autoFocus />
                  </div>
                </div>
                <button onClick={handleForgotRequest} disabled={forgotLoading || !forgotEmail}
                  className="w-full bg-primary text-primary-foreground text-sm font-semibold py-3 rounded-2xl hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {forgotLoading && <Spinner />}{forgotLoading ? "Sending…" : "Send Reset OTP"}
                </button>
              </>
            )}

            {forgotStep === "otp" && (
              <>
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-1">Check your email</h2>
                <p className="text-sm text-muted-foreground mb-5">
                  We sent a 6-digit OTP to <span className="font-semibold text-foreground">{forgotEmail}</span>
                </p>
                {forgotError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-4">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {forgotError}
                  </div>
                )}
                <div className="flex flex-col gap-1.5 mb-5">
                  <label className="text-sm font-medium text-foreground">6-digit OTP</label>
                  <input type="text" inputMode="numeric" maxLength={6} placeholder="••••••"
                    value={forgotOtp} onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full border border-input rounded-2xl px-4 py-3 text-center text-2xl tracking-[10px] font-mono bg-background outline-none focus:ring-2 focus:ring-ring transition-all"
                    autoFocus />
                </div>
                <button onClick={handleForgotVerifyOtp} disabled={forgotOtp.length !== 6}
                  className="w-full bg-primary text-primary-foreground text-sm font-semibold py-3 rounded-2xl hover:opacity-90 transition-all disabled:opacity-60 mb-2">
                  Continue
                </button>
                <button onClick={() => { setForgotStep("email"); setForgotOtp(""); setForgotError(""); }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground py-2 flex items-center justify-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </>
            )}

            {forgotStep === "password" && (
              <>
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-1">Set new password</h2>
                <p className="text-sm text-muted-foreground mb-5">Choose a strong password with at least 6 characters.</p>
                {forgotError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-4">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {forgotError}
                  </div>
                )}
                <div className="flex flex-col gap-1.5 mb-5">
                  <label className="text-sm font-medium text-foreground">New Password</label>
                  <div className="flex items-center gap-3 border border-input rounded-2xl px-4 py-3 bg-background focus-within:ring-2 focus-within:ring-ring transition-all">
                    <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input type={showNewPassword ? "text" : "password"} placeholder="Min. 6 characters"
                      value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                      onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                      autoFocus />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-muted-foreground hover:text-foreground transition-colors">
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button onClick={handleResetPassword} disabled={forgotLoading || newPassword.length < 6}
                  className="w-full bg-primary text-primary-foreground text-sm font-semibold py-3 rounded-2xl hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {forgotLoading && <Spinner />}{forgotLoading ? "Resetting…" : "Reset Password"}
                </button>
              </>
            )}

            {forgotStep === "done" && (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Password reset!</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Your password has been updated. You can now sign in with your new password.
                </p>
                <button onClick={closeForgot}
                  className="w-full bg-primary text-primary-foreground text-sm font-semibold py-3 rounded-2xl hover:opacity-90 transition-all">
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div id="recaptcha-container" />
    </div>
  );
}
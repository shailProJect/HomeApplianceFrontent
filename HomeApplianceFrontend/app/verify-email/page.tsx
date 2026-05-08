"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Mail,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Timer,
} from "lucide-react";

import { authApi } from "@/lib/api";

export default function VerifyEmailPage() {

  const router = useRouter();

  const params = useSearchParams();

  const email = params.get("email") || "";

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);

  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // 10 MINUTES
  const [timeLeft, setTimeLeft] = useState(600);

  // RESEND COOLDOWN
  const [resendCooldown, setResendCooldown] =
    useState(0);

  // ─────────────────────────────────────────────
  // TIMER
  // ─────────────────────────────────────────────
  useEffect(() => {

    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);

  }, [timeLeft]);

  // ─────────────────────────────────────────────
  // RESEND TIMER
  // ─────────────────────────────────────────────
  useEffect(() => {

    if (resendCooldown <= 0) return;

    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);

  }, [resendCooldown]);

  // ─────────────────────────────────────────────
  // FORMAT TIMER
  // ─────────────────────────────────────────────
  const formatTime = (seconds: number) => {

    const mins = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${mins}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // ─────────────────────────────────────────────
  // VERIFY OTP
  // ─────────────────────────────────────────────
  const verify = async () => {

    if (!otp) {
      setError("Please enter OTP");
      return;
    }

    if (timeLeft <= 0) {
      setError("OTP expired. Please resend.");
      return;
    }

    try {

      setLoading(true);

      setError("");

      const res = await authApi.verifyEmail(
        email,
        otp
      );

      setSuccess(
        res.message || "Email verified"
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);

    } catch (err: unknown) {

      setError(
        err instanceof Error
          ? err.message
          : "Verification failed"
      );

    } finally {

      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // RESEND OTP
  // ─────────────────────────────────────────────
  const resendOtp = async () => {

    try {

      setResending(true);

      setError("");

      setSuccess("");

      // CREATE THIS API
      await authApi.resendOtp(email);

      setSuccess(
        "New OTP sent successfully"
      );

      // RESET TIMER
      setTimeLeft(600);

      // 30s cooldown
      setResendCooldown(30);

    } catch (err: unknown) {

      setError(
        err instanceof Error
          ? err.message
          : "Failed to resend OTP"
      );

    } finally {

      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">

      <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-sm p-8">

        {/* HEADER */}
        <div className="flex flex-col items-center text-center">

          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <Mail className="w-8 h-8 text-primary" />
          </div>

          <h1 className="text-3xl font-bold">
            Verify your email
          </h1>

          <p className="text-sm text-muted-foreground mt-3">
            We sent a verification code to
          </p>

          <p className="text-sm font-semibold mt-1 break-all">
            {email}
          </p>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-6 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mt-6 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            {success}
          </div>
        )}

        {/* OTP INPUT */}
        <div className="mt-7">

          <label className="text-sm font-medium">
            Enter OTP
          </label>

          <input
            type="text"
            value={otp}
            maxLength={6}
            onChange={(e) => {
              const value = e.target.value
                .replace(/\D/g, "");

              setOtp(value);
            }}
            placeholder="6-digit OTP"
            className="
              mt-2
              w-full
              border
              border-input
              rounded-2xl
              px-4
              py-4
              outline-none
              bg-background
              text-center
              text-2xl
              tracking-[10px]
              font-semibold
            "
          />

        </div>

        {/* TIMER */}
        <div className="mt-5 flex items-center justify-center gap-2 text-sm">

          <Timer className="w-4 h-4 text-muted-foreground" />

          {timeLeft > 0 ? (
            <span className="text-muted-foreground">
              OTP expires in{" "}
              <span className="font-semibold text-foreground">
                {formatTime(timeLeft)}
              </span>
            </span>
          ) : (
            <span className="text-red-600 font-medium">
              OTP expired
            </span>
          )}

        </div>

        {/* VERIFY BUTTON */}
        <button
          onClick={verify}
          disabled={
            loading ||
            otp.length !== 6 ||
            timeLeft <= 0
          }
          className="
            w-full
            mt-7
            bg-primary
            text-primary-foreground
            py-4
            rounded-2xl
            font-semibold
            hover:opacity-90
            transition-opacity
            disabled:opacity-60
          "
        >
          {loading
            ? "Verifying..."
            : "Verify Email"}
        </button>

        {/* RESEND */}
        <div className="mt-6 text-center">

          <button
            onClick={resendOtp}
            disabled={
              resending ||
              resendCooldown > 0
            }
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-medium
              text-primary
              hover:underline
              disabled:opacity-50
            "
          >

            <RefreshCw className="w-4 h-4" />

            {resending
              ? "Sending..."
              : resendCooldown > 0
              ? `Resend OTP in ${resendCooldown}s`
              : "Resend OTP"}

          </button>

        </div>

        {/* LOGIN */}
        <div className="mt-8 text-center">

          <Link
            href="/login"
            className="
              text-sm
              text-muted-foreground
              hover:text-primary
              transition-colors
            "
          >
            Back to login
          </Link>

        </div>

      </div>
    </div>
  );
}
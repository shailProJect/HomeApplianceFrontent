"use client";

import { useState } from "react";

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

import { motion } from "framer-motion";

import toast from "react-hot-toast";
import { userApi } from "@/lib/api";

interface Props {
  onSuccess?: () => void;
  defaultPhone?: string;
}

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

export default function PhoneVerificationModal({
  onSuccess,
  defaultPhone = "",
}: Props) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);

  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );
    }
  };

  const sendOtp = async () => {
    try {
      setLoading(true);

      setupRecaptcha();

      const result = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier
      );

      setConfirmationResult(result);

      toast.success("OTP Sent Successfully");
    } catch (error: any) {
      console.error(error);

      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

 const verifyOtp = async () => {
  try {

    if (!confirmationResult) {
      toast.error("Send OTP first");
      return;
    }

    setLoading(true);

    const result =
      await confirmationResult.confirm(otp);

    const firebaseToken =
      await result.user.getIdToken();

    await userApi.verifyFirebasePhone(
      firebaseToken
    );

    toast.success("Phone Verified");
    
    onSuccess?.();

  } catch (error: any) {

    console.error(error);

    toast.error(
      error?.message || "Invalid OTP"
    );

  } finally {

    setLoading(false);
  }
};

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-8 space-y-6">

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold">
          Verify Phone
        </h2>

        <p className="text-gray-500 mt-2">
          Enter your mobile number
        </p>
      </motion.div>

      <input
        type="tel"
        maxLength={13}
        placeholder="+919876543210"
       value={phone}
        onChange={(e) => {

        let value = e.target.value;

        if (!value.startsWith("+91")) {

            value =
            "+91" +
            value.replace(/\D/g, "");

        }

        setPhone(value);
        }}
        className="w-full border rounded-2xl p-4"
      />

      <button
        onClick={sendOtp}
        disabled={loading}
        className="w-full bg-black text-white rounded-2xl p-4"
      >
        {loading ? "Sending..." : "Send OTP"}
      </button>

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => {

            const value = e.target.value;

            setOtp(value);

            if (value.length === 6) {
                verifyOtp();
            }
            }}
        className="w-full border rounded-2xl p-4 text-center tracking-[10px] text-2xl"
      />

      <button
        onClick={verifyOtp}
        disabled={loading}
        className="w-full bg-green-600 text-white rounded-2xl p-4"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      <div id="recaptcha-container"></div>
    </div>
  );
}
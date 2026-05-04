export const dynamic = "force-dynamic";
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { userApi, ProviderServiceResponse } from "@/lib/api";
import { CheckCircle, ChevronRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Service", "Date & Time", "Address", "Confirm"];

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const providerId = searchParams.get("providerId");
  const category = searchParams.get("category") || "ELECTRICIAN";

  const [step, setStep] = useState(0);
  const [services, setServices] = useState<ProviderServiceResponse[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedService, setSelectedService] = useState<ProviderServiceResponse | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    userApi.searchByCategory(category)
      .then((res) => {
        const filtered = providerId
          ? res.data.filter((s) => s.providerId === providerId)
          : res.data;
        setServices(filtered);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingServices(false));
  }, [category, providerId]);

  const canAdvance = () => {
    if (step === 0) return !!selectedService;
    if (step === 1) return !!date && !!time;
    if (step === 2) return !!address.trim();
    return true;
  };

  const handleConfirm = async () => {
    if (!selectedService) return;
    setConfirming(true);
    setError("");
    try {
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
      await userApi.createBooking({
        providerServiceId: selectedService.id,
        scheduledAt,
        address,
        notes: notes || undefined,
      });
      setConfirmed(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Booking failed. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-10">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
              Your appointment has been submitted. The provider will confirm shortly.
            </p>
            <div className="bg-muted rounded-xl p-5 text-sm flex flex-col gap-3 text-left mb-8">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium text-foreground">{selectedService?.description || selectedService?.categoryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Time</span>
                <span className="font-medium text-foreground">{date} at {time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address</span>
                <span className="font-medium text-foreground max-w-40 text-right">{address}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold text-foreground">₹{selectedService?.price}</span>
              </div>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="block w-full bg-primary text-primary-foreground text-sm font-medium py-3 rounded-xl text-center hover:opacity-90 transition-opacity"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Stepper */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                  i < step ? "bg-green-500 text-white" : i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn("text-xs font-medium hidden sm:block", i === step ? "text-primary" : "text-muted-foreground")}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("flex-1 h-0.5 mx-2", i < step ? "bg-green-500" : "bg-border")} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          {/* Step 0: Select Service */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Select a Service</h2>
              <p className="text-sm text-muted-foreground mb-6">Category: {category.replace(/_/g, " ")}</p>
              {loadingServices ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
                </div>
              ) : services.length === 0 ? (
                <p className="text-muted-foreground text-sm">No services found for this category.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {services.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedService(s)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors",
                        selectedService?.id === s.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                      )}
                    >
                      <div>
                        <p className="font-medium text-foreground text-sm">{s.description || s.categoryName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.providerName} · {s.durationMinutes} min</p>
                      </div>
                      <p className="font-bold text-foreground">₹{s.price}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 1: Date & Time */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-6">Choose Date & Time</h2>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Date</label>
                  <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-6">Service Address</h2>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Full Address *</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Flat No., Street, Area, City, PIN"
                    rows={3}
                    className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Notes (optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions"
                    className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-6">Confirm Booking</h2>
              <div className="bg-muted rounded-xl p-5 text-sm flex flex-col gap-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium text-foreground">{selectedService?.description || selectedService?.categoryName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="font-medium text-foreground">{selectedService?.providerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Time</span>
                  <span className="font-medium text-foreground">{date} at {time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address</span>
                  <span className="font-medium text-foreground max-w-48 text-right">{address}</span>
                </div>
                {notes && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Notes</span>
                    <span className="font-medium text-foreground">{notes}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground font-semibold">Total</span>
                  <span className="font-bold text-foreground text-base">₹{selectedService?.price}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 border border-border text-foreground text-sm font-medium py-3 rounded-xl hover:bg-muted transition-colors"
              >
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance()}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="flex-1 bg-primary text-primary-foreground text-sm font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {confirming && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                {confirming ? "Confirming…" : "Confirm Booking"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
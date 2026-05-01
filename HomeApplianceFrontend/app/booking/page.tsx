"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { providers, electricianServices, plumberServices, timeSlots } from "@/lib/mock-data";
import { CheckCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Provider", "Service", "Date", "Time", "Confirm"];

export default function BookingPage() {
  const [step, setStep] = useState(0);
  const [selectedProvider] = useState(providers[0]);
  const [selectedService, setSelectedService] = useState<typeof electricianServices[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const services = selectedProvider.category === "Electrician" ? electricianServices : plumberServices;

  const canAdvance = () => {
    if (step === 0) return true;
    if (step === 1) return !!selectedService;
    if (step === 2) return !!selectedDate;
    if (step === 3) return !!selectedTime;
    return true;
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
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">Your appointment has been booked successfully.</p>
            <div className="bg-muted rounded-xl p-5 text-sm flex flex-col gap-3 text-left mb-8">
              <div className="flex justify-between"><span className="text-muted-foreground">Provider</span><span className="font-medium text-foreground">{selectedProvider.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="font-medium text-foreground">{selectedService?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium text-foreground">{selectedDate}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-medium text-foreground">{selectedTime}</span></div>
              <div className="flex justify-between border-t border-border pt-3"><span className="text-muted-foreground">Total</span><span className="font-bold text-foreground">₹{selectedService?.price}</span></div>
            </div>
            <Link href="/dashboard" className="block w-full bg-primary text-primary-foreground text-sm font-medium py-3 rounded-xl text-center hover:opacity-90 transition-opacity">
              Go to Dashboard
            </Link>
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

        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          {/* Step 0: Provider */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-6">Select Provider</h2>
              <div className="flex flex-col gap-3">
                {providers.map((p) => (
                  <div
                    key={p.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors",
                      selectedProvider.id === p.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                      {p.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.category} · {p.rating} ★ · {p.distance}</p>
                    </div>
                    <span className="text-sm font-bold text-foreground">₹{p.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Service */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-6">Select Service</h2>
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
                      <p className="font-medium text-foreground text-sm">{s.name}</p>
                      <p className="text-xs text-muted-foreground">Duration: {s.duration}</p>
                    </div>
                    <span className="font-bold text-foreground">₹{s.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-6">Select Date</h2>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border border-input rounded-xl px-4 py-3 text-sm text-foreground bg-background outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          {/* Step 3: Time */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-6">Select Time</h2>
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    className={cn(
                      "py-3 rounded-xl border-2 text-sm font-medium transition-colors",
                      selectedTime === t ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted text-foreground"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-6">Confirm Booking</h2>
              <div className="bg-muted rounded-xl p-5 text-sm flex flex-col gap-3">
                <div className="flex justify-between"><span className="text-muted-foreground">Provider</span><span className="font-medium text-foreground">{selectedProvider.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span className="font-medium text-foreground">{selectedProvider.category}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="font-medium text-foreground">{selectedService?.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium text-foreground">{selectedDate}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-medium text-foreground">{selectedTime}</span></div>
                <div className="flex justify-between border-t border-border pt-3"><span className="text-muted-foreground font-semibold">Total</span><span className="font-bold text-lg text-foreground">₹{selectedService?.price}</span></div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 border border-border text-foreground text-sm font-medium py-3 rounded-xl hover:bg-muted transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={() => step < 4 ? setStep(step + 1) : setConfirmed(true)}
              disabled={!canAdvance()}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 text-sm font-medium py-3 rounded-xl transition-opacity",
                canAdvance() ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {step === 4 ? "Confirm Booking" : "Continue"} {step < 4 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

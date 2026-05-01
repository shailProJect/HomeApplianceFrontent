"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { timeSlots } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function AvailabilityPage() {
  const [activeDays, setActiveDays] = useState(new Set(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]));
  const [activeSlots, setActiveSlots] = useState(new Set(["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"]));

  const toggleDay = (day: string) => {
    setActiveDays((prev) => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });
  };

  const toggleSlot = (slot: string) => {
    setActiveSlots((prev) => {
      const next = new Set(prev);
      next.has(slot) ? next.delete(slot) : next.add(slot);
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="provider" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Availability</h1>
          <p className="text-muted-foreground mt-1">Set your working days and available time slots.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Working Days */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h2 className="font-semibold text-foreground mb-5">Working Days</h2>
            <div className="flex flex-wrap gap-3">
              {DAYS.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium border-2 transition-colors",
                    activeDays.has(day)
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h2 className="font-semibold text-foreground mb-5">Time Slots</h2>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => toggleSlot(slot)}
                  className={cn(
                    "py-2.5 rounded-xl text-xs font-medium border-2 transition-colors",
                    activeSlots.has(slot)
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button className="bg-primary text-primary-foreground text-sm font-medium px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
            Save Availability
          </button>
        </div>
      </main>
    </div>
  );
}

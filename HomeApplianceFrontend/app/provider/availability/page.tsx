"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { providerApi } from "@/lib/api";
import { Plus, CheckCircle, AlertCircle } from "lucide-react";

interface Slot {
  dayOfWeek: string;
  availableDate: string;
  startTime: string;
  endTime: string;
}

export default function ProviderAvailabilityPage() {
  const [slots, setSlots] = useState<Slot[]>([]);

  const [form, setForm] = useState<Slot>({
    dayOfWeek: "",
    availableDate: "",
    startTime: "09:00",
    endTime: "17:00",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedDate = e.target.value;

    const days = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];

    const dayOfWeek =
      days[new Date(selectedDate).getDay()];

    setForm({
      ...form,
      availableDate: selectedDate,
      dayOfWeek,
    });
  };

  const addSlot = async () => {
    if (!form.availableDate) {
      setError("Date is required");
      return;
    }

    if (!form.startTime || !form.endTime) {
      setError("Start time and end time are required");
      return;
    }

    if (form.startTime >= form.endTime) {
      setError("End time must be after start time");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await providerApi.addAvailability(form);

      setSlots((prev) => [...prev, form]);

      setSuccess(true);

      setForm({
        dayOfWeek: "",
        availableDate: "",
        startTime: "09:00",
        endTime: "17:00",
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      const validationErrors =
        e?.response?.data?.validationErrors;

      if (validationErrors) {
        const firstError =
          Object.values(validationErrors)[0];

        setError(String(firstError));
      } else {
        setError(
          e?.response?.data?.message ||
            "Failed to save availability"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="provider" />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Availability
          </h1>

          <p className="text-muted-foreground mt-1">
            Set your working hours for each day.
          </p>
        </div>

        <div className="max-w-xl flex flex-col gap-6">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h2 className="font-semibold text-foreground mb-5">
              Add Availability Slot
            </h2>

            {success && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
                <CheckCircle className="w-4 h-4" />
                Availability saved!
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex flex-col gap-4">
              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  Date
                </label>

                <input
                  type="date"
                  value={form.availableDate}
                  onChange={handleDateChange}
                  className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                />

                {form.dayOfWeek && (
                  <p className="text-sm text-muted-foreground">
                    Selected Day:{" "}
                    {form.dayOfWeek.charAt(0) +
                      form.dayOfWeek
                        .slice(1)
                        .toLowerCase()}
                  </p>
                )}
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Start Time
                  </label>

                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        startTime: e.target.value,
                      })
                    }
                    className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">
                    End Time
                  </label>

                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        endTime: e.target.value,
                      })
                    }
                    className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Button */}
              <button
                onClick={addSlot}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 mt-2"
              >
                <Plus className="w-4 h-4" />

                {loading ? "Saving..." : "Add Slot"}
              </button>
            </div>
          </div>

          {/* Saved Slots */}
          {slots.length > 0 && (
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
              <h2 className="font-semibold text-foreground mb-4">
                Saved Slots (this session)
              </h2>

              <div className="flex flex-col gap-3">
                {slots.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-muted rounded-xl px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {s.dayOfWeek.charAt(0) +
                          s.dayOfWeek
                            .slice(1)
                            .toLowerCase()}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {s.availableDate}
                      </p>
                    </div>

                    <span className="text-sm text-muted-foreground">
                      {s.startTime} - {s.endTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
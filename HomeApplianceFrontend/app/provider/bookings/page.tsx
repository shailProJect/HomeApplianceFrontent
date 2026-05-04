"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import { providerApi, BookingResponse } from "@/lib/api";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REJECTED: "bg-red-100 text-red-700",
};

function formatDt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    providerApi.getMyBookings()
      .then((res) => setBookings(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: "CONFIRMED" | "REJECTED" | "COMPLETED") => {
    setActionLoading(id + status);
    try {
      const res = await providerApi.updateBookingStatus(id, status);
      setBookings((prev) => prev.map((b) => b.id === id ? res.data : b));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  const tabs = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "REJECTED"];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="provider" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground mt-1">All customer bookings for your services.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors",
                filter === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {t} {t !== "ALL" && bookings.filter((b) => b.status === t).length > 0 && (
                <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full">
                  {bookings.filter((b) => b.status === t).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 flex flex-col gap-3">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Customer</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Service</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Scheduled</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Address</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{b.userId.slice(0, 8)}…</td>
                      <td className="px-6 py-4 text-foreground">{b.serviceName}</td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{formatDt(b.scheduledAt)}</td>
                      <td className="px-6 py-4 text-muted-foreground max-w-32 truncate">{b.address}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">₹{b.totalAmount}</td>
                      <td className="px-6 py-4">
                        <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium capitalize", statusColors[b.status])}>
                          {b.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {b.status === "PENDING" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateStatus(b.id, "CONFIRMED")}
                              disabled={actionLoading !== null}
                              className="text-xs text-green-600 border border-green-300 bg-green-50 px-3 py-1 rounded-lg hover:bg-green-100 transition-colors font-medium disabled:opacity-60"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => updateStatus(b.id, "REJECTED")}
                              disabled={actionLoading !== null}
                              className="text-xs text-red-600 border border-red-300 bg-red-50 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors font-medium disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {b.status === "CONFIRMED" && (
                          <button
                            onClick={() => updateStatus(b.id, "COMPLETED")}
                            disabled={actionLoading !== null}
                            className="text-xs text-blue-600 border border-blue-300 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors font-medium disabled:opacity-60"
                          >
                            Mark Done
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground text-sm">
                        No bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
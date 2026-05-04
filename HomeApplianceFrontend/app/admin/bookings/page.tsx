"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import { adminApi, BookingResponse } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REJECTED: "bg-red-100 text-red-700",
};

function formatDt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  const fetchBookings = () => {
    setLoading(true);
    setError("");
    adminApi
      .getAllBookings()
      .then((res) => setBookings(res.data))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load bookings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const TABS = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED"];

  const filtered = filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  const totalRevenue = bookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="admin" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">All Bookings</h1>
            <p className="text-muted-foreground mt-1">Platform-wide booking records.</p>
          </div>
          <div className="flex items-center gap-3">
            {!loading && (
              <div className="text-sm text-muted-foreground bg-card border border-border rounded-xl px-4 py-2">
                Revenue: <span className="font-bold text-foreground">₹{totalRevenue.toLocaleString()}</span>
              </div>
            )}
            <button
              onClick={fetchBookings}
              className="flex items-center gap-2 text-sm border border-border px-4 py-2 rounded-xl hover:bg-muted transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map((t) => (
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
              {t}
              {t !== "ALL" && bookings.filter((b) => b.status === t).length > 0 && (
                <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded-full">
                  {bookings.filter((b) => b.status === t).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading bookings…</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Booking ID</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Provider</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Service</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Scheduled</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Address</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {b.id.slice(0, 8)}…
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">{b.providerName}</td>
                      <td className="px-6 py-4 text-foreground">{b.serviceName}</td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{formatDt(b.scheduledAt)}</td>
                      <td className="px-6 py-4 text-muted-foreground max-w-32 truncate">{b.address}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">₹{b.totalAmount}</td>
                      <td className="px-6 py-4">
                        <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium capitalize", statusColors[b.status])}>
                          {b.status.toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground text-sm">
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

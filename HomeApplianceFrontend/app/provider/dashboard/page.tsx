"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { providerApi, BookingResponse } from "@/lib/api";
import { CalendarCheck, Star, Clock, ChevronRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REJECTED: "bg-red-100 text-red-700",
};

function formatDt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    providerApi.getMyBookings()
      .then((res) => setBookings(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id: string, status: "CONFIRMED" | "REJECTED" | "COMPLETED") => {
    setActionLoading(id + status);
    try {
      const res = await providerApi.updateBookingStatus(id, status);
      setBookings((prev) => prev.map((b) => b.id === id ? res.data : b));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const pending = bookings.filter((b) => b.status === "PENDING");
  const confirmed = bookings.filter((b) => b.status === "CONFIRMED");
  const completed = bookings.filter((b) => b.status === "COMPLETED");
  const totalRevenue = completed.reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="provider" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Provider Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your bookings and services.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{loading ? "—" : pending.length}</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{loading ? "—" : confirmed.length}</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{loading ? "—" : completed.length}</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">₹</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Revenue</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{loading ? "—" : `₹${totalRevenue.toLocaleString()}`}</p>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-card rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">Recent Bookings</h2>
            <Link href="/provider/bookings" className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="p-6 flex flex-col gap-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Customer</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Service</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Scheduled</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.slice(0, 10).map((b) => (
                    <tr key={b.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{b.userId.slice(0, 8)}…</td>
                      <td className="px-6 py-4 text-foreground">{b.serviceName}</td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDt(b.scheduledAt)}</td>
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
                              disabled={actionLoading === b.id + "CONFIRMED"}
                              className="text-xs text-green-600 border border-green-300 bg-green-50 px-3 py-1 rounded-lg hover:bg-green-100 transition-colors font-medium disabled:opacity-60"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => updateStatus(b.id, "REJECTED")}
                              disabled={actionLoading === b.id + "REJECTED"}
                              className="text-xs text-red-600 border border-red-300 bg-red-50 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors font-medium disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {b.status === "CONFIRMED" && (
                          <button
                            onClick={() => updateStatus(b.id, "COMPLETED")}
                            disabled={actionLoading === b.id + "COMPLETED"}
                            className="text-xs text-blue-600 border border-blue-300 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors font-medium disabled:opacity-60"
                          >
                            Mark Done
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground text-sm">
                        No bookings yet.
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
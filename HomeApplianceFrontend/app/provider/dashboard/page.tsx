"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { providerApi, BookingResponse, ProviderResponse } from "@/lib/api";
import {
  CalendarCheck, Star, Clock, ChevronRight, AlertCircle,
  ToggleLeft, ToggleRight, Loader2, TrendingUp, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REJECTED: "bg-red-100 text-red-700",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [profile, setProfile] = useState<ProviderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [togglingActive, setTogglingActive] = useState(false);
  const [activeMsg, setActiveMsg] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, pRes] = await Promise.all([providerApi.getMyBookings(), providerApi.getProfile()]);
      setBookings(bRes.data);
      setProfile(pRes.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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

  const handleToggleActive = async () => {
    if (!profile) return;
    setTogglingActive(true);
    try {
      const res = await providerApi.toggleActive(!profile.active);
      setProfile(res.data);
      setActiveMsg(res.data.active ? "You are now visible to customers!" : "You are now offline. Customers won't see you.");
      setTimeout(() => setActiveMsg(""), 4000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Toggle failed");
    } finally {
      setTogglingActive(false);
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

        {/* Header + Active Toggle */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {profile ? `Welcome back, ${profile.name.split(" ")[0]} 👋` : "Provider Dashboard"}
            </h1>
            <p className="text-muted-foreground mt-1">Manage your bookings, status, and services.</p>
          </div>

          {/* Active / Inactive Toggle Card */}
          <div className={cn(
            "flex items-center gap-4 rounded-2xl border px-5 py-3 shadow-sm transition-colors",
            profile?.active
              ? "bg-green-50 border-green-200"
              : "bg-gray-50 border-gray-200"
          )}>
            <div>
              <p className={cn("text-sm font-semibold", profile?.active ? "text-green-700" : "text-gray-500")}>
                {profile?.active ? "🟢 Online" : "⚫ Offline"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {profile?.active ? "Visible to customers" : "Hidden from searches"}
              </p>
            </div>
            <button
              onClick={handleToggleActive}
              disabled={togglingActive || loading}
              className={cn(
                "flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
                profile?.active
                  ? "border-gray-300 text-gray-600 hover:bg-gray-100 bg-white"
                  : "border-green-400 text-green-700 hover:bg-green-100 bg-green-50"
              )}
            >
              {togglingActive ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : profile?.active ? (
                <ToggleRight className="w-5 h-5 text-green-600" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-gray-400" />
              )}
              {togglingActive ? "Updating…" : profile?.active ? "Go Offline" : "Go Online"}
            </button>
          </div>
        </div>

        {/* Active message flash */}
        {activeMsg && (
          <div className={cn(
            "flex items-center gap-2 text-sm rounded-xl px-4 py-3 mb-5 border",
            activeMsg.includes("visible") ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-600"
          )}>
            <Zap className="w-4 h-4 shrink-0" /> {activeMsg}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Verification warning */}
        {profile && !profile.verified && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6 text-sm text-amber-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-semibold">Account not verified.</span> Upload your documents so admin can verify your account.{" "}
              <Link href="/provider/documents" className="underline font-medium">Upload now →</Link>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Pending", value: pending.length, icon: Clock, color: "yellow" },
            { label: "Confirmed", value: confirmed.length, icon: CalendarCheck, color: "blue" },
            { label: "Completed", value: completed.length, icon: Star, color: "green" },
            { label: "Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "purple" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${color}-600`} />
                </div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{loading ? "—" : value}</p>
            </div>
          ))}
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
                    {["Customer", "Service", "Scheduled", "Amount", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left px-6 py-4 font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.slice(0, 10).map((b) => (
                    <tr key={b.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{b.userId.slice(0, 8)}…</td>
                      <td className="px-6 py-4 text-foreground">{b.serviceName}</td>
                      <td className="px-6 py-4 text-muted-foreground">{fmt(b.scheduledAt)}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">₹{b.totalAmount}</td>
                      <td className="px-6 py-4">
                        <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium capitalize", statusColors[b.status])}>
                          {b.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {b.status === "PENDING" && (
                          <div className="flex gap-2">
                            <button onClick={() => updateStatus(b.id, "CONFIRMED")} disabled={actionLoading === b.id + "CONFIRMED"}
                              className="text-xs text-green-600 border border-green-300 bg-green-50 px-3 py-1 rounded-lg hover:bg-green-100 font-medium disabled:opacity-60">
                              Accept
                            </button>
                            <button onClick={() => updateStatus(b.id, "REJECTED")} disabled={actionLoading === b.id + "REJECTED"}
                              className="text-xs text-red-600 border border-red-300 bg-red-50 px-3 py-1 rounded-lg hover:bg-red-100 font-medium disabled:opacity-60">
                              Reject
                            </button>
                          </div>
                        )}
                        {b.status === "CONFIRMED" && (
                          <button onClick={() => updateStatus(b.id, "COMPLETED")} disabled={actionLoading === b.id + "COMPLETED"}
                            className="text-xs text-blue-600 border border-blue-300 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 font-medium disabled:opacity-60">
                            Mark Done
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground text-sm">
                        No bookings yet. Make sure your account is active and verified.
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

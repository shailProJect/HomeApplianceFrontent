"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { adminApi, ProviderResponse, BookingResponse, UserResponse } from "@/lib/api";
import { Users, Briefcase, CalendarCheck, TrendingUp, CheckCircle, XCircle, ChevronRight, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const [providers, setProviders] = useState<ProviderResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      adminApi.getAllProviders(),
      adminApi.getAllUsers(),
      adminApi.getAllBookings(),
    ])
      .then(([p, u, b]) => {
        setProviders(p.data);
        setUsers(u.data);
        setBookings(b.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const approveProvider = async (id: string) => {
    setApproving(id);
    try {
      const res = await adminApi.approveProvider(id);
      setProviders((prev) => prev.map((p) => p.id === id ? res.data : p));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Approval failed");
    } finally {
      setApproving(null);
    }
  };

  const pendingProviders = providers.filter((p) => !p.verified);
  const totalRevenue = bookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const stats = [
    { label: "Total Users", value: loading ? "—" : users.length.toLocaleString(), icon: Users, color: "bg-blue-100 text-blue-600" },
    { label: "Total Providers", value: loading ? "—" : providers.length.toLocaleString(), icon: Briefcase, color: "bg-purple-100 text-purple-600" },
    { label: "Active Bookings", value: loading ? "—" : bookings.filter((b) => b.status === "CONFIRMED" || b.status === "PENDING").length.toLocaleString(), icon: CalendarCheck, color: "bg-green-100 text-green-600" },
    { label: "Total Revenue", value: loading ? "—" : `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "bg-yellow-100 text-yellow-600" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="admin" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform overview and management.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-card rounded-2xl border border-border p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {loading ? <span className="text-muted-foreground">—</span> : s.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Pending Provider Verifications */}
        <div className="bg-card rounded-2xl border border-border shadow-sm mb-6">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h2 className="font-semibold text-foreground">Pending Provider Verifications</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Review and approve new service providers</p>
            </div>
            <Link href="/admin/providers" className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="p-6 flex flex-col gap-3">
              {[1, 2].map((i) => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
            </div>
          ) : pendingProviders.length === 0 ? (
            <p className="text-muted-foreground text-sm p-6">No pending verifications.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Provider Name</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Email</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Service Area</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pendingProviders.slice(0, 5).map((p) => (
                    <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{p.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{p.email}</td>
                      <td className="px-6 py-4 text-muted-foreground">{p.serviceArea || "—"}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveProvider(p.id)}
                            disabled={approving === p.id}
                            className="flex items-center gap-1.5 text-xs text-green-700 bg-green-100 border border-green-300 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors font-medium disabled:opacity-60"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button className="flex items-center gap-1.5 text-xs text-red-700 bg-red-100 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors font-medium">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Bookings Preview */}
        <div className="bg-card rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="p-6 flex flex-col gap-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Service</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Provider</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.slice(0, 5).map((b) => (
                    <tr key={b.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{b.serviceName}</td>
                      <td className="px-6 py-4 text-muted-foreground">{b.providerName}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">₹{b.totalAmount}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-muted text-muted-foreground capitalize">
                          {b.status.toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground text-sm">No bookings yet.</td>
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
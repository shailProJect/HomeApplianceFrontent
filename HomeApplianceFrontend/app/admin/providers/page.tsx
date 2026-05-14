"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { adminApi, ProviderResponse } from "@/lib/api";
import { BadgeCheck, Loader2, AlertCircle, RefreshCw, Search, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminProvidersPage() {
  const router = useRouter();
  const [providers, setProviders] = useState<ProviderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterVerified, setFilterVerified] = useState<"ALL" | "VERIFIED" | "PENDING">("ALL");

  const fetchProviders = () => {
    setLoading(true);
    setError("");
    adminApi
      .getAllProviders()
      .then((res) => setProviders(res.data))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load providers"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const approveProvider = async (id: string) => {
    setApproving(id);
    setError("");
    try {
      const res = await adminApi.approveProvider(id);
      setProviders((prev) => prev.map((p) => (p.id === id ? res.data : p)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Approval failed");
    } finally {
      setApproving(null);
    }
  };

  const filtered = providers.filter((p) => {
    const matchSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.serviceArea ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filterVerified === "ALL" ||
      (filterVerified === "VERIFIED" ? p.verified : !p.verified);
    return matchSearch && matchFilter;
  });

  const pendingCount = providers.filter((p) => !p.verified).length;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="admin" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Providers</h1>
            <p className="text-muted-foreground mt-1">
              All registered service providers.
              {pendingCount > 0 && (
                <span className="ml-2 text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                  {pendingCount} pending approval
                </span>
              )}
            </p>
          </div>
          <button
            onClick={fetchProviders}
            className="flex items-center gap-2 text-sm border border-border px-4 py-2 rounded-xl hover:bg-muted transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex items-center gap-2 flex-1 border border-input rounded-xl px-3 py-2.5 bg-card">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search by name, email or area…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-2">
            {(["ALL", "PENDING", "VERIFIED"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterVerified(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-medium transition-colors",
                  filterVerified === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:bg-muted"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading providers…</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Provider</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Contact</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Service Area</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Rating</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-foreground">{p.name}</span>
                              {p.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
                            </div>
                            {p.bio && (
                              <p className="text-xs text-muted-foreground truncate max-w-48">{p.bio}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-foreground">{p.email}</p>
                        <p className="text-xs text-muted-foreground">{p.phone}</p>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-sm">
                        {p.serviceArea || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-foreground">
                            {p.rating ? `⭐ ${p.rating.toFixed(1)}` : "New"}
                          </span>
                          {p.totalReviews !== undefined && (
                            <span className="text-xs text-muted-foreground">({p.totalReviews})</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "text-xs px-2.5 py-1 rounded-full font-medium",
                            p.verified
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          )}
                        >
                          {p.verified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/admin/providers/${p.id}`)}
                            className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/20 font-medium transition-colors"
                          >
                            <Eye className="w-3 h-3" /> View Details
                          </button>
                          {!p.verified && (
                            <button
                              onClick={() => approveProvider(p.id)}
                              disabled={approving === p.id}
                              className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-300 px-3 py-1.5 rounded-lg hover:bg-green-100 font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {approving === p.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <BadgeCheck className="w-3 h-3" />
                              )}
                              {approving === p.id ? "Approving…" : "Quick Approve"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground text-sm">
                        No providers found.
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

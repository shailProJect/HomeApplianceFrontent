"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import { adminApi, ReviewResponse } from "@/lib/api";
import { Star, Trash2, Loader2, AlertCircle, RefreshCw, Search, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn("w-3.5 h-3.5", s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200 fill-gray-200")} />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState<number | "ALL">("ALL");

  const fetchReviews = () => {
    setLoading(true);
    setError("");
    adminApi.getAllReviews()
      .then((res) => setReviews(res.data))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load reviews"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this review? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await adminApi.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = reviews.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || r.userName.toLowerCase().includes(q)
      || r.comment?.toLowerCase().includes(q)
      || r.providerId.toLowerCase().includes(q);
    const matchRating = filterRating === "ALL" || r.rating === filterRating;
    return matchSearch && matchRating;
  });

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="admin" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Feedback & Reviews</h1>
            <p className="text-muted-foreground mt-1">
              {reviews.length} total reviews · Avg rating: ⭐ {avgRating}
            </p>
          </div>
          <button onClick={fetchReviews}
            className="flex items-center gap-2 text-sm border border-border px-4 py-2 rounded-xl hover:bg-muted transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[1, 2, 3, 4, 5].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
            return (
              <button key={star}
                onClick={() => setFilterRating(filterRating === star ? "ALL" : star)}
                className={cn(
                  "bg-card rounded-2xl border p-4 shadow-sm text-left transition-colors",
                  filterRating === star ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                )}>
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: star }).map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-xl font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground">{pct}% of reviews</p>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user, comment…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-input rounded-xl bg-background outline-none focus:ring-2 focus:ring-ring" />
          </div>
          {filterRating !== "ALL" && (
            <button onClick={() => setFilterRating("ALL")}
              className="text-xs px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20">
              Clear filter ×
            </button>
          )}
          <p className="text-sm text-muted-foreground ml-auto">{filtered.length} shown</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-medium">No reviews found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <div key={r.id} className="bg-card rounded-2xl border border-border shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                      {r.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">{r.userName}</p>
                        <StarRow rating={r.rating} />
                        <span className="text-xs text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Provider ID: <span className="font-mono">{r.providerId.slice(0, 8)}…</span>
                      </p>
                      {r.comment && (
                        <p className="text-sm text-foreground mt-2 leading-relaxed">{r.comment}</p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id}
                    className="shrink-0 p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-60"
                    title="Delete review">
                    {deleting === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

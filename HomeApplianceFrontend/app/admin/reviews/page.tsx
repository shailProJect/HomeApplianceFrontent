"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import { adminApi, ReviewResponse } from "@/lib/api";
import {
  Star, Trash2, Loader2, AlertCircle, RefreshCw, Search,
  MessageSquare, TrendingUp, ChevronDown, ChevronUp, Filter, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn("w-3.5 h-3.5", s <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-100 text-gray-200")} />
      ))}
    </div>
  );
}

function StatCard({ stars, count, total, active, onClick }: {
  stars: number; count: number; total: number; active: boolean; onClick: () => void;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <button onClick={onClick}
      className="rounded-2xl border-2 p-4 text-left transition-all hover:shadow-md"
      style={{
        backgroundColor: active ? "#E0F2F1" : "#FFFFFF",
        borderColor: active ? "#00897B" : "#E0F2F1",
      }}>
      <div className="flex items-center gap-0.5 mb-2">
        {Array.from({ length: stars }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-2xl font-black" style={{ color: active ? "#00897B" : "#1A2E2B" }}>{count}</p>
      <p className="text-xs mt-0.5" style={{ color: "#90A4AE" }}>{pct}% of reviews</p>
      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#E0F2F1" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: active ? "#00897B" : "#B2DFDB" }} />
      </div>
    </button>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews]           = useState<ReviewResponse[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [deleting, setDeleting]         = useState<string | null>(null);
  const [search, setSearch]             = useState("");
  const [filterRating, setFilterRating] = useState<number | "ALL">("ALL");
  const [sortBy, setSortBy]             = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [showFilters, setShowFilters]   = useState(false);

  const fetchReviews = () => {
    setLoading(true); setError("");
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
    } finally { setDeleting(null); }
  };

  // Filter + sort
  const filtered = reviews
    .filter((r) => {
      const q = search.toLowerCase();
      const matchSearch = !q
        || r.userName.toLowerCase().includes(q)
        || (r.comment ?? "").toLowerCase().includes(q)
        || r.providerId.toLowerCase().includes(q);
      const matchRating = filterRating === "ALL" || r.rating === filterRating;
      return matchSearch && matchRating;
    })
    .sort((a, b) => {
      if (sortBy === "newest")  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest")  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "highest") return b.rating - a.rating;
      return a.rating - b.rating;
    });

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)
    : 0;

  const ratingDist = [5, 4, 3, 2, 1].map((s) => ({
    stars: s,
    count: reviews.filter((r) => r.rating === s).length,
  }));

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F7FAFA" }}>
      <Sidebar role="admin" />
      <main className="flex-1 p-6 overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black" style={{ color: "#1A2E2B" }}>Reviews & Feedback</h1>
            <p className="text-sm mt-1" style={{ color: "#607D7B" }}>
              <span className="font-bold" style={{ color: "#00897B" }}>{reviews.length}</span> total ·
              Avg rating: <span className="font-bold" style={{ color: "#00897B" }}>⭐ {avgRating > 0 ? avgRating.toFixed(1) : "—"}</span>
            </p>
          </div>
          <button onClick={fetchReviews}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition-colors hover:bg-white"
            style={{ borderColor: "#B2DFDB", color: "#00897B" }}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {ratingDist.map(({ stars, count }) => (
            <StatCard key={stars} stars={stars} count={count} total={reviews.length}
              active={filterRating === stars}
              onClick={() => setFilterRating(filterRating === stars ? "ALL" : stars)} />
          ))}
        </div>

        {/* Overview bar */}
        {reviews.length > 0 && (
          <div className="rounded-2xl border p-5 mb-6 flex items-center gap-6"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2F1" }}>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black" style={{ color: "#00897B" }}>{avgRating.toFixed(1)}</span>
              <div className="flex items-center gap-0.5 mt-1">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={cn("w-4 h-4", s <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-100 text-gray-200")} />
                ))}
              </div>
              <span className="text-xs mt-1" style={{ color: "#90A4AE" }}>Average</span>
            </div>
            <div className="flex-1">
              {ratingDist.map(({ stars, count }) => {
                const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                return (
                  <div key={stars} className="flex items-center gap-2 mb-1.5 text-xs">
                    <span className="w-4 text-right font-medium" style={{ color: "#607D7B" }}>{stars}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 shrink-0" />
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#E0F2F1" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: "#00897B" }} />
                    </div>
                    <span className="w-8 font-medium" style={{ color: "#90A4AE" }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
            <div className="text-center hidden sm:block">
              <TrendingUp className="w-8 h-8 mx-auto" style={{ color: "#00897B" }} />
              <p className="text-xs mt-1 font-semibold" style={{ color: "#607D7B" }}>Overall</p>
              <p className="text-xs" style={{ color: "#607D7B" }}>
                {reviews.filter((r) => r.rating >= 4).length} positive
              </p>
            </div>
          </div>
        )}

        {/* Search + filters */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#90A4AE" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user, comment, provider ID…"
              className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl outline-none"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0F2F1", color: "#1A2E2B" }} />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4" style={{ color: "#90A4AE" }} />
              </button>
            )}
          </div>

          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl border transition-colors"
            style={{ borderColor: "#B2DFDB", color: "#00897B", backgroundColor: showFilters ? "#E0F2F1" : "#FFF" }}>
            <Filter className="w-4 h-4" /> Sort & Filter
          </button>

          {(filterRating !== "ALL" || sortBy !== "newest") && (
            <button onClick={() => { setFilterRating("ALL"); setSortBy("newest"); }}
              className="text-xs font-bold px-3 py-2 rounded-lg"
              style={{ backgroundColor: "#E0F2F1", color: "#00897B" }}>
              Clear ×
            </button>
          )}

          <p className="text-sm ml-auto" style={{ color: "#607D7B" }}>
            <span className="font-bold" style={{ color: "#1A2E2B" }}>{filtered.length}</span> shown
          </p>
        </div>

        {showFilters && (
          <div className="rounded-2xl border p-4 mb-5 flex flex-wrap gap-5"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2F1" }}>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#90A4AE" }}>Filter by Stars</p>
              <div className="flex gap-1.5">
                {["ALL", 5, 4, 3, 2, 1].map((v) => (
                  <button key={v} onClick={() => setFilterRating(v as number | "ALL")}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors"
                    style={filterRating === v
                      ? { backgroundColor: "#00897B", color: "#FFF", borderColor: "#00897B" }
                      : { borderColor: "#E0F2F1", color: "#607D7B" }}>
                    {v === "ALL" ? "All" : `${v}★`}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#90A4AE" }}>Sort by</p>
              <div className="flex gap-1.5">
                {([
                  { key: "newest", label: "Newest" },
                  { key: "oldest", label: "Oldest" },
                  { key: "highest", label: "Highest" },
                  { key: "lowest", label: "Lowest" },
                ] as const).map(({ key, label }) => (
                  <button key={key} onClick={() => setSortBy(key)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors"
                    style={sortBy === key
                      ? { backgroundColor: "#00897B", color: "#FFF", borderColor: "#00897B" }
                      : { borderColor: "#E0F2F1", color: "#607D7B" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm rounded-2xl px-4 py-3 mb-5"
            style={{ color: "#C62828", backgroundColor: "#FFEBEE", border: "1px solid #FFCDD2" }}>
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map((i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ backgroundColor: "#E0F2F1" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: "#E0F2F1" }}>
              <MessageSquare className="w-7 h-7" style={{ color: "#00897B" }} />
            </div>
            <p className="font-bold" style={{ color: "#1A2E2B" }}>No reviews found</p>
            <p className="text-sm mt-1" style={{ color: "#607D7B" }}>Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => {
              const expanded = expandedId === r.id;
              const isLongComment = (r.comment?.length ?? 0) > 120;
              return (
                <div key={r.id} className="rounded-2xl border p-5 transition-all hover:shadow-sm"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2F1" }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold text-white"
                        style={{ backgroundColor: "#00897B" }}>
                        {r.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        {/* User + date + rating */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className="font-bold text-sm" style={{ color: "#1A2E2B" }}>{r.userName}</p>
                          <StarRow rating={r.rating} />
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{
                              backgroundColor: r.rating >= 4 ? "#E0F2F1" : r.rating === 3 ? "#FFF8E1" : "#FFEBEE",
                              color: r.rating >= 4 ? "#00897B" : r.rating === 3 ? "#F57F17" : "#C62828",
                            }}>
                            {r.rating}/5
                          </span>
                          <span className="text-xs" style={{ color: "#90A4AE" }}>
                            {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>

                        {/* Provider ID */}
                        <p className="text-xs mt-0.5" style={{ color: "#90A4AE" }}>
                          Provider: <span className="font-mono">{r.providerId.slice(0, 8)}…</span>
                        </p>

                        {/* Comment */}
                        {r.comment && (
                          <div className="mt-2">
                            <p className="text-sm leading-relaxed" style={{ color: "#607D7B" }}>
                              {isLongComment && !expanded
                                ? r.comment.slice(0, 120) + "…"
                                : r.comment}
                            </p>
                            {isLongComment && (
                              <button onClick={() => setExpandedId(expanded ? null : r.id)}
                                className="flex items-center gap-1 text-xs font-semibold mt-1"
                                style={{ color: "#00897B" }}>
                                {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
                              </button>
                            )}
                          </div>
                        )}
                        {!r.comment && (
                          <p className="text-xs mt-2 italic" style={{ color: "#B2DFDB" }}>No comment left</p>
                        )}
                      </div>
                    </div>

                    {/* Delete */}
                    <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id}
                      title="Delete review"
                      className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border transition-colors hover:bg-red-50 hover:border-red-200 hover:text-red-600 disabled:opacity-50"
                      style={{ borderColor: "#E0F2F1", color: "#90A4AE" }}>
                      {deleting === r.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

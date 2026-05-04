"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import { userApi, BookingResponse } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

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

export default function UserBookingsPage() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review modal
  const [reviewTarget, setReviewTarget] = useState<BookingResponse | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    userApi.getMyBookings()
      .then((res) => setBookings(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const submitReview = async () => {
    if (!reviewTarget) return;
    setReviewLoading(true);
    try {
      await userApi.addReview({ providerId: reviewTarget.providerId, rating, comment });
      setReviewTarget(null);
      setComment("");
      setRating(5);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="user" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>
          <p className="text-muted-foreground mt-1">All your service bookings.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">{error}</div>
        )}

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 flex flex-col gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <p className="text-muted-foreground text-sm p-8 text-center">No bookings found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Service</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Provider</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Scheduled</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{b.serviceName}</td>
                      <td className="px-6 py-4 text-muted-foreground">{b.providerName}</td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDt(b.scheduledAt)}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">₹{b.totalAmount}</td>
                      <td className="px-6 py-4">
                        <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium capitalize", statusColors[b.status])}>
                          {b.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {b.status === "COMPLETED" && (
                          <button
                            onClick={() => setReviewTarget(b)}
                            className="flex items-center gap-1 text-xs text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors font-medium"
                          >
                            <Star className="w-3 h-3" /> Review
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Review Modal */}
        {reviewTarget && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6">
              <h2 className="font-bold text-foreground text-lg mb-1">Leave a Review</h2>
              <p className="text-sm text-muted-foreground mb-5">For {reviewTarget.providerName}</p>
              <div className="flex gap-2 mb-5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setRating(s)} className="focus:outline-none">
                    <Star className={cn("w-7 h-7 transition-colors", s <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Write your experience (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring resize-none mb-5"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setReviewTarget(null)}
                  className="flex-1 border border-border text-foreground text-sm font-medium py-2.5 rounded-xl hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  disabled={reviewLoading}
                  className="flex-1 bg-primary text-primary-foreground text-sm font-medium py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {reviewLoading ? "Submitting…" : "Submit Review"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
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

function formatDt(date: string | undefined) {
  if (!date) return "Not Scheduled";

  const d = new Date(date);

  if (isNaN(d.getTime())) return "Not Scheduled";

  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UserBookingsPage() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review Modal
  const [reviewTarget, setReviewTarget] =
    useState<BookingResponse | null>(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    userApi
      .getMyBookings()
      .then((res) => setBookings(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Complete Service
  const completeService = async (bookingId: string) => {
    try {
      // Backend API call (optional)
      // await userApi.updateBookingStatus(bookingId, "COMPLETED");

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: "COMPLETED" }
            : booking
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  // Update Amount
  const updateAmount = (
    bookingId: string,
    value: string
  ) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              totalAmount: Number(value),
            }
          : booking
      )
    );
  };

  // Submit Review
  const submitReview = async () => {
    if (!reviewTarget) return;

    setReviewLoading(true);

    try {
      await userApi.addReview({
        providerId: reviewTarget.providerId,
        rating,
        comment,
      });

      setReviewTarget(null);
      setComment("");
      setRating(5);

      alert("Review submitted successfully");
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

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            My Bookings
          </h1>

          <p className="text-muted-foreground mt-2">
            Manage and track your bookings.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            {loading ? (
              <div className="p-8 flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-muted rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-16 text-center">
                <p className="text-muted-foreground">
                  No bookings found.
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">

                {/* Header */}
                <thead className="bg-muted border-b border-border">
                  <tr>

                    <th className="text-left px-6 py-4 font-semibold text-muted-foreground">
                      Service
                    </th>

                    <th className="text-left px-6 py-4 font-semibold text-muted-foreground">
                      Provider
                    </th>

                    <th className="text-left px-6 py-4 font-semibold text-muted-foreground">
                      Scheduled
                    </th>

                    <th className="text-left px-6 py-4 font-semibold text-muted-foreground">
                      Total Cost
                    </th>

                    <th className="text-left px-6 py-4 font-semibold text-muted-foreground">
                      Status
                    </th>

                    <th className="text-left px-6 py-4 font-semibold text-muted-foreground">
                      Action
                    </th>

                  </tr>
                </thead>

                {/* Body */}
                <tbody className="divide-y divide-border">
                  {bookings.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-muted/40 transition-all"
                    >

                      {/* Service */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">
                            {b.serviceName}
                          </span>

                          <span className="text-xs text-muted-foreground mt-1">
                            Booking ID: #{b.id.slice(0, 8)}
                          </span>
                        </div>
                      </td>

                      {/* Provider */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {b.providerName}
                          </span>

                          <span className="text-xs text-muted-foreground">
                            Service Provider
                          </span>
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {formatDt(b.scheduledAt)}
                          </span>

                          <span className="text-xs text-muted-foreground">
                            Appointment Time
                          </span>
                        </div>
                      </td>

                      {/* Total Amount Editable */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">

                          <input
                            type="number"
                            value={b.totalAmount || ""}
                            onChange={(e) =>
                              updateAmount(
                                b.id,
                                e.target.value
                              )
                            }
                            placeholder="Enter amount"
                            className="w-32 border border-border rounded-xl px-3 py-2 bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary"
                          />

                          <span className="text-xs text-muted-foreground">
                            User can edit amount
                          </span>

                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <span
                          className={cn(
                            "text-xs px-3 py-1.5 rounded-full font-semibold capitalize inline-flex items-center",
                            statusColors[b.status]
                          )}
                        >
                          {b.status.toLowerCase()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">

                        <div className="flex flex-wrap gap-2">

                          {/* Pending */}
                          {b.status === "PENDING" && (
                            <button
                              onClick={() =>
                                setBookings((prev) =>
                                  prev.map((booking) =>
                                    booking.id === b.id
                                      ? {
                                          ...booking,
                                          status: "CONFIRMED",
                                        }
                                      : booking
                                  )
                                )
                              }
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                            >
                              Confirm Booking
                            </button>
                          )}

                          {/* Confirmed */}
                          {b.status === "CONFIRMED" && (
                            <button
                              onClick={() =>
                                completeService(b.id)
                              }
                              className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                            >
                              Complete Service
                            </button>
                          )}

                          {/* Completed */}
                          {b.status === "COMPLETED" && (
                            <div className="flex gap-2">

                              <div className="bg-green-100 text-green-700 text-xs font-semibold px-4 py-2 rounded-xl">
                                Completed
                              </div>

                              <button
                                onClick={() =>
                                  setReviewTarget(b)
                                }
                                className="flex items-center gap-1 text-xs border border-primary/20 bg-primary/5 text-primary px-4 py-2 rounded-xl hover:bg-primary/10 font-semibold"
                              >
                                <Star className="w-3.5 h-3.5" />
                                Give Review
                              </button>

                            </div>
                          )}

                        </div>

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

            <div className="bg-card rounded-3xl border border-border shadow-xl w-full max-w-md p-6">

              <h2 className="font-bold text-xl text-foreground mb-1">
                Leave a Review
              </h2>

              <p className="text-sm text-muted-foreground mb-6">
                For {reviewTarget.providerName}
              </p>

              {/* Stars */}
              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setRating(s)}
                  >
                    <Star
                      className={cn(
                        "w-8 h-8",
                        s <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      )}
                    />
                  </button>
                ))}
              </div>

              {/* Comment */}
              <textarea
                placeholder="Write your review..."
                value={comment}
                onChange={(e) =>
                  setComment(e.target.value)
                }
                rows={4}
                className="w-full border border-input rounded-2xl px-4 py-3 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring resize-none mb-6"
              />

              {/* Buttons */}
              <div className="flex gap-3">

                <button
                  onClick={() =>
                    setReviewTarget(null)
                  }
                  className="flex-1 border border-border py-3 rounded-2xl text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>

                <button
                  onClick={submitReview}
                  disabled={reviewLoading}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-2xl text-sm font-medium hover:opacity-90"
                >
                  {reviewLoading
                    ? "Submitting..."
                    : "Submit Review"}
                </button>

              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
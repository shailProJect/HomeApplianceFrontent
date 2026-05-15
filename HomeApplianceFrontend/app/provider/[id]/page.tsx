"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BadgeCheck, MapPin, Briefcase, Star, Store, Navigation,
  Loader2, AlertCircle, ThumbsUp, ChevronRight, Clock, Shield, Send,
} from "lucide-react";
import Navbar from "@/components/navbar";
import StarRating from "@/components/star-rating";
import { userApi, ProviderResponse, ReviewResponse, ProviderServiceResponse, ReviewRequest, getUser } from "@/lib/api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-5 text-right font-medium" style={{ color: "#607D7B" }}>{label}</span>
      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 shrink-0" />
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#E0F2F1" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: "#00897B" }} />
      </div>
      <span className="w-5 font-medium" style={{ color: "#90A4AE" }}>{count}</span>
    </div>
  );
}

export default function ProviderProfilePage() {
  const params = useParams();
  const providerId = params.id as string;

  const [provider, setProvider]   = useState<ProviderResponse | null>(null);
  const [reviews, setReviews]     = useState<ReviewResponse[]>([]);
  const [services, setServices]   = useState<ProviderServiceResponse[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  // Review form state
  const [showReviewForm, setShowReviewForm]     = useState(false);
  const [reviewRating, setReviewRating]         = useState(0);
  const [reviewHover, setReviewHover]           = useState(0);
  const [reviewComment, setReviewComment]       = useState("");
  const [submitting, setSubmitting]             = useState(false);
  const [reviewError, setReviewError]           = useState("");
  const [reviewSuccess, setReviewSuccess]       = useState(false);

  const currentUser = typeof window !== "undefined" ? getUser() : null;

  useEffect(() => {
    if (!providerId) return;
    setLoading(true);
    Promise.all([
      userApi.getProviderById(providerId),
      userApi.getProviderReviews(providerId),
    ])
      .then(([provRes, revRes]) => {
        setProvider(provRes.data);
        setReviews(revRes.data);
        if (provRes.data.categoryName) {
          userApi.searchByCategory(provRes.data.categoryName)
            .then((svcRes) => {
              setServices((svcRes.data || []).filter((s: ProviderServiceResponse) => s.providerId === provRes.data.id));
            })
            .catch(() => {});
        }
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load provider"))
      .finally(() => setLoading(false));
  }, [providerId]);

  const handleSubmitReview = async () => {
    if (reviewRating === 0) { setReviewError("Please select a star rating."); return; }
    setSubmitting(true); setReviewError("");
    try {
      const body: ReviewRequest = { providerId, rating: reviewRating, comment: reviewComment.trim() || undefined };
      const res = await userApi.addReview(body);
      setReviews((prev) => [res.data, ...prev]);
      setReviewSuccess(true);
      setShowReviewForm(false);
      setReviewRating(0); setReviewComment("");
      setTimeout(() => setReviewSuccess(false), 4000);
    } catch (e: unknown) {
      setReviewError(e instanceof Error ? e.message : "Failed to submit review");
    } finally { setSubmitting(false); }
  };

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star, count: reviews.filter((r) => r.rating === star).length,
  }));

  const avgRating   = provider?.rating ?? 0;
  const reviewCount = reviews.length;
  const lowestPrice = services.length > 0 ? Math.min(...services.map((s) => s.price)) : null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7FAFA" }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: "#E0F2F1", borderTopColor: "#00897B" }} />
          <span className="text-sm font-medium" style={{ color: "#607D7B" }}>Loading provider…</span>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7FAFA" }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" /> {error || "Provider not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7FAFA" }}>
      <Navbar />

      {/* Hero strip */}
      <div style={{ backgroundColor: "#00897B" }} className="py-8 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
            {provider.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{provider.name}</h1>
              {provider.verified && (
                <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                  <BadgeCheck className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            {provider.categoryName && (
              <span className="inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                {provider.categoryName.replace(/_/g, " ")}
              </span>
            )}
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {avgRating > 0 && (
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                  <span className="text-sm font-bold text-white">{avgRating.toFixed(1)}</span>
                  <span className="text-xs text-white/70">({reviewCount} reviews)</span>
                </div>
              )}
              {provider.serviceArea && (
                <div className="flex items-center gap-1 text-white/80">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-xs">{provider.serviceArea}</span>
                </div>
              )}
              {provider.experienceYears && provider.experienceYears > 0 && (
                <div className="flex items-center gap-1 text-white/80">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span className="text-xs">{provider.experienceYears} yrs exp</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Services + Reviews */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, label: "Verified", sub: "Background checked" },
                { icon: Clock, label: "On-Time", sub: "Reliable service" },
                { icon: Star, label: `${avgRating > 0 ? avgRating.toFixed(1) : "New"} Rating`, sub: `${reviewCount} reviews` },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="rounded-2xl border p-4 text-center"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2F1" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                    style={{ backgroundColor: "#E0F2F1" }}>
                    <Icon className="w-4 h-4" style={{ color: "#00897B" }} />
                  </div>
                  <p className="text-xs font-bold" style={{ color: "#1A2E2B" }}>{label}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "#90A4AE" }}>{sub}</p>
                </div>
              ))}
            </div>

            {/* Shop info */}
            {(provider.shopName || provider.shopAddress) && (
              <div className="rounded-2xl border p-5" style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2F1" }}>
                <h2 className="font-bold mb-3 flex items-center gap-2 text-sm" style={{ color: "#1A2E2B" }}>
                  <Store className="w-4 h-4" style={{ color: "#00897B" }} /> Shop Details
                </h2>
                {provider.shopName && (
                  <p className="font-semibold text-sm" style={{ color: "#1A2E2B" }}>{provider.shopName}</p>
                )}
                {provider.shopAddress && (
                  <p className="flex items-start gap-1.5 text-sm mt-1" style={{ color: "#607D7B" }}>
                    <Navigation className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {provider.shopAddress}
                  </p>
                )}
              </div>
            )}

            {/* Services */}
            {services.length > 0 && (
              <div className="rounded-2xl border p-5" style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2F1" }}>
                <h2 className="font-bold mb-4 flex items-center gap-2 text-sm" style={{ color: "#1A2E2B" }}>
                  <ChevronRight className="w-4 h-4" style={{ color: "#00897B" }} /> Services Offered
                </h2>
                <div className="flex flex-col gap-3">
                  {services.map((svc) => (
                    <div key={svc.id} className="flex items-center justify-between py-3 px-4 rounded-xl"
                      style={{ backgroundColor: "#F7FAFA", border: "1px solid #E0F2F1" }}>
                      <div>
                        <p className="font-bold text-sm" style={{ color: "#1A2E2B" }}>{svc.serviceName}</p>
                        {svc.description && (
                          <p className="text-xs mt-0.5" style={{ color: "#607D7B" }}>{svc.description}</p>
                        )}
                        <p className="text-xs mt-1" style={{ color: "#90A4AE" }}>⏱ {svc.durationMinutes} min</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="font-bold text-lg" style={{ color: "#1A2E2B" }}>₹{svc.price}</p>
                        <Link href={`/booking?provider=${providerId}&service=${svc.id}`}
                          className="text-xs font-bold px-4 py-1.5 rounded-xl text-white hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: "#00897B" }}>
                          Book →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews section */}
            <div className="rounded-2xl border p-5" style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2F1" }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold flex items-center gap-2 text-sm" style={{ color: "#1A2E2B" }}>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> Customer Reviews
                </h2>
                {currentUser?.role === "USER" && !reviewSuccess && (
                  <button onClick={() => setShowReviewForm(!showReviewForm)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-colors"
                    style={{ borderColor: "#00897B", color: "#00897B" }}>
                    {showReviewForm ? "Cancel" : "Write a Review"}
                  </button>
                )}
              </div>

              {/* Success toast */}
              {reviewSuccess && (
                <div className="rounded-xl px-4 py-3 mb-4 text-sm font-semibold flex items-center gap-2"
                  style={{ backgroundColor: "#E0F2F1", color: "#00897B" }}>
                  ✅ Review submitted successfully! Thank you.
                </div>
              )}

              {/* Review form */}
              {showReviewForm && (
                <div className="rounded-2xl border p-5 mb-5" style={{ backgroundColor: "#F7FAFA", borderColor: "#E0F2F1" }}>
                  <p className="text-sm font-bold mb-3" style={{ color: "#1A2E2B" }}>Your Rating</p>
                  <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star}
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewHover(star)}
                        onMouseLeave={() => setReviewHover(0)}
                        className="transition-transform hover:scale-110">
                        <Star className={`w-8 h-8 transition-colors ${
                          star <= (reviewHover || reviewRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-100 text-gray-200"
                        }`} />
                      </button>
                    ))}
                    {(reviewHover || reviewRating) > 0 && (
                      <span className="text-xs font-bold ml-2" style={{ color: "#00897B" }}>
                        {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][reviewHover || reviewRating]}
                      </span>
                    )}
                  </div>
                  <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience (optional)…"
                    rows={3}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none mb-3"
                    style={{ backgroundColor: "#FFFFFF", border: "1px solid #B2DFDB", color: "#1A2E2B" }} />
                  {reviewError && (
                    <p className="text-xs mb-3" style={{ color: "#C62828" }}>⚠ {reviewError}</p>
                  )}
                  <button onClick={handleSubmitReview} disabled={submitting}
                    className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl text-white disabled:opacity-60 transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#00897B" }}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {submitting ? "Submitting…" : "Submit Review"}
                  </button>
                </div>
              )}

              {/* No reviews */}
              {reviews.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#E0F2F1" }}>
                    <ThumbsUp className="w-6 h-6" style={{ color: "#00897B" }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "#1A2E2B" }}>No reviews yet</p>
                  <p className="text-xs" style={{ color: "#607D7B" }}>Be the first to review this provider!</p>
                </div>
              ) : (
                <>
                  {/* Rating summary */}
                  <div className="flex gap-6 mb-6 flex-wrap p-4 rounded-2xl" style={{ backgroundColor: "#F7FAFA" }}>
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-5xl font-black" style={{ color: "#00897B" }}>{avgRating.toFixed(1)}</span>
                      <div className="flex items-center gap-0.5 mt-1">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
                        ))}
                      </div>
                      <span className="text-xs mt-1" style={{ color: "#90A4AE" }}>{reviewCount} reviews</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5 justify-center min-w-[160px]">
                      {ratingCounts.map(({ star, count }) => (
                        <RatingBar key={star} label={String(star)} count={count} total={reviewCount} />
                      ))}
                    </div>
                  </div>

                  {/* Review list */}
                  <div className="flex flex-col gap-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="pb-4 border-b last:border-b-0 last:pb-0"
                        style={{ borderColor: "#E0F2F1" }}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                              style={{ backgroundColor: "#00897B" }}>
                              {r.userName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-sm" style={{ color: "#1A2E2B" }}>{r.userName}</p>
                              <div className="flex items-center gap-0.5 mt-0.5">
                                {[1,2,3,4,5].map((s) => (
                                  <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs" style={{ color: "#90A4AE" }}>{formatDate(r.createdAt)}</span>
                        </div>
                        {r.comment && (
                          <p className="text-sm leading-relaxed ml-11.5" style={{ color: "#607D7B" }}>{r.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right: Booking CTA */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border p-6 sticky top-24" style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2F1" }}>
              {lowestPrice != null ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#90A4AE" }}>Starting from</p>
                  <p className="text-4xl font-black mb-1" style={{ color: "#1A2E2B" }}>₹{lowestPrice}</p>
                  <p className="text-xs mb-5" style={{ color: "#90A4AE" }}>per service</p>
                </>
              ) : (
                <p className="text-sm font-medium mb-4" style={{ color: "#607D7B" }}>Contact for pricing</p>
              )}

              <Link href={`/booking?provider=${providerId}`}
                className="w-full block text-center font-bold py-3.5 rounded-xl text-white hover:opacity-90 transition-opacity mb-3"
                style={{ backgroundColor: "#00897B" }}>
                Book Appointment
              </Link>
              <p className="text-xs text-center mb-5" style={{ color: "#90A4AE" }}>Free cancellation up to 2 hrs before</p>

              {/* Details */}
              <div className="flex flex-col gap-3 pt-4 border-t" style={{ borderColor: "#E0F2F1" }}>
                {[
                  provider.verified && { label: "Status", value: "✅ Verified" },
                  provider.categoryName && { label: "Category", value: provider.categoryName.replace(/_/g, " ") },
                  provider.experienceYears && { label: "Experience", value: `${provider.experienceYears} years` },
                  provider.serviceArea && { label: "Service Area", value: provider.serviceArea },
                  avgRating > 0 && { label: "Rating", value: `${avgRating.toFixed(1)}/5` },
                  provider.shopName && { label: "Shop", value: provider.shopName },
                ].filter(Boolean).map((item) => item && (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span style={{ color: "#90A4AE" }}>{item.label}</span>
                    <span className="font-semibold text-right max-w-[140px] truncate" style={{ color: "#1A2E2B" }}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Leave a review CTA if user */}
              {currentUser?.role === "USER" && (
                <button onClick={() => {
                  setShowReviewForm(true);
                  document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                  className="w-full mt-5 flex items-center justify-center gap-2 border py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-[#F7FAFA]"
                  style={{ borderColor: "#B2DFDB", color: "#00897B" }}>
                  <Star className="w-4 h-4" /> Leave a Review
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

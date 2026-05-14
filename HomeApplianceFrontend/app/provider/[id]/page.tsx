"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BadgeCheck,
  MapPin,
  Briefcase,
  Star,
  Store,
  Navigation,
  Loader2,
  AlertCircle,
  ThumbsUp,
  Calendar,
} from "lucide-react";
import Navbar from "@/components/navbar";
import StarRating from "@/components/star-rating";
import { userApi, ProviderResponse, ReviewResponse, ProviderServiceResponse } from "@/lib/api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-4 text-muted-foreground text-right">{label}</span>
      <Star className="w-3 h-3 text-yellow-500 shrink-0" />
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-muted-foreground">{count}</span>
    </div>
  );
}

export default function ProviderProfilePage() {
  const params = useParams();
  const providerId = params.id as string;

  const [provider, setProvider] = useState<ProviderResponse | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [services, setServices] = useState<ProviderServiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        // Fetch services for this category
        if (provRes.data.categoryName) {
          userApi.searchByCategory(provRes.data.categoryName)
            .then((svcRes) => {
              setServices((svcRes.data || []).filter((s: ProviderServiceResponse) => s.providerId === provRes.data.id));
            })
            .catch(() => {});
        }
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load provider");
      })
      .finally(() => setLoading(false));
  }, [providerId]);

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const avgRating = provider?.rating ?? 0;
  const reviewCount = reviews.length;
  const lowestPrice = services.length > 0 ? Math.min(...services.map((s) => s.price)) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading provider…
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" /> {error || "Provider not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left column */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Profile Card */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl shrink-0">
                  {provider.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-foreground">{provider.name}</h1>
                    {provider.verified && (
                      <span className="flex items-center gap-1 text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                        <BadgeCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  {provider.categoryName && (
                    <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {provider.categoryName.replace(/_/g, " ")}
                    </span>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                    {avgRating > 0 && (
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={avgRating} size="sm" />
                        <span>{avgRating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? "s" : ""})</span>
                      </div>
                    )}
                    {provider.serviceArea && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {provider.serviceArea}
                      </div>
                    )}
                    {provider.experienceYears != null && provider.experienceYears > 0 && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" /> {provider.experienceYears} yr{provider.experienceYears !== 1 ? "s" : ""} exp
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Shop info */}
              {(provider.shopName || provider.shopAddress) && (
                <div className="mt-5 pt-5 border-t border-border flex flex-col gap-2">
                  {provider.shopName && (
                    <div className="flex items-center gap-2 text-sm">
                      <Store className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-medium text-foreground">{provider.shopName}</span>
                    </div>
                  )}
                  {provider.shopAddress && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Navigation className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{provider.shopAddress}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Services offered */}
            {services.length > 0 && (
              <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Services Offered
                </h2>
                <div className="flex flex-col gap-3">
                  {services.map((svc) => (
                    <div key={svc.id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                      <div>
                        <p className="font-medium text-foreground text-sm">{svc.serviceName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{svc.durationMinutes} min</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">₹{svc.price}</p>
                        <Link href={`/booking?provider=${providerId}&service=${svc.id}`} className="text-xs text-primary hover:underline">
                          Book →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
              <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" /> Customer Reviews
              </h2>

              {reviews.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                  <ThumbsUp className="w-8 h-8 opacity-40" />
                  <p className="text-sm">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                <>
                  {/* Rating summary */}
                  <div className="flex gap-6 mb-6 flex-wrap">
                    <div className="flex flex-col items-center">
                      <span className="text-4xl font-bold text-foreground">{avgRating.toFixed(1)}</span>
                      <StarRating rating={avgRating} size="sm" />
                      <span className="text-xs text-muted-foreground mt-1">{reviewCount} review{reviewCount !== 1 ? "s" : ""}</span>
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
                      <div key={r.id} className="pb-4 border-b border-border last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                              {r.userName?.charAt(0).toUpperCase()}
                            </div>
                            <p className="font-medium text-foreground text-sm">{r.userName}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
                        </div>
                        <StarRating rating={r.rating} size="sm" />
                        {r.comment && (
                          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{r.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right column — Book CTA */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sticky top-24">
              {lowestPrice != null && (
                <>
                  <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">Starting from</p>
                  <p className="text-3xl font-bold text-foreground mb-5">₹{lowestPrice}</p>
                </>
              )}
              <Link
                href={`/booking?provider=${providerId}`}
                className="w-full block text-center bg-primary text-primary-foreground font-medium py-3 rounded-xl hover:opacity-90 transition-opacity mb-3"
              >
                Book Appointment
              </Link>
              <p className="text-xs text-muted-foreground text-center">Free cancellation up to 2 hrs before</p>

              <div className="mt-6 pt-5 border-t border-border flex flex-col gap-3 text-sm">
                {provider.verified && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <BadgeCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>
                )}
                {provider.categoryName && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium text-foreground">{provider.categoryName.replace(/_/g, " ")}</span>
                  </div>
                )}
                {provider.experienceYears != null && provider.experienceYears > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="font-medium text-foreground">{provider.experienceYears} yr{provider.experienceYears !== 1 ? "s" : ""}</span>
                  </div>
                )}
                {provider.serviceArea && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Service Area</span>
                    <span className="font-medium text-foreground text-right max-w-[140px]">{provider.serviceArea}</span>
                  </div>
                )}
                {avgRating > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="font-medium text-foreground">{avgRating.toFixed(1)}/5</span>
                  </div>
                )}
                {provider.shopName && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Shop</span>
                    <span className="font-medium text-foreground text-right max-w-[140px]">{provider.shopName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

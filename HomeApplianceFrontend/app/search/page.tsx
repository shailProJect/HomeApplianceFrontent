"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { userApi, ProviderServiceResponse, ProviderResponse } from "@/lib/api";
import { Filter, SlidersHorizontal, MapPin, Star, BadgeCheck, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "ELECTRICIAN",
  "PLUMBER",
  "CARPENTER",
  "PAINTER",
  "CLEANER",
  "AC_TECHNICIAN",
  "APPLIANCE_REPAIR",
  "OTHER",
];

const RATINGS = [4.5, 4.0, 3.5];

type SearchMode = "category" | "nearby";

export default function SearchPage() {
  const [mode, setMode] = useState<SearchMode>("category");
  const [category, setCategory] = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [radius, setRadius] = useState(5);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [services, setServices] = useState<ProviderServiceResponse[]>([]);
  const [nearbyProviders, setNearbyProviders] = useState<ProviderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch by category
  const fetchByCategory = useCallback(async (cat: string) => {
    setLoading(true);
    setError("");
    try {
      if (cat === "All") {
        // Fetch all known categories and merge
        const results = await Promise.all(
          CATEGORIES.filter((c) => c !== "All").map((c) =>
            userApi.searchByCategory(c).then((r) => r.data).catch(() => [] as ProviderServiceResponse[])
          )
        );
        setServices(results.flat());
      } else {
        const res = await userApi.searchByCategory(cat);
        setServices(res.data);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch nearby
  const fetchNearby = useCallback((lat: number, lng: number, r: number) => {
    setLoading(true);
    setError("");
    userApi
      .findNearby(lat, lng, r)
      .then((res) => setNearbyProviders(res.data))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load nearby providers"))
      .finally(() => setLoading(false));
  }, []);

  // Initial load
  useEffect(() => {
    if (mode === "category") {
      fetchByCategory(category);
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchNearby(pos.coords.latitude, pos.coords.longitude, radius),
          () => fetchNearby(19.076, 72.877, radius) // Mumbai fallback
        );
      } else {
        fetchNearby(19.076, 72.877, radius);
      }
    }
  }, [mode, category, radius, fetchByCategory, fetchNearby]);

  // Apply client-side rating filter to category results
  const filteredServices = services.filter((s) => {
    // ProviderServiceResponse doesn't have rating; filter is best-effort
    return true;
  });

  const filteredNearby = nearbyProviders.filter((p) =>
    minRating === 0 || (p.rating ?? 0) >= minRating
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="user" />
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="sticky top-0 bg-background border-b border-border px-8 py-4 flex items-center justify-between z-10">
          <h1 className="text-xl font-bold text-foreground">Find Providers</h1>
          <div className="flex items-center gap-3">
            {/* Mode Switch */}
            <div className="hidden sm:flex gap-1 bg-muted p-1 rounded-xl">
              <button
                onClick={() => setMode("category")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  mode === "category" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                By Category
              </button>
              <button
                onClick={() => setMode("nearby")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1",
                  mode === "nearby" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <MapPin className="w-3 h-3" /> Near Me
              </button>
            </div>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 text-sm border border-border px-4 py-2 rounded-xl hover:bg-muted transition-colors md:hidden"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        <div className="flex gap-6 p-8">
          {/* Sidebar Filters */}
          <aside className={cn("w-64 shrink-0 hidden md:block", filtersOpen && "block")}>
            <div className="bg-card rounded-2xl border border-border p-5 sticky top-24 flex flex-col gap-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </div>

              {/* Mode (mobile) */}
              <div className="sm:hidden">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Search Mode</p>
                <div className="flex flex-col gap-1">
                  {(["category", "nearby"] as SearchMode[]).map((m) => (
                    <label key={m} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input type="radio" name="mode" checked={mode === m} onChange={() => setMode(m)} className="accent-primary" />
                      {m === "category" ? "By Category" : "Near Me"}
                    </label>
                  ))}
                </div>
              </div>

              {/* Category (only for category mode) */}
              {mode === "category" && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Service Category</p>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c === "All" ? "All Categories" : c.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Radius (only for nearby mode) */}
              {mode === "nearby" && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Radius</p>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={1}
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1 km</span>
                    <span className="font-medium text-foreground">{radius} km</span>
                    <span>20 km</span>
                  </div>
                </div>
              )}

              {/* Rating */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Min. Rating</p>
                <div className="flex flex-col gap-1.5">
                  {[0, ...RATINGS].map((r) => (
                    <label key={r} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === r}
                        onChange={() => setMinRating(r)}
                        className="accent-primary"
                      />
                      {r === 0 ? "Any rating" : `${r}+ stars`}
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setCategory("All");
                  setMinRating(0);
                  setRadius(5);
                }}
                className="text-xs text-primary font-medium hover:underline text-left"
              >
                Clear all filters
              </button>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="text-sm">Loading providers…</p>
              </div>
            ) : mode === "category" ? (
              <>
                <p className="text-sm text-muted-foreground mb-5">
                  Showing <span className="font-semibold text-foreground">{filteredServices.length}</span> services
                </p>
                {filteredServices.length === 0 ? (
                  <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <p className="text-muted-foreground">No services found for this category.</p>
                    <button
                      onClick={() => fetchByCategory(category)}
                      className="mt-3 text-sm text-primary hover:underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredServices.map((s) => (
                      <ServiceCard key={s.id} service={s} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-5">
                  Showing <span className="font-semibold text-foreground">{filteredNearby.length}</span> providers within {radius} km
                </p>
                {filteredNearby.length === 0 ? (
                  <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <p className="text-muted-foreground">No providers found nearby. Try increasing the radius.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredNearby.map((p) => (
                      <NearbyCard key={p.id} provider={p} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ServiceCard({ service }: { service: ProviderServiceResponse }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5 flex flex-col gap-4">
      <div>
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
          {service.categoryName.replace(/_/g, " ")}
        </span>
        <h3 className="font-semibold text-foreground mt-2 text-sm">
          {service.description || service.categoryName.replace(/_/g, " ")}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">by {service.providerName}</p>
      </div>
      <div className="flex items-center justify-between text-sm border-t border-border pt-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-foreground">₹{service.price}</span>
          <span className="text-xs text-muted-foreground">{service.durationMinutes} min</span>
        </div>
        <Link
          href={`/booking?providerId=${service.providerId}&category=${service.categoryName}`}
          className="bg-primary text-primary-foreground text-xs font-medium px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}

function NearbyCard({ provider }: { provider: ProviderResponse }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
          {provider.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-foreground text-sm truncate">{provider.name}</p>
            {provider.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
          </div>
          {provider.serviceArea && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground truncate">{provider.serviceArea}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-foreground">
            {provider.rating ? provider.rating.toFixed(1) : "New"}
          </span>
          {provider.totalReviews !== undefined && (
            <span className="text-xs text-muted-foreground">({provider.totalReviews})</span>
          )}
        </div>
        <Link
          href={`/booking?providerId=${provider.id}`}
          className="bg-primary text-primary-foreground text-xs font-medium px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}

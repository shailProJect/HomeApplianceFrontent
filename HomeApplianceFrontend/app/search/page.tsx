"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { userApi, ProviderServiceResponse, ProviderResponse } from "@/lib/api";
import {
  Filter,
  SlidersHorizontal,
  MapPin,
  Star,
  BadgeCheck,
  Loader2,
  AlertCircle,
  Navigation,
  LocateFixed,
  Map,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Leaflet must not run on the server
const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

// ─── Constants ────────────────────────────────────────────────────────────────

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

//  Location state machine
//  detecting → we are actively calling getCurrentPosition right now
//  granted   → we have good coords, proceed to fetch
//  prompt    → browser permission not yet decided (or not yet asked)
//  denied    → user blocked it OR browser doesn't support geolocation
type LocationState = "detecting" | "granted" | "prompt" | "denied";

// ─── Page ─────────────────────────────────────────────────────────────────────

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

  // ── Location state ────────────────────────────────────────────────────────
  const [locationState, setLocationState] = useState<LocationState>("detecting");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Map picker
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapCoords, setMapCoords] = useState({ lat: 19.076, lng: 72.877 }); // Mumbai default

  // ── Request GPS ───────────────────────────────────────────────────────────

  const requestLocation = useCallback(() => {
    if (!navigator?.geolocation) {
      setLocationState("denied");
      return;
    }
    setLocationState("detecting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        setMapCoords(c); // pre-center map picker at real location too
        setLocationState("granted");
      },
      (err) => {
        setLocationState(err.code === err.PERMISSION_DENIED ? "denied" : "denied");
      },
      { timeout: 10_000, maximumAge: 300_000 }
    );
  }, []);

  // On mount: check permission state without triggering a browser prompt yet
  useEffect(() => {
    if (!navigator?.permissions) {
      // Browser doesn't support Permissions API — just try requesting directly
      requestLocation();
      return;
    }
    navigator.permissions.query({ name: "geolocation" }).then((result) => {
      if (result.state === "granted") {
        requestLocation(); // silent, no dialog
      } else if (result.state === "prompt") {
        setLocationState("prompt"); // show our banner first
      } else {
        setLocationState("denied");
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Data fetchers ─────────────────────────────────────────────────────────

  const fetchByCategory = useCallback(async (cat: string) => {
    setLoading(true);
    setError("");
    try {
      if (cat === "All") {
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

  const fetchNearby = useCallback((lat: number, lng: number, r: number) => {
    setLoading(true);
    setError("");
    userApi
      .findNearby(lat, lng, r)
      .then((res) => setNearbyProviders(res.data))
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load nearby providers")
      )
      .finally(() => setLoading(false));
  }, []);

  // ── Trigger fetches ───────────────────────────────────────────────────────

  useEffect(() => {
    if (mode === "category") fetchByCategory(category);
  }, [mode, category, fetchByCategory]);

  useEffect(() => {
    if (mode !== "nearby") return;
    // If user just switched to Nearby and permission hasn't been asked, ask now
    if (locationState === "prompt") {
      requestLocation();
      return;
    }
    if (locationState === "granted" && coords) {
      fetchNearby(coords.lat, coords.lng, radius);
    }
  }, [mode, locationState, coords, radius, fetchNearby, requestLocation]);

  // ── Map picker confirm ────────────────────────────────────────────────────

  const confirmMapLocation = () => {
    setCoords(mapCoords);
    setLocationState("granted");
    setShowMapPicker(false);
    fetchNearby(mapCoords.lat, mapCoords.lng, radius);
  };

  // ── Filters ───────────────────────────────────────────────────────────────

  const filteredNearby = nearbyProviders.filter(
    (p) => minRating === 0 || (p.rating ?? 0) >= minRating
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="user" />
      <main className="flex-1 overflow-y-auto">

        {/* ── Top bar ───────────────────────────────────────────────────────── */}
        <div className="sticky top-0 bg-background border-b border-border px-8 py-4 flex items-center justify-between z-10">
          <h1 className="text-xl font-bold text-foreground">Find Providers</h1>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex gap-1 bg-muted p-1 rounded-xl">
              <button
                onClick={() => setMode("category")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  mode === "category"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                By Category
              </button>
              <button
                onClick={() => setMode("nearby")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1",
                  mode === "nearby"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
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

          {/* ── Sidebar filters ───────────────────────────────────────────── */}
          <aside className={cn("w-64 shrink-0 hidden md:block", filtersOpen && "block")}>
            <div className="bg-card rounded-2xl border border-border p-5 sticky top-24 flex flex-col gap-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </div>

              {/* Mode toggle (mobile) */}
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

              {/* Category filter */}
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

              {/* Radius filter */}
              {mode === "nearby" && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Search Radius</p>
                  <input
                    type="range" min={1} max={20} step={1} value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1 km</span>
                    <span className="font-medium text-foreground">{radius} km</span>
                    <span>20 km</span>
                  </div>
                  {/* Quick chips */}
                  <div className="flex gap-1.5 mt-2">
                    {[3, 5, 10].map((r) => (
                      <button
                        key={r}
                        onClick={() => setRadius(r)}
                        className={cn(
                          "flex-1 py-1 rounded-lg text-xs font-medium border transition-colors",
                          radius === r
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {r} km
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating filter */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Min. Rating</p>
                <div className="flex flex-col gap-1.5">
                  {[0, ...RATINGS].map((r) => (
                    <label key={r} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input
                        type="radio" name="rating"
                        checked={minRating === r}
                        onChange={() => setMinRating(r)}
                        className="accent-primary"
                      />
                      {r === 0 ? "Any rating" : `${r}+ stars`}
                    </label>
                  ))}
                </div>
              </div>

              {/* Active location info + change */}
              {mode === "nearby" && locationState === "granted" && coords && (
                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium mb-1">
                    <LocateFixed className="w-3.5 h-3.5 text-green-600" />
                    Location active
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono mb-2">
                    {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </p>
                  <button
                    onClick={() => setShowMapPicker(true)}
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <Map className="w-3 h-3" /> Change location manually
                  </button>
                </div>
              )}

              <button
                onClick={() => { setCategory("All"); setMinRating(0); setRadius(5); }}
                className="text-xs text-primary font-medium hover:underline text-left"
              >
                Clear all filters
              </button>
            </div>
          </aside>

          {/* ── Main results area ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            {/* ── Location banners (only when in Nearby mode) ─────────────── */}

            {/* State: detecting */}
            {mode === "nearby" && locationState === "detecting" && (
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 mb-5">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                <p className="text-sm text-blue-700 font-medium">Detecting your location…</p>
              </div>
            )}

            {/* State: prompt — we haven't asked yet, show a friendly CTA */}
            {mode === "nearby" && locationState === "prompt" && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-5 mb-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Navigation className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-900">Allow location access</p>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      To show providers near you, we need your location. Click{" "}
                      <strong>Enable Location</strong> and allow access when your browser asks.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button
                        onClick={requestLocation}
                        className="flex items-center gap-2 bg-amber-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-amber-700 transition-colors"
                      >
                        <LocateFixed className="w-3.5 h-3.5" />
                        Enable Location
                      </button>
                      <button
                        onClick={() => { setShowMapPicker(true); setLocationState("denied"); }}
                        className="flex items-center gap-2 bg-white border border-amber-300 text-amber-800 text-xs font-medium px-4 py-2 rounded-xl hover:bg-amber-50 transition-colors"
                      >
                        <Map className="w-3.5 h-3.5" />
                        Pick on Map Instead
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* State: denied — show instructions + map fallback */}
            {mode === "nearby" && locationState === "denied" && !showMapPicker && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-5 mb-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900">Location access is blocked</p>
                    <p className="text-xs text-red-700 mt-1 leading-relaxed">
                      Your browser is blocking location access. To re-enable it:
                    </p>
                    <ol className="text-xs text-red-700 mt-2 ml-3 list-decimal space-y-1">
                      <li>Click the <strong>🔒 lock icon</strong> in the address bar</li>
                      <li>Set <strong>Location</strong> to <strong>Allow</strong></li>
                      <li>Reload the page and try again</li>
                    </ol>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        onClick={requestLocation}
                        className="flex items-center gap-2 bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
                      >
                        <LocateFixed className="w-3.5 h-3.5" />
                        Try Again
                      </button>
                      <button
                        onClick={() => setShowMapPicker(true)}
                        className="flex items-center gap-2 bg-white border border-red-300 text-red-800 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-red-50 transition-colors"
                      >
                        <Map className="w-3.5 h-3.5" />
                        Search by Map
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Map picker ──────────────────────────────────────────────── */}
            {mode === "nearby" && showMapPicker && (
              <div className="bg-card border border-border rounded-2xl overflow-hidden mb-5">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Map className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold text-foreground">
                      Pin your search location
                    </p>
                  </div>
                  <button
                    onClick={() => setShowMapPicker(false)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-3">
                    Search for an area or click anywhere on the map, then press{" "}
                    <strong>Use This Location</strong>.
                  </p>
                  <MapPicker
                    latitude={mapCoords.lat}
                    longitude={mapCoords.lng}
                    onChange={(lat, lng) => setMapCoords({ lat, lng })}
                  />
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-muted-foreground font-mono">
                      📍 {mapCoords.lat.toFixed(5)}, {mapCoords.lng.toFixed(5)}
                    </p>
                    <button
                      onClick={confirmMapLocation}
                      className="bg-primary text-primary-foreground text-sm font-medium px-5 py-2 rounded-xl hover:opacity-90 transition-opacity"
                    >
                      Use This Location
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Loading spinner ──────────────────────────────────────────── */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="text-sm">Loading providers…</p>
              </div>
            )}

            {/* ── Category results ─────────────────────────────────────────── */}
            {!loading && mode === "category" && (
              <>
                <p className="text-sm text-muted-foreground mb-5">
                  Showing{" "}
                  <span className="font-semibold text-foreground">{services.length}</span>{" "}
                  services
                </p>
                {services.length === 0 ? (
                  <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <p className="text-muted-foreground">No services found for this category.</p>
                    <button onClick={() => fetchByCategory(category)} className="mt-3 text-sm text-primary hover:underline">
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {services.map((s) => <ServiceCard key={s.id} service={s} />)}
                  </div>
                )}
              </>
            )}

            {/* ── Nearby results (only when location is granted) ──────────── */}
            {!loading && mode === "nearby" && locationState === "granted" && (
              <>
                <p className="text-sm text-muted-foreground mb-5">
                  Showing{" "}
                  <span className="font-semibold text-foreground">{filteredNearby.length}</span>{" "}
                  providers within{" "}
                  <span className="font-semibold text-foreground">{radius} km</span>
                </p>
                {filteredNearby.length === 0 ? (
                  <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <p className="text-muted-foreground">No providers found nearby. Try increasing the radius.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredNearby.map((p) => <NearbyCard key={p.id} provider={p} />)}
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

// ─── Cards ────────────────────────────────────────────────────────────────────

function ServiceCard({ service }: { service: ProviderServiceResponse }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-5 flex flex-col gap-4">
      <div>
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
          {service.categoryName.replace(/_/g, " ")}
        </span>
        <h3 className="font-semibold text-foreground mt-2 text-sm">
          {service.serviceName || service.categoryName.replace(/_/g, " ")}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">by {service.providerName}</p>
      </div>
      <div className="flex items-center justify-between text-sm border-t border-border pt-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-foreground">₹{service.price}</span>
          <span className="text-xs text-muted-foreground">{service.durationMinutes} min</span>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/provider/${service.providerId}`}
            className="border border-border text-foreground text-xs font-medium px-3 py-2 rounded-xl hover:bg-muted transition-colors"
          >
            Profile
          </Link>
          <Link
            href={`/booking?providerId=${service.providerId}&service=${service.id}&category=${service.categoryName}`}
            className="bg-primary text-primary-foreground text-xs font-medium px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            Book Now
          </Link>
        </div>
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
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-semibold text-foreground text-sm truncate">{provider.name}</p>
            {provider.verified && (
              <>
                <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-xs text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded-full">Verified</span>
              </>
            )}
          </div>
          {provider.serviceArea && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground truncate">{provider.serviceArea}</span>
            </div>
          )}
          {(provider as ProviderResponse & { shopName?: string }).shopName && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              🏪 {(provider as ProviderResponse & { shopName?: string }).shopName}
            </p>
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
        <div className="flex gap-2">
          <Link
            href={`/provider/${provider.id}`}
            className="border border-border text-foreground text-xs font-medium px-3 py-2 rounded-xl hover:bg-muted transition-colors"
          >
            Profile
          </Link>
          <Link
            href={`/booking?providerId=${provider.id}`}
            className="bg-primary text-primary-foreground text-xs font-medium px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { userApi, categoryApi, ProviderServiceResponse, ProviderResponse, ServiceCategoryResponse } from "@/lib/api";
import {
  Zap, Droplets, Hammer, Paintbrush, Wind, Wrench, Sparkles, Settings2,
  Filter, SlidersHorizontal, MapPin, Star, BadgeCheck, Loader2, AlertCircle,
  Navigation, LocateFixed, Map, ChevronRight, ChevronLeft, Search, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

// ─── Category icon + color meta ───────────────────────────────────────────────
const CATEGORY_META: Record<string, { icon: React.ElementType; color: string; bg: string; border: string; description: string }> = {
  ELECTRICIAN:      { icon: Zap,        color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", description: "Wiring, fans, switches & more" },
  PLUMBER:          { icon: Droplets,   color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200",   description: "Taps, pipes, leakages & more" },
  CARPENTER:        { icon: Hammer,     color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", description: "Furniture, doors & woodwork" },
  PAINTER:          { icon: Paintbrush, color: "text-pink-600",   bg: "bg-pink-50",   border: "border-pink-200",   description: "Interior & exterior painting" },
  AC_TECHNICIAN:    { icon: Wind,       color: "text-cyan-600",   bg: "bg-cyan-50",   border: "border-cyan-200",   description: "AC service, gas refill & more" },
  APPLIANCE_REPAIR: { icon: Wrench,     color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", description: "Washing machine, fridge & more" },
  CLEANER:          { icon: Sparkles,   color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200",  description: "Deep cleaning, sanitization" },
  OTHER:            { icon: Settings2,  color: "text-slate-600",  bg: "bg-slate-50",  border: "border-slate-200",  description: "Other home services" },
};

const RATINGS = [4.5, 4.0, 3.5];
type LocationState = "detecting" | "granted" | "prompt" | "denied";
type SearchMode = "category" | "nearby";
type CategoryStep = "categories" | "providers" | "services";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [mode, setMode]               = useState<SearchMode>("category");
  const [minRating, setMinRating]     = useState(0);
  const [radius, setRadius]           = useState(5);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQ, setSearchQ]         = useState("");

  // 3-step category flow
  const [step, setStep]                         = useState<CategoryStep>(initialCategory ? "providers" : "categories");
  const [categories, setCategories]             = useState<ServiceCategoryResponse[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryResponse | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ProviderResponse | null>(null);

  const [providersByCategory, setProvidersByCategory] = useState<ProviderResponse[]>([]);
  const [servicesByProvider, setServicesByProvider]   = useState<ProviderServiceResponse[]>([]);
  const [nearbyProviders, setNearbyProviders]         = useState<ProviderResponse[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // Location
  const [locationState, setLocationState] = useState<LocationState>("detecting");
  const [coords, setCoords]               = useState<{ lat: number; lng: number } | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapCoords, setMapCoords]         = useState({ lat: 19.076, lng: 72.877 });

  // ── Load categories ───────────────────────────────────────────────────────
  useEffect(() => {
    categoryApi.getAll()
      .then((res) => {
        setCategories(res.data);
        if (initialCategory) {
          const found = res.data.find((c) => c.name === initialCategory);
          if (found) { setSelectedCategory(found); setStep("providers"); loadProvidersForCategory(initialCategory); }
        }
      })
      .catch(() => {
        const fallback = Object.keys(CATEGORY_META).map((name, i) => ({ id: String(i), name }));
        setCategories(fallback);
        if (initialCategory) {
          const found = fallback.find((c) => c.name === initialCategory);
          if (found) { setSelectedCategory(found); setStep("providers"); loadProvidersForCategory(initialCategory); }
        }
      });
  }, []); // eslint-disable-line

  // ── GPS ───────────────────────────────────────────────────────────────────
  const requestLocation = useCallback(() => {
    if (!navigator?.geolocation) { setLocationState("denied"); return; }
    setLocationState("detecting");
    navigator.geolocation.getCurrentPosition(
      (pos) => { const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setCoords(c); setMapCoords(c); setLocationState("granted"); },
      () => setLocationState("denied"),
      { timeout: 10_000, maximumAge: 300_000 }
    );
  }, []);

  useEffect(() => {
    if (!navigator?.permissions) { requestLocation(); return; }
    navigator.permissions.query({ name: "geolocation" }).then((r) => {
      if (r.state === "granted") requestLocation();
      else if (r.state === "prompt") setLocationState("prompt");
      else setLocationState("denied");
    });
  }, []); // eslint-disable-line

  // ── Data loaders ──────────────────────────────────────────────────────────
  const loadProvidersForCategory = useCallback(async (catName: string) => {
    setLoading(true); setError("");
    try {
      const res = await userApi.searchByCategory(catName);
      const seen = new Set<string>();
      const providers: ProviderResponse[] = [];
      for (const svc of res.data) {
        if (!seen.has(svc.providerId)) {
          seen.add(svc.providerId);
          providers.push({
            id: svc.providerId,
            userId: svc.providerId,
            name: svc.providerName,
            email: "",
            phone: "",
            categoryId: svc.categoryId,
            categoryName: svc.categoryName,
            verified: true,
          });
        }
      }
      setProvidersByCategory(providers);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load providers");
    } finally { setLoading(false); }
  }, []);

  const loadServicesForProvider = useCallback(async (providerId: string, catName: string) => {
    setLoading(true); setError("");
    try {
      const res = await userApi.searchByCategory(catName);
      setServicesByProvider((res.data || []).filter((s) => s.providerId === providerId));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load services");
    } finally { setLoading(false); }
  }, []);

  const fetchNearby = useCallback((lat: number, lng: number, r: number) => {
    setLoading(true); setError("");
    userApi.findNearby(lat, lng, r)
      .then((res) => setNearbyProviders(res.data))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load nearby"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (mode !== "nearby") return;
    if (locationState === "prompt") { requestLocation(); return; }
    if (locationState === "granted" && coords) fetchNearby(coords.lat, coords.lng, radius);
  }, [mode, locationState, coords, radius, fetchNearby, requestLocation]);

  // ── Step handlers ─────────────────────────────────────────────────────────
  const handleSelectCategory = (cat: ServiceCategoryResponse) => {
    setSelectedCategory(cat);
    setStep("providers");
    loadProvidersForCategory(cat.name);
  };

  const handleSelectProvider = (provider: ProviderResponse) => {
    setSelectedProvider(provider);
    setStep("services");
    loadServicesForProvider(provider.id, provider.categoryName);
  };

  const goBack = () => {
    if (step === "services") { setStep("providers"); setSelectedProvider(null); }
    else if (step === "providers") { setStep("categories"); setSelectedCategory(null); setProvidersByCategory([]); }
  };

  const confirmMapLocation = () => {
    setCoords(mapCoords); setLocationState("granted"); setShowMapPicker(false);
    fetchNearby(mapCoords.lat, mapCoords.lng, radius);
  };

  const filteredNearby = nearbyProviders.filter(
    (p) => (minRating === 0 || (p.rating ?? 0) >= minRating) &&
      (!searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase()))
  );
  const filteredProviders = providersByCategory.filter(
    (p) => (minRating === 0 || (p.rating ?? 0) >= minRating) &&
      (!searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase()))
  );

  const Breadcrumb = () => (
    <div className="flex items-center gap-1.5 text-xs mb-5" style={{ color: "#90A4AE" }}>
      <button onClick={() => { setStep("categories"); setSelectedCategory(null); setSelectedProvider(null); }}
        className="hover:underline font-medium" style={{ color: "#00897B" }}>
        All Services
      </button>
      {selectedCategory && <>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => step === "services" && setStep("providers") && setSelectedProvider(null)}
          className={cn("font-medium", step === "services" ? "hover:underline" : "")}
          style={{ color: step === "services" ? "#607D7B" : "#00897B" }}>
          {selectedCategory.name.replace(/_/g, " ")}
        </button>
      </>}
      {selectedProvider && <>
        <ChevronRight className="w-3 h-3" />
        <span style={{ color: "#00897B" }}>{selectedProvider.name}</span>
      </>}
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F7FAFA" }}>
      <Sidebar role="user" />
      <main className="flex-1 overflow-y-auto">

        {/* Top bar */}
        <div className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between gap-4"
          style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E0F2F1" }}>
          <div className="flex items-center gap-3">
            {(step !== "categories" && mode === "category") && (
              <button onClick={goBack}
                className="w-8 h-8 flex items-center justify-center rounded-xl border transition-colors"
                style={{ borderColor: "#B2DFDB", backgroundColor: "#E0F2F1" }}>
                <ChevronLeft className="w-4 h-4" style={{ color: "#00897B" }} />
              </button>
            )}
            <div>
              <h1 className="text-lg font-bold" style={{ color: "#1A2E2B" }}>
                {mode === "nearby" ? "Providers Near You" :
                 step === "categories" ? "What service do you need?" :
                 step === "providers" ? `${selectedCategory?.name.replace(/_/g, " ")} Providers` :
                 `${selectedProvider?.name} — Services`}
              </h1>
              {step === "categories" && mode === "category" && (
                <p className="text-xs" style={{ color: "#607D7B" }}>Select a category to find the right expert</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex gap-1 p-1 rounded-xl" style={{ backgroundColor: "#E0F2F1" }}>
              {(["category", "nearby"] as SearchMode[]).map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                  style={mode === m
                    ? { backgroundColor: "#00897B", color: "#FFFFFF" }
                    : { color: "#00897B" }}>
                  {m === "nearby" && <MapPin className="w-3 h-3" />}
                  {m === "category" ? "By Category" : "Near Me"}
                </button>
              ))}
            </div>
            {(mode === "nearby" || step === "providers") && (
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#90A4AE" }} />
                <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Search…"
                  className="pl-8 pr-8 py-2 text-xs rounded-xl outline-none w-44"
                  style={{ backgroundColor: "#F7FAFA", border: "1px solid #B2DFDB", color: "#1A2E2B" }} />
                {searchQ && (
                  <button onClick={() => setSearchQ("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    <X className="w-3 h-3" style={{ color: "#90A4AE" }} />
                  </button>
                )}
              </div>
            )}
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border md:hidden"
              style={{ borderColor: "#B2DFDB", color: "#00897B" }}>
              <Filter className="w-3.5 h-3.5" /> Filters
            </button>
          </div>
        </div>

        <div className="flex gap-6 p-6">

          {/* Sidebar filters */}
          <aside className={cn("w-56 shrink-0 hidden md:block", filtersOpen && "block")}>
            <div className="rounded-2xl border p-5 sticky top-24 flex flex-col gap-5"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2F1" }}>
              <div className="flex items-center gap-2 text-sm font-bold" style={{ color: "#1A2E2B" }}>
                <SlidersHorizontal className="w-4 h-4" style={{ color: "#00897B" }} /> Filters
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2.5" style={{ color: "#90A4AE" }}>Min. Rating</p>
                <div className="flex flex-col gap-2">
                  {[0, ...RATINGS].map((r) => (
                    <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                      <div onClick={() => setMinRating(r)}
                        className="w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer"
                        style={{ borderColor: minRating === r ? "#00897B" : "#B2DFDB" }}>
                        {minRating === r && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#00897B" }} />}
                      </div>
                      <span style={{ color: "#1A2E2B" }}>{r === 0 ? "Any rating" : `${r}+ ⭐`}</span>
                    </label>
                  ))}
                </div>
              </div>

              {mode === "nearby" && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-2.5" style={{ color: "#90A4AE" }}>Radius</p>
                  <input type="range" min={1} max={20} value={radius} onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full" style={{ accentColor: "#00897B" }} />
                  <div className="flex justify-between text-xs mt-1" style={{ color: "#607D7B" }}>
                    <span>1 km</span>
                    <span className="font-bold" style={{ color: "#00897B" }}>{radius} km</span>
                    <span>20 km</span>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {[3, 5, 10].map((r) => (
                      <button key={r} onClick={() => setRadius(r)}
                        className="flex-1 py-1.5 rounded-xl text-xs font-bold border transition-colors"
                        style={radius === r
                          ? { backgroundColor: "#00897B", color: "#FFF", borderColor: "#00897B" }
                          : { borderColor: "#B2DFDB", color: "#00897B" }}>
                        {r}km
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mode === "nearby" && locationState === "granted" && coords && (
                <div className="border-t pt-4" style={{ borderColor: "#E0F2F1" }}>
                  <p className="text-[11px] font-bold flex items-center gap-1 mb-1" style={{ color: "#00897B" }}>
                    <LocateFixed className="w-3.5 h-3.5" /> Location active
                  </p>
                  <p className="text-[10px] font-mono mb-2" style={{ color: "#90A4AE" }}>
                    {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                  </p>
                  <button onClick={() => setShowMapPicker(true)} className="flex items-center gap-1 text-xs font-semibold"
                    style={{ color: "#00897B" }}>
                    <Map className="w-3 h-3" /> Change location
                  </button>
                </div>
              )}

              <button onClick={() => { setMinRating(0); setRadius(5); setSearchQ(""); }}
                className="text-xs font-bold" style={{ color: "#00897B" }}>
                Clear all
              </button>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {error && (
              <div className="flex items-center gap-2 text-sm rounded-2xl px-4 py-3 mb-5"
                style={{ color: "#C62828", backgroundColor: "#FFEBEE", border: "1px solid #FFCDD2" }}>
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            {/* Nearby banners */}
            {mode === "nearby" && locationState === "detecting" && (
              <div className="flex items-center gap-3 rounded-2xl px-5 py-4 mb-5"
                style={{ backgroundColor: "#E0F2F1", border: "1px solid #B2DFDB" }}>
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#00897B" }} />
                <p className="text-sm font-medium" style={{ color: "#004D40" }}>Detecting your location…</p>
              </div>
            )}

            {mode === "nearby" && locationState === "prompt" && (
              <div className="rounded-2xl px-5 py-5 mb-5" style={{ backgroundColor: "#FFF8E1", border: "1px solid #FFE082" }}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#FFE082" }}>
                    <Navigation className="w-4 h-4" style={{ color: "#F57F17" }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#1A2E2B" }}>Allow location access</p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: "#5D4037" }}>Share your location to find providers near you</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={requestLocation}
                        className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl text-white"
                        style={{ backgroundColor: "#FF8F00" }}>
                        <LocateFixed className="w-3.5 h-3.5" /> Enable Location
                      </button>
                      <button onClick={() => { setShowMapPicker(true); setLocationState("denied"); }}
                        className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl border bg-white"
                        style={{ borderColor: "#FFE082", color: "#5D4037" }}>
                        <Map className="w-3.5 h-3.5" /> Pick on Map
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {mode === "nearby" && locationState === "denied" && !showMapPicker && (
              <div className="rounded-2xl px-5 py-5 mb-5" style={{ backgroundColor: "#FFEBEE", border: "1px solid #FFCDD2" }}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#1A2E2B" }}>Location blocked</p>
                    <p className="text-xs mt-1" style={{ color: "#C62828" }}>Enable location in browser settings or pick location on map.</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={requestLocation}
                        className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl text-white bg-red-600">
                        <LocateFixed className="w-3.5 h-3.5" /> Try Again
                      </button>
                      <button onClick={() => setShowMapPicker(true)}
                        className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl border bg-white text-red-700"
                        style={{ borderColor: "#FFCDD2" }}>
                        <Map className="w-3.5 h-3.5" /> Search by Map
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {mode === "nearby" && showMapPicker && (
              <div className="rounded-2xl overflow-hidden mb-5 border" style={{ backgroundColor: "#FFF", borderColor: "#E0F2F1" }}>
                <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "#E0F2F1" }}>
                  <p className="text-sm font-bold" style={{ color: "#1A2E2B" }}>📍 Pin your search location</p>
                  <button onClick={() => setShowMapPicker(false)} className="text-xs" style={{ color: "#607D7B" }}>Cancel</button>
                </div>
                <div className="p-4">
                  <MapPicker latitude={mapCoords.lat} longitude={mapCoords.lng}
                    onChange={(lat, lng) => setMapCoords({ lat, lng })} />
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xs font-mono" style={{ color: "#607D7B" }}>
                      {mapCoords.lat.toFixed(4)}, {mapCoords.lng.toFixed(4)}
                    </p>
                    <button onClick={confirmMapLocation}
                      className="text-sm font-bold px-5 py-2 rounded-xl text-white"
                      style={{ backgroundColor: "#00897B" }}>
                      Use This Location
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading spinner */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
                  style={{ borderColor: "#E0F2F1", borderTopColor: "#00897B" }} />
                <p className="text-sm font-medium" style={{ color: "#607D7B" }}>Loading…</p>
              </div>
            )}

            {/* ══ CATEGORY MODE ══════════════════════════════════════════════ */}
            {mode === "category" && !loading && (
              <>

                {/* STEP 1 — Categories */}
                {step === "categories" && (
                  <div>
                    <p className="text-sm mb-5" style={{ color: "#607D7B" }}>
                      <span className="font-bold" style={{ color: "#1A2E2B" }}>{categories.length}</span> service categories
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                      {categories.map((cat) => {
                        const meta = CATEGORY_META[cat.name] ?? CATEGORY_META.OTHER;
                        const Icon = meta.icon;
                        return (
                          <button key={cat.id} onClick={() => handleSelectCategory(cat)}
                            className={cn("rounded-2xl border-2 p-5 text-left flex flex-col gap-3 hover:shadow-lg transition-all group", meta.bg, meta.border)}>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm">
                              <Icon className={cn("w-6 h-6", meta.color)} />
                            </div>
                            <div>
                              <p className="font-bold text-sm" style={{ color: "#1A2E2B" }}>
                                {cat.name.replace(/_/g, " ")}
                              </p>
                              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#607D7B" }}>
                                {meta.description}
                              </p>
                            </div>
                            <span className={cn("text-xs font-bold flex items-center gap-1", meta.color)}>
                              Find Providers <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 2 — Providers */}
                {step === "providers" && (
                  <div>
                    <Breadcrumb />
                    {filteredProviders.length === 0 ? (
                      <div className="rounded-2xl border p-12 text-center" style={{ backgroundColor: "#FFF", borderColor: "#E0F2F1" }}>
                        <p className="text-sm" style={{ color: "#607D7B" }}>No providers found for this category.</p>
                        <button onClick={() => { setStep("categories"); setSelectedCategory(null); }}
                          className="mt-3 text-sm font-bold hover:underline" style={{ color: "#00897B" }}>
                          ← Back to categories
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm mb-5" style={{ color: "#607D7B" }}>
                          <span className="font-bold" style={{ color: "#1A2E2B" }}>{filteredProviders.length}</span> providers ·
                          <span className="font-bold" style={{ color: "#1A2E2B" }}> {selectedCategory?.name.replace(/_/g, " ")}</span>
                          <span className="ml-2 text-xs" style={{ color: "#00897B" }}>— Click a provider to see their services</span>
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                          {filteredProviders.map((p) => (
                            <ProviderCard key={p.id} provider={p} onSelect={() => handleSelectProvider(p)} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* STEP 3 — Services */}
                {step === "services" && (
                  <div>
                    <Breadcrumb />
                    {/* Provider summary strip */}
                    <div className="rounded-2xl border p-4 mb-5 flex items-center gap-4"
                      style={{ backgroundColor: "#E0F2F1", borderColor: "#B2DFDB" }}>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                        style={{ backgroundColor: "#00897B" }}>
                        {selectedProvider?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold" style={{ color: "#1A2E2B" }}>{selectedProvider?.name}</p>
                          {selectedProvider?.verified && (
                            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: "#00897B" }}>
                              <BadgeCheck className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>
                        {selectedProvider?.serviceArea && (
                          <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "#607D7B" }}>
                            <MapPin className="w-3 h-3" /> {selectedProvider.serviceArea}
                          </p>
                        )}
                      </div>
                      <Link href={`/provider/${selectedProvider?.id}`}
                        className="text-xs font-bold px-3 py-2 rounded-xl border bg-white transition-colors hover:bg-[#F7FAFA]"
                        style={{ borderColor: "#00897B", color: "#00897B" }}>
                        Full Profile
                      </Link>
                    </div>

                    {servicesByProvider.length === 0 ? (
                      <div className="rounded-2xl border p-12 text-center" style={{ backgroundColor: "#FFF", borderColor: "#E0F2F1" }}>
                        <p className="text-sm" style={{ color: "#607D7B" }}>No services listed by this provider yet.</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm mb-4" style={{ color: "#607D7B" }}>
                          <span className="font-bold" style={{ color: "#1A2E2B" }}>{servicesByProvider.length}</span> services available
                        </p>
                        <div className="flex flex-col gap-3">
                          {servicesByProvider.map((svc) => <ServiceRow key={svc.id} service={svc} />)}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ══ NEARBY MODE ════════════════════════════════════════════════ */}
            {mode === "nearby" && !loading && locationState === "granted" && (
              <>
                <p className="text-sm mb-5" style={{ color: "#607D7B" }}>
                  <span className="font-bold" style={{ color: "#1A2E2B" }}>{filteredNearby.length}</span> providers within{" "}
                  <span className="font-bold" style={{ color: "#1A2E2B" }}>{radius} km</span>
                </p>
                {filteredNearby.length === 0 ? (
                  <div className="rounded-2xl border p-12 text-center" style={{ backgroundColor: "#FFF", borderColor: "#E0F2F1" }}>
                    <p style={{ color: "#607D7B" }}>No providers nearby. Try a larger radius.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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

// ─── Provider Card (step 2) ───────────────────────────────────────────────────
function ProviderCard({ provider, onSelect }: { provider: ProviderResponse; onSelect: () => void }) {
  return (
    <button onClick={onSelect} className="rounded-2xl border p-5 flex flex-col gap-4 hover:shadow-lg transition-all group text-left"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2F1" }}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
          style={{ backgroundColor: "#00897B" }}>
          {provider.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-bold text-sm truncate" style={{ color: "#1A2E2B" }}>{provider.name}</p>
            {provider.verified && <BadgeCheck className="w-3.5 h-3.5 shrink-0" style={{ color: "#00897B" }} />}
          </div>
          {provider.serviceArea && (
            <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "#607D7B" }}>
              <MapPin className="w-3 h-3" /> {provider.serviceArea}
            </p>
          )}
        </div>
      </div>
      {provider.rating && provider.rating > 0 ? (
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-bold" style={{ color: "#1A2E2B" }}>{provider.rating.toFixed(1)}</span>
          {provider.totalReviews !== undefined && (
            <span className="text-xs" style={{ color: "#607D7B" }}>({provider.totalReviews} reviews)</span>
          )}
        </div>
      ) : (
        <span className="text-xs px-2 py-0.5 rounded-full font-bold inline-block"
          style={{ backgroundColor: "#E0F2F1", color: "#00897B" }}>New Provider</span>
      )}
      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "#F0FAFA" }}>
        <span className="text-xs" style={{ color: "#90A4AE" }}>Tap to view services</span>
        <span className="flex items-center gap-1 text-xs font-bold group-hover:gap-1.5 transition-all"
          style={{ color: "#00897B" }}>
          View Services <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
}

// ─── Service Row (step 3) ─────────────────────────────────────────────────────
function ServiceRow({ service }: { service: ProviderServiceResponse }) {
  return (
    <div className="rounded-2xl border p-5 flex items-center justify-between gap-4"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2F1" }}>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm" style={{ color: "#1A2E2B" }}>
          {service.serviceName || service.categoryName.replace(/_/g, " ")}
        </p>
        {service.description && (
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "#607D7B" }}>{service.description}</p>
        )}
        <p className="text-xs mt-1.5" style={{ color: "#90A4AE" }}>⏱ {service.durationMinutes} min</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <p className="font-bold text-lg" style={{ color: "#1A2E2B" }}>₹{service.price}</p>
        <Link href={`/booking?providerId=${service.providerId}&service=${service.id}&category=${service.categoryName}`}
          className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#00897B" }}>
          Book Now
        </Link>
      </div>
    </div>
  );
}

// ─── Nearby Provider Card ─────────────────────────────────────────────────────
function NearbyCard({ provider }: { provider: ProviderResponse }) {
  return (
    <div className="rounded-2xl border p-5 flex flex-col gap-4" style={{ backgroundColor: "#FFFFFF", borderColor: "#E0F2F1" }}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
          style={{ backgroundColor: "#00897B" }}>
          {provider.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-bold text-sm truncate" style={{ color: "#1A2E2B" }}>{provider.name}</p>
            {provider.verified && <BadgeCheck className="w-3.5 h-3.5 shrink-0" style={{ color: "#00897B" }} />}
          </div>
          {provider.serviceArea && (
            <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "#607D7B" }}>
              <MapPin className="w-3 h-3" /> {provider.serviceArea}
            </p>
          )}
          <span className="text-xs px-2 py-0.5 rounded-full font-bold inline-block mt-1"
            style={{ backgroundColor: "#E0F2F1", color: "#00897B" }}>
            {provider.categoryName?.replace(/_/g, " ")}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: "#E0F2F1" }}>
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-bold" style={{ color: "#1A2E2B" }}>
            {provider.rating ? provider.rating.toFixed(1) : "New"}
          </span>
          {provider.totalReviews !== undefined && (
            <span className="text-xs" style={{ color: "#607D7B" }}>({provider.totalReviews})</span>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/provider/${provider.id}`}
            className="text-xs font-bold px-3 py-2 rounded-xl border transition-colors"
            style={{ borderColor: "#B2DFDB", color: "#00897B" }}>
            Profile
          </Link>
          <Link href={`/booking?providerId=${provider.id}`}
            className="text-xs font-bold px-4 py-2 rounded-xl text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#00897B" }}>
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}

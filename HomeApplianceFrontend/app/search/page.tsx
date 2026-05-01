"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import ProviderCard from "@/components/provider-card";
import { providers } from "@/lib/mock-data";
import { Filter, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const RATINGS = [4.9, 4.5, 4.0, 3.5];

export default function SearchPage() {
  const [category, setCategory] = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = providers.filter((p) => {
    if (category !== "All" && p.category !== category) return false;
    if (p.rating < minRating) return false;
    if (nearbyOnly && parseFloat(p.distance) > 2.5) return false;
    return true;
  });

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="user" />
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="sticky top-0 bg-background border-b border-border px-8 py-4 flex items-center justify-between z-10">
          <h1 className="text-xl font-bold text-foreground">Find Providers</h1>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 text-sm border border-border px-4 py-2 rounded-xl hover:bg-muted transition-colors md:hidden"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="flex gap-6 p-8">
          {/* Sidebar Filters */}
          <aside className={cn("w-64 shrink-0 hidden md:block", filtersOpen && "block")}>
            <div className="bg-card rounded-2xl border border-border p-5 sticky top-24 flex flex-col gap-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </div>

              {/* Category */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Service Category</p>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="All">All Categories</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Price Range</p>
                <input type="range" min={100} max={1000} step={50} defaultValue={600} className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>₹100</span><span>₹1000</span>
                </div>
              </div>

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

              {/* Distance */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Distance</p>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nearbyOnly}
                    onChange={(e) => setNearbyOnly(e.target.checked)}
                    className="accent-primary rounded"
                  />
                  Within 2.5 km only
                </label>
              </div>

              <button
                onClick={() => { setCategory("All"); setMinRating(0); setNearbyOnly(false); }}
                className="text-xs text-primary font-medium hover:underline text-left"
              >
                Clear all filters
              </button>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-5">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> providers
            </p>
            {filtered.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border p-12 text-center">
                <p className="text-muted-foreground">No providers match your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((p) => (
                  <ProviderCard key={p.id} provider={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

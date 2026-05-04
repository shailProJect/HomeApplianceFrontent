"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap, Droplets, Hammer, Paintbrush, Wind, Wrench,
  Search, MapPin, ChevronRight, Star, Shield, Clock, BadgeCheck
} from "lucide-react";
import Navbar from "@/components/navbar";
import { userApi, ProviderResponse } from "@/lib/api";

const categories = [
  {
    icon: Zap,
    title: "Electrician",
    apiKey: "ELECTRICIAN",
    description: "Fan installation, wiring fixes, switch repairs & more.",
    color: "bg-yellow-50 text-yellow-600",
    iconBg: "bg-yellow-100",
  },
  {
    icon: Droplets,
    title: "Plumber",
    apiKey: "PLUMBER",
    description: "Tap repairs, pipe leakages, toilet fixes & more.",
    color: "bg-blue-50 text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    icon: Hammer,
    title: "Carpenter",
    apiKey: "CARPENTER",
    description: "Furniture assembly, door repairs, custom woodwork & more.",
    color: "bg-orange-50 text-orange-600",
    iconBg: "bg-orange-100",
  },
  {
    icon: Paintbrush,
    title: "Painter",
    apiKey: "PAINTER",
    description: "Interior & exterior painting, texture work & more.",
    color: "bg-pink-50 text-pink-600",
    iconBg: "bg-pink-100",
  },
  {
    icon: Wind,
    title: "AC Technician",
    apiKey: "AC_TECHNICIAN",
    description: "AC installation, servicing, gas refilling & more.",
    color: "bg-cyan-50 text-cyan-600",
    iconBg: "bg-cyan-100",
  },
  {
    icon: Wrench,
    title: "Appliance Repair",
    apiKey: "APPLIANCE_REPAIR",
    description: "Washing machine, fridge, microwave repairs & more.",
    color: "bg-purple-50 text-purple-600",
    iconBg: "bg-purple-100",
  },
];

const features = [
  { icon: Shield, title: "Verified Professionals", desc: "All providers are background-checked and verified." },
  { icon: Star, title: "Rated & Reviewed", desc: "Read real reviews from genuine customers." },
  { icon: Clock, title: "On-time Service", desc: "Book at your convenience. We show up on time." },
];

export default function HomePage() {
  const router = useRouter();
  const [searchCategory, setSearchCategory] = useState("");
  const [topProviders, setTopProviders] = useState<ProviderResponse[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  useEffect(() => {
    // Fetch nearby providers using geolocation or Mumbai fallback
    const fetch = (lat: number, lng: number) =>
      userApi
        .findNearby(lat, lng, 20)
        .then((res) => {
          // Sort by rating desc, take top 4
          const sorted = res.data
            .filter((p) => p.verified)
            .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
            .slice(0, 4);
          setTopProviders(sorted);
        })
        .catch(() => setTopProviders([]))
        .finally(() => setLoadingProviders(false));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetch(pos.coords.latitude, pos.coords.longitude),
        () => fetch(19.076, 72.877)
      );
    } else {
      fetch(19.076, 72.877);
    }
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchCategory) params.set("category", searchCategory);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight text-balance">
            Book Trusted Home Services
            <span className="text-primary"> Near You</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Find verified electricians, plumbers, and more — available when you need them.
          </p>

          {/* Search Bar */}
          <div className="mt-10 bg-card rounded-2xl shadow-md border border-border p-3 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 flex-1 px-3">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Enter your location..."
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2 flex-1 px-3">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-foreground appearance-none cursor-pointer"
              >
                <option value="">Select service...</option>
                {categories.map((c) => (
                  <option key={c.apiKey} value={c.apiKey}>{c.title}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity text-center"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">Browse Services</h2>
          <Link href="/search" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.title}
                href={`/search?category=${cat.apiKey}`}
                className={`rounded-2xl border border-border p-6 flex items-start gap-4 hover:shadow-md transition-shadow ${cat.color} bg-opacity-50`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.iconBg} shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">{cat.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{cat.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-3">
                    Explore <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Why Us */}
      <section className="bg-muted py-16 px-4">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground text-center mb-12">Why Choose ApnaAdmi?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-card rounded-2xl p-6 text-center border border-border shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Top Providers - Live from API */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">Top Providers Near You</h2>
          <Link href="/search" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingProviders ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : topProviders.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-border">
            <p className="text-muted-foreground text-sm">No verified providers found nearby yet.</p>
            <Link href="/search" className="mt-3 inline-block text-sm text-primary hover:underline">
              Browse all providers →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topProviders.map((p) => (
              <div key={p.id} className="bg-card rounded-2xl border border-border shadow-sm p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-foreground text-sm truncate">{p.name}</p>
                      {p.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
                    </div>
                    {p.serviceArea && (
                      <p className="text-xs text-muted-foreground truncate">{p.serviceArea}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-foreground">
                    {p.rating ? p.rating.toFixed(1) : "New"}
                  </span>
                  {p.totalReviews !== undefined && (
                    <span className="text-xs text-muted-foreground">({p.totalReviews} reviews)</span>
                  )}
                </div>
                <Link
                  href={`/booking?providerId=${p.id}`}
                  className="w-full bg-primary text-primary-foreground text-xs font-medium py-2 rounded-xl text-center hover:opacity-90 transition-opacity mt-auto"
                >
                  Book Now
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-primary-foreground mb-3">Are you a service professional?</h2>
        <p className="text-primary-foreground/80 mb-6 text-sm leading-relaxed max-w-md mx-auto">
          Join thousands of providers already earning with ApnaAdmi. Sign up and start accepting bookings today.
        </p>
        <Link
          href="/register"
          className="inline-block bg-card text-primary font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          Join as Provider
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>&copy; 2025 ApnaAdmi. All rights reserved.</p>
      </footer>
    </div>
  );
}

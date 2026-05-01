import Link from "next/link";
import { Zap, Droplets, Search, MapPin, ChevronRight, Star, Shield, Clock } from "lucide-react";
import Navbar from "@/components/navbar";
import { providers } from "@/lib/mock-data";
import ProviderCard from "@/components/provider-card";

const categories = [
  {
    icon: Zap,
    title: "Electrician",
    description: "Fan installation, wiring fixes, switch repairs & more.",
    color: "bg-yellow-50 text-yellow-600",
    iconBg: "bg-yellow-100",
    href: "/search?category=Electrician",
  },
  {
    icon: Droplets,
    title: "Plumber",
    description: "Tap repairs, pipe leakages, toilet fixes & more.",
    color: "bg-blue-50 text-blue-600",
    iconBg: "bg-blue-100",
    href: "/search?category=Plumber",
  },
];

const features = [
  { icon: Shield, title: "Verified Professionals", desc: "All providers are background-checked and verified." },
  { icon: Star, title: "Rated & Reviewed", desc: "Read real reviews from genuine customers." },
  { icon: Clock, title: "On-time Service", desc: "Book at your convenience. We show up on time." },
];

export default function HomePage() {
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
              <select className="flex-1 bg-transparent outline-none text-sm text-foreground appearance-none cursor-pointer">
                <option value="">Select service...</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
              </select>
            </div>
            <Link
              href="/search"
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity text-center"
            >
              Search
            </Link>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.title} className={`rounded-2xl border border-border p-6 flex items-start gap-4 ${cat.color} bg-opacity-50`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.iconBg} shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">{cat.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{cat.description}</p>
                  <Link
                    href={cat.href}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-3 hover:underline"
                  >
                    Explore <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
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

      {/* Top Providers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">Top Providers Near You</h2>
          <Link href="/search" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {providers.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
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

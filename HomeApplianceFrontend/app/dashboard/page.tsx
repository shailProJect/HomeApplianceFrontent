import Link from "next/link";
import { CalendarCheck, Clock, MapPin, ChevronRight, BadgeCheck } from "lucide-react";
import Sidebar from "@/components/sidebar";
import StarRating from "@/components/star-rating";
import { userBookings, providers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function UserDashboard() {
  const upcoming = userBookings.filter((b) => b.status === "upcoming");
  const completed = userBookings.filter((b) => b.status === "completed");
  const nearby = providers.slice(0, 3);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="user" />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Welcome back, Aryan!</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s an overview of your activity.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{upcoming.length}</p>
            <p className="text-xs text-muted-foreground mt-1">booking(s) scheduled</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{completed.length}</p>
            <p className="text-xs text-muted-foreground mt-1">service(s) done</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Nearby Providers</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{providers.length}</p>
            <p className="text-xs text-muted-foreground mt-1">within 5 km</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Bookings */}
          <div className="bg-card rounded-2xl border border-border shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-semibold text-foreground">Upcoming Bookings</h2>
              <Link href="/dashboard/bookings" className="text-xs text-primary flex items-center gap-1 hover:underline">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {upcoming.length === 0 ? (
                <p className="text-muted-foreground text-sm p-5">No upcoming bookings.</p>
              ) : (
                upcoming.map((b) => (
                  <div key={b.id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground text-sm">{b.service}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{b.provider}</p>
                        <p className="text-xs text-muted-foreground mt-1">{b.date} at {b.time}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColors[b.status])}>
                          {b.status}
                        </span>
                        <span className="text-sm font-bold text-foreground">₹{b.price}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Previous Bookings */}
          <div className="bg-card rounded-2xl border border-border shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-semibold text-foreground">Previous Bookings</h2>
              <Link href="/dashboard/bookings" className="text-xs text-primary flex items-center gap-1 hover:underline">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {completed.map((b) => (
                <div key={b.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground text-sm">{b.service}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{b.provider}</p>
                      <p className="text-xs text-muted-foreground mt-1">{b.date} at {b.time}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColors[b.status])}>
                        {b.status}
                      </span>
                      <span className="text-sm font-bold text-foreground">₹{b.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Providers */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-semibold text-foreground">Nearby Providers</h2>
              <Link href="/search" className="text-xs text-primary flex items-center gap-1 hover:underline">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {nearby.map((p) => (
                <div key={p.id} className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                    {p.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-foreground text-sm">{p.name}</p>
                      {p.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <StarRating rating={p.rating} />
                      <span className="text-xs text-muted-foreground">{p.distance}</span>
                    </div>
                  </div>
                  <Link
                    href={`/booking?provider=${p.id}`}
                    className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity shrink-0"
                  >
                    Book
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, Clock, MapPin, ChevronRight, BadgeCheck } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { userApi, providerApi, BookingResponse, ProviderResponse } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "../login/auth-context";
import ChatWidget from "@/components/ChatWidget";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REJECTED: "bg-red-100 text-red-700",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  });
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [nearby, setNearby] = useState<ProviderResponse[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingNearby, setLoadingNearby] = useState(true);

  useEffect(() => {
    userApi.getMyBookings()
      .then((res) => setBookings(res.data))
      .catch(console.error)
      .finally(() => setLoadingBookings(false));

    // Use Mumbai as fallback coordinates if geolocation fails
    const fetchNearby = (lat: number, lng: number) =>
      userApi.findNearby(lat, lng, 10)
        .then((res) => setNearby(res.data.slice(0, 3)))
        .catch(console.error)
        .finally(() => setLoadingNearby(false));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchNearby(pos.coords.latitude, pos.coords.longitude),
        () => fetchNearby(19.076, 72.877) // Mumbai fallback
      );
    } else {
      fetchNearby(19.076, 72.877);
    }
  }, []);

  const upcoming = bookings.filter((b) => b.status === "PENDING" || b.status === "CONFIRMED");
  const completed = bookings.filter((b) => b.status === "COMPLETED");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="user" />

      <main className="flex-1 p-4 pt-16 md:p-8 md:pt-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name?.split(" ")[0] ?? "User"}!
          </h1>
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
            <p className="text-3xl font-bold text-foreground">
              {loadingBookings ? "—" : upcoming.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">booking(s) scheduled</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {loadingBookings ? "—" : completed.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">service(s) done</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Nearby Providers</p>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {loadingNearby ? "—" : nearby.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">within 10 km</p>
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
              {loadingBookings ? (
                <div className="p-5 flex flex-col gap-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : upcoming.length === 0 ? (
                <p className="text-muted-foreground text-sm p-5">No upcoming bookings.</p>
              ) : (
                upcoming.slice(0, 3).map((b) => (
                  <div key={b.id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground text-sm">{b.serviceName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{b.providerName}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(b.scheduledAt)} at {formatTime(b.scheduledAt)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColors[b.status])}>
                          {b.status}
                        </span>
                        <span className="text-sm font-bold text-foreground">₹{b.totalAmount}</span>
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
              {loadingBookings ? (
                <div className="p-5 flex flex-col gap-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : completed.length === 0 ? (
                <p className="text-muted-foreground text-sm p-5">No completed bookings yet.</p>
              ) : (
                completed.slice(0, 3).map((b) => (
                  <div key={b.id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground text-sm">{b.serviceName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{b.providerName}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(b.scheduledAt)} at {formatTime(b.scheduledAt)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColors[b.status])}>
                          {b.status}
                        </span>
                        <span className="text-sm font-bold text-foreground">₹{b.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
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
              {loadingNearby ? (
                <div className="p-5 flex flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : nearby.length === 0 ? (
                <p className="text-muted-foreground text-sm p-5">No nearby providers found.</p>
              ) : (
                nearby.map((p) => (
                  <div key={p.id} className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-foreground text-sm">{p.name}</p>
                        {p.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-muted-foreground">⭐ {p.rating?.toFixed(1) ?? "New"}</span>
                        {p.serviceArea && (
                          <span className="text-xs text-muted-foreground">{p.serviceArea}</span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/booking?providerId=${p.id}`}
                      className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity shrink-0"
                    >
                      Book
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
       {/* ── ✅ ADD THIS ONE LINE ── Chat widget floats over the entire dashboard */}
      <ChatWidget
        apiKey={process.env.NEXT_PUBLIC_GROK_API_KEY}
        systemPrompt={`You are a helpful assistant for ApnaAdmi, a home appliance service booking platform.
The user "${user?.name ?? "User"}" is currently logged in.
Help them with booking services, finding providers, tracking bookings, appliance repair questions, and platform navigation.
Be concise, warm, and professional. Respond in the same language the user writes in.`}
        welcomeMessage={`Hi ${user?.name?.split(" ")[0] ?? "there"}! 👋 How can I help you today?`}
      />
    </div>
  );
}
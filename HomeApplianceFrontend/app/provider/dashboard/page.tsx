import Sidebar from "@/components/sidebar";
import { providerBookings } from "@/lib/mock-data";
import { CalendarCheck, Star, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function ProviderDashboard() {
  const today = providerBookings.filter((b) => b.status === "upcoming");
  const upcoming = providerBookings.filter((b) => b.status === "upcoming");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="provider" />
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Provider Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your bookings and services.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Today&apos;s Bookings</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{today.length}</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{upcoming.length}</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
            </div>
            <p className="text-3xl font-bold text-foreground">4.8</p>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-card rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">Recent Bookings</h2>
            <Link href="/provider/bookings" className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Service</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Date & Time</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {providerBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{b.provider}</td>
                    <td className="px-6 py-4 text-foreground">{b.service}</td>
                    <td className="px-6 py-4 text-muted-foreground">{b.date} · {b.time}</td>
                    <td className="px-6 py-4 font-semibold text-foreground">₹{b.price}</td>
                    <td className="px-6 py-4">
                      <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium capitalize", statusColors[b.status])}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

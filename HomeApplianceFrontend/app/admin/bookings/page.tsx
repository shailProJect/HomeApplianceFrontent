import Sidebar from "@/components/sidebar";
import { userBookings, providerBookings } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const allBookings = [...userBookings, ...providerBookings];

export default function AdminBookingsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="admin" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">All Bookings</h1>
          <p className="text-muted-foreground mt-1">Platform-wide booking records.</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Booking ID</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Customer / Provider</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Service</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Date & Time</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{b.id}</td>
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

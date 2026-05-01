import Sidebar from "@/components/sidebar";
import { providerBookings } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function ProviderBookingsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="provider" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground mt-1">All customer bookings for your services.</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Service</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Date & Time</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Actions</th>
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
                    <td className="px-6 py-4">
                      {b.status === "upcoming" && (
                        <div className="flex gap-2">
                          <button className="text-xs text-green-600 border border-green-300 bg-green-50 px-3 py-1 rounded-lg hover:bg-green-100 transition-colors font-medium">Accept</button>
                          <button className="text-xs text-red-600 border border-red-300 bg-red-50 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors font-medium">Decline</button>
                        </div>
                      )}
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

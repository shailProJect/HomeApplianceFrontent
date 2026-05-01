import Sidebar from "@/components/sidebar";
import { adminStats, pendingProviders } from "@/lib/mock-data";
import { Users, Briefcase, CalendarCheck, TrendingUp, CheckCircle, XCircle } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Users", value: adminStats.totalUsers.toLocaleString(), icon: Users, color: "bg-blue-100 text-blue-600" },
    { label: "Total Providers", value: adminStats.totalProviders.toLocaleString(), icon: Briefcase, color: "bg-purple-100 text-purple-600" },
    { label: "Active Bookings", value: adminStats.activeBookings.toLocaleString(), icon: CalendarCheck, color: "bg-green-100 text-green-600" },
    { label: "Total Revenue", value: `₹${adminStats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "bg-yellow-100 text-yellow-600" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="admin" />
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform overview and management.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-card rounded-2xl border border-border p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                </div>
                <p className="text-3xl font-bold text-foreground">{s.value}</p>
              </div>
            );
          })}
        </div>

        {/* Provider Verification Table */}
        <div className="bg-card rounded-2xl border border-border shadow-sm">
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">Pending Provider Verifications</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Review and approve new service providers</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Provider Name</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Service Category</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Submitted</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingProviders.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{p.name}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{p.category}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{p.submitted}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="flex items-center gap-1.5 text-xs text-green-700 bg-green-100 border border-green-300 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button className="flex items-center gap-1.5 text-xs text-red-700 bg-red-100 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
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

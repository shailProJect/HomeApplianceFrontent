import Sidebar from "@/components/sidebar";

const users = [
  { id: "U01", name: "Aryan Sharma", email: "aryan@example.com", phone: "+91 9876543210", joined: "Jan 12, 2025", bookings: 5 },
  { id: "U02", name: "Priya Nair", email: "priya@example.com", phone: "+91 9988776655", joined: "Feb 3, 2025", bookings: 2 },
  { id: "U03", name: "Ravi Teja", email: "ravi@example.com", phone: "+91 9123456789", joined: "Mar 19, 2025", bookings: 8 },
  { id: "U04", name: "Anita Mehta", email: "anita@example.com", phone: "+91 9876001234", joined: "Apr 5, 2025", bookings: 1 },
];

export default function AdminUsersPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="admin" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">All registered users on the platform.</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Phone</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Joined</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Bookings</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{u.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                    <td className="px-6 py-4 text-muted-foreground">{u.phone}</td>
                    <td className="px-6 py-4 text-muted-foreground">{u.joined}</td>
                    <td className="px-6 py-4 font-semibold text-foreground">{u.bookings}</td>
                    <td className="px-6 py-4">
                      <button className="text-xs text-red-600 hover:underline font-medium">Suspend</button>
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

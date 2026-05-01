import Sidebar from "@/components/sidebar";
import { providers } from "@/lib/mock-data";
import StarRating from "@/components/star-rating";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminProvidersPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="admin" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Providers</h1>
          <p className="text-muted-foreground mt-1">All registered service providers.</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Provider</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Category</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Experience</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Rating</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {providers.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">
                          {p.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-foreground">{p.name}</span>
                            {p.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{p.area}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", p.category === "Electrician" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700")}>
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{p.experience}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={p.rating} />
                        <span className="text-xs text-muted-foreground">{p.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", p.verified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700")}>
                        {p.verified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {!p.verified && <button className="text-xs text-green-700 bg-green-100 border border-green-300 px-3 py-1 rounded-lg hover:bg-green-200 font-medium">Approve</button>}
                        <button className="text-xs text-red-600 hover:underline font-medium">Remove</button>
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

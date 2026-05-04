"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import { providerApi, ProviderServiceResponse } from "@/lib/api";
import { Plus, X, Pencil, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "ELECTRICIAN", "PLUMBER", "CARPENTER", "PAINTER",
  "CLEANER", "AC_TECHNICIAN", "APPLIANCE_REPAIR", "OTHER",
];

export default function ProviderServicesPage() {
  const [services, setServices] = useState<ProviderServiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newService, setNewService] = useState({
    categoryName: "",
    serviceName: "",
    description: "",
    price: "",
    durationMinutes: "",
  });

  const fetchServices = () => {
    setLoading(true);
    providerApi.getMyServices()
      .then((res) => setServices(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  const addService = async () => {
    if (!newService.categoryName || !newService.price) return;
    setAdding(true);
    setError("");
    try {
      const res = await providerApi.addService({
        categoryName: newService.categoryName,
        serviceName: newService.categoryName,
        description: newService.description || undefined,
        price: parseFloat(newService.price),
        durationMinutes: parseInt(newService.durationMinutes) || 60,
      });
      setServices((prev) => [...prev, res.data]);
      setNewService({ categoryName: "", serviceName: "", description: "", price: "", durationMinutes: "" });
      setModalOpen(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add service");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="provider" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Services</h1>
            <p className="text-muted-foreground mt-1">Manage the services you offer.</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Service
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-muted rounded-2xl animate-pulse" />)}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium mb-2">No services yet</p>
            <p className="text-sm">Click &quot;Add Service&quot; to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s) => (
              <div key={s.id} className="bg-card rounded-2xl border border-border shadow-sm p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {s.categoryName.replace(/_/g, " ")}
                    </span>
                    <h3 className="font-semibold text-foreground mt-2">
                      {s.description || s.categoryName.replace(/_/g, " ")}
                    </h3>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-col gap-2 text-sm mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-bold text-foreground">₹{s.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="text-foreground">{s.durationMinutes} min</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={cn(
                    "text-xs px-2.5 py-1 rounded-full font-medium",
                    s.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                  )}>
                    {s.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Service Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-foreground text-lg">Add New Service</h2>
                <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Category *</label>
                  <select
                    value={newService.categoryName}
                    onChange={(e) => setNewService({ ...newService, categoryName: e.target.value })}
                    className="border border-input rounded-xl px-3 py-2.5 bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Fan Installation, Pipe Repair"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="299"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Duration (minutes)</label>
                  <input
                    type="number"
                    placeholder="60"
                    value={newService.durationMinutes}
                    onChange={(e) => setNewService({ ...newService, durationMinutes: e.target.value })}
                    className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 border border-border text-foreground text-sm font-medium py-2.5 rounded-xl hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addService}
                    disabled={adding || !newService.categoryName || !newService.price}
                    className="flex-1 bg-primary text-primary-foreground text-sm font-medium py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {adding ? "Adding…" : "Add Service"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
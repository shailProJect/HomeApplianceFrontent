"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { providerServices } from "@/lib/mock-data";
import { Plus, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProviderServicesPage() {
  const [services, setServices] = useState(providerServices);
  const [modalOpen, setModalOpen] = useState(false);
  const [newService, setNewService] = useState({ name: "", price: "", duration: "" });

  const toggleActive = (id: string) => {
    setServices((prev) => prev.map((s) => s.id === id ? { ...s, active: !s.active } : s));
  };

  const addService = () => {
    if (!newService.name) return;
    setServices((prev) => [
      ...prev,
      { id: `s${Date.now()}`, name: newService.name, price: parseInt(newService.price) || 0, duration: newService.duration, active: true },
    ]);
    setNewService({ name: "", price: "", duration: "" });
    setModalOpen(false);
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => (
            <div key={s.id} className="bg-card rounded-2xl border border-border shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <h3 className="font-semibold text-foreground">{s.name}</h3>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col gap-2 text-sm mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <input
                    type="number"
                    defaultValue={s.price}
                    className="w-24 border border-input rounded-lg px-2 py-1 text-sm text-right bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <input
                    type="text"
                    defaultValue={s.duration}
                    className="w-24 border border-input rounded-lg px-2 py-1 text-sm text-right bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-sm text-muted-foreground">Active</span>
                <button
                  onClick={() => toggleActive(s.id)}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors",
                    s.active ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                  aria-label="Toggle active"
                >
                  <span className={cn(
                    "absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
                    s.active && "translate-x-5"
                  )} />
                </button>
              </div>
            </div>
          ))}
        </div>

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
                  <label className="text-sm font-medium text-foreground">Service Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Fan Installation"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Price (₹)</label>
                  <input
                    type="number"
                    placeholder="299"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 hr"
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                    className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex gap-3 mt-2">
                  <button onClick={() => setModalOpen(false)} className="flex-1 border border-border text-foreground text-sm font-medium py-2.5 rounded-xl hover:bg-muted transition-colors">
                    Cancel
                  </button>
                  <button onClick={addService} className="flex-1 bg-primary text-primary-foreground text-sm font-medium py-2.5 rounded-xl hover:opacity-90 transition-opacity">
                    Add Service
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

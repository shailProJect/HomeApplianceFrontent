"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import { providerApi, ProviderServiceResponse, ServiceCategoryResponse } from "@/lib/api";
import { Plus, X, Pencil, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── shared form shape ────────────────────────────────────────────────────────
interface ServiceForm {
  categoryId: string;
  serviceName: string;
  price: string;
  durationMinutes: string;
}

const EMPTY_FORM: ServiceForm = {
  categoryId: "temp",
  serviceName: "",
  price: "",
  durationMinutes: "",
};

// ─── reusable modal ───────────────────────────────────────────────────────────
function ServiceModal({
  title, form, onChange, onSubmit, onClose,
  submitting, submitLabel, categories, loadingCategories, error,
}: {
  title: string;
  form: ServiceForm;
  onChange: (f: ServiceForm) => void;
  onSubmit: () => void;
  onClose: () => void;
  submitting: boolean;
  submitLabel: string;
  categories: ServiceCategoryResponse[];
  loadingCategories: boolean;
  error: string;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-foreground text-lg">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Category *</label>
            {loadingCategories ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2.5">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading categories…
              </div>
            ) : (
             <input
              type="text"
              value={
                categories[0]?.name?.replace(/_/g, " ") || ""
              }
              disabled
              className="border border-input rounded-xl px-3 py-2.5 bg-muted text-sm text-foreground"
            />
            )}
          </div>

          {/* Service Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Service Name *
              <span className="text-muted-foreground font-normal ml-1 text-xs">(shown to customers)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Fan Installation, Pipe Repair, AC Service"
              value={form.serviceName}
              onChange={(e) => onChange({ ...form, serviceName: e.target.value })}
              className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Price */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Price (₹) *</label>
            <input
              type="number"
              placeholder="299"
              value={form.price}
              onChange={(e) => onChange({ ...form, price: e.target.value })}
              className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Duration (minutes)</label>
            <input
              type="number"
              placeholder="60"
              value={form.durationMinutes}
              onChange={(e) => onChange({ ...form, durationMinutes: e.target.value })}
              className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={onClose}
              className="flex-1 border border-border text-foreground text-sm font-medium py-2.5 rounded-xl hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={submitting || !form.serviceName.trim() || !form.price}
              className="flex-1 bg-primary text-primary-foreground text-sm font-medium py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              ) : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function ProviderServicesPage() {
  const [services, setServices] = useState<ProviderServiceResponse[]>([]);
  const [categories, setCategories] = useState<ServiceCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [pageError, setPageError] = useState("");

  // Add modal state
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<ServiceForm>(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // Edit modal state
  const [editTarget, setEditTarget] = useState<ProviderServiceResponse | null>(null);
  const [editForm, setEditForm] = useState<ServiceForm>(EMPTY_FORM);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState("");
const [providerCategory, setProviderCategory] =
  useState<ServiceCategoryResponse | null>(null);

 useEffect(() => {
  const fetchProviderCategory = async () => {
    try {
      setLoadingCategories(true);

      const profileRes = await providerApi.getProfile();

      const category = {
        id: profileRes.data.categoryId,
        name: profileRes.data.categoryName,
      };

      setProviderCategory(category);

      setCategories([category]);

      setAddForm((prev) => ({
        ...prev,
        categoryId: category.id,
      }));
    } catch (e) {
      setPageError("Failed to load provider category");
    } finally {
      setLoadingCategories(false);
    }
  };

  fetchProviderCategory();
  fetchServices();
}, []);

  const fetchServices = () => {
    setLoading(true);
    providerApi.getMyServices()
      .then((res) => setServices(res.data))
      .catch((e) => setPageError(e.message))
      .finally(() => setLoading(false));
  };

  // Pre-fill edit form with the service's current values
  const openEdit = (s: ProviderServiceResponse) => {
    setEditTarget(s);
    setEditError("");
    setEditForm({
      categoryId: s.categoryId,
      serviceName: s.serviceName ?? "",
      price: String(s.price),
      durationMinutes: String(s.durationMinutes),
    });
  };

  const handleAdd = async () => {
    setAdding(true);
    setAddError("");
    try {
      const res = await providerApi.addService({
        categoryId: addForm.categoryId,
        serviceName: addForm.serviceName.trim(),
        price: parseFloat(addForm.price),
        durationMinutes: parseInt(addForm.durationMinutes) || 60,
      });
      setServices((prev) => [...prev, res.data]);
      setAddForm(EMPTY_FORM);
      setAddOpen(false);
    } catch (e: unknown) {
      setAddError(e instanceof Error ? e.message : "Failed to add service");
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setEditing(true);
    setEditError("");
    try {
      const res = await providerApi.updateService(editTarget.id, {
        categoryId: editForm.categoryId,
        serviceName: editForm.serviceName.trim(),
        price: parseFloat(editForm.price),
        durationMinutes: parseInt(editForm.durationMinutes) || 60,
      });
      setServices((prev) => prev.map((s) => (s.id === editTarget.id ? res.data : s)));
      setEditTarget(null);
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : "Failed to update service");
    } finally {
      setEditing(false);
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
            onClick={() => {
              setAddForm({
                categoryId: providerCategory?.id || "",
                serviceName: "",
                price: "",
                durationMinutes: "",
              });

              setAddError("");
              setAddOpen(true);
          }}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Service
          </button>
        </div>

        {pageError && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" /> {pageError}
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
                  <div className="min-w-0">
                    {/* Category badge */}
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {s.categoryName.replace(/_/g, " ")}
                    </span>
                    {/* ✅ Show actual serviceName typed by provider */}
                    <h3 className="font-semibold text-foreground mt-2 truncate">
                      {s.serviceName?.trim() ? s.serviceName : s.categoryName.replace(/_/g, " ")}
                    </h3>
                  </div>
                  {/* ✅ Edit button opens pre-filled edit modal */}
                  <button
                    onClick={() => openEdit(s)}
                    className="text-muted-foreground hover:text-primary transition-colors shrink-0 p-1 rounded-lg hover:bg-primary/10"
                    title="Edit service"
                  >
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

        {/* Add modal */}
        {addOpen && (
          <ServiceModal
            title="Add New Service"
            form={addForm}
            onChange={setAddForm}
            onSubmit={handleAdd}
            onClose={() => setAddOpen(false)}
            submitting={adding}
            submitLabel="Add Service"
            categories={categories}
            loadingCategories={loadingCategories}
            error={addError}
          />
        )}

        {/* Edit modal — pre-filled with existing service data */}
        {editTarget && (
          <ServiceModal
            title="Edit Service"
            form={editForm}
            onChange={setEditForm}
            onSubmit={handleEdit}
            onClose={() => setEditTarget(null)}
            submitting={editing}
            submitLabel="Save Changes"
            categories={categories}
            loadingCategories={loadingCategories}
            error={editError}
          />
        )}

      </main>
    </div>
  );
}
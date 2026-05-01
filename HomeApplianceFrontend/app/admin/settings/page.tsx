import Sidebar from "@/components/sidebar";

export default function AdminSettingsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="admin" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Platform Settings</h1>
          <p className="text-muted-foreground mt-1">Configure platform-wide settings.</p>
        </div>

        <div className="max-w-2xl flex flex-col gap-6">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h2 className="font-semibold text-foreground mb-5">General</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Platform Name</label>
                <input type="text" defaultValue="ApnaAdmi" className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Support Email</label>
                <input type="email" defaultValue="support@ApnaAdmi.in" className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Platform Fee (%)</label>
                <input type="number" defaultValue={10} min={0} max={100} className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h2 className="font-semibold text-foreground mb-5">Notifications</h2>
            <div className="flex flex-col gap-3">
              {["Email notifications for new bookings", "SMS alerts for provider requests", "Weekly summary reports"].map((item) => (
                <div key={item} className="flex items-center justify-between py-1">
                  <span className="text-sm text-foreground">{item}</span>
                  <button className="relative w-11 h-6 rounded-full bg-primary" aria-label="Toggle">
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white shadow" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button className="bg-primary text-primary-foreground text-sm font-medium px-6 py-3 rounded-xl hover:opacity-90 transition-opacity w-fit">
            Save Settings
          </button>
        </div>
      </main>
    </div>
  );
}

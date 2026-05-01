"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import { Camera, Lock } from "lucide-react";

export default function ProfilePage() {
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="user" />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account details.</p>
        </div>

        <div className="max-w-2xl flex flex-col gap-6">
          {/* Avatar */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h2 className="font-semibold text-foreground mb-5">Profile Photo</h2>
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl">
                  AS
                </div>
                <button className="absolute bottom-0 right-0 w-7 h-7 bg-card border-2 border-background rounded-full flex items-center justify-center hover:bg-muted transition-colors shadow-sm" aria-label="Change photo">
                  <Camera className="w-3.5 h-3.5 text-foreground" />
                </button>
              </div>
              <div>
                <p className="font-medium text-foreground">Aryan Sharma</p>
                <p className="text-sm text-muted-foreground">aryan@example.com</p>
                <button className="text-xs text-primary font-medium mt-1 hover:underline">Upload new photo</button>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h2 className="font-semibold text-foreground mb-5">Personal Information</h2>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <input type="text" defaultValue="Aryan Sharma" className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Phone Number</label>
                  <input type="tel" defaultValue="+91 9876543210" className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <input type="email" defaultValue="aryan@example.com" className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Address</label>
                <input type="text" defaultValue="Sector 15, Noida, UP 201301" className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="bg-primary text-primary-foreground text-sm font-medium px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
                Save Changes
              </button>
              <button className="border border-border text-foreground text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-muted transition-colors">
                Cancel
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h2 className="font-semibold text-foreground mb-5">Security</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Password</p>
                <p className="text-xs text-muted-foreground mt-0.5">Last changed 30 days ago</p>
              </div>
              <button
                onClick={() => setPasswordModalOpen(true)}
                className="flex items-center gap-2 border border-border text-sm font-medium px-4 py-2 rounded-xl hover:bg-muted transition-colors"
              >
                <Lock className="w-4 h-4" /> Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        {passwordModalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6">
              <h2 className="font-bold text-foreground text-lg mb-5">Change Password</h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Current Password</label>
                  <input type="password" placeholder="••••••••" className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">New Password</label>
                  <input type="password" placeholder="••••••••" className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="flex gap-3 mt-2">
                  <button onClick={() => setPasswordModalOpen(false)} className="flex-1 border border-border text-foreground text-sm font-medium py-2.5 rounded-xl hover:bg-muted transition-colors">
                    Cancel
                  </button>
                  <button onClick={() => setPasswordModalOpen(false)} className="flex-1 bg-primary text-primary-foreground text-sm font-medium py-2.5 rounded-xl hover:opacity-90 transition-opacity">
                    Update Password
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

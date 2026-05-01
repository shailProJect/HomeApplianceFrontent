"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, Menu, X, Wrench, Zap, Droplets } from "lucide-react";
import { notifications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">ApnaAdmi</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setServicesOpen(!servicesOpen)}
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Services <ChevronDown className="w-4 h-4" />
              </button>
              {servicesOpen && (
                <div className="absolute top-8 left-0 bg-card rounded-xl shadow-lg border border-border w-48 py-2 z-50">
                  <Link href="/search?category=Electrician" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors" onClick={() => setServicesOpen(false)}>
                    <Zap className="w-4 h-4 text-yellow-500" /> Electrician
                  </Link>
                  <Link href="/search?category=Plumber" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors" onClick={() => setServicesOpen(false)}>
                    <Droplets className="w-4 h-4 text-blue-500" /> Plumber
                  </Link>
                </div>
              )}
            </div>
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-card rounded-xl shadow-lg border border-border z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="font-semibold text-sm">Notifications</p>
                  </div>
                  {notifications.map((n) => (
                    <div key={n.id} className={cn("px-4 py-3 text-sm hover:bg-muted transition-colors", !n.read && "bg-blue-50")}>
                      <p className="text-foreground leading-relaxed">{n.message}</p>
                      <p className="text-muted-foreground text-xs mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link href="/login" className="hidden md:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted transition-colors">
              Login
            </Link>
            <Link href="/register" className="hidden md:inline-flex text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              Register
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-4 flex flex-col gap-3">
          <Link href="/search?category=Electrician" className="flex items-center gap-2 text-sm font-medium text-foreground py-2" onClick={() => setMobileOpen(false)}>
            <Zap className="w-4 h-4 text-yellow-500" /> Electrician
          </Link>
          <Link href="/search?category=Plumber" className="flex items-center gap-2 text-sm font-medium text-foreground py-2" onClick={() => setMobileOpen(false)}>
            <Droplets className="w-4 h-4 text-blue-500" /> Plumber
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-foreground py-2" onClick={() => setMobileOpen(false)}>Dashboard</Link>
          <div className="flex gap-3 pt-2 border-t border-border">
            <Link href="/login" className="flex-1 text-center text-sm font-medium border border-border text-foreground px-4 py-2 rounded-lg" onClick={() => setMobileOpen(false)}>Login</Link>
            <Link href="/register" className="flex-1 text-center text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg" onClick={() => setMobileOpen(false)}>Register</Link>
          </div>
        </div>
      )}
    </header>
  );
}

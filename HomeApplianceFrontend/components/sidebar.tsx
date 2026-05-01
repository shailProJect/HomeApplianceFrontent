"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  CalendarCheck,
  User,
  LogOut,
  Briefcase,
  Clock,
  BookOpen,
  Users,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: "user" | "provider" | "admin";
}

const userLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search", label: "Search Providers", icon: Search },
  { href: "/dashboard/bookings", label: "My Bookings", icon: CalendarCheck },
  { href: "/profile", label: "Profile", icon: User },
];

const providerLinks = [
  { href: "/provider/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/provider/services", label: "My Services", icon: Briefcase },
  { href: "/provider/availability", label: "Availability", icon: Clock },
  { href: "/provider/bookings", label: "Bookings", icon: BookOpen },
  { href: "/profile", label: "Profile", icon: User },
];

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/providers", label: "Providers", icon: ShieldCheck },
  { href: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const links = role === "user" ? userLinks : role === "provider" ? providerLinks : adminLinks;

  return (
    <aside className="w-64 shrink-0 bg-card border-r border-border min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">SE</span>
          </div>
          <span className="font-bold text-foreground">ServeEase</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 capitalize">{role} Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Link>
      </div>
    </aside>
  );
}

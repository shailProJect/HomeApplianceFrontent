"use client";

import Link from "next/link";
import { MapPin, BadgeCheck } from "lucide-react";
import StarRating from "./star-rating";
import { Provider } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface ProviderCardProps {
  provider: Provider;
}

const categoryColors: Record<string, string> = {
  Electrician: "bg-yellow-100 text-yellow-700",
  Plumber: "bg-blue-100 text-blue-700",
};

export default function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
          {provider.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-foreground truncate">{provider.name}</h3>
            {provider.verified && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
          </div>
          <span className={cn("inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1", categoryColors[provider.category] ?? "bg-muted text-muted-foreground")}>
            {provider.category}
          </span>
        </div>
      </div>

      {/* Rating & Distance */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5">
          <StarRating rating={provider.rating} />
          <span className="text-muted-foreground">{provider.rating} ({provider.reviews})</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          {provider.distance}
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Starting from</span>
        <span className="font-bold text-foreground">₹{provider.price}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={`/provider/${provider.id}`}
          className="flex-1 text-center text-sm font-medium border border-border text-foreground px-3 py-2 rounded-lg hover:bg-muted transition-colors"
        >
          View Profile
        </Link>
        <Link
          href={`/booking?provider=${provider.id}`}
          className="flex-1 text-center text-sm font-medium bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}

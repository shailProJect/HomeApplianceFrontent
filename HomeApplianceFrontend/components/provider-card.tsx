"use client";

import Link from "next/link";
import { MapPin, BadgeCheck, Store } from "lucide-react";
import StarRating from "./star-rating";
import { ProviderResponse, ProviderServiceResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ProviderCardProps {
  /** A full provider (from nearby search) */
  provider?: ProviderResponse;
  /** A provider service (from category search) */
  service?: ProviderServiceResponse;
  /** Optional: extra data merged in when we have both */
  providerDetail?: ProviderResponse;
}

const categoryColors: Record<string, string> = {
  ELECTRICIAN: "bg-yellow-100 text-yellow-700",
  PLUMBER: "bg-blue-100 text-blue-700",
  CARPENTER: "bg-orange-100 text-orange-700",
  PAINTER: "bg-purple-100 text-purple-700",
  CLEANER: "bg-green-100 text-green-700",
  AC_TECHNICIAN: "bg-cyan-100 text-cyan-700",
  APPLIANCE_REPAIR: "bg-rose-100 text-rose-700",
};

export default function ProviderCard({ provider, service, providerDetail }: ProviderCardProps) {
  // Normalise: can render from either a ProviderResponse or a ProviderServiceResponse
  const id = provider?.id ?? providerDetail?.id ?? service?.providerId ?? "";
  const name = provider?.name ?? providerDetail?.name ?? service?.providerName ?? "";
  const category = provider?.categoryName ?? providerDetail?.categoryName ?? service?.categoryName ?? "";
  const verified = provider?.verified ?? providerDetail?.verified ?? false;
  const rating = provider?.rating ?? providerDetail?.rating ?? 0;
  const shopName = provider?.shopName ?? providerDetail?.shopName;
  const shopAddress = provider?.shopAddress ?? providerDetail?.shopAddress;
  const serviceArea = provider?.serviceArea ?? providerDetail?.serviceArea;
  const price = service?.price;

  const colorClass = categoryColors[category] ?? "bg-muted text-muted-foreground";

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
          {name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-foreground truncate">{name}</h3>
            {verified && (
              <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
            )}
          </div>
          {category && (
            <span className={cn("inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1", colorClass)}>
              {category.replace(/_/g, " ")}
            </span>
          )}
          {verified && (
            <span className="ml-1 inline-block text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full mt-1">
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Shop info */}
      {shopName && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Store className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate font-medium text-foreground">{shopName}</span>
        </div>
      )}
      {shopAddress && !shopName && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{shopAddress}</span>
        </div>
      )}
      {shopAddress && shopName && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{shopAddress}</span>
        </div>
      )}

      {/* Rating & Area */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5">
          {rating > 0 ? (
            <>
              <StarRating rating={rating} />
              <span className="text-muted-foreground">{rating.toFixed(1)}</span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">No ratings yet</span>
          )}
        </div>
        {serviceArea && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate max-w-[100px]">{serviceArea}</span>
          </div>
        )}
      </div>

      {/* Price (only when from a service) */}
      {price != null && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {service?.serviceName ?? "Service"}
          </span>
          <span className="font-bold text-foreground">₹{price}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={`/provider/${id}`}
          className="flex-1 text-center text-sm font-medium border border-border text-foreground px-3 py-2 rounded-lg hover:bg-muted transition-colors"
        >
          View Profile
        </Link>
        <Link
          href={`/booking?provider=${id}${service ? `&service=${service.id}` : ""}`}
          className="flex-1 text-center text-sm font-medium bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}

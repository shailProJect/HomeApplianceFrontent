import Link from "next/link";
import { BadgeCheck, MapPin, Briefcase, Star, Calendar } from "lucide-react";
import Navbar from "@/components/navbar";
import StarRating from "@/components/star-rating";
import { providers, reviews, timeSlots } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function ProviderProfilePage({ params }: { params: { id: string } }) {
  const provider = providers.find((p) => p.id === params.id) ?? providers[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Profile */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Profile Card */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl shrink-0">
                  {provider.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-foreground">{provider.name}</h1>
                    {provider.verified && (
                      <span className="flex items-center gap-1 text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                        <BadgeCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {provider.category}
                  </span>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={provider.rating} size="sm" />
                      <span>{provider.rating} ({provider.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {provider.area}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" /> {provider.experience}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{provider.about}</p>
                </div>
              </div>
            </div>

            {/* Available Slots */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Available Slots
              </h2>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                defaultValue={new Date().toISOString().split("T")[0]}
                className="border border-input rounded-xl px-3 py-2.5 text-sm text-foreground bg-background outline-none focus:ring-2 focus:ring-ring mb-4 w-full sm:w-auto"
              />
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map((t) => (
                  <button
                    key={t}
                    className="border border-border rounded-xl py-2 text-xs text-foreground font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
              <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" /> Customer Reviews
              </h2>
              <div className="flex flex-col gap-4">
                {reviews.map((r) => (
                  <div key={r.id} className="pb-4 border-b border-border last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="font-medium text-foreground text-sm">{r.user}</p>
                      <p className="text-xs text-muted-foreground">{r.date}</p>
                    </div>
                    <StarRating rating={r.rating} size="sm" />
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Book CTA */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sticky top-24">
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">Starting from</p>
              <p className="text-3xl font-bold text-foreground mb-5">₹{provider.price}</p>
              <Link
                href={`/booking?provider=${provider.id}`}
                className="w-full block text-center bg-primary text-primary-foreground font-medium py-3 rounded-xl hover:opacity-90 transition-opacity mb-3"
              >
                Book Appointment
              </Link>
              <p className="text-xs text-muted-foreground text-center">Free cancellation up to 2 hrs before</p>

              <div className="mt-6 pt-5 border-t border-border flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium text-foreground">{provider.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="font-medium text-foreground">{provider.experience}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Service Area</span>
                  <span className="font-medium text-foreground text-right max-w-[140px]">{provider.area}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="font-medium text-foreground">{provider.rating}/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

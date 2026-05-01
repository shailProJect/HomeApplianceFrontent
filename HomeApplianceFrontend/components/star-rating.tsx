import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md";
}

export default function StarRating({ rating, max = 5, size = "sm" }: StarRatingProps) {
  const iconClass = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            iconClass,
            i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground"
          )}
        />
      ))}
    </div>
  );
}

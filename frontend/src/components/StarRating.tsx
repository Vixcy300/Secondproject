/** Star rating display with half-star support. */
import { Star, StarHalf } from "lucide-react";

interface Props {
  rating: number;   // 0–5
  count?: number;   // review count to show alongside
  size?: "sm" | "md";
}

export default function StarRating({ rating, count, size = "md" }: Props) {
  const starSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: full }).map((_, i) => (
          <Star key={`f${i}`} className={`${starSize} fill-amber-400 text-amber-400`} />
        ))}
        {hasHalf && <StarHalf className={`${starSize} fill-amber-400 text-amber-400`} />}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={`e${i}`} className={`${starSize} text-gray-300`} />
        ))}
      </div>
      {count !== undefined && (
        <span className={`text-gray-500 ${size === "sm" ? "text-xs" : "text-sm"}`}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}

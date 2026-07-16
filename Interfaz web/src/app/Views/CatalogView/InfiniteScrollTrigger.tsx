import { useEffect, useRef } from "react";
import { SkeletonCard } from "./SkeletonCard";

export function InfiniteScrollTrigger({
  onIntersect,
  count,
}: {
  onIntersect: () => void;
  count: number;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !firedRef.current) {
          firedRef.current = true;
          setTimeout(onIntersect, 600);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onIntersect]);

  return (
    <div>
      {/* Skeleton grid shown while scrolling into view */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mt-3">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      {/* Invisible sentinel at the bottom */}
      <div ref={sentinelRef} className="h-1 w-full" />
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

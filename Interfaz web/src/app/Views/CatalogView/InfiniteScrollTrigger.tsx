import { useEffect, useRef } from "react";
import { SkeletonCard } from "./SkeletonCard";

export function InfiniteScrollTrigger({
  onIntersect,
  count,
  disabled = false,
}: {
  onIntersect: () => void;
  count: number;
  disabled?: boolean;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    loadingRef.current = false;
  }, [onIntersect]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || disabled) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingRef.current) {
          loadingRef.current = true;
          onIntersect();
        }
      },
      { rootMargin: "300px" },
    );
    
    observer.observe(el);
    return () => observer.disconnect();
  }, [onIntersect, disabled]);

  if (disabled) return null;

  return (
    <div>
      {/* Skeleton grid shown while loading */}
      {count > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mt-3">
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}
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

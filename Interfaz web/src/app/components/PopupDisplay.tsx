import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface PopupData {
  id: number;
  title: string;
  image: string | null;
  position: "header" | "footer" | "left" | "right";
  filterConfig: {
    categoryIds?: number[];
    brandId?: number | null;
    productTypeCode?: string;
    onSale?: boolean;
    search?: string;
    sort?: string;
  } | null;
  durationMs: number;
  delayMs: number;
}

interface PopupDisplayProps {
  onApplyFilter: (f: {
    categoryIds?: number[];
    brandId?: number | null;
    productTypeCode?: string;
    onSale?: boolean;
    search?: string;
    sort?: string;
    priceMin?: number;
    priceMax?: number;
  }) => void;
}

export function PopupDisplay({ onApplyFilter }: PopupDisplayProps) {
  const [activePopups, setActivePopups] = useState<PopupData[]>([]);
  const [visibleIds, setVisibleIds] = useState<Set<number>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  // Fetch active popups
  useEffect(() => {
    fetch(`${API_BASE_URL}/popups/active`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: PopupData[]) =>
        setActivePopups(data.filter((p) => p.image)),
      )
      .catch(() => {});
  }, []);

  // Manage show/hide lifecycle per popup
  useEffect(() => {
    activePopups.forEach((p) => {
      if (dismissedIds.has(p.id)) return;

      // Clear any existing timer for this popup
      if (timersRef.current.has(p.id)) {
        clearTimeout(timersRef.current.get(p.id));
      }

      // Delay before showing
      const showTimer = setTimeout(() => {
        // Mark as visible
        setVisibleIds((prev) => new Set(prev).add(p.id));

        // Auto-hide after duration (only if position is not static)
        if (p.durationMs > 0) {
          const hideTimer = setTimeout(() => {
            setVisibleIds((prev) => {
              const next = new Set(prev);
              next.delete(p.id);
              return next;
            });
          }, p.durationMs);
          timersRef.current.set(p.id, hideTimer);
        }
      }, p.delayMs);

      timersRef.current.set(p.id, showTimer);
    });

    // Cleanup
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, [activePopups, dismissedIds]);

  const handleClick = useCallback(
    (p: PopupData) => {
      if (p.filterConfig && Object.keys(p.filterConfig).length > 0) {
        const f: any = { ...p.filterConfig };
        // Remove undefined values
        Object.keys(f).forEach((k) => {
          if (
            f[k] === undefined ||
            f[k] === null ||
            (Array.isArray(f[k]) && f[k].length === 0)
          ) {
            delete f[k];
          }
        });
        onApplyFilter(f);
      }
    },
    [onApplyFilter],
  );

  const handleDismiss = useCallback(
    (id: number, e: React.MouseEvent) => {
      e.stopPropagation();
      setDismissedIds((prev) => new Set(prev).add(id));
      setVisibleIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (timersRef.current.has(id)) {
        clearTimeout(timersRef.current.get(id));
        timersRef.current.delete(id);
      }
    },
    [],
  );

  const visiblePopups = activePopups.filter(
    (p) => visibleIds.has(p.id) && !dismissedIds.has(p.id),
  );

  if (visiblePopups.length === 0) return null;

  return (
    <>
      {visiblePopups.map((p) => {
        const isHorizontal = p.position === "header" || p.position === "footer";
        const isPanel = p.position === "left" || p.position === "right";

        // Position styles
        const positionStyles: React.CSSProperties = {};
        const panelStyles: React.CSSProperties = {};

        if (p.position === "header") {
          positionStyles.top = "72px"; // below navbar
          positionStyles.left = 0;
          positionStyles.right = 0;
        } else if (p.position === "footer") {
          positionStyles.bottom = "64px"; // above footer bottom
          positionStyles.left = 0;
          positionStyles.right = 0;
        } else if (p.position === "left") {
          positionStyles.top = "72px";
          positionStyles.left = 0;
          positionStyles.bottom = 0;
          panelStyles.maxWidth = "420px";
          panelStyles.width = "90vw";
        } else if (p.position === "right") {
          positionStyles.top = "72px";
          positionStyles.right = 0;
          positionStyles.bottom = 0;
          panelStyles.maxWidth = "420px";
          panelStyles.width = "90vw";
        }

        const containerClass = isHorizontal
          ? "fixed left-0 right-0 z-40 cursor-pointer animate-slide-down"
          : `fixed z-40 cursor-pointer ${p.position === "left" ? "animate-slide-in-left" : "animate-slide-in-right"}`;

        return (
          <div
            key={p.id}
            className={containerClass}
            style={positionStyles}
            onClick={() => handleClick(p)}
          >
            <div
              className="relative"
              style={isPanel ? panelStyles : undefined}
            >
              {/* Image */}
              {isHorizontal ? (
                <div className="w-full h-[60px] sm:h-[80px] overflow-hidden">
                  <img
                    src={p.image!}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-full overflow-hidden rounded-r-2xl shadow-2xl">
                  <img
                    src={p.image!}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Close button */}
              <button
                onClick={(e) => handleDismiss(p.id, e)}
                className={`absolute ${
                  p.position === "header"
                    ? "top-2 right-3"
                    : p.position === "footer"
                      ? "bottom-2 right-3"
                      : "top-3 right-3"
                } w-7 h-7 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-10`}
                title="Cerrar"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}

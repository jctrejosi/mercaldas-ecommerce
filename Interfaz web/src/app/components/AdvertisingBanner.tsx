import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface AdBanner {
  id: number;
  title: string;
  subtitle: string;
  ctaText: string;
  image: string;
  badge: string;
  bg: string;
  accent: string;
  filter?: {
    categoryIds?: number[];
    brandId?: number | null;
    productTypeCode?: string;
    onSale?: boolean;
    search?: string;
    sort?: string;
    priceMin?: number;
    priceMax?: number;
  } | null;
}

async function fetchPromoBanners(): Promise<AdBanner[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/banners?bannerType=promo`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((b: any) => ({
      id: b.id,
      title: b.title || "",
      subtitle: b.subtitle || b.description || "",
      ctaText: b.ctaText || "Ver más",
      image: b.image || "",
      badge: b.title ? b.title.split(" ").slice(0, 2).join(" ").toUpperCase() : "OFERTA",
      bg: b.bgColor
        ? `linear-gradient(135deg, ${b.bgColor} 0%, ${b.bgColor}dd 100%)`
        : "linear-gradient(135deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)",
      accent: b.accentColor || "#FFF200",
      filter: b.filter || null,
    }));
  } catch {
    return [];
  }
}

const FALLBACK: AdBanner[] = [
  {
    id: 1,
    title: "Semana del Ahorro",
    subtitle: "Hasta 40% de descuento en miles de productos seleccionados",
    ctaText: "Aprovechar ahora",
    badge: "OFERTA LIMITADA",
    bg: "linear-gradient(135deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)",
    accent: "#FFF200",
    image: "https://images.unsplash.com/photo-1607083207685-aaf05f2c908c?w=900&h=300&fit=crop&auto=format",
    filter: null,
  },
];

const ANIM_STYLES = `
@keyframes promoFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes promoBgFade {
  from { opacity: 0.8; }
  to   { opacity: 1; }
}
`;

export function AdvertisingBanner({
  onShop,
  onApplyFilter,
}: {
  onShop: () => void;
  onApplyFilter?: (f: NonNullable<AdBanner["filter"]>) => void;
}) {
  const [banners, setBanners] = useState<AdBanner[]>(FALLBACK);
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchPromoBanners().then((data) => {
      if (data.length > 0) setBanners(data);
    });
  }, []);

  const advance = useCallback(() => {
    setAnimKey((k) => k + 1);
    setTimeout(() => setCurrent((c) => (c + 1) % banners.length), 50);
  }, [banners.length]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (banners.length <= 1) return;
    timerRef.current = setInterval(advance, 6000);
  }, [advance, banners.length]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const go = (dir: number) => {
    setAnimKey((k) => k + 1);
    setTimeout(() => {
      setCurrent((c) => (c + dir + banners.length) % banners.length);
      startTimer();
    }, 50);
  };

  const handleClick = () => {
    if (banners[current]?.filter && onApplyFilter) {
      onApplyFilter(banners[current].filter!);
    } else {
      onShop();
    }
  };

  if (banners.length === 0) return null;
  const banner = banners[current];

  return (
    <section className="py-6 bg-background">
      <style>{ANIM_STYLES}</style>
      <div className="max-w-7xl mx-auto px-4">
        <div
          className="relative overflow-hidden rounded-2xl h-40 md:h-44"
          style={{
            background: banner.bg,
            transition: "background 0.6s ease",
          }}
        >
          {/* BG image with crossfade */}
          <div className="absolute right-0 top-0 h-full w-1/2 md:w-2/5">
            {banner.image && (
              <img
                key={`promo-img-${current}`}
                src={banner.image}
                alt=""
                className="w-full h-full object-cover opacity-25"
                style={{ animation: "promoBgFade 0.7s ease both" }}
              />
            )}
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to right, transparent 0%, rgba(0,0,0,0.1) 100%)` }}
            />
          </div>

          {/* Content */}
          <div key={animKey} className="relative z-10 px-7 py-6 flex flex-col md:flex-row md:items-center gap-4 h-full">
            <div className="flex-1 min-w-0">
              <span
                className="inline-block text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full mb-2"
                style={{
                  background: banner.accent,
                  color: "#1A1A2E",
                  animation: "promoFadeIn 0.5s ease both",
                  animationDelay: "0ms",
                }}
              >
                {banner.badge}
              </span>
              <h2
                className="text-xl md:text-2xl font-black text-white leading-tight mb-1 truncate"
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  animation: "promoFadeIn 0.5s ease both",
                  animationDelay: "80ms",
                }}
              >
                {banner.title}
              </h2>
              <p
                className="text-sm max-w-sm line-clamp-2"
                style={{
                  color: "rgba(255,255,255,0.7)",
                  animation: "promoFadeIn 0.5s ease both",
                  animationDelay: "160ms",
                }}
              >
                {banner.subtitle}
              </p>
            </div>
            <button
              onClick={handleClick}
              className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:brightness-95 active:scale-95 self-start md:self-auto"
              style={{
                background: banner.accent,
                color: "#1A1A2E",
                animation: "promoFadeIn 0.5s ease both",
                animationDelay: "240ms",
              }}
            >
              {banner.ctaText}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Arrows */}
          {banners.length > 1 && (
            <>
              <button
                onClick={() => go(-1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-all"
                style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)" }}
              >
                <ChevronLeft className="w-3.5 h-3.5 text-white" />
              </button>
              <button
                onClick={() => go(1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-all"
                style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)" }}
              >
                <ChevronRight className="w-3.5 h-3.5 text-white" />
              </button>
            </>
          )}

          {/* Dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setAnimKey((k) => k + 1);
                    setTimeout(() => { setCurrent(i); startTimer(); }, 50);
                  }}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? "20px" : "6px",
                    background: i === current ? "#FFF200" : "rgba(255,255,255,0.4)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

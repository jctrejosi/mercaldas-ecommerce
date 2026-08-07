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
    return (Array.isArray(data) ? data : []).map((b: any) => ({
      id: b.id,
      title: b.title || "",
      subtitle: b.subtitle || b.description || "",
      ctaText: b.ctaText || "",
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
@keyframes promoSlideInRight {
  from { transform: translateX(64px); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}
@keyframes promoSlideInLeft {
  from { transform: translateX(-64px); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}
@keyframes promoSlideOutLeft {
  from { transform: translateX(0); opacity: 1; }
  to   { transform: translateX(-64px); opacity: 0; }
}
@keyframes promoSlideOutRight {
  from { transform: translateX(0); opacity: 1; }
  to   { transform: translateX(64px); opacity: 0; }
}
`;

// Duración del deslizamiento de salida (ms)
const SLIDE_OUT_MS = 400;

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
  const [isLeaving, setIsLeaving] = useState(false);
  const [slideDir, setSlideDir] = useState<1 | -1>(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const leavingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchPromoBanners().then((data) => {
      if (data.length > 0) setBanners(data);
    });
  }, []);

  const goTo = useCallback(
    (idx: number, dir: 1 | -1 = 1) => {
      // Si ya hay una transición en curso, ignorar el cambio
      if (leavingTimerRef.current) return;

      // 1) El item actual se desliza hacia afuera (según la dirección)
      setSlideDir(dir);
      setIsLeaving(true);

      // 2) Al terminar, cambiar de item: el nuevo entra deslizándose
      leavingTimerRef.current = setTimeout(() => {
        setCurrent(idx);
        setAnimKey((k) => k + 1);
        setIsLeaving(false);
        leavingTimerRef.current = null;
      }, SLIDE_OUT_MS);
    },
    [],
  );

  const advance = useCallback(() => {
    goTo((current + 1) % banners.length, 1);
  }, [current, banners.length, goTo]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (banners.length <= 1) return;
    timerRef.current = setInterval(advance, 6000);
  }, [advance, banners.length]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (leavingTimerRef.current) clearTimeout(leavingTimerRef.current);
    };
  }, [startTimer]);

  const go = (dir: number) => {
    goTo((current + dir + banners.length) % banners.length, dir as 1 | -1);
    // Reiniciar el autoplay una vez completada la transición
    setTimeout(() => startTimer(), SLIDE_OUT_MS + 60);
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
  const hasText = !!(banner.title || banner.subtitle || banner.ctaText);

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
          {/* BG image — ancho completo cuando no hay texto */}
          <div className={`absolute top-0 h-full ${hasText ? "right-0 w-1/2 md:w-2/5" : "inset-0 w-full"}`}>
            {banner.image && (
              <img
                key={`promo-img-${current}`}
                src={banner.image}
                alt=""
                className={`w-full h-full object-contain ${hasText ? "opacity-25" : ""}`}
                style={{
                  animation: isLeaving
                    ? slideDir === 1
                      ? "promoSlideOutLeft 0.4s ease both"
                      : "promoSlideOutRight 0.4s ease both"
                    : slideDir === 1
                      ? "promoSlideInRight 0.55s ease both"
                      : "promoSlideInLeft 0.55s ease both",
                }}
              />
            )}
            {hasText && (
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(to right, transparent 0%, rgba(0,0,0,0.1) 100%)` }}
              />
            )}
          </div>

          {/* Content */}
          <div
            key={animKey}
            className="relative z-10 px-7 py-6 flex flex-col md:flex-row md:items-center gap-4 h-full"
            style={
              isLeaving
                ? {
                    animation:
                      slideDir === 1
                        ? "promoSlideOutLeft 0.4s ease both"
                        : "promoSlideOutRight 0.4s ease both",
                  }
                : {
                    animation:
                      slideDir === 1
                        ? "promoSlideInRight 0.55s ease both"
                        : "promoSlideInLeft 0.55s ease both",
                  }
            }
          >
            <div className="flex-1 min-w-0">
              {(banner.title || banner.subtitle) && (
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
              )}
              {banner.title && (
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
              )}
              {banner.subtitle && (
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
              )}
            </div>
            {banner.ctaText && (
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
            )}
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
                    goTo(i, i > current ? 1 : -1);
                    setTimeout(() => startTimer(), SLIDE_OUT_MS + 60);
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

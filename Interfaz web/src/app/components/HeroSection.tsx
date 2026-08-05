import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  ctaText: string;
  image: string;
  mobileImage: string;
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

async function fetchHeroSlides(): Promise<HeroSlide[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/banners?bannerType=hero`);
    if (!res.ok) return [];
    const banners = await res.json();
    return banners.map((b: any) => ({
      id: b.id,
      title: b.title || "",
      subtitle: b.subtitle || b.description || "",
      cta: b.linkUrl || "",
      ctaText: b.ctaText || "Ver más",
      image: b.image || "",
      mobileImage: b.mobileImage || b.image || "",
      bg: b.bgColor || "#1A1A2E",
      accent: b.accentColor || "#FFF200",
      filter: b.filter || null,
    }));
  } catch {
    return [];
  }
}

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: 0,
    title: "Configura tus slides\ndesde el panel admin",
    subtitle:
      "Ve a Contenido → Home en el panel de administración para añadir banners hero con imágenes, textos y colores personalizados.",
    cta: "",
    ctaText: "Ir al panel admin",
    image: "",
    mobileImage: "",
    bg: "#374151",
    accent: "#9CA3AF",
  },
];

const ANIM_STYLES = `
@keyframes heroFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes heroImageIn {
  from { opacity: 0; transform: scale(1.05); }
  to   { opacity: 0.45; transform: scale(1); }
}
@keyframes heroBgShift {
  from { opacity: 0.6; }
  to   { opacity: 1; }
}
`;

export function HeroSection({
  onApplyFilter,
}: {
  onApplyFilter?: (f: NonNullable<HeroSlide["filter"]>) => void;
}) {
  const [slides, setSlides] = useState<HeroSlide[]>(FALLBACK_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isManualRef = useRef(false);

  useEffect(() => {
    fetchHeroSlides().then((data) => {
      if (data.length > 0) setSlides(data);
    });
  }, []);

  const goTo = useCallback(
    (idx: number) => {
      // Trigger re-mount animation
      setAnimKey((k) => k + 1);
      setTimeout(() => setCurrentIndex(idx), 50);
    },
    [],
  );

  const advance = useCallback(() => {
    goTo((currentIndex + 1) % slides.length);
  }, [currentIndex, slides.length, goTo]);

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (slides.length <= 1) return;
    intervalRef.current = setInterval(advance, 5000);
  }, [advance, slides.length]);

  useEffect(() => {
    startTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startTimer]);

  const goSlide = (dir: number) => {
    isManualRef.current = true;
    goTo((currentIndex + dir + slides.length) % slides.length);
    // Restart auto-timer after manual interaction
    setTimeout(() => {
      isManualRef.current = false;
      startTimer();
    }, 50);
  };

  if (slides.length === 0) return null;

  const slide = slides[currentIndex];

  return (
    <section className="relative overflow-hidden" style={{ background: slide.bg, transition: "background 0.6s ease" }}>
      <style>{ANIM_STYLES}</style>

      <div className="max-w-7xl mx-auto px-4">
        <div className="relative flex items-center h-[340px] md:h-[420px]">
          {/* Content */}
          <div key={animKey} className="relative z-10 flex-1 py-8 max-w-xl">
            <div
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5"
              style={{
                background: slide.accent,
                color: "#1A1A2E",
                animation: "heroFadeIn 0.5s ease both",
                animationDelay: "0ms",
              }}
            >
              <Sparkles className="w-3 h-3" />
              Mercaldas · Manizales
            </div>
            <h1
              className="font-black text-3xl md:text-5xl leading-[1.1] mb-4 text-white whitespace-pre-line"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                animation: "heroFadeIn 0.5s ease both",
                animationDelay: "100ms",
              }}
            >
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p
                className="text-sm md:text-base mb-7 max-w-sm line-clamp-2"
                style={{
                  color: "rgba(255,255,255,0.75)",
                  animation: "heroFadeIn 0.5s ease both",
                  animationDelay: "200ms",
                }}
              >
                {slide.subtitle}
              </p>
            )}
            {slide.ctaText && (
              <button
                onClick={() => {
                  if (slide.filter && onApplyFilter) onApplyFilter(slide.filter);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:brightness-95 active:scale-95"
                style={{
                  background: slide.accent,
                  color: "#1A1A2E",
                  animation: "heroFadeIn 0.5s ease both",
                  animationDelay: "300ms",
                }}
              >
                {slide.ctaText}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Background image with crossfade */}
          {slide.image && (
            <div className="absolute right-0 top-0 h-full w-1/2 md:w-5/12">
              <img
                key={`img-${currentIndex}`}
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                style={{ opacity: 0.45, animation: "heroImageIn 0.7s ease both" }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to right, ${slide.bg} 10%, transparent 60%)`,
                }}
              />
            </div>
          )}

          {/* Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={() => goSlide(-1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => goSlide(1)}
                className="absolute right-2 md:right-[42%] top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                goTo(i);
                startTimer();
              }}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === currentIndex ? "24px" : "6px",
                background: i === currentIndex ? "#FFF200" : "rgba(255,255,255,0.4)",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Slide } from "../types";

const HERO_SLIDES: Slide[] = [
  {
    id: 1,
    title: "Frutas y Verduras\nFrescas del Día",
    subtitle:
      "Directo de los mejores cultivadores de la región. Frescura garantizada en cada entrega.",
    cta: "Ver Frutas y Verduras",
    image:
      "https://images.unsplash.com/photo-1729622493745-03ca9590c64a?w=1200&h=600&fit=crop&auto=format",
    bg: "#1A1A2E",
    accent: "#FFF200",
  },
  {
    id: 2,
    title: "Hasta 30% OFF\nen Productos Seleccionados",
    subtitle:
      "Aprovecha nuestras promociones de temporada. Ofertas válidas hasta agotar existencias.",
    cta: "Ver Todas las Ofertas",
    image:
      "https://images.unsplash.com/photo-1607083207685-aaf05f2c908c?w=1200&h=600&fit=crop&auto=format",
    bg: "#8B0000",
    accent: "#FFF200",
  },
  {
    id: 3,
    title: "Tu Mercado Completo\nSin Salir de Casa",
    subtitle: "Miles de productos, domicilio en Manizales en menos de 2 horas.",
    cta: "Empezar a Comprar",
    image:
      "https://images.unsplash.com/photo-1533413710577-c1b62c5fc55b?w=1200&h=600&fit=crop&auto=format",
    bg: "#1A4A2E",
    accent: "#FFF200",
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startSlideTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentSlide((s) => (s + 1) % HERO_SLIDES.length);
    }, 4500);
  };

  useEffect(() => {
    startSlideTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const goSlide = (dir: number) => {
    setCurrentSlide((s) => (s + dir + HERO_SLIDES.length) % HERO_SLIDES.length);
    startSlideTimer();
  };

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: slide.bg, transition: "background 0.5s ease" }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative flex items-center min-h-[320px] md:min-h-[420px]">
          {/* Content */}
          <div className="relative z-10 flex-1 py-10 max-w-xl">
            <div
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5"
              style={{ background: slide.accent, color: "#1A1A2E" }}
            >
              <Sparkles className="w-3 h-3" />
              Mercaldas · Manizales
            </div>
            <h1
              className="font-black text-3xl md:text-5xl leading-[1.1] mb-4 text-white whitespace-pre-line"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              {slide.title}
            </h1>
            <p
              className="text-sm md:text-base mb-7 max-w-sm"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              {slide.subtitle}
            </p>
            <button
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:brightness-95 active:scale-95"
              style={{ background: slide.accent, color: "#1A1A2E" }}
            >
              {slide.cta}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Background image */}
          <div className="absolute right-0 top-0 h-full w-1/2 md:w-5/12">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              style={{ opacity: 0.45 }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, ${slide.bg} 10%, transparent 60%)`,
              }}
            />
          </div>

          {/* Arrows */}
          <button
            onClick={() => goSlide(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(4px)",
            }}
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => goSlide(1)}
            className="absolute right-2 md:right-[42%] top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(4px)",
            }}
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentSlide(i);
              startSlideTimer();
            }}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === currentSlide ? "24px" : "6px",
              background:
                i === currentSlide ? "#FFF200" : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>
    </section>
  );
}

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Brand } from "../types";

interface BrandsSectionProps {
  brands: Brand[];
  onBrandClick?: (brandId: number) => void;
}

const FALLBACK_BRANDS = [
  "Alquería", "Alpina", "Ariel", "Colgate", "Nestlé", "Juan Valdez", "Huggies", "Head & Shoulders", "Protex", "Casillero del Diablo",
];
const FALLBACK_EMOJIS = ["🥛", "🧀", "🫧", "🪥", "☕", "☕", "👶", "💆", "🧼", "🍷"];

export function BrandsSection({ brands = [], onBrandClick }: BrandsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Lista duplicada para lograr loop infinito: al llegar a la mitad del
  // contenido duplicado se reinicia el scroll a 0 sin que se note.
  const loopBrands = brands.length > 0 ? [...brands, ...brands] : null;

  const scrollBy = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  // Auto-scroll infinito continuo (igual que el carrusel de tipo de producto)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || brands.length === 0) return;
    let animId: number;
    const step = () => {
      if (!el) return;
      el.scrollLeft += 0.5;
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft = 0;
      }
      animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [brands.length]);

  return (
    <section className="py-10 bg-white border-y border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 rounded-full" style={{ background: "#1A1A2E" }} />
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nuestros aliados</p>
              <h2 className="font-black text-2xl text-foreground leading-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Marcas Destacadas
              </h2>
            </div>
          </div>
          <div className="hidden md:flex gap-1.5">
            <button onClick={() => scrollBy(-1)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => scrollBy(1)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {brands.length === 0 ? (
            <div className="flex gap-4">
              {[...FALLBACK_BRANDS, ...FALLBACK_BRANDS].map((name, i) => (
                <div key={`fb-${i}`} className="flex-shrink-0 flex flex-col items-center gap-3 group">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-border flex items-center justify-center transition-all duration-200 group-hover:border-foreground group-hover:shadow-md bg-white">
                    <span className="text-3xl md:text-4xl select-none opacity-60">{FALLBACK_EMOJIS[i % FALLBACK_EMOJIS.length]}</span>
                  </div>
                  <span className="text-xs font-semibold text-center text-muted-foreground group-hover:text-foreground transition-colors" style={{ maxWidth: "80px" }}>{name}</span>
                </div>
              ))}
            </div>
          ) : (
            loopBrands!.map((brand, i) => (
              <button key={`brand-${brand.id}-${i}`} onClick={() => onBrandClick?.(brand.id)} className="flex-shrink-0 flex flex-col items-center gap-3 group">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-border flex items-center justify-center transition-all duration-200 group-hover:border-foreground group-hover:shadow-md bg-white overflow-hidden">
                  {brand.image ? (
                    <img src={brand.image} alt={brand.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl md:text-4xl select-none opacity-40">{brand.name.charAt(0)}</span>
                  )}
                </div>
                <span className="text-xs font-semibold text-center text-muted-foreground group-hover:text-foreground transition-colors" style={{ maxWidth: "80px" }}>
                  {brand.name}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

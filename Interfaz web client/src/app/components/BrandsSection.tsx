import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Brand } from "../types";

interface BrandsSectionProps {
  brands: Brand[];
  onBrandClick?: (brandId: number) => void;
}

export function BrandsSection({ brands = [], onBrandClick }: BrandsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 220, behavior: "smooth" });
    }
  };

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
            <button onClick={() => scroll(-1)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => scroll(1)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {brands.length === 0 ? (
            <div className="flex gap-4">
              {["Alquería", "Alpina", "Ariel", "Colgate", "Nestlé", "Juan Valdez", "Huggies", "Head & Shoulders", "Protex", "Casillero del Diablo"].map((name, i) => (
                <div key={name} className="flex-shrink-0 flex flex-col items-center gap-3 group">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-border flex items-center justify-center transition-all duration-200 group-hover:border-foreground group-hover:shadow-md bg-white">
                    <span className="text-3xl md:text-4xl select-none opacity-60">{["🥛", "🧀", "🫧", "🪥", "☕", "☕", "👶", "💆", "🧼", "🍷"][i]}</span>
                  </div>
                  <span className="text-xs font-semibold text-center text-muted-foreground group-hover:text-foreground transition-colors" style={{ maxWidth: "80px" }}>{name}</span>
                </div>
              ))}
            </div>
          ) : (
            brands.map((brand) => (
              <button key={brand.id} onClick={() => onBrandClick?.(brand.id)} className="flex-shrink-0 flex flex-col items-center gap-3 group">
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

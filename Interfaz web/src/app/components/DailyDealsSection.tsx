import { useState, useEffect, useRef } from "react";
import { ShoppingCart, Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product, CartItem } from "../types";

const DEAL_OF_DAY_ITEMS = [
  {
    id: 1,
    title: "Papa Criolla\nLimpia",
    subtitle: "Fresca desde las fincas caldenses",
    discount: "21% OFF",
    price: 3800,
    originalPrice: 4800,
    unit: "x kg",
    image: "https://images.unsplash.com/photo-1589894308598-8ddba0593e91?w=600&h=600&fit=crop&auto=format",
    bg: "linear-gradient(160deg, #1A4A2E 0%, #0D3B1F 100%)",
    endsAt: "Hoy · Hasta agotar existencias",
  },
  {
    id: 2,
    title: "Aguacate\nHass",
    subtitle: "Madurez perfecta garantizada",
    discount: "25% OFF",
    price: 2100,
    originalPrice: 2800,
    unit: "x und",
    image: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=600&h=600&fit=crop&auto=format",
    bg: "linear-gradient(160deg, #2D4A1A 0%, #1F3B0D 100%)",
    endsAt: "Hoy · Oferta del día",
  },
  {
    id: 3,
    title: "Fresas\nFrescas",
    subtitle: "Dulces y naturales, sin preservantes",
    discount: "30% OFF",
    price: 4900,
    originalPrice: 7000,
    unit: "x 500 g",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&h=600&fit=crop&auto=format",
    bg: "linear-gradient(160deg, #6B0D20 0%, #8B1428 100%)",
    endsAt: "Hoy · Temporada",
  },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

interface DailyDealsSectionProps {
  cartItems: CartItem[];
  onAdd: (product: Product, quantity?: number) => void;
  onRemove: (id: number) => void;
  onProductClick: (product: Product) => void;
  dealProducts: Product[];
}

export function DailyDealsSection({
  cartItems, onAdd, onRemove, onProductClick, dealProducts,
}: DailyDealsSectionProps) {
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [carouselStart, setCarouselStart] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const VISIBLE = 3;

  useEffect(() => {
    const t = setInterval(() => setFeaturedIdx((i) => (i + 1) % DEAL_OF_DAY_ITEMS.length), 6000);
    return () => clearInterval(t);
  }, []);

  const scrollCarousel = (dir: number) => {
    const next = carouselStart + dir;
    if (next < 0 || next + VISIBLE > dealProducts.length) return;
    setCarouselStart(next);
  };

  const featured = DEAL_OF_DAY_ITEMS[featuredIdx];

  return (
    <section className="py-10 bg-muted/40">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 rounded-full" style={{ background: "#FFF200" }} />
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Cada día</p>
              <h2 className="font-black text-2xl text-foreground leading-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Ofertas del Día
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {DEAL_OF_DAY_ITEMS.map((_, i) => (
              <button
                key={i}
                onClick={() => setFeaturedIdx(i)}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{ background: i === featuredIdx ? "#1A1A2E" : "#D1D5DB", width: i === featuredIdx ? "20px" : "8px" }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left: featured deal of the day */}
          <div
            className="lg:w-72 flex-shrink-0 rounded-2xl overflow-hidden relative flex flex-col justify-between"
            style={{ background: featured.bg, minHeight: "340px", transition: "background 0.6s ease" }}
          >
            <div className="p-6 z-10 relative">
              <span
                className="inline-block text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full mb-4"
                style={{ background: "#FFF200", color: "#1A1A2E" }}
              >
                {featured.discount}
              </span>
              <h3
                className="text-2xl font-black text-white whitespace-pre-line leading-tight mb-1"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                {featured.title}
              </h3>
              <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.65)" }}>{featured.subtitle}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  {fmt(featured.price)}
                </span>
                <span className="text-sm line-through" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {fmt(featured.originalPrice)}
                </span>
              </div>
              <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>{featured.unit}</p>
              <p className="text-xs mt-3 font-semibold" style={{ color: "#FFF200" }}>⏱ {featured.endsAt}</p>
            </div>

            <div className="relative h-44 overflow-hidden flex-shrink-0">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover"
                style={{ transition: "opacity 0.4s ease", objectPosition: "center" }}
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 50%)" }} />
            </div>

            {/* Nav dots bottom */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {DEAL_OF_DAY_ITEMS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFeaturedIdx(i)}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{ width: i === featuredIdx ? "16px" : "5px", background: i === featuredIdx ? "#FFF200" : "rgba(255,255,255,0.4)" }}
                />
              ))}
            </div>
          </div>

          {/* Right: deals carousel */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted-foreground">
                Más ofertas del día — descuentos hasta agotar existencias
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => scrollCarousel(-1)}
                  disabled={carouselStart === 0}
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-border hover:bg-muted transition-colors disabled:opacity-30"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => scrollCarousel(1)}
                  disabled={carouselStart + VISIBLE >= dealProducts.length}
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-border hover:bg-muted transition-colors disabled:opacity-30"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div ref={carouselRef} className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-1">
              {dealProducts.slice(carouselStart, carouselStart + VISIBLE).map((p) => {
                const inCart = cartItems.find((c) => c.id === p.id);
                const qty = inCart?.quantity ?? 0;
                const discountPct = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
                return (
                  <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                    <button
                      className="relative bg-muted aspect-square overflow-hidden"
                      onClick={() => onProductClick(p)}
                    >
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      <span
                        className="absolute top-2 left-2 text-xs font-black px-2 py-0.5 rounded-full text-white"
                        style={{ background: "#FF4444" }}
                      >
                        {discountPct}% OFF
                      </span>
                    </button>
                    <div className="p-3 flex flex-col gap-1 flex-1">
                      <p className="text-xs text-muted-foreground">{p.category}</p>
                      <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{p.name}</p>
                      <div className="flex items-end gap-1.5 mt-auto pt-1">
                        <span className="font-bold text-base text-foreground" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                          {fmt(p.price)}
                        </span>
                        <span className="text-xs text-muted-foreground line-through">{fmt(p.originalPrice!)}</span>
                      </div>
                      <div className="flex items-center border border-border rounded-lg overflow-hidden mt-2">
                        <button onClick={() => onRemove(p.id)} disabled={qty === 0} className="flex-1 flex items-center justify-center py-1.5 disabled:opacity-25 hover:bg-muted transition-colors">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-sm w-8 text-center tabular-nums">{qty}</span>
                        <button onClick={() => onAdd(p)} className="flex-1 flex items-center justify-center py-1.5 hover:bg-muted transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => onAdd(p)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-semibold text-sm mt-1 transition-all hover:brightness-95 active:scale-95"
                        style={{ background: "#FFF200", color: "#1A1A2E" }}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {qty === 0 ? "Agregar" : "Agregar uno más"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

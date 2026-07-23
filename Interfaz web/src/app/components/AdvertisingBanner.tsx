import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AD_BANNERS = [
  {
    id: 1,
    title: "Semana del Ahorro",
    subtitle: "Hasta 40% de descuento en miles de productos seleccionados",
    cta: "Aprovechar ahora",
    badge: "OFERTA LIMITADA",
    bg: "linear-gradient(135deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)",
    accent: "#FFF200",
    image: "https://images.unsplash.com/photo-1607083207685-aaf05f2c908c?w=900&h=300&fit=crop&auto=format",
  },
  {
    id: 2,
    title: "Canasta Familiar",
    subtitle: "Los básicos del hogar al mejor precio. Envío gratis en pedidos superiores a $80.000",
    cta: "Ver canasta",
    badge: "ENVÍO GRATIS",
    bg: "linear-gradient(135deg, #1A4A2E 0%, #1F5C38 100%)",
    accent: "#FFF200",
    image: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=900&h=300&fit=crop&auto=format",
  },
  {
    id: 3,
    title: "Festival de Frutas",
    subtitle: "Frescura garantizada directo del campo al carrito. Escoge entre más de 50 variedades.",
    cta: "Explorar frutas",
    badge: "TEMPORADA",
    bg: "linear-gradient(135deg, #7B2D00 0%, #C0392B 100%)",
    accent: "#FFF200",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=900&h=300&fit=crop&auto=format",
  },
];

export function AdvertisingBanner({ onShop }: { onShop: () => void }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % AD_BANNERS.length), 5000);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const go = (dir: number) => {
    setCurrent((c) => (c + dir + AD_BANNERS.length) % AD_BANNERS.length);
    startTimer();
  };

  const banner = AD_BANNERS[current];

  return (
    <section className="py-6 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ background: banner.bg, transition: "background 0.5s ease", minHeight: "160px" }}
        >
          {/* BG image */}
          <div className="absolute right-0 top-0 h-full w-1/2 md:w-2/5">
            <img src={banner.image} alt="" className="w-full h-full object-cover opacity-25" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to right, transparent 0%, rgba(0,0,0,0.1) 100%)` }} />
          </div>

          <div className="relative z-10 px-7 py-8 flex flex-col md:flex-row md:items-center gap-5">
            <div className="flex-1">
              <span
                className="inline-block text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full mb-3"
                style={{ background: banner.accent, color: "#1A1A2E" }}
              >
                {banner.badge}
              </span>
              <h2
                className="text-2xl md:text-3xl font-black text-white leading-tight mb-2"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                {banner.title}
              </h2>
              <p className="text-sm max-w-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{banner.subtitle}</p>
            </div>
            <button
              onClick={onShop}
              className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:brightness-95 active:scale-95 self-start md:self-auto"
              style={{ background: banner.accent, color: "#1A1A2E" }}
            >
              {banner.cta}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Arrows */}
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

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {AD_BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); startTimer(); }}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: i === current ? "20px" : "6px", background: i === current ? "#FFF200" : "rgba(255,255,255,0.4)" }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

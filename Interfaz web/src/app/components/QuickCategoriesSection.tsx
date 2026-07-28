import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductType {
  id: number;
  code: string;
  name: string;
  count: number;
}

interface QuickCategoriesSectionProps {
  productTypes?: ProductType[];
  onProductTypeClick: (code: string) => void;
  onViewAll: () => void;
}

const ICONS = ["🥬", "🥩", "🥛", "🥫", "🧹", "💄", "👶", "🍷", "🏠", "💻", "🐾", "🔌"];

function ProductTypeButton({ pt, index, onClick }: { pt: ProductType; index: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 flex-shrink-0 p-3 rounded-xl hover:bg-muted transition-colors min-w-[90px] cursor-pointer"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg"
        style={{ background: "#F4F4F6", color: "#6B7280" }}
      >
        {ICONS[index % ICONS.length]}
      </div>
      <span className="text-xs font-semibold text-center text-foreground leading-tight max-w-[90px]">
        {pt.name}
      </span>
      <span className="text-[10px] text-muted-foreground">
        {pt.count} productos
      </span>
    </button>
  );
}

export function QuickCategoriesSection({
  productTypes = [],
  onProductTypeClick,
  onViewAll,
}: QuickCategoriesSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let animId: number;
    const step = () => {
      el.scrollLeft += 0.5;
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
        el.scrollLeft = 0;
      }
      animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, []);

  const scrollBy = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  if (productTypes.length === 0) {
    return (
      <section className="py-8 bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-sm text-muted-foreground">Cargando tipos de producto...</p>
          </div>
        </section>
      );
    }

    return (
      <>
      <section className="py-8 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-5">
          <h2
            className="font-black text-lg text-foreground"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Tipo de producto
          </h2>
          <button
            onClick={onViewAll}
            className="text-xs font-medium text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
          >
            Ver todos <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Carousel with arrows */}
        <div className="relative group">
          <button
            onClick={() => scrollBy(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {productTypes.map((pt, i) => (
              <ProductTypeButton
                key={pt.id}
                pt={pt}
                index={i}
                onClick={() => onProductTypeClick(pt.code)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>

    </>
  );
}

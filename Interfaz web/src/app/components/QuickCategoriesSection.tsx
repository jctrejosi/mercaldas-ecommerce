import { ChevronRight } from "lucide-react";

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

export function QuickCategoriesSection({
  productTypes = [],
  onProductTypeClick,
  onViewAll,
}: QuickCategoriesSectionProps) {
  const displayTypes = productTypes.slice(0, 10);

  return (
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
        <div
          className="flex gap-4 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {displayTypes.length === 0 && (
            <p className="text-sm text-muted-foreground">Cargando tipos de producto...</p>
          )}
          {displayTypes.map((pt, i) => (
            <button
              key={pt.id}
              onClick={() => onProductTypeClick(pt.code)}
              className="flex flex-col items-center gap-2 flex-shrink-0 p-3 rounded-xl hover:bg-muted transition-colors min-w-[90px]"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-lg"
                style={{ background: "#F4F4F6", color: "#6B7280" }}
              >
                {ICONS[i % ICONS.length]}
              </div>
              <span className="text-xs font-semibold text-center text-foreground leading-tight max-w-[90px]">
                {pt.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {pt.count} productos
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

import { ChevronRight } from "lucide-react";
import type { CatalogCategory } from "../types";

interface QuickCategoriesSectionProps {
  categories: CatalogCategory[];
  onCategoryClick: (categoryId: number) => void;
  onViewAll: () => void;
}

export function QuickCategoriesSection({
  categories,
  onCategoryClick,
  onViewAll,
}: QuickCategoriesSectionProps) {
  return (
    <section className="py-8 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-5">
          <h2
            className="font-black text-lg text-foreground"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Categorías
          </h2>
          <button
            onClick={onViewAll}
            className="text-xs font-medium text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
          >
            Ver todas <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div
          className="flex gap-4 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryClick(cat.id)}
                className="flex flex-col items-center gap-2 flex-shrink-0 p-3 rounded-xl hover:bg-muted transition-colors min-w-[90px]"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-lg"
                  style={{
                    background: cat.bg || "#F4F4F6",
                    color: cat.color || "#6B7280",
                  }}
                >
                  {Icon ? (
                    <Icon className="w-5 h-5" />
                  ) : (
                    <span className="font-bold text-sm">
                      {cat.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-center text-foreground leading-tight">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

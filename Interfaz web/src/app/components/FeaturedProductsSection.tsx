import { ChevronRight } from "lucide-react";
import type { CartItem, Product } from "../types";
import { ProductCard } from "../Views/CatalogView/ProductCard";
import { SkeletonCard } from "../Views/CatalogView/SkeletonCard";

const PRODUCT_TABS = [
  { id: "vendidos", label: "Más Vendidos" },
  { id: "promociones", label: "Promociones" },
  { id: "recomendados", label: "Recomendados" },
  { id: "novedades", label: "Novedades" },
];

interface FeaturedProductsSectionProps {
  products: Product[];
  loading: boolean;
  activeTab: string;
  cartItems: CartItem[];
  onTabChange: (tab: string) => void;
  onAdd: (product: Product, quantity?: number) => void;
  onRemove: (id: number) => void;
  onProductClick: (product: Product) => void;
  onViewAll: () => void;
}

export function FeaturedProductsSection({
  products,
  loading,
  activeTab,
  cartItems,
  onTabChange,
  onAdd,
  onRemove,
  onProductClick,
  onViewAll,
}: FeaturedProductsSectionProps) {
  return (
    <section className="py-10 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="font-black text-2xl text-foreground"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Productos Destacados
          </h2>
          <button
            onClick={onViewAll}
            className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Ver catálogo completo <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div
          className="flex gap-2 mb-6 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {PRODUCT_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
              style={
                activeTab === tab.id
                  ? { background: "#FFF200", color: "#1A1A2E" }
                  : { background: "#F4F4F6", color: "#6B7280" }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                cartItems={cartItems}
                onAdd={onAdd}
                onRemove={onRemove}
                onProductClick={onProductClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No hay productos disponibles en esta categoría.
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={onViewAll}
            className="px-8 py-3 rounded-xl font-bold text-sm border-2 transition-all hover:bg-foreground hover:text-white"
            style={{ borderColor: "#1A1A2E", color: "#1A1A2E" }}
          >
            Ver todos los productos
          </button>
        </div>
      </div>
    </section>
  );
}

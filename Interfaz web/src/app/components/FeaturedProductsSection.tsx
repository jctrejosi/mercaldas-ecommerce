import { ChevronRight } from "lucide-react";
import type { CartItem, Product } from "../types";
import { ProductCard } from "../Views/CatalogView/ProductCard";
import { SkeletonCard } from "../Views/CatalogView/SkeletonCard";

export interface FeaturedTab {
  id: number;
  name: string;
  slug: string;
  position: number;
}

interface FeaturedProductsSectionProps {
  products: Product[];
  loading: boolean;
  activeTab: string;
  tabs?: FeaturedTab[];
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
  tabs = [],
  cartItems,
  onTabChange,
  onAdd,
  onRemove,
  onProductClick,
  onViewAll,
}: FeaturedProductsSectionProps) {
  const hasTabs = tabs.length > 0;

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
            className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Ver catálogo completo <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {!hasTabs ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: "#F4F4F6" }}
          >
            <p className="font-bold text-gray-500">
              Configura los productos destacados desde el panel admin
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Ve a Contenido → Home → Productos Destacados para crear pestañas y
              adjuntar productos.
            </p>
          </div>
        ) : (
          <>
            <div
              className="flex gap-2 mb-6 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none" }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.slug)}
                  className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer"
                  style={
                    activeTab === tab.slug
                      ? { background: "#FFF200", color: "#1A1A2E" }
                      : { background: "#F4F4F6", color: "#6B7280" }
                  }
                >
                  {tab.name}
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
                No hay productos asignados a esta pestaña.
              </div>
            )}

            <div className="text-center mt-8">
              <button
                onClick={onViewAll}
                className="px-8 py-3 rounded-xl font-bold text-sm border-2 transition-all cursor-pointer hover:bg-[#1A1A2E] hover:text-white"
                style={{ borderColor: "#1A1A2E" }}
              >
                Ver todos los productos
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

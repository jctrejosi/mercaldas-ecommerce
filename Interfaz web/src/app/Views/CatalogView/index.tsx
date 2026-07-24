import { useEffect, useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { useCatalog } from "../../../hooks/useCatalog";
import { catalogService } from "../../../services/catalog.service";
import { InfiniteScrollTrigger } from "./InfiniteScrollTrigger";
import { ProductCard } from "./ProductCard";
import { SkeletonCard } from "./SkeletonCard";
import type { Brand, CatalogCategory, CatalogPageProps, Product } from "../../types";

const PRICE_RANGES = [
  { id: "all", label: "Todos los precios" },
  { id: "0-10000", label: "Hasta $10.000" },
  { id: "10000-30000", label: "$10.000 – $30.000" },
  { id: "30000-70000", label: "$30.000 – $70.000" },
  { id: "70000+", label: "Más de $70.000" },
];

const SORT_OPTIONS = [
  { id: "relevancia", label: "Relevancia" },
  { id: "precio-asc", label: "Precio: menor a mayor" },
  { id: "precio-desc", label: "Precio: mayor a menor" },
  { id: "descuento", label: "Mayor descuento" },
  { id: "nombre", label: "Nombre A–Z" },
];

const EMPTY_PRODUCTS: Product[] = [];
const EMPTY_CATEGORIES: CatalogCategory[] = [];

export function CatalogPage({
  cartItems,
  onAdd,
  onRemove,
  onBack,
  onProductClick,
  catalogCategory,
  setCatalogCategory,
  catalogOnSale,
  setCatalogOnSale,
  catalogPriceRange,
  setCatalogPriceRange,
  catalogSort,
  setCatalogSort,
  catalogSearch,
  setCatalogSearch,
  catalogBrand,
  setCatalogBrand,
  mobileFiltersOpen,
  setMobileFiltersOpen,
}: CatalogPageProps) {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchInput, setSearchInput] = useState(catalogSearch);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    catalogService.getFeaturedBrands().then(setBrands).catch(() => {});
  }, []);
  const PAGE_SIZE = 20;

  const {
    categories,
    products,
    loading: catalogLoading,
  } = useCatalog({
    categoryIds: catalogCategory,
    onSale: catalogOnSale,
    priceRange: catalogPriceRange,
    sort: catalogSort,
    search: catalogSearch,
    brandId: catalogBrand ?? undefined,
    limit: PAGE_SIZE,
    offset,
  });

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || String(categoryId);
  };

  // Reset products when filters change
  useEffect(() => {
    setAllProducts([]);
    setOffset(0);
    setHasMore(true);
  }, [
    catalogCategory,
    catalogOnSale,
    catalogPriceRange,
    catalogSort,
    catalogSearch,
    catalogBrand,
  ]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setCatalogSearch(searchInput);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Sync search input when catalogSearch changes externally
  useEffect(() => {
    setSearchInput(catalogSearch);
  }, [catalogSearch]);

  // Accumulate products when new ones arrive
  useEffect(() => {
    if (offset === 0) {
      setAllProducts(products);
    } else {
      setAllProducts((prev) => [...prev, ...products]);
    }
    setHasMore(products.length === PAGE_SIZE);
    setLoadingMore(false);
  }, [products, offset]);

  const loadMore = () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setOffset((prev) => prev + PAGE_SIZE);
  };

  const categoriesByParentId = categories.reduce<
    Map<number | null, CatalogCategory[]>
  >((map, category) => {
    const parentId = category.parentId ?? null;
    const current = map.get(parentId) ?? [];
    current.push(category);
    map.set(parentId, current);
    return map;
  }, new Map());

  const getDescendantIds = (categoryId: number): number[] => {
    const descendants = new Set<number>();
    const stack = [categoryId];

    while (stack.length > 0) {
      const currentId = stack.pop()!;
      if (descendants.has(currentId)) continue;
      descendants.add(currentId);

      for (const child of categoriesByParentId.get(currentId) ?? []) {
        stack.push(child.id);
      }
    }

    return Array.from(descendants);
  };

  const getCategoryCount = (categoryId: number): number => {
    const descendantIds = getDescendantIds(categoryId);
    return descendantIds.reduce((sum, id) => {
      const category = categories.find((c) => c.id === id);
      return sum + (category?.count ?? 0);
    }, 0);
  };

  const toggleCategory = (categoryId: number) => {
    setCatalogCategory(
      catalogCategory.includes(categoryId)
        ? catalogCategory.filter((id) => id !== categoryId)
        : [...catalogCategory, categoryId],
    );
  };

  const catalogProducts = products.length > 0 ? products : EMPTY_PRODUCTS;
  const catalogCategories =
    categories.length > 0 ? categories : EMPTY_CATEGORIES;

  const rootCategories = catalogCategories.filter(
    (category) => !category.parentId,
  );

  const getChildCategories = (parentId: number) =>
    categoriesByParentId.get(parentId) ?? [];

  const activeFilterCount =
    catalogCategory.length +
    (catalogOnSale ? 1 : 0) +
    (catalogPriceRange !== "all" ? 1 : 0) +
    (catalogBrand ? 1 : 0);

  const clearAll = () => {
    setCatalogCategory([]);
    setCatalogOnSale(false);
    setCatalogPriceRange("all");
    setCatalogSearch("");
    setCatalogBrand(null);
  };

  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-bold text-sm text-foreground mb-3">Categorías</h3>
        <div className="space-y-1.5">
          {rootCategories.map((cat) => {
            const Icon = cat.icon;
            const childCategories = getChildCategories(cat.id);
            const checked = catalogCategory.includes(cat.id);

            return (
              <div key={cat.id} className="space-y-1">
                <label className="flex items-center gap-2.5 py-1 px-2 rounded-lg cursor-pointer hover:bg-muted transition-colors group">
                  <div
                    className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      borderColor: checked ? "#1A1A2E" : "#D1D5DB",
                      background: checked ? "#1A1A2E" : "white",
                    }}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    {checked && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4l2.5 2.5L9 1"
                          stroke="#FFF200"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: cat.bg ?? "#F3F4F6" }}
                  >
                    {Icon ? (
                      <Icon
                        className="w-3 h-3"
                        style={{ color: cat.color ?? "currentColor" }}
                      />
                    ) : null}
                  </div>
                  <span
                    className="text-sm flex-1 transition-colors"
                    style={{
                      color: checked ? "#1A1A2E" : "#6B7280",
                      fontWeight: checked ? 600 : 400,
                    }}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    {cat.name}
                  </span>
                </label>

                {checked && childCategories.length > 0 && (
                  <div className="ml-7 space-y-1 border-l border-border pl-2">
                    {childCategories.map((child) => {
                      const grandChildCategories = getChildCategories(child.id);
                      const childChecked = catalogCategory.includes(child.id);

                      return (
                        <div key={child.id} className="space-y-1">
                          <label className="flex items-center gap-2 py-1 px-2 rounded-lg cursor-pointer hover:bg-muted transition-colors">
                            <div
                              className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all"
                              style={{
                                borderColor: childChecked
                                  ? "#1A1A2E"
                                  : "#D1D5DB",
                                background: childChecked ? "#1A1A2E" : "white",
                              }}
                              onClick={() => toggleCategory(child.id)}
                            >
                              {childChecked && (
                                <svg
                                  width="8"
                                  height="6"
                                  viewBox="0 0 10 8"
                                  fill="none"
                                >
                                  <path
                                    d="M1 4l2.5 2.5L9 1"
                                    stroke="#FFF200"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                            <span
                              className="text-xs flex-1"
                              style={{
                                color: childChecked ? "#1A1A2E" : "#6B7280",
                                fontWeight: childChecked ? 600 : 400,
                              }}
                              onClick={() => toggleCategory(child.id)}
                            >
                              {child.name}
                            </span>
                          </label>

                          {childChecked && grandChildCategories.length > 0 && (
                            <div className="ml-6 space-y-1 border-l border-border pl-2">
                              {grandChildCategories.map((grandChild) => {
                                const grandChildChecked =
                                  catalogCategory.includes(grandChild.id);

                                return (
                                  <label
                                    key={grandChild.id}
                                    className="flex items-center gap-2 py-1 px-2 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                                  >
                                    <div
                                      className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all"
                                      style={{
                                        borderColor: grandChildChecked
                                          ? "#1A1A2E"
                                          : "#D1D5DB",
                                        background: grandChildChecked
                                          ? "#1A1A2E"
                                          : "white",
                                      }}
                                      onClick={() =>
                                        toggleCategory(grandChild.id)
                                      }
                                    >
                                      {grandChildChecked && (
                                        <svg
                                          width="8"
                                          height="6"
                                          viewBox="0 0 10 8"
                                          fill="none"
                                        >
                                          <path
                                            d="M1 4l2.5 2.5L9 1"
                                            stroke="#FFF200"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      )}
                                    </div>
                                    <span
                                      className="text-xs flex-1"
                                      style={{
                                        color: grandChildChecked
                                          ? "#1A1A2E"
                                          : "#6B7280",
                                        fontWeight: grandChildChecked
                                          ? 600
                                          : 400,
                                      }}
                                      onClick={() =>
                                        toggleCategory(grandChild.id)
                                      }
                                    >
                                      {grandChild.name}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Price range */}
      <div className="border-t border-border pt-5">
        <h3 className="font-bold text-sm text-foreground mb-3">
          Rango de precio
        </h3>
        <div className="space-y-1.5">
          {PRICE_RANGES.map((r) => (
            <label
              key={r.id}
              className="flex items-center gap-2.5 py-1 px-2 rounded-lg cursor-pointer hover:bg-muted transition-colors"
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{
                  borderColor:
                    catalogPriceRange === r.id ? "#1A1A2E" : "#D1D5DB",
                }}
                onClick={() => setCatalogPriceRange(r.id)}
              >
                {catalogPriceRange === r.id && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: "#1A1A2E" }}
                  />
                )}
              </div>
              <span
                className="text-sm cursor-pointer"
                style={{
                  color: catalogPriceRange === r.id ? "#1A1A2E" : "#6B7280",
                  fontWeight: catalogPriceRange === r.id ? 600 : 400,
                }}
                onClick={() => setCatalogPriceRange(r.id)}
              >
                {r.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div className="border-t border-border pt-5">
          <h3 className="font-bold text-sm text-foreground mb-3">Marcas</h3>
          <div className="space-y-1.5">
            {brands.map((brand) => {
              const checked = catalogBrand === brand.id;
              return (
                <label
                  key={brand.id}
                  className="flex items-center gap-2.5 py-1 px-2 rounded-lg cursor-pointer hover:bg-muted transition-colors group"
                >
                  <div
                    className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      borderColor: checked ? "#1A1A2E" : "#D1D5DB",
                      background: checked ? "#1A1A2E" : "white",
                    }}
                    onClick={() => setCatalogBrand(checked ? null : brand.id)}
                  >
                    {checked && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-sm flex-1 transition-colors"
                    style={{
                      color: checked ? "#1A1A2E" : "#6B7280",
                      fontWeight: checked ? 600 : 400,
                    }}
                    onClick={() => setCatalogBrand(checked ? null : brand.id)}
                  >
                    {brand.name}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* On sale */}
      <div className="border-t border-border pt-5">
        <label className="flex items-center justify-between cursor-pointer group">
          <div>
            <p className="font-bold text-sm text-foreground">Solo ofertas</p>
            <p className="text-xs text-muted-foreground">
              Productos con descuento
            </p>
          </div>
          <div
            className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
            style={{ background: catalogOnSale ? "#FFF200" : "#E5E7EB" }}
            onClick={() => setCatalogOnSale(!catalogOnSale)}
          >
            <div
              className="absolute top-1 w-4 h-4 rounded-full bg-foreground transition-all shadow-sm"
              style={{ left: catalogOnSale ? "calc(100% - 20px)" : "4px" }}
            />
          </div>
        </label>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearAll}
          className="w-full py-2 rounded-xl text-sm font-semibold text-muted-foreground border border-border hover:border-foreground hover:text-foreground transition-all"
        >
          Limpiar todos los filtros
        </button>
      )}
    </div>
  );

  const filtered = allProducts;

  return (
    <div
      className="bg-muted/40"
      style={{ height: "calc(100vh - 108px)", overflow: "hidden" }}
    >
      {/* ── Two-column body ── */}
      <div className="max-w-7xl mx-auto px-4 py-5 flex gap-5 h-full">
        {/* Desktop sidebar */}
        <aside
          className="hidden md:flex flex-col w-56 flex-shrink-0 bg-white rounded-xl border border-border overflow-y-auto"
          style={{ height: "calc(100vh - 148px)" }}
        >
          {/* Search inside sidebar */}
          <div className="p-3 border-b border-border sticky top-0 bg-white z-10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="relative"
            >
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar en catálogo..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-border bg-muted/60 focus:outline-none"
                onFocus={(e) => {
                  e.target.style.boxShadow = "0 0 0 2px #FFF200";
                  e.target.style.borderColor = "#FFF200";
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = "";
                }}
              />
            </form>
          </div>
          <div className="p-4">
            <SidebarContent />
          </div>
        </aside>

        {/* Products column */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Sort row + mobile filters trigger */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-shrink-0">
            <div className="flex items-center gap-2 ml-auto">
              {/* Mobile filters button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold md:hidden hover:bg-muted transition-colors"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                  <line x1="11" y1="18" x2="13" y2="18" />
                </svg>
                Filtros
                {activeFilterCount > 0 && (
                  <span
                    className="w-4 h-4 rounded-full text-xs font-black flex items-center justify-center"
                    style={{ background: "#FFF200", color: "#1A1A2E" }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>
              {/* Sort */}
              <select
                value={catalogSort}
                onChange={(e) => setCatalogSort(e.target.value)}
                className="pl-3 pr-7 py-2 text-xs rounded-lg border border-border bg-white focus:outline-none appearance-none cursor-pointer font-medium"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 6px center",
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {(catalogCategory.length > 0 ||
            catalogOnSale ||
            catalogPriceRange !== "all" ||
            catalogSearch ||
            catalogBrand) && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {catalogCategory.map((cat) => (
                <span
                  key={cat}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border-2 border-foreground text-foreground"
                >
                  {getCategoryName(cat)}
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="hover:opacity-60 ml-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              {catalogOnSale && (
                <span
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ background: "#FF4444" }}
                >
                  Solo ofertas
                  <button
                    onClick={() => setCatalogOnSale(false)}
                    className="hover:opacity-70 ml-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {catalogPriceRange !== "all" && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border border-border text-muted-foreground">
                  {PRICE_RANGES.find((r) => r.id === catalogPriceRange)?.label}
                  <button
                    onClick={() => setCatalogPriceRange("all")}
                    className="hover:opacity-70 ml-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {catalogBrand && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border border-border text-muted-foreground">
                  Marca #{catalogBrand}
                  <button
                    onClick={() => setCatalogBrand(null)}
                    className="hover:opacity-70 ml-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {catalogSearch && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border border-border text-muted-foreground">
                  "{catalogSearch}"
                  <button
                    onClick={() => setCatalogSearch("")}
                    className="hover:opacity-70 ml-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground underline hover:text-foreground transition-colors self-center ml-1"
              >
                Limpiar todo
              </button>
            </div>
          )}

          {/* Grid */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ height: "calc(100vh - 220px)" }}
          >
            {catalogLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filtered.map((p) => (
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

                {/* Sentinel + skeletons */}
                <InfiniteScrollTrigger
                  onIntersect={loadMore}
                  count={loadingMore ? PAGE_SIZE : 0}
                  disabled={!hasMore || loadingMore}
                />

                {!hasMore && allProducts.length > 0 && (
                  <p className="text-center text-xs text-muted-foreground mt-10 pb-8">
                    ✓ Has visto todos los {allProducts.length} productos
                  </p>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Search className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="font-bold text-foreground">Sin resultados</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Intenta con otros filtros o categorías.
                </p>
                <button
                  onClick={clearAll}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-95"
                  style={{ background: "#FFF200", color: "#1A1A2E" }}
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-72 bg-white h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <h2 className="font-bold text-base">Filtros</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <SidebarContent />
            </div>
            <div className="border-t border-border p-4">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:brightness-95"
                style={{ background: "#1A1A2E", color: "#FFF200" }}
              >
                Ver {filtered.length} productos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

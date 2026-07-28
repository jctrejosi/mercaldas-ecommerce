import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, Plus, Upload, Download, Filter, X, Edit, MoreHorizontal,
  ChevronUp, ChevronDown, Package, RefreshCw,
} from "lucide-react";
import {
  catalogService,
  type CatalogProduct,
  type CatalogCategory,
  type Brand,
  type ProductType,
} from "../services/catalog.service";

/* ─── Helpers ─────────────────────────── */
const PAGE_SIZE = 20;
const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

const STATUS_STYLE: Record<string, string> = {
  true: "bg-green-50 text-green-700 border-green-200",
  false: "bg-red-50 text-red-700 border-red-200",
};

type SortDir = "asc" | "desc";
type SortCol = "name" | "sku" | "price" | null;

/* ─── Skeleton ────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3"><div className="w-4 h-4 bg-gray-200 rounded" /></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-xl" />
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-gray-200 rounded w-32" />
            <div className="h-2 bg-gray-100 rounded w-20" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
      <td className="px-4 py-3 text-right"><div className="h-4 bg-gray-200 rounded w-16 ml-auto" /></td>
      <td className="px-4 py-3 text-center"><div className="h-5 bg-gray-200 rounded-full w-14 mx-auto" /></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-6 ml-auto" /></td>
    </tr>
  );
}

/* ─── Sort Header ─────────────────────── */
function SortHeader({
  label,
  col,
  active,
  dir,
  align = "left",
  onClick,
}: {
  label: string;
  col: SortCol;
  active: SortCol | null;
  dir: SortDir;
  align?: "left" | "right" | "center";
  onClick: (col: SortCol) => void;
}) {
  const isActive = active === col;
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none ${align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"}`}
      onClick={() => onClick(col)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="flex flex-col -space-y-1">
          <ChevronUp
            size={10}
            className={isActive && dir === "asc" ? "text-amber-500" : "text-gray-300"}
          />
          <ChevronDown
            size={10}
            className={isActive && dir === "desc" ? "text-amber-500" : "text-gray-300"}
          />
        </span>
      </span>
    </th>
  );
}

/* ─── Main Component ──────────────────── */
export default function Products() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [drawer, setDrawer] = useState<{ mode: "create" | "edit"; product?: any }>({ mode: null } as any);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [catFilter, setCatFilter] = useState<number[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandFilter, setBrandFilter] = useState<number | null>(null);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [branches, setBranches] = useState<{ id: number; name: string; address: string }[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [sortCol, setSortCol] = useState<SortCol>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const fetchIdRef = useRef(0);

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Load categories, brands, product-types, and total count on mount
  useEffect(() => {
    catalogService.getCategories().then(setCategories).catch(() => {});
    catalogService.getBrands().then(setBrands).catch(() => {});
    catalogService.getProductTypes().then(setProductTypes).catch(() => {});
    catalogService.getBranches().then(setBranches).catch(() => {});
    catalogService.getProductsCount().then((r) => setTotalCount(r.total)).catch(() => {});
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset and reload when filters change
  const buildSortParam = useCallback((): string | undefined => {
    if (!sortCol) return "nombre";
    if (sortCol === "name") return sortDir === "asc" ? "nombre" : "nombre-desc";
    if (sortCol === "sku") return "sku";
    if (sortCol === "price") return sortDir === "asc" ? "precio-asc" : "precio-desc";
    return "nombre";
  }, [sortCol, sortDir]);

  const loadProducts = useCallback(
    async (reset: boolean) => {
      const id = ++fetchIdRef.current;
      const offset = reset ? 0 : products.length;
      if (reset) {
        setLoading(true);
        setProducts([]);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const data = await catalogService.getProducts({
          search: search || undefined,
          categoryIds: catFilter.length > 0 ? catFilter : undefined,
          brandId: brandFilter ?? undefined,
          productTypeCode: typeFilter || undefined,
          isActive: statusFilter === "all" ? undefined : statusFilter === "active",
          priceMin: priceMin ? Number(priceMin) : undefined,
          priceMax: priceMax ? Number(priceMax) : undefined,
          sort: buildSortParam(),
          limit: PAGE_SIZE,
          offset,
        });

        // Ignore stale responses
        if (id !== fetchIdRef.current) return;

        if (reset) {
          setProducts(data);
        } else {
          setProducts((prev) => [...prev, ...data]);
        }
        setHasMore(data.length === PAGE_SIZE);
      } catch (err) {
        if (id !== fetchIdRef.current) return;
        setGlobalError('No se pudo conectar con el servidor. Verificá tu conexión.');
      } finally {
        if (id === fetchIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [search, catFilter, brandFilter, typeFilter, statusFilter, priceMin, priceMax, buildSortParam, products.length],
  );

  useEffect(() => {
    void loadProducts(true);
  }, [search, catFilter, brandFilter, typeFilter, statusFilter, priceMin, priceMax, sortCol, sortDir]);

  // Infinite scroll observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          void loadProducts(false);
        }
      },
      { rootMargin: "200px" },
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [hasMore, loading, loadingMore, loadProducts]);

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const allSelected =
    products.length > 0 && products.every((p) => selected.includes(p.id));
  const toggleAll = () => setAllSelected();
  function setAllSelected() {
    if (allSelected) setSelected([]);
    else setSelected(products.map((p) => p.id));
  }

  if (globalError) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Error de conexión</h2>
          <p className="text-sm text-gray-500 mb-6">{globalError}</p>
          <button
            onClick={() => { setGlobalError(null); loadProducts(true); catalogService.getProductsCount().then((r) => setTotalCount(r.total)).catch(() => {}); catalogService.getCategories().then(setCategories).catch(() => {}); catalogService.getBrands().then(setBrands).catch(() => {}); catalogService.getProductTypes().then(setProductTypes).catch(() => {}); catalogService.getBranches().then(setBranches).catch(() => {}); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors"
          >
            <RefreshCw size={14} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-80px)]">
        {/* Header + filters */}
        <div className="shrink-0 p-6 pb-0 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? "Cargando..." : `${totalCount} productos en el catálogo`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
                window.open(`${API}/catalog/products/export`, "_blank");
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Download size={14} /> Exportar
            </button>
            <button
              onClick={() => document.getElementById("import-file-input")?.click()}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Upload size={14} /> Importar
            </button>
            <input
              id="import-file-input"
              type="file"
              accept=".json"
              className="hidden"
              onChange={async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;
                const formData = new FormData();
                formData.append("file", file);
                try {
                  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
                  const res = await fetch(`${API}/catalog/products/import`, { method: "POST", body: formData });
                  if (res.ok) {
                    const data = await res.json();
                    alert(`Importación completada: ${data.created} creados, ${data.updated} actualizados`);
                    loadProducts(true);
                    catalogService.getProductsCount().then((r) => setTotalCount(r.total)).catch(() => {});
                  } else {
                    alert("Error al importar");
                  }
                } catch {
                  alert("Error de red al importar");
                }
              }}
            />
            <button
              onClick={() => setDrawer({ mode: "create" })}
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors"
            >
              <Plus size={14} /> Nuevo producto
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre o SKU..."
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
            />
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl border transition-colors ${filtersOpen ? "bg-amber-50 border-amber-300 text-amber-800" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            <Filter size={14} /> Filtros
          </button>
        </div>

        {/* Expanded filters */}
        {filtersOpen && (
          <div className="flex items-center gap-4 flex-wrap bg-white border border-gray-200 rounded-xl p-4">
            {/* Category dropdown */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Categoría</label>
              <select
                value={catFilter[0] ?? ""}
                onChange={(e) => setCatFilter(e.target.value ? [Number(e.target.value)] : [])}
                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white min-w-[140px]"
              >
                <option value="">Todas</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Marca</label>
              <select
                value={brandFilter ?? ""}
                onChange={(e) => setBrandFilter(e.target.value ? Number(e.target.value) : null)}
                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white min-w-[140px]"
              >
                <option value="">Todas</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Product Type */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Tipo</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white min-w-[140px]"
              >
                <option value="">Todos</option>
                {productTypes.map((pt) => (
                  <option key={pt.code} value={pt.code}>{pt.name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white min-w-[120px]"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>

            {/* Price range */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Precio</label>
              <div className="flex items-center gap-1">
                <input
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  type="number"
                  placeholder="Min"
                  className="w-20 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                />
                <span className="text-xs text-gray-400">-</span>
                <input
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  type="number"
                  placeholder="Max"
                  className="w-20 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                />
              </div>
            </div>

            {/* Clear filters */}
            {(catFilter.length > 0 || brandFilter || typeFilter || statusFilter !== "all" || priceMin || priceMax) && (
              <button
                onClick={() => { setCatFilter([]); setBrandFilter(null); setTypeFilter(""); setStatusFilter("all"); setPriceMin(""); setPriceMax(""); setSearchInput(""); setSearch(""); }}
                className="text-xs text-red-500 hover:text-red-700 font-medium self-end mb-0.5"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-sm font-semibold text-amber-800">{selected.length} seleccionados</span>
            <div className="flex gap-2 ml-auto">
              {["Activar", "Desactivar", "Editar precio", "Eliminar"].map((a) => (
                <button
                  key={a}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${a === "Eliminar" ? "border-red-200 text-red-600 hover:bg-red-50" : "border-amber-300 text-amber-700 hover:bg-amber-100"}`}
                >
                  {a}
                </button>
              ))}
              <button onClick={() => setSelected([])} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>
        )}
        </div>

        {/* Table — fills remaining height */}
        <div className="flex-1 min-h-0 px-6 pb-6">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-full flex flex-col">
            <table className="w-full shrink-0">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded accent-amber-400"
                  />
                </th>
                <SortHeader label="Producto" col="name" active={sortCol} dir={sortDir} onClick={toggleSort} />
                <SortHeader label="SKU" col="sku" active={sortCol} dir={sortDir} onClick={toggleSort} />
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Categoría</th>
                <SortHeader label="Precio" col="price" active={sortCol} dir={sortDir} align="right" onClick={toggleSort} />
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Estado</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
          </table>
          <div className="overflow-y-auto flex-1">
            <table className="w-full">
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="w-12 h-12 text-gray-300" />
                      <p className="text-sm font-semibold text-gray-500">Sin productos</p>
                      <p className="text-xs text-gray-400">No se encontraron productos con los filtros actuales.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => setDrawer({ mode: "edit", product: p })}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          setSelected(
                            e.target.checked ? [...selected, p.id] : selected.filter((id) => id !== p.id),
                          );
                        }}
                        className="w-4 h-4 rounded accent-amber-400"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 m-2.5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.productTypeName ?? ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                        {p.externalId ?? `SKU-${p.id}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{p.category || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-gray-900">{fmt(p.price)}</span>
                        {p.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">{fmt(p.originalPrice)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${p.isActive ? STATUS_STYLE.true : STATUS_STYLE.false}`}
                      >
                        {p.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); setDrawer({ mode: "edit", product: p }); }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Edit size={13} />
                        </button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-1" />

          {/* Loading more indicator */}
          {loadingMore && (
            <div className="px-4 py-4 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-amber-300 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
                <span className="text-xs text-gray-400 ml-2">Cargando productos...</span>
              </div>
            </div>
          )}

          {/* End of list */}
          {!hasMore && products.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                {products.length} de {totalCount} productos mostrados
              </p>
            </div>
          )}
          </div>
          </div>
        </div>
      </div>

      {/* Product Drawer */}
      {drawer.mode && (
        <ProductDrawer
          mode={drawer.mode}
          product={drawer.product}
          brands={brands}
          branches={branches}
          onClose={() => setDrawer({ mode: null } as any)}
          onCreated={() => { setDrawer({ mode: null } as any); loadProducts(true); }}
        />
      )}
    </>
  );
}

/* ─── Product Drawer ──────────────────── */
function ProductDrawer({
  mode,
  product,
  brands,
  branches,
  onClose,
  onCreated,
}: {
  mode: "create" | "edit";
  product?: any;
  brands: Brand[];
  branches: { id: number; name: string; address: string }[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [tab, setTab] = useState<"general" | "stock">("general");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    sku: product?.externalId || "",
    barcode: "",
    price: product?.price || "",
    originalPrice: product?.originalPrice || "",
    brandId: product?.brandId || "",
    unit: "",
    branchId: "",
    stock: "",
    minStock: "20",
    maxStock: "999",
    reorderPoint: "10",
    image: product?.image || "",
    isActive: product?.isActive !== false,
  });

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.name || !form.price) {
      setToast({ type: "error", message: "Nombre y precio son obligatorios" });
      return;
    }
    setSaving(true);
    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const isEdit = mode === "edit" && product?.id;
      const url = isEdit ? `${API}/catalog/products/${product.id}/update` : `${API}/catalog/products/create`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          sku: form.sku || undefined,
          barcode: form.barcode || undefined,
          price: Number(form.price),
          originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
          brandId: form.brandId ? Number(form.brandId) : undefined,
          image: form.image || undefined,
          isActive: form.isActive,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message?.join?.(', ') || errData?.message || "Error al guardar");
      }
      setToast({ type: "success", message: isEdit ? "Producto actualizado correctamente" : "Producto creado correctamente" });
      setTimeout(() => { onCreated(); }, 1000);
    } catch (e: any) {
      setToast({ type: "error", message: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-xl text-sm font-semibold shadow-2xl animate-[slideIn_0.2s_ease-out] flex items-center gap-2 ${toast.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}
        >
          {toast.type === "success" ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          )}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X size={14} /></button>
        </div>
      )}
      <div className="flex-1 bg-black/40 animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="w-full max-w-2xl bg-white flex flex-col shadow-2xl animate-[slideIn_0.2s_ease-out]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">
            {mode === "create" ? "Crear Producto" : "Editar Producto"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={16} />
          </button>
        </div>

        <div className="flex border-b border-gray-100 px-6">
          {(["general", "stock"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? "border-amber-400 text-amber-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t === "general" ? "General" : "Stock"}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {tab === "general" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre *</label>
                  <input value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="Ej: Leche Entera Alquería 1.1L" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">SKU</label>
                  <input value={form.sku} onChange={(e) => update("sku", e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="Auto-generado si vacío" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Código de barras</label>
                  <input value={form.barcode} onChange={(e) => update("barcode", e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono" placeholder="7702153000012" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Precio *</label>
                  <input value={form.price} onChange={(e) => update("price", e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" type="number" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Precio original</label>
                  <input value={form.originalPrice} onChange={(e) => update("originalPrice", e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" type="number" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Marca</label>
                  <select value={form.brandId} onChange={(e) => update("brandId", e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white">
                    <option value="">Sin marca</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Unidad</label>
                  <input value={form.unit} onChange={(e) => update("unit", e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="x 1.1L, x kg, x und..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descripción</label>
                  <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none" placeholder="Descripción del producto..." />
                </div>

                {/* Image */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Imagen</label>
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200 flex items-center justify-center">
                      {form.image ? (
                        <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        value={form.image}
                        onChange={(e) => update("image", e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
                        placeholder="URL de la imagen..."
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">o</span>
                        <label className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                          {uploading ? (
                            <>
                              <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Subiendo...
                            </>
                          ) : (
                            <><Upload size={12} /> Subir archivo</>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploading(true);
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                update("image", ev.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                              try {
                                const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
                                const fd = new FormData();
                                fd.append("file", file);
                                fd.append("code", form.sku || form.name.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_'));
                                const res = await fetch(`${API}/upload/image`, { method: "POST", body: fd });
                                if (res.ok) {
                                  const data = await res.json();
                                  update("image", data.url);
                                } else {
                                  setToast({ type: "error", message: "Error al subir imagen" });
                                }
                              } catch {
                                setToast({ type: "error", message: "Error de red al subir imagen" });
                              } finally {
                                setUploading(false);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === "stock" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sucursal / Bodega</label>
                <select value={form.branchId} onChange={(e) => update("branchId", e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white">
                  <option value="">Principal (por defecto)</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} — {b.address}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stock actual</label>
                  <input value={form.stock} onChange={(e) => update("stock", e.target.value)} type="number" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stock máximo</label>
                  <input value={form.maxStock} onChange={(e) => update("maxStock", e.target.value)} type="number" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="999" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stock mínimo (alerta)</label>
                  <input value={form.minStock} onChange={(e) => update("minStock", e.target.value)} type="number" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Punto de reorden</label>
                  <input value={form.reorderPoint} onChange={(e) => update("reorderPoint", e.target.value)} type="number" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="10" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => update("isActive", e.target.checked)} className="w-4 h-4 rounded accent-amber-400" />
                  <span className="text-sm text-gray-700">Producto activo</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 rounded-xl transition-colors disabled:opacity-50">
            {saving ? "Guardando..." : mode === "create" ? "Publicar Producto" : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

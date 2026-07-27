import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, Plus, Upload, Download, Filter, X, Edit, MoreHorizontal,
  ChevronUp, ChevronDown, Package,
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
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [sortCol, setSortCol] = useState<SortCol>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Load categories, brands, product-types, and total count on mount
  useEffect(() => {
    catalogService.getCategories().then(setCategories).catch(() => {});
    catalogService.getBrands().then(setBrands).catch(() => {});
    catalogService.getProductTypes().then(setProductTypes).catch(() => {});
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
          sort: buildSortParam(),
          limit: PAGE_SIZE,
          offset,
        });

        if (reset) {
          setProducts(data);
        } else {
          setProducts((prev) => [...prev, ...data]);
        }
        setHasMore(data.length === PAGE_SIZE);
      } catch {
        // silent
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [search, catFilter, brandFilter, typeFilter, buildSortParam, products.length],
  );

  // Initial load + reload on filter change
  useEffect(() => {
    void loadProducts(true);
  }, [search, catFilter, brandFilter, typeFilter, sortCol, sortDir]);

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

  return (
    <>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? "Cargando..." : `${totalCount} productos en el catálogo`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Upload size={14} /> Importar
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Download size={14} /> Exportar
            </button>
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
              placeholder="Buscar por nombre..."
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
            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Categoría</label>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setCatFilter([])}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${catFilter.length === 0 ? "bg-amber-400 text-amber-900" : "text-gray-500 hover:text-gray-700 bg-gray-50"}`}
                >
                  Todas
                </button>
                {categories.slice(0, 10).map((c) => {
                  const active = catFilter.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() =>
                        setCatFilter((prev) =>
                          active ? prev.filter((id) => id !== c.id) : [...prev, c.id],
                        )
                      }
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${active ? "bg-amber-400 text-amber-900" : "text-gray-500 hover:text-gray-700 bg-gray-50"}`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brand */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Marca</label>
              <select
                value={brandFilter ?? ""}
                onChange={(e) => setBrandFilter(e.target.value ? Number(e.target.value) : null)}
                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white"
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
                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white"
              >
                <option value="">Todos</option>
                {productTypes.map((pt) => (
                  <option key={pt.code} value={pt.code}>{pt.name}</option>
                ))}
              </select>
            </div>
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

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
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
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={(e) =>
                          setSelected(
                            e.target.checked ? [...selected, p.id] : selected.filter((id) => id !== p.id),
                          )
                        }
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
                          onClick={() => setDrawer({ mode: "edit", product: p })}
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

      {/* Product Drawer */}
      {drawer.mode && (
        <ProductDrawer
          mode={drawer.mode}
          product={drawer.product}
          categories={categories}
          brands={brands}
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
  categories,
  brands,
  onClose,
  onCreated,
}: {
  mode: "create" | "edit";
  product?: any;
  categories: CatalogCategory[];
  brands: Brand[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [tab, setTab] = useState<"general" | "stock" | "seo">("general");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    sku: product?.externalId || "",
    barcode: "",
    price: product?.price || "",
    originalPrice: product?.originalPrice || "",
    brandId: product?.brandId || "",
    categoryName: product?.category || "",
    unit: "",
    isActive: product?.isActive !== false,
  });

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.name || !form.price) {
      setError("Nombre y precio son obligatorios");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API}/catalog/products/create`, {
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
          isActive: form.isActive,
        }),
      });
      if (!res.ok) throw new Error("Error al crear producto");
      onCreated();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-2xl bg-white flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">
            {mode === "create" ? "Crear Producto" : "Editar Producto"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={16} />
          </button>
        </div>

        <div className="flex border-b border-gray-100 px-6">
          {(["general", "stock", "seo"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? "border-amber-400 text-amber-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t === "seo" ? "SEO" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</div>}

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
              </div>
            </>
          )}

          {tab === "stock" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Estado</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => update("isActive", e.target.checked)} className="w-4 h-4 rounded accent-amber-400" />
                  <span className="text-sm text-gray-700">Producto activo</span>
                </label>
              </div>
            </div>
          )}

          {tab === "seo" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Slug URL</label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">/producto/</span>
                  <input className="flex-1 px-3 py-2.5 text-sm focus:outline-none" placeholder="auto-generado" readOnly />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 rounded-xl transition-colors disabled:opacity-50">
            {saving ? "Creando..." : "Publicar Producto"}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Globe,
  MapPin,
  X,
  Star,
  Upload,
  Crop,
  Eraser,
} from "lucide-react";
import { catalogService, CatalogProduct } from "../services/catalog.service";

type AdminBrand = {
  id: number;
  name: string;
  slug: string;
  code: string | null;
  description: string | null;
  image: string | null;
  website: string | null;
  country: string | null;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  productCount: number;
};

export default function Brands() {
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [editing, setEditing] = useState<AdminBrand | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [trimEnabled, setTrimEnabled] = useState(false);
  const [removeBgEnabled, setRemoveBgEnabled] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<AdminBrand | null>(null);

  // Brand products tab
  const [editTab, setEditTab] = useState<"general" | "products">("general");
  const [brandProducts, setBrandProducts] = useState<
    Array<{
      id: number;
      name: string;
      price: number;
      image: string | null;
      productTypeCode: string | null;
      brandName: string | null;
    }>
  >([]);
  const [brandProductsLoading, setBrandProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productSearchResults, setProductSearchResults] = useState<
    Array<{
      id: number;
      name: string;
      price: number;
      image: string | null;
      productTypeCode: string | null;
      brandName: string | null;
    }>
  >([]);
  const [productSearching, setProductSearching] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Unbranded products
  const [unbranded, setUnbranded] = useState<CatalogProduct[]>([]);
  const [unbrandedLoading, setUnbrandedLoading] = useState(false);
  const [unbrandedSearch, setUnbrandedSearch] = useState("");
  const [unbrandedOffset, setUnbrandedOffset] = useState(0);
  const [unbrandedHasMore, setUnbrandedHasMore] = useState(true);
  const [unbrandedTotal, setUnbrandedTotal] = useState(0);
  const unbrandedSentinelRef = useRef<HTMLDivElement>(null);

  // Assign brand modal
  const [assignProductId, setAssignProductId] = useState<number | null>(null);
  const [assignBrandId, setAssignBrandId] = useState("");
  const [assignBrandSearch, setAssignBrandSearch] = useState("");
  const [assignBrandDropdownOpen, setAssignBrandDropdownOpen] = useState(false);

  const loadUnbranded = async (reset = false) => {
    setUnbrandedLoading(true);
    const offset = reset ? 0 : unbrandedOffset;
    try {
      const [countData, data] = await Promise.all([
        catalogService.getUnbrandedCount(),
        catalogService.getUnbrandedProducts(
          offset,
          20,
          unbrandedSearch || undefined,
        ),
      ]);
      if (reset) {
        setUnbrandedTotal(countData.total);
        setUnbranded(data);
        setUnbrandedOffset(20);
      } else {
        setUnbranded((prev) => [...prev, ...data]);
        setUnbrandedOffset(offset + 20);
      }
      setUnbrandedHasMore(data.length === 20);
    } catch {
      if (reset) setUnbranded([]);
    }
    setUnbrandedLoading(false);
  };

  // Load unbranded on mount
  useEffect(() => {
    loadUnbranded(true);
  }, []);

  // Infinite scroll for unbranded
  useEffect(() => {
    if (!unbrandedHasMore || unbrandedLoading) return;
    const el = unbrandedSentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadUnbranded(false);
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [unbrandedHasMore, unbrandedLoading]);

  // Debounce search for unbranded
  useEffect(() => {
    if (!unbrandedSearch) {
      loadUnbranded(true);
      return;
    }
    const timer = setTimeout(() => loadUnbranded(true), 400);
    return () => clearTimeout(timer);
  }, [unbrandedSearch]);

  const assignBrandToProduct = async () => {
    if (!assignProductId || !assignBrandId) return;
    try {
      await catalogService.addProductToBrand(
        Number(assignBrandId),
        assignProductId,
      );
      setAssignProductId(null);
      setAssignBrandId("");
      await Promise.all([loadBrands(), loadUnbranded(true)]);
    } catch {}
  };

  const loadBrands = useCallback(async () => {
    try {
      setLoading(true);
      const data = await catalogService.getBrandsAdmin();
      setBrands(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  // ── Debounced search ──
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  // ── Form helpers ──

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setEditTab("general");
    setForm({
      name: "",
      code: "",
      website: "",
      description: "",
      country: "",
      isFeatured: false,
      imageUrl: "",
    });
    setPendingFile(null);
    setPreviewUrl(null);
    setTrimEnabled(false);
    setRemoveBgEnabled(false);
    setSaveError(null);
  };

  const openEdit = (brand: AdminBrand) => {
    setEditing(brand);
    setCreating(false);
    setEditTab("general");
    setForm({
      name: brand.name,
      code: brand.code ?? "",
      website: brand.website ?? "",
      description: brand.description ?? "",
      country: brand.country ?? "",
      isFeatured: brand.isFeatured,
      isActive: brand.isActive,
      imageUrl: brand.image ?? "",
    });
    setPendingFile(null);
    setPreviewUrl(brand.image);
    setTrimEnabled(false);
    setRemoveBgEnabled(false);
    setSaveError(null);
    loadBrandProducts(brand.id);
  };

  const closePanel = () => {
    setEditing(null);
    setCreating(false);
    setPendingFile(null);
    setPreviewUrl(null);
    setTrimEnabled(false);
    setRemoveBgEnabled(false);
    setSaveError(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadPendingImage = async (name: string): Promise<string | null> => {
    if (!pendingFile) return form.imageUrl || null;
    try {
      const fd = new FormData();
      fd.append("file", pendingFile);
      fd.append("code", `brand_${name.replace(/\s+/g, "_")}`);
      fd.append("trim", trimEnabled ? "true" : "false");
      fd.append("removeBg", removeBgEnabled ? "true" : "false");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/upload/image`,
        { method: "POST", body: fd },
      );
      if (res.ok) {
        const data = await res.json();
        return data.url;
      }
      return null;
    } catch {
      return null;
    }
  };

  const save = async () => {
    const name = (form.name ?? "").trim();
    if (!name) {
      setSaveError("El nombre es obligatorio");
      return;
    }
    setSaveError(null);
    setUploading(true);

    const imageUrl = await uploadPendingImage(name);
    if (pendingFile && !imageUrl) {
      setSaveError("Error al subir la imagen");
      setUploading(false);
      return;
    }

    try {
      if (creating) {
        const result = await catalogService.createBrand({
          name,
          code: form.code || undefined,
          website: form.website || undefined,
          description: form.description || undefined,
          country: form.country || undefined,
          isFeatured: form.isFeatured ?? false,
          imageUrl: imageUrl || form.imageUrl || undefined,
        });
        // Assign products collected during creation
        if (brandProducts.length > 0) {
          await Promise.all(
            brandProducts.map((p) =>
              catalogService.addProductToBrand(result.id, p.id),
            ),
          );
        }
      } else if (editing) {
        await catalogService.updateBrand(editing.id, {
          name: name !== editing.name ? name : undefined,
          code: form.code !== editing.code ? form.code || undefined : undefined,
          website: form.website || undefined,
          description: form.description || undefined,
          country: form.country || undefined,
          isFeatured:
            form.isFeatured !== editing.isFeatured
              ? form.isFeatured
              : undefined,
          isActive:
            form.isActive !== editing.isActive ? form.isActive : undefined,
          imageUrl:
            imageUrl !== editing.image ? imageUrl || form.imageUrl : undefined,
        });
      }
      closePanel();
      await loadBrands();
    } catch {
      setSaveError("Error al guardar");
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    await catalogService.deleteBrand(deleteConfirm.id);
    setDeleteConfirm(null);
    await loadBrands();
  };

  // ── Brand Products ──

  const loadBrandProducts = async (brandId: number) => {
    setBrandProductsLoading(true);
    setProductSearch("");
    setProductSearchResults([]);
    try {
      const data = await catalogService.getBrandProducts(brandId);
      setBrandProducts(data.map((p) => ({ ...p, brandName: null })));
    } catch {
      setBrandProducts([]);
    }
    setBrandProductsLoading(false);
  };

  const handleProductSearch = useCallback(
    async (query: string) => {
      setProductSearching(true);
      try {
        const existingIds = new Set(brandProducts.map((p) => p.id));
        const data = await catalogService.getProducts({
          search: query.trim() || undefined,
          limit: 20,
        });
        setProductSearchResults(
          data
            .filter((p) => !existingIds.has(p.id))
            .map((p) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              image: p.image ?? null,
              productTypeCode: p.productTypeCode ?? null,
              brandName: null,
            })),
        );
      } catch {
        setProductSearchResults([]);
      }
      setProductSearching(false);
    },
    [brandProducts],
  );

  // Load products when opening search
  useEffect(() => {
    if (showAddProduct) {
      setProductSearch("");
      handleProductSearch("");
    }
  }, [showAddProduct, handleProductSearch]);

  // Debounced product search
  useEffect(() => {
    if (!showAddProduct) return;
    const timer = setTimeout(() => handleProductSearch(productSearch), 300);
    return () => clearTimeout(timer);
  }, [productSearch, showAddProduct, handleProductSearch]);

  const addProduct = async (productId: number) => {
    if (editing) {
      try {
        await catalogService.addProductToBrand(editing.id, productId);
        await loadBrandProducts(editing.id);
        setProductSearchResults((prev) =>
          prev.filter((p) => p.id !== productId),
        );
        setShowAddProduct(false);
        await loadBrands();
      } catch {}
    } else {
      const product = productSearchResults.find((p) => p.id === productId);
      if (product) {
        setBrandProducts((prev) => [...prev, product]);
        setProductSearchResults((prev) =>
          prev.filter((p) => p.id !== productId),
        );
      }
    }
  };

  const removeProduct = async (productId: number) => {
    if (editing) {
      try {
        await catalogService.removeProductFromBrand(editing.id, productId);
        setBrandProducts((prev) => prev.filter((p) => p.id !== productId));
        await loadBrands();
      } catch {}
    } else {
      // Create mode — just remove from local state
      setBrandProducts((prev) => prev.filter((p) => p.id !== productId));
      const product = brandProducts.find((p) => p.id === productId);
      if (product) {
        setProductSearchResults((prev) => [...prev, product]);
      }
    }
  };

  const isPanelOpen = creating || !!editing;

  return (
    <div className="p-6 space-y-5 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marcas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {brands.length} marcas en el catálogo
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all hover:brightness-95"
          style={{ background: "#FFF200", color: "#1A1A2E" }}
        >
          <Plus size={15} /> Nueva marca
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar marca..."
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
        />
      </div>

      {/* Brand Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-100 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((b) => (
            <div
              key={b.id}
              className={`bg-white rounded-2xl border p-5 hover:shadow-md transition-shadow group cursor-pointer ${
                !b.isActive ? "opacity-60" : ""
              }`}
              style={{ borderColor: b.isFeatured ? "#FFF200" : "#E5E7EB" }}
              onClick={() => openEdit(b)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
                  {b.image ? (
                    <img
                      src={b.image}
                      alt={b.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl select-none opacity-40">
                      {b.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {b.isFeatured && (
                    <Star size={12} className="text-amber-400" fill="#FACC15" />
                  )}
                  <button
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(b);
                    }}
                  >
                    <Edit size={13} />
                  </button>
                  <button
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(b);
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-gray-900">{b.name}</h3>
              {b.code && (
                <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                  #{b.code}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                {b.country && (
                  <>
                    <MapPin size={10} />
                    {b.country}
                  </>
                )}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Package size={12} className="text-gray-400" />
                <span className="text-xs text-gray-500">
                  {b.productCount} producto{b.productCount !== 1 ? "s" : ""}
                </span>
                {b.website && (
                  <a
                    href={`https://${b.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-gray-300 hover:text-gray-500 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Globe size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <div className="col-span-full text-center py-12 text-sm text-gray-400">
              No se encontraron marcas
            </div>
          )}
        </div>
      )}

      {/* ── Unbranded Products ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <Package size={14} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Productos sin marca
            </p>
          </div>
          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
            {unbrandedTotal}
          </span>
        </div>
        <div className="px-4 py-3 border-b border-gray-50">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={unbrandedSearch}
              onChange={(e) => setUnbrandedSearch(e.target.value)}
              placeholder="Buscar productos sin marca..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>
        {unbrandedLoading && unbranded.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : unbranded.length === 0 && !unbrandedLoading ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-400">
              Todos los productos tienen marca asignada
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            {unbranded.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setAssignProductId(p.id);
                  setAssignBrandId("");
                  setAssignBrandSearch("");
                  setAssignBrandDropdownOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package size={14} className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">
                    {p.name}
                  </p>
                  {p.productTypeCode && (
                    <p className="text-[10px] text-gray-400">
                      {p.productTypeCode}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div ref={unbrandedSentinelRef} className="h-4" />
            {unbrandedLoading && unbranded.length > 0 && (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-amber-400 rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Assign brand modal */}
      {assignProductId !== null && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[60]"
            onClick={() => setAssignProductId(null)}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-5">
              <h4 className="font-bold text-sm text-gray-900 mb-4">
                Asignar marca a producto
              </h4>
              <div className="relative mb-4">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  value={assignBrandSearch}
                  onChange={(e) => {
                    setAssignBrandSearch(e.target.value);
                    setAssignBrandDropdownOpen(true);
                  }}
                  onFocus={() => setAssignBrandDropdownOpen(true)}
                  placeholder="Buscar marca..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                  autoFocus
                />
                {assignBrandDropdownOpen && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-10 max-h-48 overflow-y-auto"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {brands
                      .filter((b) =>
                        b.name
                          .toLowerCase()
                          .includes(assignBrandSearch.toLowerCase()),
                      )
                      .map((b) => (
                        <button
                          key={b.id}
                          onClick={() => {
                            setAssignBrandId(String(b.id));
                            setAssignBrandSearch(b.name);
                            setAssignBrandDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                            String(b.id) === assignBrandId
                              ? "bg-amber-50 font-semibold"
                              : ""
                          }`}
                        >
                          {b.name}
                        </button>
                      ))}
                    {brands.filter((b) =>
                      b.name
                        .toLowerCase()
                        .includes(assignBrandSearch.toLowerCase()),
                    ).length === 0 && (
                      <p className="px-3 py-4 text-xs text-gray-400 text-center">
                        No se encontraron marcas
                      </p>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={assignBrandToProduct}
                disabled={!assignBrandId}
                className="w-full py-2 rounded-xl text-sm font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 transition-colors disabled:opacity-50"
              >
                Asignar marca
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Edit/Create Panel (Drawer from right) ── */}
      {isPanelOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 overflow-y-auto">
          {/* Uploading overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-white/75 z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-gray-300 border-t-amber-400 rounded-full animate-spin" />
                <span className="text-sm font-semibold text-gray-600">
                  Guardando...
                </span>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-900">
              {creating ? "Nueva marca" : "Editar marca"}
            </h3>
            <button
              onClick={closePanel}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tab bar */}
          {isPanelOpen && (
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setEditTab("general")}
                className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                  editTab === "general"
                    ? "text-amber-600 border-b-2 border-amber-400"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                General
              </button>
              <button
                onClick={() => setEditTab("products")}
                className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                  editTab === "products"
                    ? "text-amber-600 border-b-2 border-amber-400"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Productos ({brandProducts.length})
              </button>
            </div>
          )}

          {editTab === "general" && (
            <div className="p-5 space-y-5">
              {/* Error */}
              {saveError && (
                <div className="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold">
                  {saveError}
                </div>
              )}

              {/* Icon/Image preview + upload */}
              <div
                className="relative w-full h-44 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer"
                onClick={() =>
                  document.getElementById("brand-logo-input")?.click()
                }
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Logo"
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Upload size={28} />
                    <span className="text-xs font-semibold">
                      Subir logo de la marca
                    </span>
                  </div>
                )}
                <input
                  id="brand-logo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={uploading}
                />
              </div>

              {/* Image processing options */}
              {pendingFile && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setTrimEnabled((v) => !v)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      trimEnabled
                        ? "bg-amber-50 border-amber-300 text-amber-700"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <Crop size={13} />
                    Recortar al contenido
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemoveBgEnabled((v) => !v)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      removeBgEnabled
                        ? "bg-amber-50 border-amber-300 text-amber-700"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <Eraser size={13} />
                    Quitar fondo
                  </button>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Nombre
                </label>
                <input
                  value={form.name ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Ej: Alquería"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              {/* Code */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Código
                </label>
                <input
                  value={form.code ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, code: e.target.value }))
                  }
                  placeholder="Ej: ALQ001"
                  disabled={!!editing}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 ${
                    editing
                      ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "border-gray-200"
                  }`}
                />
                {editing && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    El código no se puede modificar después de crear la marca.
                  </p>
                )}
              </div>

              {/* Website */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Sitio web
                </label>
                <input
                  value={form.website ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, website: e.target.value }))
                  }
                  placeholder="alqueria.com.co"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              {/* Country */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  País
                </label>
                <input
                  value={form.country ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, country: e.target.value }))
                  }
                  placeholder="Colombia"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Descripción
                </label>
                <textarea
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Breve descripción de la marca"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                />
              </div>

              {/* Featured toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    form.isFeatured ? "bg-amber-400" : "bg-gray-200"
                  }`}
                  onClick={() =>
                    setForm((f) => ({ ...f, isFeatured: !f.isFeatured }))
                  }
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      form.isFeatured ? "left-5" : "left-0.5"
                    }`}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Marca destacada
                </span>
              </label>

              {/* Active toggle (only edit) */}
              {editing && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      form.isActive ? "bg-green-500" : "bg-gray-200"
                    }`}
                    onClick={() =>
                      setForm((f) => ({ ...f, isActive: !f.isActive }))
                    }
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        form.isActive ? "left-5" : "left-0.5"
                      }`}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Activa
                  </span>
                </label>
              )}

              {/* Save */}
              <button
                onClick={save}
                disabled={uploading}
                className="w-full py-2.5 rounded-xl text-sm font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 transition-colors disabled:opacity-50"
              >
                {uploading
                  ? "Guardando..."
                  : creating
                    ? "Crear marca"
                    : "Guardar cambios"}
              </button>

              {/* Delete (only edit) */}
              {editing && (
                <button
                  onClick={() => {
                    setDeleteConfirm(editing);
                    closePanel();
                  }}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} className="inline mr-1" />
                  Eliminar marca
                </button>
              )}
            </div>
          )}

          {editTab === "products" && (
            <div className="p-5 space-y-4">
              <button
                onClick={() => setShowAddProduct(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 transition-colors"
              >
                <Plus size={14} /> Añadir producto
              </button>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Productos ({brandProducts.length})
              </p>
              {brandProductsLoading ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-amber-400 rounded-full animate-spin" />
                </div>
              ) : brandProducts.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">
                  Sin productos asignados
                </p>
              ) : (
                <div className="flex flex-col gap-2 max-h-[calc(100vh-18rem)] overflow-y-auto">
                  {brandProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 rounded bg-gray-200 overflow-hidden shrink-0">
                        {p.image && (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            maximumFractionDigits: 0,
                          }).format(p.price)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeProduct(p.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add product submodal */}
      {showAddProduct && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[60]"
            onClick={() => setShowAddProduct(false)}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[70vh] flex flex-col">
              <div className="shrink-0 p-4 pb-0 flex items-center justify-between">
                <h4 className="font-bold text-sm text-gray-900">
                  Añadir producto
                </h4>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Buscar productos..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {productSearching ? (
                  <div className="flex justify-center py-6">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-amber-400 rounded-full animate-spin" />
                  </div>
                ) : productSearchResults.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">
                    No se encontraron productos
                  </p>
                ) : (
                  productSearchResults.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                      onClick={() => addProduct(p.id)}
                    >
                      <div className="w-9 h-9 rounded bg-gray-100 overflow-hidden shrink-0">
                        {p.image && (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          ${Number(p.price).toLocaleString("es-CO")}
                          {p.productTypeCode && ` · ${p.productTypeCode}`}
                        </p>
                      </div>
                      <div className="shrink-0 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                        <Plus size={12} className="text-amber-900" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Eliminar marca</h3>
                <p className="text-xs text-gray-500">{deleteConfirm.name}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              ¿Estás seguro? Esta acción no se puede deshacer. Los productos
              asociados a esta marca quedarán sin marca.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

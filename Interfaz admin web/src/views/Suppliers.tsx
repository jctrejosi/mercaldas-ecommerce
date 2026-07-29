import { useEffect, useState, useCallback, useRef } from "react";
import {
  Plus,
  Search,
  Building2,
  Phone,
  Mail,
  Package,
  ChevronRight,
  X,
  Edit,
  Trash2,
  Globe,
  MapPin,
} from "lucide-react";
import { catalogService, CatalogProduct } from "../services/catalog.service";

type AdminSupplier = {
  id: number;
  code: string | null;
  legalName: string;
  taxId: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  website: string | null;
  paymentTermsDays: number | null;
  currencyCode: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  productCount: number;
};

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<AdminSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [editing, setEditing] = useState<AdminSupplier | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminSupplier | null>(
    null,
  );
  const [selected, setSelected] = useState<AdminSupplier | null>(null);
  const [editTab, setEditTab] = useState<"general" | "products">("general");
  const [supplierProducts, setSupplierProducts] = useState<
    Array<{
      id: number;
      name: string;
      price: number;
      image: string | null;
      productTypeCode: string | null;
    }>
  >([]);
  const [supplierProductsLoading, setSupplierProductsLoading] = useState(false);
  const [prodSearch, setProdSearch] = useState("");
  const [prodSearchResults, setProdSearchResults] = useState<
    Array<{
      id: number;
      name: string;
      price: number;
      image: string | null;
      productTypeCode: string | null;
    }>
  >([]);
  const [prodSearching, setProdSearching] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Unsupplied products
  const [unsupplied, setUnsupplied] = useState<CatalogProduct[]>([]);
  const [unsuppliedLoading, setUnsuppliedLoading] = useState(false);
  const [unsuppliedSearch, setUnsuppliedSearch] = useState("");
  const [unsuppliedOffset, setUnsuppliedOffset] = useState(0);
  const [unsuppliedHasMore, setUnsuppliedHasMore] = useState(true);
  const [unsuppliedTotal, setUnsuppliedTotal] = useState(0);
  const unsuppliedSentinelRef = useRef<HTMLDivElement>(null);

  const loadUnsupplied = async (reset = false) => {
    setUnsuppliedLoading(true);
    const offset = reset ? 0 : unsuppliedOffset;
    try {
      const [countData, data] = await Promise.all([
        catalogService.getUnsuppliedCount(),
        catalogService.getUnsuppliedProducts(
          offset,
          20,
          unsuppliedSearch || undefined,
        ),
      ]);
      if (reset) {
        setUnsuppliedTotal(countData.total);
        setUnsupplied(data);
        setUnsuppliedOffset(20);
      } else {
        setUnsupplied((prev) => [...prev, ...data]);
        setUnsuppliedOffset(offset + 20);
      }
      setUnsuppliedHasMore(data.length === 20);
    } catch {
      if (reset) setUnsupplied([]);
    }
    setUnsuppliedLoading(false);
  };

  useEffect(() => {
    loadUnsupplied(true);
  }, []);

  useEffect(() => {
    if (!unsuppliedHasMore || unsuppliedLoading) return;
    const el = unsuppliedSentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadUnsupplied(false);
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [unsuppliedHasMore, unsuppliedLoading]);

  useEffect(() => {
    if (!unsuppliedSearch) {
      loadUnsupplied(true);
      return;
    }
    const timer = setTimeout(() => loadUnsupplied(true), 400);
    return () => clearTimeout(timer);
  }, [unsuppliedSearch]);

  const loadSupplierProducts = async (supplierId: number) => {
    setSupplierProductsLoading(true);
    setProdSearch("");
    setProdSearchResults([]);
    try {
      setSupplierProducts(await catalogService.getSupplierProducts(supplierId));
    } catch {
      setSupplierProducts([]);
    }
    setSupplierProductsLoading(false);
  };

  const handleProductSearch = useCallback(
    async (query: string) => {
      setProdSearching(true);
      try {
        const existingIds = new Set(supplierProducts.map((p) => p.id));
        const data = await catalogService.getProducts({
          search: query.trim() || undefined,
          limit: 20,
        });
        setProdSearchResults(
          data
            .filter((p) => !existingIds.has(p.id))
            .map((p) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              image: p.image ?? null,
              productTypeCode: p.productTypeCode ?? null,
            })),
        );
      } catch {
        setProdSearchResults([]);
      }
      setProdSearching(false);
    },
    [supplierProducts],
  );

  useEffect(() => {
    if (showAddProduct) {
      setProdSearch("");
      handleProductSearch("");
    }
  }, [showAddProduct, handleProductSearch]);

  useEffect(() => {
    if (!showAddProduct) return;
    const timer = setTimeout(() => handleProductSearch(prodSearch), 300);
    return () => clearTimeout(timer);
  }, [prodSearch, showAddProduct, handleProductSearch]);

  const addProduct = async (productId: number) => {
    if (!editing) return;
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/admin/catalog/products/${productId}/suppliers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ supplierId: editing.id }),
        },
      );
      await loadSupplierProducts(editing.id);
      setProdSearchResults((prev) => prev.filter((p) => p.id !== productId));
      setShowAddProduct(false);
      await loadSuppliers();
    } catch {}
  };

  const removeProduct = async (productId: number) => {
    if (!editing) return;
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/admin/catalog/suppliers/${editing.id}/products/${productId}`,
        { method: "DELETE" },
      );
      setSupplierProducts((prev) => prev.filter((p) => p.id !== productId));
      await loadSuppliers();
    } catch {}
  };

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setSuppliers(await catalogService.getSuppliersAdmin());
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filtered = suppliers.filter((s) =>
    s.legalName.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({
      legalName: "",
      code: "",
      taxId: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      website: "",
      paymentTermsDays: "",
      currencyCode: "",
      notes: "",
    });
    setSaveError(null);
  };

  const openEdit = (s: AdminSupplier) => {
    setCreating(false);
    setEditing(s);
    setEditTab("general");
    setForm({
      legalName: s.legalName,
      code: s.code ?? "",
      taxId: s.taxId ?? "",
      contactName: s.contactName ?? "",
      email: s.email ?? "",
      phone: s.phone ?? "",
      address: s.address ?? "",
      city: s.city ?? "",
      country: s.country ?? "",
      website: s.website ?? "",
      paymentTermsDays: s.paymentTermsDays ?? "",
      currencyCode: s.currencyCode ?? "",
      notes: s.notes ?? "",
      isActive: s.isActive,
    });
    setSaveError(null);
    loadSupplierProducts(s.id);
  };

  const closePanel = () => {
    setEditing(null);
    setCreating(false);
    setSaveError(null);
  };

  const save = async () => {
    const legalName = (form.legalName ?? "").trim();
    if (!legalName) {
      setSaveError("La razón social es obligatoria");
      return;
    }
    setSaveError(null);
    setSaving(true);
    try {
      if (creating) {
        await catalogService.createSupplier({
          legalName,
          code: form.code || undefined,
          taxId: form.taxId || undefined,
          contactName: form.contactName || undefined,
          email: form.email || undefined,
          phone: form.phone || undefined,
          address: form.address || undefined,
          city: form.city || undefined,
          country: form.country || undefined,
          website: form.website || undefined,
          paymentTermsDays: form.paymentTermsDays
            ? Number(form.paymentTermsDays)
            : undefined,
          currencyCode: form.currencyCode || undefined,
          notes: form.notes || undefined,
        });
      } else if (editing) {
        await catalogService.updateSupplier(editing.id, {
          legalName,
          code: form.code || undefined,
          taxId: form.taxId || undefined,
          contactName: form.contactName || undefined,
          email: form.email || undefined,
          phone: form.phone || undefined,
          address: form.address || undefined,
          city: form.city || undefined,
          country: form.country || undefined,
          website: form.website || undefined,
          paymentTermsDays: form.paymentTermsDays
            ? Number(form.paymentTermsDays)
            : null,
          currencyCode: form.currencyCode || undefined,
          notes: form.notes || undefined,
          isActive: form.isActive,
        });
      }
      closePanel();
      await loadSuppliers();
    } catch {
      setSaveError("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    await catalogService.deleteSupplier(deleteConfirm.id);
    setDeleteConfirm(null);
    await loadSuppliers();
  };

  const isPanelOpen = creating || !!editing;

  return (
    <>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {suppliers.length} proveedores en el catálogo
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all hover:brightness-95"
            style={{ background: "#FFF200", color: "#1A1A2E" }}
          >
            <Plus size={15} /> Nuevo proveedor
          </button>
        </div>

        <div className="relative max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar proveedor..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
          />
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-8 text-center text-sm text-gray-400">
              Cargando proveedores...
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {[
                    "Proveedor",
                    "Código",
                    "Contacto",
                    "Ciudad",
                    "Productos",
                    "Teléfono",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => openEdit(s)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                          <Building2 size={14} className="text-blue-600" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-800">
                            {s.legalName}
                          </span>
                          {!s.isActive && (
                            <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                              Inactivo
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-400">
                      {s.code || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {s.contactName || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {s.city || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                      {s.productCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {s.phone || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(s);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-400"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(s);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={13} />
                        </button>
                        <ChevronRight
                          size={14}
                          className="text-gray-300 group-hover:text-gray-500"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-12 text-sm text-gray-400"
                    >
                      No se encontraron proveedores
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Products Without Supplier ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <Package size={14} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Productos sin proveedor
            </p>
          </div>
          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
            {unsuppliedTotal}
          </span>
        </div>
        <div className="px-4 py-3 border-b border-gray-50">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={unsuppliedSearch}
              onChange={(e) => setUnsuppliedSearch(e.target.value)}
              placeholder="Buscar productos sin proveedor..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>
        {unsuppliedLoading && unsupplied.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : unsupplied.length === 0 && !unsuppliedLoading ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-400">
              Todos los productos tienen proveedor asignado
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            {unsupplied.map((p) => (
              <div
                key={p.id}
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
            <div ref={unsuppliedSentinelRef} className="h-4" />
            {unsuppliedLoading && unsupplied.length > 0 && (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-amber-400 rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Edit/Create Panel ── */}
      {isPanelOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 overflow-y-auto">
          {saving && (
            <div className="absolute inset-0 bg-white/75 z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-gray-300 border-t-amber-400 rounded-full animate-spin" />
                <span className="text-sm font-semibold text-gray-600">
                  Guardando...
                </span>
              </div>
            </div>
          )}

          <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-900">
              {creating ? "Nuevo proveedor" : "Editar proveedor"}
            </h3>
            <button
              onClick={closePanel}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tab bar (edit only) */}
          {editing && (
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
                Productos ({supplierProducts.length})
              </button>
            </div>
          )}

          {editTab === "general" && (
            <div className="p-5 space-y-4">
              {saveError && (
                <div className="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold">
                  {saveError}
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Razón social *
                </label>
                <input
                  value={form.legalName ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, legalName: e.target.value }))
                  }
                  placeholder="Ej: Alquería S.A."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Código
                </label>
                <input
                  value={form.code ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, code: e.target.value }))
                  }
                  placeholder="Ej: SUP001"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  NIT / RUT
                </label>
                <input
                  value={form.taxId ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, taxId: e.target.value }))
                  }
                  placeholder="123456789-0"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Contacto
                </label>
                <input
                  value={form.contactName ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, contactName: e.target.value }))
                  }
                  placeholder="Nombre del contacto"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Email
                </label>
                <input
                  value={form.email ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="contacto@empresa.com"
                  type="email"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Teléfono
                </label>
                <input
                  value={form.phone ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+57 4 340 0000"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Dirección
                </label>
                <input
                  value={form.address ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  placeholder="Calle 123 # 45-67"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Ciudad
                  </label>
                  <input
                    value={form.city ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, city: e.target.value }))
                    }
                    placeholder="Bogotá"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>
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
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Sitio web
                </label>
                <input
                  value={form.website ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, website: e.target.value }))
                  }
                  placeholder="www.empresa.com"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Días pago
                  </label>
                  <input
                    value={form.paymentTermsDays ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        paymentTermsDays: e.target.value,
                      }))
                    }
                    placeholder="30"
                    type="number"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Moneda
                  </label>
                  <input
                    value={form.currencyCode ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        currencyCode: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="COP"
                    maxLength={3}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Notas
                </label>
                <textarea
                  value={form.notes ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Notas internas..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                />
              </div>

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
                    Activo
                  </span>
                </label>
              )}

              <button
                onClick={save}
                disabled={saving}
                className="w-full py-2.5 rounded-xl text-sm font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 transition-colors disabled:opacity-50"
              >
                {saving
                  ? "Guardando..."
                  : creating
                    ? "Crear proveedor"
                    : "Guardar cambios"}
              </button>

              {editing && (
                <button
                  onClick={() => {
                    setDeleteConfirm(editing);
                    closePanel();
                  }}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} className="inline mr-1" />
                  Eliminar proveedor
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
                Productos ({supplierProducts.length})
              </p>
              {supplierProductsLoading ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-amber-400 rounded-full animate-spin" />
                </div>
              ) : supplierProducts.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">
                  Sin productos asignados
                </p>
              ) : (
                <div className="flex flex-col gap-2 max-h-[calc(100vh-18rem)] overflow-y-auto">
                  {supplierProducts.map((p) => (
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
                        onClick={() => {
                          if (!editing) return;
                          fetch(
                            `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/admin/catalog/products/${p.id}/suppliers/${editing.id}`,
                            { method: "DELETE" },
                          ).then(() => {
                            setSupplierProducts((prev) =>
                              prev.filter((s) => s.id !== p.id),
                            );
                          });
                        }}
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

          {/* ── Add Product Submodal ── */}
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
                        value={prodSearch}
                        onChange={(e) => setProdSearch(e.target.value)}
                        placeholder="Buscar productos..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {prodSearching ? (
                      <div className="flex justify-center py-6">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-amber-400 rounded-full animate-spin" />
                      </div>
                    ) : prodSearchResults.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6">
                        No se encontraron productos
                      </p>
                    ) : (
                      prodSearchResults.map((p) => (
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
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40"
            onClick={() => setSelected(null)}
          />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">Perfil del Proveedor</h2>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <Building2 size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {selected.legalName}
                  </h3>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      selected.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {selected.isActive ? "activo" : "inactivo"}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                {selected.contactName && (
                  <p className="font-semibold text-gray-800">
                    {selected.contactName}
                  </p>
                )}
                {selected.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-gray-400" />
                    {selected.email}
                  </div>
                )}
                {selected.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-gray-400" />
                    {selected.phone}
                  </div>
                )}
                {selected.address && (
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-gray-400" />
                    {selected.address}
                    {selected.city && `, ${selected.city}`}
                  </div>
                )}
                {selected.website && (
                  <div className="flex items-center gap-2">
                    <Globe size={13} className="text-gray-400" />
                    {selected.website}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Productos", value: selected.productCount },
                  {
                    label: "Días pago",
                    value: selected.paymentTermsDays
                      ? `${selected.paymentTermsDays} d.`
                      : "—",
                  },
                  {
                    label: "Moneda",
                    value: selected.currencyCode || "—",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-gray-50 rounded-xl p-3 text-center"
                  >
                    <p className="text-sm font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
              {selected.notes && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-amber-800 mb-1">
                    Notas
                  </h4>
                  <p className="text-xs text-amber-700">{selected.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
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
                <h3 className="font-bold text-gray-900">Eliminar proveedor</h3>
                <p className="text-xs text-gray-500">
                  {deleteConfirm.legalName}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              ¿Estás seguro? Esta acción no se puede deshacer.
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
    </>
  );
}

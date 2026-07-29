import { useEffect, useState, useCallback } from "react";
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
} from "lucide-react";
import { catalogService } from "../services/catalog.service";

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

  const [deleteConfirm, setDeleteConfirm] = useState<AdminBrand | null>(null);

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
    setSaveError(null);
  };

  const openEdit = (brand: AdminBrand) => {
    setEditing(brand);
    setCreating(false);
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
    setSaveError(null);
  };

  const closePanel = () => {
    setEditing(null);
    setCreating(false);
    setPendingFile(null);
    setPreviewUrl(null);
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
        await catalogService.createBrand({
          name,
          code: form.code || undefined,
          website: form.website || undefined,
          description: form.description || undefined,
          country: form.country || undefined,
          isFeatured: form.isFeatured ?? false,
          imageUrl: imageUrl || form.imageUrl || undefined,
        });
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
        </div>
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

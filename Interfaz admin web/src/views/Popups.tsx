import { useState, useEffect } from "react";
import {
  Plus, Edit, Trash2, X, Loader2, Filter, Image, Type,
  SlidersHorizontal, Megaphone, Search, Check, Save, AlertTriangle,
} from "lucide-react";
import { popupsService, type Popup, type CreatePopupData } from "../services/popups.service";
import { filtersService, type FilterConfig } from "../services/filters.service";

const POSITION_LABEL: Record<string, string> = {
  header: "Header",
  footer: "Footer",
  left: "Izquierda",
  right: "Derecha",
};

const POSITION_COLOR: Record<string, string> = {
  header: "bg-blue-50 text-blue-700 border-blue-200",
  footer: "bg-purple-50 text-purple-700 border-purple-200",
  left: "bg-amber-50 text-amber-700 border-amber-200",
  right: "bg-green-50 text-green-700 border-green-200",
};

const STATUS_BADGE: Record<string, string> = {
  activo: "bg-green-50 text-green-700 border-green-200",
  programado: "bg-blue-50 text-blue-700 border-blue-200",
  inactivo: "bg-gray-100 text-gray-600 border-gray-200",
  expirado: "bg-red-50 text-red-600 border-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  activo: "Activo",
  programado: "Programado",
  inactivo: "Inactivo",
  expirado: "Expirado",
};

async function createMediaFromUrl(url: string): Promise<number> {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const res = await fetch(`${API_BASE_URL}/admin/popups/upload-url`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error("Error al crear media");
  return (await res.json()).mediaId;
}

// ── Mini filter form ──
function FilterMiniForm({
  onCreated,
  onCancel,
}: {
  onCreated: (f: FilterConfig) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [categoryIds, setCategoryIds] = useState("");
  const [brandId, setBrandId] = useState("");
  const [productTypeCode, setProductTypeCode] = useState("");
  const [onSale, setOnSale] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) { setError("Nombre requerido"); return; }
    setSaving(true); setError("");
    try {
      const f = await filtersService.create({
        name: name.trim(),
        categoryIds: categoryIds ? categoryIds.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n)) : [],
        brandId: brandId ? parseInt(brandId) : null,
        productTypeCode: productTypeCode.trim() || undefined,
        onSale,
        search: search.trim() || undefined,
        sort: sort || undefined,
      });
      onCreated(f);
    } catch (e: any) { setError(e.message || "Error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
      <p className="text-xs font-semibold text-gray-700">Nuevo filtro</p>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del filtro *" className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300" />
      <div className="grid grid-cols-2 gap-2">
        <input value={categoryIds} onChange={(e) => setCategoryIds(e.target.value)} placeholder="IDs categorías (1,2,3)" className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300" />
        <input value={brandId} onChange={(e) => setBrandId(e.target.value)} placeholder="ID marca" className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={productTypeCode} onChange={(e) => setProductTypeCode(e.target.value)} placeholder="Tipo producto" className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Búsqueda" className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300" />
      </div>
      <div className="flex items-center gap-3">
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-3 py-2 text-xs border rounded-lg bg-white flex-1">
          <option value="">Orden: por defecto</option>
          <option value="precio-asc">Precio ↑</option>
          <option value="precio-desc">Precio ↓</option>
          <option value="descuento">Descuento</option>
          <option value="relevancia">Relevancia</option>
          <option value="vendidos">Vendidos</option>
        </select>
        <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} className="w-3.5 h-3.5" /> Oferta</label>
      </div>
      <div className="flex gap-2">
        <button onClick={handleCreate} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-amber-400 text-amber-900 rounded-lg hover:bg-amber-500 disabled:opacity-50">
          {saving && <Loader2 size={12} className="animate-spin" />} Crear filtro
        </button>
        <button onClick={onCancel} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700">Cancelar</button>
      </div>
    </div>
  );
}

// ── Popup Editor Drawer ──
function PopupEditor({
  popup,
  onClose,
  onSaved,
}: {
  popup: Popup | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!popup;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(popup?.title ?? "");
  const [imageUrl, setImageUrl] = useState(popup?.image ?? "");
  const [position, setPosition] = useState(popup?.position ?? "header");
  const [durationMs, setDurationMs] = useState(popup?.durationMs?.toString() ?? "7000");
  const [delayMs, setDelayMs] = useState(popup?.delayMs?.toString() ?? "1500");
  const [isActive, setIsActive] = useState(popup?.isActive ?? true);
  const [startDate, setStartDate] = useState(popup?.startDate ? new Date(popup.startDate).toISOString().slice(0, 16) : "");
  const [endDate, setEndDate] = useState(popup?.endDate ? new Date(popup.endDate).toISOString().slice(0, 16) : "");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("code", `popup_${Date.now()}`);
    const res = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/upload/image`,
      { method: "POST", body: fd },
    );
    if (!res.ok) throw new Error("Error al subir imagen");
    const data = await res.json();
    return data.url;
  };

  // Filter state from popup's filterConfig
  const [filterCategoryIds, setFilterCategoryIds] = useState(
    (popup?.filterConfig?.categoryIds ?? []).join(",")
  );
  const [filterBrandId, setFilterBrandId] = useState(popup?.filterConfig?.brandId?.toString() ?? "");
  const [filterProductType, setFilterProductType] = useState(popup?.filterConfig?.productTypeCode ?? "");
  const [filterOnSale, setFilterOnSale] = useState(popup?.filterConfig?.onSale ?? false);
  const [filterSearch, setFilterSearch] = useState(popup?.filterConfig?.search ?? "");
  const [filterSort, setFilterSort] = useState(popup?.filterConfig?.sort ?? "");

  const handleSave = async () => {
    if (!title.trim()) { setError("El título es obligatorio"); return; }
    if (!imageUrl.trim()) { setError("La imagen es obligatoria"); return; }
    setError(""); setSaving(true);
    try {
      let finalImageUrl = imageUrl.trim();
      if (pendingFile) finalImageUrl = await uploadFile(pendingFile);
      const imageMediaId = await createMediaFromUrl(finalImageUrl);
      const filterConfig: Record<string, unknown> = {
        categoryIds: filterCategoryIds ? filterCategoryIds.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n)) : [],
        brandId: filterBrandId ? parseInt(filterBrandId) : null,
        productTypeCode: filterProductType.trim() || undefined,
        onSale: filterOnSale,
        search: filterSearch.trim() || undefined,
        sort: filterSort || undefined,
      };
      const data: CreatePopupData = {
        title: title.trim(),
        imageMediaId,
        position: position as any,
        filterConfig,
        durationMs: parseInt(durationMs) || 7000,
        delayMs: parseInt(delayMs) || 1500,
        isActive,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      };
      if (isEdit && popup) await popupsService.update(popup.id, data);
      else await popupsService.create(data);
      onSaved();
    } catch (e: any) { setError(e.message || "Error al guardar"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-full max-w-xl bg-white flex flex-col shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-900">{isEdit ? "Editar Popup" : "Nuevo Popup"}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-5">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</div>}

          {/* Contenido */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"><Type size={12} /> Contenido</div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Título *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="Frutas y Verduras Frescas" />
            </div>
          </div>

          {/* Imagen */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"><Image size={12} /> Imagen</div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">URL de la imagen *</label>
              <div className="flex items-center gap-2">
                <input value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setPendingFile(null); }} className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono" placeholder="https://... o sube una imagen" />
                <label className="px-3 py-2.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer shrink-0 transition-colors">
                  {pendingFile ? "✓ Imagen lista" : "Subir archivo"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                </label>
              </div>
              {imageUrl && <div className="mt-2 rounded-xl overflow-hidden bg-gray-100 h-28"><img src={imageUrl} alt="" className="w-full h-full object-cover" /></div>}
            </div>
          </div>

          {/* Posición */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"><SlidersHorizontal size={12} /> Posición</div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ubicación del popup</label>
              <select value={position} onChange={(e) => setPosition(e.target.value as "header" | "footer" | "left" | "right")} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300">
                <option value="header">Header (barra superior)</option>
                <option value="footer">Footer (barra inferior)</option>
                <option value="left">Izquierda (panel lateral)</option>
                <option value="right">Derecha (panel lateral)</option>
              </select>
            </div>
          </div>

          {/* Timing */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <span className="w-3 h-3 rounded-full border-2 border-gray-400" /> Temporización
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Duración (ms)</label>
                <input type="number" value={durationMs} onChange={(e) => setDurationMs(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Delay inicial (ms)</label>
                <input type="number" value={delayMs} onChange={(e) => setDelayMs(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" />
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Inicio</label>
                <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fin</label>
                <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" />
              </div>
            </div>
          </div>

          {/* Activo */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 rounded accent-amber-500" />
              <span className="text-sm font-medium text-gray-700">Activo</span>
            </label>
          </div>

          {/* Filtro */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"><Filter size={12} /> Filtro de destino</div>
            <p className="text-xs text-gray-500">Al hacer clic en el popup, el usuario irá al catálogo con este filtro aplicado.</p>
            <div className="grid grid-cols-2 gap-2">
              <input value={filterCategoryIds} onChange={(e) => setFilterCategoryIds(e.target.value)} placeholder="IDs categorías (1,2,3)" className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300" />
              <input value={filterBrandId} onChange={(e) => setFilterBrandId(e.target.value)} placeholder="ID marca" className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={filterProductType} onChange={(e) => setFilterProductType(e.target.value)} placeholder="Tipo producto" className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300" />
              <input value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} placeholder="Búsqueda" className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
            <div className="flex items-center gap-3">
              <select value={filterSort} onChange={(e) => setFilterSort(e.target.value)} className="px-3 py-2 text-xs border rounded-lg bg-white flex-1">
                <option value="">Orden: por defecto</option>
                <option value="precio-asc">Precio ↑</option>
                <option value="precio-desc">Precio ↓</option>
                <option value="descuento">Descuento</option>
                <option value="relevancia">Relevancia</option>
                <option value="vendidos">Vendidos</option>
              </select>
              <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={filterOnSale} onChange={(e) => setFilterOnSale(e.target.checked)} className="w-3.5 h-3.5" /> Oferta</label>
            </div>
          </div>

          {/* Save */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-amber-400 text-amber-900 rounded-xl hover:bg-amber-500 disabled:opacity-50 transition-colors">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isEdit ? "Guardar cambios" : "Crear popup"}
            </button>
            <button onClick={onClose} className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Confirm modal ──
function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={20} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-1">{title}</h3>
        <p className="text-sm text-gray-500 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">Eliminar</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Popups View ──
export default function Popups() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPopup, setSelectedPopup] = useState<Popup | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Popup | null>(null);
  const [error, setError] = useState("");

  const fetchPopups = async () => {
    setLoading(true);
    setError("");
    try {
      setPopups(await popupsService.getAll());
    } catch (e: any) {
      setError(e.message || "Error al cargar popups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPopups(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await popupsService.remove(deleteTarget.id);
      setDeleteTarget(null);
      fetchPopups();
    } catch (e: any) {
      setError(e.message || "Error al eliminar");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone size={24} className="text-amber-500" />
            Popups
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestiona los popups que aparecen en la tienda</p>
        </div>
        <button
          onClick={() => { setSelectedPopup(null); setEditorOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 text-amber-900 rounded-xl font-bold text-sm hover:bg-amber-500 transition-colors"
        >
          <Plus size={16} /> Nuevo Popup
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-amber-500" />
        </div>
      ) : popups.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Megaphone size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No hay popups configurados</p>
          <button
            onClick={() => { setSelectedPopup(null); setEditorOpen(true); }}
            className="mt-3 text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            Crear el primer popup
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {popups.map((p) => (
              <div
                key={p.id}
                onClick={() => { setSelectedPopup(p); setEditorOpen(true); }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {/* Image preview */}
                <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  {p.image ? (
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <Image size={20} className="mx-auto mt-4 text-gray-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${POSITION_COLOR[p.position] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                      {POSITION_LABEL[p.position] || p.position}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[p.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                      {STATUS_LABEL[p.status] || p.status}
                    </span>
                    <span className="text-[10px] text-gray-400">{p.durationMs}ms · delay {p.delayMs}ms</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedPopup(p); setEditorOpen(true); }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-amber-600 transition-colors"
                    title="Editar"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(p); }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor drawer */}
      {editorOpen && (
        <PopupEditor
          popup={selectedPopup}
          onClose={() => setEditorOpen(false)}
          onSaved={() => {
            setEditorOpen(false);
            setSelectedPopup(null);
            fetchPopups();
          }}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmModal
          title="Eliminar popup"
          message={`¿Estás seguro de eliminar "${deleteTarget.title}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

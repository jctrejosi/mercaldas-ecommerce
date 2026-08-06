import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Edit, SquarePen, Trash2, X, Loader2, Filter, GripVertical,
  Image, Type, Palette, Link, Calendar, Eye, ChevronLeft, ChevronRight,
  LayoutTemplate, SlidersHorizontal, Zap, Truck, ShieldCheck, Clock, Megaphone,
  Layers, Search, Package, ArrowUp, ArrowDown, Check, Save, AlertTriangle, Tag, Store, Star,
} from "lucide-react";
import {
  bannersService,
  type Banner,
  type CreateBannerData,
} from "../services/banners.service";
import {
  featuredService,
  type FeaturedTab,
  type FeaturedProduct,
} from "../services/featured.service";
import { filtersService, type FilterConfig } from "../services/filters.service";

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

// ── Slide Editor (nested in Content tab) ──
function SlideEditor({
  slide,
  onClose,
  onSaved,
}: {
  slide: Banner | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!slide;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(slide?.title ?? "");
  const [subtitle, setSubtitle] = useState(slide?.subtitle ?? "");
  const [description, setDescription] = useState(slide?.description ?? "");
  const [imageUrl, setImageUrl] = useState(slide?.image ?? "");
  const [mobileImageUrl, setMobileImageUrl] = useState(slide?.mobileImage ?? "");
  const [ctaText, setCtaText] = useState(slide?.ctaText ?? "");
  const [bgColor, setBgColor] = useState(slide?.bgColor ?? "#1A1A2E");
  const [accentColor, setAccentColor] = useState(slide?.accentColor ?? "#FFF200");
  const [position, setPosition] = useState(slide?.position?.toString() ?? "0");
  const [isActive, setIsActive] = useState(slide?.isActive ?? true);
  const [startDate, setStartDate] = useState(slide?.startDate ? new Date(slide.startDate).toISOString().slice(0, 16) : "");
  const [endDate, setEndDate] = useState(slide?.endDate ? new Date(slide.endDate).toISOString().slice(0, 16) : "");

  // Filter config in content tab is read-only — managed in Filter tab
  const filterId = slide?.filterId?.toString() ?? "";
  const savedFilter = slide?.filter;

  const handleSave = async () => {
    if (!title.trim()) { setError("El título es obligatorio"); return; }
    if (!imageUrl.trim()) { setError("La imagen es obligatoria"); return; }
    setError(""); setSaving(true);
    try {
      const imageMediaId = await createMediaFromUrl(imageUrl.trim());
      const mobileMediaId = mobileImageUrl.trim() ? await createMediaFromUrl(mobileImageUrl.trim()) : undefined;
      const data: CreateBannerData = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        description: description.trim() || undefined,
        mediaId: imageMediaId,
        mobileImageId: mobileMediaId,
        bannerType: "hero",
        ctaText: ctaText.trim() || undefined,
        bgColor: bgColor.trim() || undefined,
        accentColor: accentColor.trim() || undefined,
        position: parseInt(position) || 0,
        isActive,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      };
      if (isEdit && slide) await bannersService.update(slide.id, data);
      else await bannersService.create(data);
      onSaved();
    } catch (e: any) { setError(e.message || "Error al guardar"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-full max-w-xl bg-white flex flex-col shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-900">{isEdit ? "Editar Slide" : "Nuevo Slide"}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-5">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</div>}

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"><Type size={12} /> Contenido</div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Título * <span className="text-gray-400 font-normal">— \\n para salto de línea</span></label>
              <textarea value={title} onChange={(e) => setTitle(e.target.value)} rows={2} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none" placeholder="Frutas y Verduras\nFrescas del Día" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Slogan / Subtítulo</label>
              <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="Directo de los mejores cultivadores" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descripción</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none" placeholder="Texto adicional..." />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"><Image size={12} /> Imágenes</div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Imagen escritorio *</label>
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono" placeholder="https://..." />
              {imageUrl && <div className="mt-2 rounded-xl overflow-hidden bg-gray-100 h-28"><img src={imageUrl} alt="" className="w-full h-full object-cover" /></div>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Imagen móvil</label>
              <input value={mobileImageUrl} onChange={(e) => setMobileImageUrl(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono" placeholder="https://..." />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"><Palette size={12} /> Apariencia</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Color de fondo</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border" />
                  <input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Color de acento</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border" />
                  <input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"><Link size={12} /> Botón</div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Texto del botón</label>
              <input value={ctaText} onChange={(e) => setCtaText(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="Ver Frutas y Verduras" />
            </div>
            {/* Show assigned filter info */}
            {savedFilter && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2 text-xs">
                <Filter size={12} className="text-amber-600 shrink-0" />
                <span className="text-amber-800">Filtro: <strong>{savedFilter.name}</strong></span>
                <span className="text-amber-500">— configurable en la pestaña Filtros</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"><Calendar size={12} /> Programación</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Posición</label>
                <input type="number" value={position} onChange={(e) => setPosition(e.target.value)} min={0} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" />
              </div>
              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-amber-500" />
                  <span className="text-sm text-gray-700">Activo</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Inicio</label><input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Fin</label><input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" /></div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 sticky bottom-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 rounded-xl">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Guardar" : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Helper ──
async function createMediaFromUrl(url: string): Promise<number> {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const res = await fetch(`${API_BASE_URL}/admin/banners/upload-url`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error("Error al crear media");
  return (await res.json()).mediaId;
}

// ── Main Carousel Manager Modal ──
function CarouselManager({
  slides,
  filters,
  onClose,
  onSaved,
}: {
  slides: Banner[];
  filters: FilterConfig[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"contenido" | "filtros">("contenido");
  const [slideEditor, setSlideEditor] = useState<Banner | null | "new">(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);

  // For filter tab: track filter assignments per slide
  const [slideFilters, setSlideFilters] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    slides.forEach((s) => { map[s.id] = s.filterId?.toString() ?? ""; });
    return map;
  });
  const [showFilterForm, setShowFilterForm] = useState<number | null>(null);
  const [localFilters, setLocalFilters] = useState<FilterConfig[]>(filters);

  const sortedSlides = [...slides].sort((a, b) => a.position - b.position);

  const handleDeleteSlide = async () => {
    if (!deleteConfirm) return;
    try { await bannersService.remove(deleteConfirm.id); setDeleteConfirm(null); onSaved(); }
    catch (e) { console.error(e); }
  };

  const handleSaveFilter = async (slideId: number) => {
    setSaving(true);
    try {
      const filterId = slideFilters[slideId];
      await bannersService.update(slideId, {
        filterId: filterId ? parseInt(filterId) : null,
      } as any);
      onSaved();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col mx-4 overflow-hidden">
        {/* Header with tabs */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-6">
            <h2 className="font-bold text-gray-900">Carousel Hero</h2>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("contenido")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === "contenido" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <LayoutTemplate size={13} /> Contenido
              </button>
              <button
                onClick={() => setActiveTab("filtros")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === "filtros" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <SlidersHorizontal size={13} /> Filtros
              </button>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"><X size={16} /></button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "contenido" ? (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{sortedSlides.length} slides · ordenados por posición</p>
                <button
                  onClick={() => setSlideEditor("new")}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-lg transition-colors"
                >
                  <Plus size={13} /> Añadir slide
                </button>
              </div>

              {sortedSlides.length === 0 ? (
                <div className="text-center py-16 text-sm text-gray-400">
                  <Image size={32} className="mx-auto text-gray-300 mb-3" />
                  No hay slides. Añade el primero con el botón de arriba.
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedSlides.map((s) => (
                    <div key={s.id} className="relative rounded-xl overflow-hidden group" style={{ background: s.bgColor || "#1A1A2E", minHeight: "160px" }}>
                      {/* Background image */}
                      {s.image && (
                        <div className="absolute right-0 top-0 h-full w-2/5">
                          <img src={s.image} alt="" className="w-full h-full object-cover opacity-35" />
                          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${s.bgColor || "#1A1A2E"} 0%, transparent 70%)` }} />
                        </div>
                      )}

                      {/* Content */}
                      <div className="relative z-10 p-6 max-w-lg">
                        <span
                          className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-4"
                          style={{ background: s.accentColor || "#FFF200", color: s.bgColor || "#1A1A2E" }}
                        >
                          Mercaldas · Manizales
                        </span>
                        <h3 className="font-black text-xl md:text-2xl text-white whitespace-pre-line leading-tight mb-2">
                          {s.title || "Sin título"}
                        </h3>
                        {s.subtitle && (
                          <p className="text-xs md:text-sm mb-5 max-w-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
                            {s.subtitle}
                          </p>
                        )}
                        {s.ctaText && (
                          <span
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold"
                            style={{ background: s.accentColor || "#FFF200", color: s.bgColor || "#1A1A2E" }}
                          >
                            {s.ctaText}
                            <ChevronRight size={13} />
                          </span>
                        )}
                      </div>

                      {/* Hover actions */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[s.status]}`}>
                          {STATUS_LABEL[s.status]} · #{s.position}
                        </span>
                        <button
                          onClick={() => setSlideEditor(s)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/90 hover:bg-white text-gray-600 transition-colors"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(s)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/90 hover:bg-red-50 text-gray-600 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ── FILTROS TAB ── */
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">
                Configura el filtro que se aplicará al hacer clic en el botón de cada slide.
              </p>

              {sortedSlides.length === 0 ? (
                <div className="text-center py-16 text-sm text-gray-400">No hay slides configurados.</div>
              ) : (
                <div className="space-y-4">
                  {sortedSlides.map((s) => (
                    <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start gap-3 mb-3">
                        {s.image && <img src={s.image} alt="" className="w-16 h-10 rounded-lg object-cover shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{s.title || "Sin título"}</p>
                          {s.ctaText && <p className="text-xs text-gray-400 mt-0.5">Botón: {s.ctaText}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={slideFilters[s.id] ?? ""}
                          onChange={(e) => setSlideFilters((prev) => ({ ...prev, [s.id]: e.target.value }))}
                          className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                        >
                          <option value="">Sin filtro</option>
                          {localFilters.map((f) => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => setShowFilterForm(showFilterForm === s.id ? null : s.id)}
                          className="shrink-0 flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100"
                        >
                          <Plus size={11} /> Nuevo
                        </button>
                        <button
                          onClick={() => handleSaveFilter(s.id)}
                          disabled={saving}
                          className="shrink-0 px-3 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg disabled:opacity-50"
                        >
                          Guardar
                        </button>
                      </div>

                      {showFilterForm === s.id && (
                        <div className="mt-3">
                          <FilterMiniForm
                            onCreated={(f) => {
                              setLocalFilters((prev) => [...prev, f]);
                              setSlideFilters((prev) => ({ ...prev, [s.id]: f.id.toString() }));
                              setShowFilterForm(null);
                            }}
                            onCancel={() => setShowFilterForm(null)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Slide Editor (nested modal) */}
      {slideEditor !== null && (
        <SlideEditor
          slide={slideEditor === "new" ? null : slideEditor}
          onClose={() => setSlideEditor(null)}
          onSaved={() => { setSlideEditor(null); onSaved(); }}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Eliminar slide</h3>
            <p className="text-sm text-gray-500 mb-5">¿Eliminar "{deleteConfirm.title}" del carousel?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-600">Cancelar</button>
              <button onClick={handleDeleteSlide} className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Promo Banner (Advertising) Manager ──
function PromoSlideEditor({
  slide,
  onClose,
  onSaved,
}: {
  slide: Banner | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!slide;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState(slide?.title ?? "");
  const [subtitle, setSubtitle] = useState(slide?.subtitle ?? "");
  const [imageUrl, setImageUrl] = useState(slide?.image ?? "");
  const [ctaText, setCtaText] = useState(slide?.ctaText ?? "");
  const [bgColor, setBgColor] = useState(slide?.bgColor ?? "#1A1A2E");
  const [accentColor, setAccentColor] = useState(slide?.accentColor ?? "#FFF200");
  const [position, setPosition] = useState(slide?.position?.toString() ?? "0");
  const [isActive, setIsActive] = useState(slide?.isActive ?? true);
  const [startDate, setStartDate] = useState(slide?.startDate ? new Date(slide.startDate).toISOString().slice(0, 16) : "");
  const [endDate, setEndDate] = useState(slide?.endDate ? new Date(slide.endDate).toISOString().slice(0, 16) : "");

  const handleSave = async () => {
    if (!title.trim()) { setError("El título es obligatorio"); return; }
    if (!imageUrl.trim()) { setError("La imagen es obligatoria"); return; }
    setError(""); setSaving(true);
    try {
      const imageMediaId = await createMediaFromUrl(imageUrl.trim());
      const data: CreateBannerData = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        mediaId: imageMediaId,
        bannerType: "promo",
        ctaText: ctaText.trim() || undefined,
        bgColor: bgColor.trim() || undefined,
        accentColor: accentColor.trim() || undefined,
        position: parseInt(position) || 0,
        isActive,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      };
      if (isEdit && slide) await bannersService.update(slide.id, data);
      else await bannersService.create(data);
      onSaved();
    } catch (e: any) { setError(e.message || "Error al guardar"); }
    finally { setSaving(false); }
  };

  const badge = title.trim() ? title.split(" ").slice(0, 2).join(" ").toUpperCase() : "OFERTA";

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-full max-w-xl bg-white flex flex-col shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-900">{isEdit ? "Editar Banner Promo" : "Nuevo Banner Promo"}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-5">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</div>}

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"><Type size={12} /> Contenido</div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Título *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="Semana del Ahorro" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subtítulo</label>
              <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="Hasta 40% de descuento..." />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"><Image size={12} /> Imagen</div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">URL de imagen de fondo *</label>
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono" placeholder="https://..." />
              {imageUrl && <div className="mt-2 rounded-xl overflow-hidden bg-gray-100 h-24"><img src={imageUrl} alt="" className="w-full h-full object-cover" /></div>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"><Palette size={12} /> Apariencia</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Color de fondo</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border" />
                  <input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Color de acento</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border" />
                  <input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"><Link size={12} /> Botón</div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Texto del botón CTA</label>
              <input value={ctaText} onChange={(e) => setCtaText(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="Aprovechar ahora" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"><Calendar size={12} /> Programación</div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Posición</label><input type="number" value={position} onChange={(e) => setPosition(e.target.value)} min={0} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" /></div>
              <div className="flex items-end pb-0.5"><label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-amber-500" /><span className="text-sm text-gray-700">Activo</span></label></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Inicio</label><input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Fin</label><input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" /></div>
            </div>
          </div>

          {/* Preview */}
          {title && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"><Eye size={12} /> Vista previa</div>
              <div className="rounded-xl overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%)`, minHeight: "110px" }}>
                {imageUrl && <img src={imageUrl} alt="" className="absolute right-0 top-0 h-full w-2/5 object-cover opacity-20" />}
                <div className="relative z-10 p-4">
                  <span className="inline-block text-[9px] font-black tracking-widest px-2 py-1 rounded-full mb-2" style={{ background: accentColor, color: bgColor }}>{badge}</span>
                  <h3 className="font-black text-base text-white leading-tight mb-1">{title}</h3>
                  {subtitle && <p className="text-xs text-white/60 mb-2">{subtitle}</p>}
                  {ctaText && <span className="inline-block px-3 py-1 rounded-lg text-[10px] font-bold" style={{ background: accentColor, color: bgColor }}>{ctaText}</span>}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 sticky bottom-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 rounded-xl">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Guardar" : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PromoManager({
  slides,
  filters,
  onClose,
  onSaved,
}: {
  slides: Banner[];
  filters: FilterConfig[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"contenido" | "filtros">("contenido");
  const [slideEditor, setSlideEditor] = useState<Banner | null | "new">(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);

  const [slideFilters, setSlideFilters] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    slides.forEach((s) => { map[s.id] = s.filterId?.toString() ?? ""; });
    return map;
  });
  const [showFilterForm, setShowFilterForm] = useState<number | null>(null);
  const [localFilters, setLocalFilters] = useState<FilterConfig[]>(filters);

  const sortedSlides = [...slides].sort((a, b) => a.position - b.position);

  const handleDeleteSlide = async () => {
    if (!deleteConfirm) return;
    try { await bannersService.remove(deleteConfirm.id); setDeleteConfirm(null); onSaved(); }
    catch (e) { console.error(e); }
  };

  const handleSaveFilter = async (slideId: number) => {
    setSaving(true);
    try {
      const filterId = slideFilters[slideId];
      await bannersService.update(slideId, { filterId: filterId ? parseInt(filterId) : null } as any);
      onSaved();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-6">
            <h2 className="font-bold text-gray-900">Banners Promocionales</h2>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button onClick={() => setActiveTab("contenido")} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === "contenido" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                <LayoutTemplate size={13} /> Contenido
              </button>
              <button onClick={() => setActiveTab("filtros")} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === "filtros" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                <SlidersHorizontal size={13} /> Filtros
              </button>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "contenido" ? (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{sortedSlides.length} banners · ordenados por posición</p>
                <button onClick={() => setSlideEditor("new")} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-lg">
                  <Plus size={13} /> Añadir banner
                </button>
              </div>
              {sortedSlides.length === 0 ? (
                <div className="text-center py-16 text-sm text-gray-400">No hay banners. Añade el primero.</div>
              ) : (
                <div className="space-y-3">
                  {sortedSlides.map((s) => {
                    const badge = (s.title || "OFERTA").split(" ").slice(0, 2).join(" ").toUpperCase();
                    return (
                      <div key={s.id} className="relative rounded-xl overflow-hidden group" style={{ background: `linear-gradient(135deg, ${s.bgColor || "#1A1A2E"} 0%, ${(s.bgColor || "#1A1A2E") + "dd"} 100%)`, minHeight: "120px" }}>
                        {s.image && (
                          <div className="absolute right-0 top-0 h-full w-2/5">
                            <img src={s.image} alt="" className="w-full h-full object-cover opacity-20" />
                          </div>
                        )}
                        <div className="relative z-10 p-5 flex items-center gap-5">
                          <div className="flex-1">
                            <span className="inline-block text-[9px] font-black tracking-widest px-2 py-1 rounded-full mb-2" style={{ background: s.accentColor || "#FFF200", color: s.bgColor || "#1A1A2E" }}>{badge}</span>
                            <h3 className="font-black text-lg text-white leading-tight mb-1">{s.title || "Sin título"}</h3>
                            {s.subtitle && <p className="text-xs text-white/60">{s.subtitle}</p>}
                          </div>
                          {s.ctaText && (
                            <span className="shrink-0 px-4 py-2 rounded-lg text-xs font-bold" style={{ background: s.accentColor || "#FFF200", color: s.bgColor || "#1A1A2E" }}>{s.ctaText}</span>
                          )}
                        </div>
                        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[s.status]}`}>{STATUS_LABEL[s.status]} · #{s.position}</span>
                          <button onClick={() => setSlideEditor(s)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/90 hover:bg-white text-gray-600"><Edit size={12} /></button>
                          <button onClick={() => setDeleteConfirm(s)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/90 hover:bg-red-50 text-gray-600 hover:text-red-500"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">Configura el filtro para el botón de cada banner.</p>
              {sortedSlides.map((s) => (
                <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {s.image && <img src={s.image} alt="" className="w-16 h-10 rounded-lg object-cover shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{s.title || "Sin título"}</p>
                      {s.ctaText && <p className="text-xs text-gray-400 mt-0.5">Botón: {s.ctaText}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={slideFilters[s.id] ?? ""} onChange={(e) => setSlideFilters((prev) => ({ ...prev, [s.id]: e.target.value }))} className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white">
                      <option value="">Sin filtro</option>
                      {localFilters.map((f) => (<option key={f.id} value={f.id}>{f.name}</option>))}
                    </select>
                    <button onClick={() => setShowFilterForm(showFilterForm === s.id ? null : s.id)} className="shrink-0 flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100"><Plus size={11} /> Nuevo</button>
                    <button onClick={() => handleSaveFilter(s.id)} disabled={saving} className="shrink-0 px-3 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg disabled:opacity-50">Guardar</button>
                  </div>
                  {showFilterForm === s.id && (
                    <div className="mt-3"><FilterMiniForm onCreated={(f) => { setLocalFilters((prev) => [...prev, f]); setSlideFilters((prev) => ({ ...prev, [s.id]: f.id.toString() })); setShowFilterForm(null); }} onCancel={() => setShowFilterForm(null)} /></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {slideEditor !== null && <PromoSlideEditor slide={slideEditor === "new" ? null : slideEditor} onClose={() => setSlideEditor(null)} onSaved={() => { setSlideEditor(null); onSaved(); }} />}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Eliminar banner</h3>
            <p className="text-sm text-gray-500 mb-5">¿Eliminar "{deleteConfirm.title}"?</p>
            <div className="flex justify-end gap-2"><button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-600">Cancelar</button><button onClick={handleDeleteSlide} className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl">Eliminar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Benefits/Promo Banner Editor ──
const BENEFIT_ICONS: Record<string, React.ElementType> = {
  truck: Truck,
  shield: ShieldCheck,
  clock: Clock,
  zap: Zap,
};

const BENEFIT_DEFAULTS = [
  { icon: "truck", text: "Domicilio gratis en pedidos +$80.000" },
  { icon: "shield", text: "Compra 100% segura" },
  { icon: "clock", text: "Entrega en 2 horas" },
];

type BenefitDraft = { id: number; icon: string; text: string };

function BenefitsInlineEditor({
  benefits,
  onSaved,
}: {
  benefits: Banner[];
  onSaved: () => void;
}) {
  const [items, setItems] = useState<BenefitDraft[]>(() => {
    if (benefits.length > 0) {
      return [...benefits]
        .sort((a, b) => a.position - b.position)
        .map((b) => ({ id: b.id, icon: b.subtitle || "zap", text: b.title || "" }));
    }
    return BENEFIT_DEFAULTS.map((d, i) => ({ id: -(i + 1), icon: d.icon, text: d.text }));
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  const startEditing = () => {
    setItems(
      benefits.length > 0
        ? [...benefits]
            .sort((a, b) => a.position - b.position)
            .map((b) => ({ id: b.id, icon: b.subtitle || "zap", text: b.title || "" }))
        : BENEFIT_DEFAULTS.map((d, i) => ({ id: -(i + 1), icon: d.icon, text: d.text })),
    );
    setError("");
    setEditing(true);
  };

  const cancelEdit = () => {
    setError("");
    setEditing(false);
  };

  const addItem = () => {
    setItems((prev) => [...prev, { id: -Date.now(), icon: "zap", text: "" }]);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: "icon" | "text", value: string) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      // 1. Crear/actualizar primero: nunca borrar antes de guardar
      const savedIds: number[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.text.trim()) continue;
        if (item.id > 0) {
          await bannersService.update(item.id, {
            title: item.text.trim(),
            subtitle: item.icon,
          });
          savedIds.push(item.id);
        } else {
          const mediaId = await createMediaFromUrl(
            "https://images.unsplash.com/photo-1?w=1&h=1&fit=crop",
          );
          const created = await bannersService.create({
            title: item.text.trim(),
            subtitle: item.icon,
            bannerType: "benefits" as any,
            mediaId,
            position: i,
          });
          savedIds.push(created.id);
        }
      }
      // 2. Solo después de guardar, eliminar los ítems removidos
      for (const b of benefits) {
        if (!savedIds.includes(b.id)) {
          await bannersService.remove(b.id).catch(() => {});
        }
      }
      onSaved();
    } catch (e: any) {
      setError(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {!editing ? (
        <>
          {/* Barra de solo lectura: idéntica al PromoBanner de Interfaz web */}
          <div className="rounded-none" style={{ background: "#FFF200" }}>
            <div
              className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm font-bold"
              style={{ color: "#1A1A2E" }}
            >
              {[...benefits]
                .sort((a, b) => a.position - b.position)
                .map((b) => {
                  const Icon = BENEFIT_ICONS[b.subtitle || "zap"] || Zap;
                  return (
                    <span key={b.id} className="flex items-center gap-2">
                      <Icon className="w-4 h-4" /> {b.title}
                    </span>
                  );
                })}
              {benefits.length === 0 && (
                <span className="text-sm font-normal text-black/40">Sin beneficios configurados</span>
              )}
            </div>
          </div>
          <button
            onClick={startEditing}
            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg hover:border-amber-300 hover:text-amber-600 transition-colors"
          >
            <SquarePen size={13} /> Editar
          </button>
        </>
      ) : (
        <>
          {/* Modo edición: mismas proporciones que el modo lectura */}
          <div className="rounded-none" style={{ background: "#FFF200" }}>
            <div
              className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm font-bold"
              style={{ color: "#1A1A2E" }}
            >
              {items.map((item, i) => {
                const Icon = BENEFIT_ICONS[item.icon] || Zap;
                return (
                  <span key={item.id} className="flex items-center gap-2 group/item">
                    <span className="relative inline-flex" title="Cambiar icono">
                      <Icon className="w-4 h-4" />
                      <select
                        value={item.icon}
                        onChange={(e) => updateItem(i, "icon", e.target.value)}
                        aria-label="Cambiar icono"
                        className="absolute inset-0 opacity-0 cursor-pointer appearance-none"
                      >
                        <option value="truck">🚚</option>
                        <option value="shield">🛡️</option>
                        <option value="clock">⏱️</option>
                        <option value="zap">⚡</option>
                      </select>
                    </span>
                    <input
                      value={item.text}
                      onChange={(e) => updateItem(i, "text", e.target.value)}
                      placeholder="Texto del beneficio"
                      className="w-44 md:w-56 appearance-none rounded-none bg-transparent text-sm font-bold outline-none border-b border-dashed border-black/25 focus:border-black/50 placeholder:text-black/40"
                    />
                    <button
                      onClick={() => removeItem(i)}
                      title="Quitar beneficio"
                      className="w-4 h-4 flex items-center justify-center text-black/40 hover:text-red-500 transition-colors shrink-0"
                    >
                      <X size={11} />
                    </button>
                  </span>
                );
              })}
              {items.length === 0 && (
                <span className="text-sm font-normal text-black/40">Sin beneficios configurados</span>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={addItem}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 border border-dashed border-gray-300 rounded-lg hover:border-amber-300 hover:text-amber-600 transition-colors"
            >
              <Plus size={13} /> Añadir beneficio
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 size={12} className="animate-spin" />} Guardar cambios
            </button>
            <button onClick={cancelEdit} disabled={saving} className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600">
              Cancelar
            </button>
            {error && <span className="text-xs text-red-500">{error}</span>}
          </div>
        </>
      )}
    </div>
  );
}

// ── Daily Deals Manager ──
interface DealItemForm {
  id: string;
  title: string;
  subtitle: string;
  discount: string;
  price: string;
  originalPrice: string;
  unit: string;
  image: string;
  bgFrom: string;
  bgTo: string;
  endsAt: string;
}

interface DealCarouselProduct {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string | null;
  category?: string | null;
}

function DailyDealsManager({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<DealItemForm[]>([]);
  const [carousel, setCarousel] = useState<DealCarouselProduct[]>([]);
  const [tab, setTab] = useState<"display" | "carousel">("display");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DealCarouselProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/landing/daily-deals`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setItems(
          (data.featuredItems ?? []).map((it: any, idx: number) => ({
            id: String(it.id ?? idx),
            title: it.title ?? "",
            subtitle: it.subtitle ?? "",
            discount: it.discount ?? "",
            price: String(it.price ?? ""),
            originalPrice: String(it.originalPrice ?? ""),
            unit: it.unit ?? "",
            image: it.image ?? "",
            bgFrom: it.bgFrom ?? "#1A4A2E",
            bgTo: it.bgTo ?? "#0D3B1F",
            endsAt: it.endsAt ?? "",
          })),
        );
        setCarousel(data.carousel ?? []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateItem = (idx: number, field: keyof DealItemForm, value: string) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `n${Date.now()}`,
        title: "",
        subtitle: "",
        discount: "",
        price: "",
        originalPrice: "",
        unit: "",
        image: "",
        bgFrom: "#1A4A2E",
        bgTo: "#0D3B1F",
        endsAt: "",
      },
    ]);
  };

  const removeItem = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleProductSearch = (q: string) => {
    setSearchQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      if (!q.trim()) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const res = await fetch(
          `${API_BASE}/admin/featured/products/search?q=${encodeURIComponent(q.trim())}&limit=20`,
          { credentials: "include" },
        );
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.products ?? [];
          setSearchResults(
            list.map((p: any) => ({
              id: p.id,
              name: p.name,
              price: Number(p.price ?? 0),
              originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
              image: p.image ?? null,
              category: p.category ?? null,
            })),
          );
        }
      } catch {
        /* noop */
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const addCarouselProduct = (p: DealCarouselProduct) => {
    setCarousel((prev) => (prev.some((x) => x.id === p.id) ? prev : [...prev, p]));
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeCarouselProduct = (id: number) => {
    setCarousel((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const featuredItems = items
        .filter((it) => it.title.trim() || it.image.trim())
        .map((it, i) => ({
          id: i,
          title: it.title.trim(),
          subtitle: it.subtitle.trim(),
          discount: it.discount.trim(),
          price: Number(it.price) || 0,
          originalPrice: Number(it.originalPrice) || 0,
          unit: it.unit.trim(),
          image: it.image.trim(),
          bgFrom: it.bgFrom,
          bgTo: it.bgTo,
          endsAt: it.endsAt.trim(),
        }));
      const res = await fetch(`${API_BASE}/admin/landing/daily-deals`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featuredItems,
          carouselProductIds: carousel.map((p) => p.id),
        }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      onClose();
    } catch (e: any) {
      setError(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const currency = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  const inputCls =
    "w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900">Ofertas del Día</h2>
            <p className="text-xs text-gray-400 mt-0.5">Display rotativo y carousel de productos</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0">
          <button
            onClick={() => setTab("display")}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === "display" ? "text-amber-600 border-b-2 border-amber-400" : "text-gray-400 hover:text-gray-600"}`}
          >
            Display ({items.length})
          </button>
          <button
            onClick={() => setTab("carousel")}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === "carousel" ? "text-amber-600 border-b-2 border-amber-400" : "text-gray-400 hover:text-gray-600"}`}
          >
            Carousel ({carousel.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : tab === "display" ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-8">
                Sin items. Añade el primero.
              </p>
            )}
            {items.map((it, i) => (
              <div key={it.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Item #{i + 1}
                  </p>
                  <button
                    onClick={() => removeItem(i)}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500"
                    title="Quitar item"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                      Título <span className="text-gray-400">(\n para salto de línea)</span>
                    </label>
                    <input
                      value={it.title}
                      onChange={(e) => updateItem(i, "title", e.target.value)}
                      className={inputCls}
                      placeholder="Papa Criolla\nLimpia"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Subtítulo</label>
                    <input value={it.subtitle} onChange={(e) => updateItem(i, "subtitle", e.target.value)} className={inputCls} placeholder="Fresca desde las fincas" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Descuento</label>
                    <input value={it.discount} onChange={(e) => updateItem(i, "discount", e.target.value)} className={inputCls} placeholder="21% OFF" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Unidad</label>
                    <input value={it.unit} onChange={(e) => updateItem(i, "unit", e.target.value)} className={inputCls} placeholder="x kg" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Precio</label>
                    <input type="number" min="0" value={it.price} onChange={(e) => updateItem(i, "price", e.target.value)} className={inputCls} placeholder="3800" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Precio original</label>
                    <input type="number" min="0" value={it.originalPrice} onChange={(e) => updateItem(i, "originalPrice", e.target.value)} className={inputCls} placeholder="4800" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Imagen (URL)</label>
                    <input value={it.image} onChange={(e) => updateItem(i, "image", e.target.value)} className={`${inputCls} font-mono`} placeholder="https://..." />
                    {it.image && (
                      <img src={it.image} alt="" className="mt-2 h-20 w-full object-cover rounded-lg border border-gray-200" />
                    )}
                  </div>
                  <div className="col-span-2 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Fondo</label>
                      <input type="color" value={it.bgFrom} onChange={(e) => updateItem(i, "bgFrom", e.target.value)} className="w-8 h-8 rounded cursor-pointer border" />
                      <input type="color" value={it.bgTo} onChange={(e) => updateItem(i, "bgTo", e.target.value)} className="w-8 h-8 rounded cursor-pointer border" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Texto final (⏱)</label>
                      <input value={it.endsAt} onChange={(e) => updateItem(i, "endsAt", e.target.value)} className={inputCls} placeholder="Hoy · Hasta agotar existencias" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addItem}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-gray-500 border border-dashed border-gray-300 rounded-xl hover:border-amber-300 hover:text-amber-600 transition-colors"
            >
              <Plus size={13} /> Añadir item
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            <button
              onClick={() => setShowSearch(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 transition-colors"
            >
              <Plus size={14} /> Añadir productos
            </button>
            {carousel.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">Sin productos en el carousel</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
                {carousel.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded bg-gray-200 overflow-hidden shrink-0">
                      {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 truncate font-medium">{p.name}</p>
                      <p className="text-[10px] text-gray-400">
                        {currency.format(p.price)}
                        {p.originalPrice ? (
                          <span className="line-through ml-1.5">{currency.format(p.originalPrice)}</span>
                        ) : null}
                      </p>
                    </div>
                    <button
                      onClick={() => removeCarouselProduct(p.id)}
                      className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 shrink-0"
                      title="Quitar del carousel"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">
            Cancelar
          </button>
          {error && <span className="text-xs text-red-500">{error}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 rounded-xl"
          >
            {saving && <Loader2 size={14} className="animate-spin" />} Guardar cambios
          </button>
        </div>
      </div>

      {/* Buscador de productos del carousel */}
      {showSearch && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/40" onClick={() => setShowSearch(false)} />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-gray-900">Añadir productos al carousel</h3>
                <button onClick={() => setShowSearch(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                  <X size={16} />
                </button>
              </div>
              <div className="relative mb-3">
                <input
                  value={searchQuery}
                  onChange={(e) => handleProductSearch(e.target.value)}
                  placeholder="Buscar producto..."
                  className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              </div>
              {searching ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-amber-400 rounded-full animate-spin" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addCarouselProduct(p)}
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-amber-50 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                        {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-400">{currency.format(p.price)}</p>
                      </div>
                      <Plus size={14} className="text-amber-500 shrink-0" />
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <p className="text-xs text-gray-400 py-8 text-center">Sin resultados</p>
              ) : (
                <p className="text-xs text-gray-400 py-8 text-center">Escribe para buscar productos</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Landing Brands Manager ──
interface LandingBrand {
  id: number;
  code: string | null;
  name: string;
  slug: string;
  isActive: boolean;
  imagePath: string | null;
  productCount: number;
  selected: boolean;
}

function BrandsLandingManager({
  brands,
  onClose,
  onSaved,
}: {
  brands: LandingBrand[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [items, setItems] = useState(brands);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "count">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [batchBusy, setBatchBusy] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const toggleSelected = (id: number) => {
    setItems((prev) => prev.map((b) => (b.id === id ? { ...b, selected: !b.selected } : b)));
  };

  const toggleActive = async (b: LandingBrand) => {
    const newActive = !b.isActive;
    try {
      await fetch(`${API_BASE}/admin/landing/brands/${b.id}/active`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newActive }),
      });
      setItems((prev) => prev.map((x) => (x.id === b.id ? { ...x, isActive: newActive } : x)));
    } catch (e) { console.error(e); }
  };

  const allSelected = items.length > 0 && items.every((b) => b.selected);
  const selectedItems = items.filter((b) => b.selected);

  const toggleSelectAll = () => {
    setItems((prev) => prev.map((b) => ({ ...b, selected: !allSelected })));
  };

  const setSelectedActive = async (isActive: boolean) => {
    const targets = items.filter((b) => b.selected);
    if (targets.length === 0) return;
    setBatchBusy(true);
    try {
      for (const b of targets) {
        await fetch(`${API_BASE}/admin/landing/brands/${b.id}/active`, {
          method: "PATCH", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive }),
        });
        setItems((prev) => prev.map((x) => (x.id === b.id ? { ...x, isActive } : x)));
      }
    } catch (e) { console.error(e); }
    finally { setBatchBusy(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const codes = items.filter((b) => b.selected && b.code).map((b) => b.code as string);
      await fetch(`${API_BASE}/admin/landing/brands`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes }),
      });
      onSaved();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const activeCount = items.filter((b) => b.isActive).length;
  const inactiveCount = items.length - activeCount;

  const q = search.trim().toLowerCase();
  const filtered = items
    .filter((b) => {
      const matchesSearch =
        !q || b.name.toLowerCase().includes(q) || (b.code ?? "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? b.isActive : !b.isActive);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortKey === "count") {
        return sortDir === "desc" ? b.productCount - a.productCount : a.productCount - b.productCount;
      }
      return a.name.localeCompare(b.name, "es");
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900">Marcas en Home</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {activeCount} activas · {inactiveCount} inactivas de {items.length} totales
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"><X size={16} /></button>
        </div>
        <div className="px-6 pt-4 pb-1 space-y-3 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar marca..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={`${sortKey}-${sortDir}`}
              onChange={(e) => {
                const [k, d] = e.target.value.split("-");
                setSortKey(k as "name" | "count");
                setSortDir(d as "asc" | "desc");
              }}
              className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <option value="name-asc">Orden: Nombre (A–Z)</option>
              <option value="count-desc">Más productos primero</option>
              <option value="count-asc">Menos productos primero</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
              className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <option value="all">Todas</option>
              <option value="active">Solo activas</option>
              <option value="inactive">Solo inactivas</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-2 border-t border-gray-100 shrink-0">
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-3.5 h-3.5 rounded border-gray-300 text-amber-500" />
            Seleccionar todas
          </label>
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-amber-700 mr-1">{selectedItems.length} seleccionadas</span>
              <button onClick={() => setSelectedActive(true)} disabled={batchBusy} className="px-2 py-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50">Activar</button>
              <button onClick={() => setSelectedActive(false)} disabled={batchBusy} className="px-2 py-1 text-[11px] font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 disabled:opacity-50">Inactivar</button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-1">
          {filtered.map((b) => (
            <div key={b.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <label className="flex items-center gap-3 flex-1 cursor-pointer">
                <input type="checkbox" checked={b.selected} onChange={() => toggleSelected(b.id)} className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-300" />
                <div className="w-7 h-7 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {b.imagePath ? (
                    <img src={b.imagePath} alt={b.name} className="w-full h-full object-contain" />
                  ) : (
                    <Tag size={14} className="text-gray-400" />
                  )}
                </div>
                <span className={`flex-1 text-sm ${b.isActive ? "text-gray-700" : "text-gray-300 line-through"}`}>{b.name}</span>
                {b.code && <span className="text-[10px] text-gray-400 font-mono">{b.code}</span>}
                <span className="text-xs text-gray-400">{b.productCount} prod.</span>
              </label>
              <button
                onClick={(e) => { e.stopPropagation(); toggleActive(b); }}
                className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 cursor-pointer ${b.isActive ? "bg-green-500" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${b.isActive ? "left-4" : "left-0.5"}`} />
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-xs text-gray-400 py-8">Sin resultados</p>
          )}
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 rounded-xl">
            {saving && <Loader2 size={14} className="animate-spin" />}Guardar selección
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Landing Branches Manager ──
const BRANCH_DAYS: { key: string; label: string }[] = [
  { key: "monday", label: "Lunes" },
  { key: "tuesday", label: "Martes" },
  { key: "wednesday", label: "Miércoles" },
  { key: "thursday", label: "Jueves" },
  { key: "friday", label: "Viernes" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

interface LandingBranchItem {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string | null;
  schedule: Record<string, string> | null;
  isActive: boolean;
  imagePath: string | null;
}

interface BranchForm {
  name: string;
  address: string;
  phone: string;
  imageUrl: string;
  schedule: Record<string, string>;
}

function branchScheduleSummary(schedule: Record<string, string> | null): string {
  if (!schedule) return "Horario no configurado";
  const filled = BRANCH_DAYS.filter((d) => schedule[d.key]?.trim());
  if (filled.length === 0) return "Horario no configurado";
  return `${filled.length} días · ${schedule[filled[0].key]}`;
}

function BranchesLandingManager({ onClose }: { onClose: () => void }) {
  const [branches, setBranches] = useState<LandingBranchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<LandingBranchItem | null>(null);
  const [form, setForm] = useState<BranchForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState("");
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/branches`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setBranches(
          (Array.isArray(data) ? data : []).map((b: any) => ({
            id: b.id,
            name: b.name,
            address: b.address,
            city: b.city,
            phone: b.phone,
            email: b.email ?? null,
            schedule: b.schedule ?? null,
            isActive: b.isActive,
            imagePath: b.imagePath ?? null,
          })),
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleVisible = async (b: LandingBranchItem) => {
    const next = !b.isActive;
    setBranches((prev) => prev.map((x) => (x.id === b.id ? { ...x, isActive: next } : x)));
    try {
      const res = await fetch(`${API_BASE}/admin/branches/${b.id}`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });
      if (!res.ok) {
        setBranches((prev) => prev.map((x) => (x.id === b.id ? { ...x, isActive: b.isActive } : x)));
      }
    } catch {
      setBranches((prev) => prev.map((x) => (x.id === b.id ? { ...x, isActive: b.isActive } : x)));
    }
  };

  const openEdit = (b: LandingBranchItem) => {
    setEditing(b);
    setForm({
      name: b.name,
      address: b.address,
      phone: b.phone,
      imageUrl: b.imagePath ?? "",
      schedule: b.schedule ?? {},
    });
    setPendingFile(null);
    setPendingPreview("");
    setError("");
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!pendingFile) return form?.imageUrl ?? null;
    const fd = new FormData();
    fd.append("file", pendingFile);
    fd.append("code", `branch_${(form?.name ?? "sucursal").replace(/\s+/g, "_")}`);
    const res = await fetch(`${API_BASE}/upload/image`, { method: "POST", body: fd });
    if (!res.ok) throw new Error("Error al subir imagen");
    const data = await res.json();
    return data.url;
  };

  const saveEdit = async () => {
    if (!editing || !form) return;
    setSaving(true);
    setError("");
    try {
      const imageUrl = await uploadImage();
      const payload: any = {
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        schedule: form.schedule,
      };
      if (imageUrl) payload.imageUrl = imageUrl;
      const res = await fetch(`${API_BASE}/admin/branches/${editing.id}`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setEditing(null);
      await load();
    } catch (e: any) {
      setError(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900">Sucursales en Home</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {branches.filter((b) => b.isActive).length} visibles · {branches.filter((b) => !b.isActive).length} ocultas
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : branches.length === 0 ? (
          <p className="text-xs text-gray-400 py-12 text-center">No hay sucursales</p>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {branches.map((b) => (
              <div key={b.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {b.imagePath ? (
                    <img src={b.imagePath} alt={b.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store size={16} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium truncate ${b.isActive ? "text-gray-900" : "text-gray-400"}`}>{b.name}</p>
                    {b.isActive ? (
                      <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full font-semibold">Visible</span>
                    ) : (
                      <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full font-semibold">Oculta</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{b.address} · {b.phone}</p>
                  <p className="text-[11px] text-gray-400">{branchScheduleSummary(b.schedule)}</p>
                </div>
                <button
                  onClick={() => toggleVisible(b)}
                  className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 cursor-pointer ${b.isActive ? "bg-green-500" : "bg-gray-300"}`}
                  title={b.isActive ? "Ocultar" : "Mostrar"}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${b.isActive ? "left-4" : "left-0.5"}`} />
                </button>
                <button
                  onClick={() => openEdit(b)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 shrink-0"
                  title="Editar sucursal"
                >
                  <Edit size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cerrar</button>
          <p className="text-[11px] text-gray-400">Edita los datos con el lápiz · oculta/muestra con el switch</p>
        </div>
      </div>

      {/* Drawer de edición */}
      {editing && form && (
        <>
          <div className="fixed inset-0 bg-black/30 z-[60]" onClick={() => setEditing(null)} />
          <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-[60] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">Editar sucursal</h3>
              <button onClick={() => setEditing(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Título</label>
                <input value={form.name} onChange={(e) => setForm((f) => (f ? { ...f, name: e.target.value } : f))} className={inputCls} />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Dirección</label>
                <input value={form.address} onChange={(e) => setForm((f) => (f ? { ...f, address: e.target.value } : f))} className={inputCls} />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Teléfono</label>
                <input value={form.phone} onChange={(e) => setForm((f) => (f ? { ...f, phone: e.target.value } : f))} className={inputCls} />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Horario</label>
                <div className="space-y-1.5">
                  {BRANCH_DAYS.map((d) => (
                    <div key={d.key} className="flex items-center gap-2">
                      <span className="w-16 text-[11px] text-gray-500">{d.label}</span>
                      <input
                        value={form.schedule[d.key] ?? ""}
                        onChange={(e) =>
                          setForm((f) =>
                            f ? { ...f, schedule: { ...f.schedule, [d.key]: e.target.value } } : f,
                          )
                        }
                        placeholder="8:00 AM - 9:00 PM"
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Imagen</label>
                {form.imageUrl || pendingFile ? (
                  <div className="relative mb-2">
                    <img src={pendingPreview || form.imageUrl} alt="" className="w-full h-28 object-cover rounded-lg border border-gray-200" />
                    <button
                      onClick={() => { setPendingFile(null); setPendingPreview(""); setForm((f) => (f ? { ...f, imageUrl: "" } : f)); }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-28 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">Sin imagen</div>
                )}
                <label className="mt-2 flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  Subir imagen
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setPendingFile(file);
                      setPendingPreview(URL.createObjectURL(file));
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                onClick={saveEdit}
                disabled={saving}
                className="w-full py-2.5 rounded-xl text-sm font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 transition-colors disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Landing Benefits Manager ──
const BENEFIT_OPTIONS = [
  { key: "Truck", label: "🚚 Envío" },
  { key: "MapPin", label: "📍 Mapa" },
  { key: "CreditCard", label: "💳 Pago" },
  { key: "ShieldCheck", label: "🛡️ Seguro" },
  { key: "Phone", label: "📞 Teléfono" },
  { key: "Store", label: "🏪 Tienda" },
  { key: "Heart", label: "❤️ Salud" },
  { key: "Zap", label: "⚡ Rápido" },
  { key: "Clock", label: "⏱ Horario" },
  { key: "Star", label: "⭐ Calidad" },
];

interface BenefitItemForm {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

function BenefitsLandingManager({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<BenefitItemForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/landing/benefits`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setItems(
          (Array.isArray(data) ? data : []).map((it: any, idx: number) => ({
            id: String(it.id ?? idx),
            icon: it.icon ?? "Star",
            title: it.title ?? "",
            desc: it.desc ?? "",
          })),
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateItem = (idx: number, field: "icon" | "title" | "desc", value: string) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: `n${Date.now()}`, icon: "Star", title: "", desc: "" },
    ]);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = items
        .filter((it) => it.title.trim() || it.desc.trim())
        .map((it, i) => ({
          id: i,
          icon: it.icon,
          title: it.title.trim(),
          desc: it.desc.trim(),
        }));
      const res = await fetch(`${API_BASE}/admin/landing/benefits`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al guardar");
      onClose();
    } catch (e: any) {
      setError(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900">Beneficios</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Sección ¿Por qué comprar en Mercaldas? ({items.length} ítems)
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"><X size={16} /></button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {items.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-8">Sin beneficios configurados</p>
            )}
            {items.map((it, i) => (
              <div key={it.id} className="flex flex-col gap-2 bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <select
                    value={it.icon}
                    onChange={(e) => updateItem(i, "icon", e.target.value)}
                    className="w-28 px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                  >
                    {BENEFIT_OPTIONS.map((o) => (
                      <option key={o.key} value={o.key}>{o.label}</option>
                    ))}
                  </select>
                  <input
                    value={it.title}
                    onChange={(e) => updateItem(i, "title", e.target.value)}
                    placeholder="Título del beneficio"
                    className={`${inputCls} flex-1`}
                  />
                  <button
                    onClick={() => removeItem(i)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 shrink-0"
                    title="Quitar beneficio"
                  >
                    <X size={12} />
                  </button>
                </div>
                <textarea
                  value={it.desc}
                  onChange={(e) => updateItem(i, "desc", e.target.value)}
                  placeholder="Descripción del beneficio"
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </div>
            ))}
            <button
              onClick={addItem}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-gray-500 border border-dashed border-gray-300 rounded-xl hover:border-amber-300 hover:text-amber-600 transition-colors"
            >
              <Plus size={13} /> Añadir beneficio
            </button>
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancelar</button>
          {error && <span className="text-xs text-red-500">{error}</span>}
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 rounded-xl">
            {saving && <Loader2 size={14} className="animate-spin" />} Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Footer Manager ──
interface FooterSocial { platform: string; url: string }
interface FooterHelpLink { label: string; url: string }
interface FooterContact { address: string; phone: string; whatsapp: string; email: string }
interface FooterCategoryOption { code: string; name: string }

function FooterLandingManager({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [description, setDescription] = useState("");
  const [socialLinks, setSocialLinks] = useState<FooterSocial[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<FooterCategoryOption[]>([]);
  const [helpLinks, setHelpLinks] = useState<FooterHelpLink[]>([]);
  const [contact, setContact] = useState<FooterContact>({ address: "", phone: "", whatsapp: "", email: "" });
  const [hours, setHours] = useState("");
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const load = useCallback(async () => {
    try {
      const [fRes, catRes] = await Promise.all([
        fetch(`${API_BASE}/admin/landing/footer`, { credentials: "include" }),
        fetch(`${API_BASE}/admin/catalog/categories`, { credentials: "include" }),
      ]);
      if (fRes.ok) {
        const fc = await fRes.json();
        setDescription(fc.description ?? "");
        setSocialLinks(Array.isArray(fc.socialLinks) ? fc.socialLinks : []);
        setSelectedCategories(Array.isArray(fc.categoryCodes) ? fc.categoryCodes : []);
        setHelpLinks(Array.isArray(fc.helpLinks) ? fc.helpLinks : []);
        setContact(fc.contact ?? { address: "", phone: "", whatsapp: "", email: "" });
        setHours(fc.hours ?? "");
      }
      if (catRes.ok) {
        const cats = await catRes.json();
        const list: FooterCategoryOption[] = [];
        (Array.isArray(cats) ? cats : []).forEach((c: any) => {
          if (c.code) list.push({ code: c.code, name: c.name ?? c.code });
          if (c.children && Array.isArray(c.children)) c.children.forEach((ch: any) => { if (ch.code) list.push({ code: ch.code, name: ch.name ?? ch.code }); });
        });
        setAllCategories(list);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [API_BASE]);

  useEffect(() => { void load(); }, [load]);

  const addSocial = () => setSocialLinks((p) => [...p, { platform: "instagram", url: "" }]);
  const updateSocial = (i: number, f: keyof FooterSocial, v: string) => setSocialLinks((p) => p.map((x, idx) => idx === i ? { ...x, [f]: v } : x));
  const removeSocial = (i: number) => setSocialLinks((p) => p.filter((_, idx) => idx !== i));

  const addHelp = () => setHelpLinks((p) => [...p, { label: "", url: "" }]);
  const updateHelp = (i: number, f: keyof FooterHelpLink, v: string) => setHelpLinks((p) => p.map((x, idx) => idx === i ? { ...x, [f]: v } : x));
  const removeHelp = (i: number) => setHelpLinks((p) => p.filter((_, idx) => idx !== i));

  const toggleCategory = (code: string) => {
    setSelectedCategories((p) => (p.includes(code) ? p.filter((c) => c !== code) : [...p, code]));
  };

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/landing/footer`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          socialLinks: socialLinks.filter((s) => s.platform && s.url),
          categoryCodes: selectedCategories,
          helpLinks: helpLinks.filter((h) => h.label),
          contact,
          hours,
        }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      onClose();
    } catch (e: any) { setError(e.message || "Error al guardar"); }
    finally { setSaving(false); }
  };

  const inputCls = "w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300";
  const labelCls = "text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div><h2 className="font-bold text-gray-900">Footer</h2><p className="text-xs text-gray-400 mt-0.5">Configuración del pie de página</p></div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"><X size={16} /></button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-gray-300 border-t-amber-400 rounded-full animate-spin" /></div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Descripción */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-2">Descripción</h4>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputCls} />
            </div>

            {/* Redes sociales */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-2">Redes sociales</h4>
              <div className="space-y-2">
                {socialLinks.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select value={s.platform} onChange={(e) => updateSocial(i, "platform", e.target.value)} className="w-28 text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300">
                      <option value="facebook">Facebook</option><option value="instagram">Instagram</option><option value="twitter">X (Twitter)</option><option value="youtube">YouTube</option>
                    </select>
                    <input value={s.url} onChange={(e) => updateSocial(i, "url", e.target.value)} placeholder="https://..." className={`${inputCls} flex-1 font-mono text-xs`} />
                    <button onClick={() => removeSocial(i)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-gray-400 hover:text-red-500 shrink-0"><X size={12} /></button>
                  </div>
                ))}
                <button onClick={addSocial} className="flex items-center gap-1 text-xs text-gray-500 hover:text-amber-600"><Plus size={12} /> Añadir red social</button>
              </div>
            </div>

            {/* Categorías */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-2">Categorías del footer</h4>
              <div className="max-h-40 overflow-y-auto grid grid-cols-2 gap-1">
                {allCategories.map((c) => (
                  <label key={c.code} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 rounded px-2 py-1">
                    <input type="checkbox" checked={selectedCategories.includes(c.code)} onChange={() => toggleCategory(c.code)} className="w-3.5 h-3.5 rounded border-gray-300 text-amber-500" />
                    <span className="truncate">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Ayuda */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-2">Links de ayuda</h4>
              <div className="space-y-2">
                {helpLinks.map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={h.label} onChange={(e) => updateHelp(i, "label", e.target.value)} placeholder="Título" className={`${inputCls} w-40`} />
                    <input value={h.url} onChange={(e) => updateHelp(i, "url", e.target.value)} placeholder="https://..." className={`${inputCls} flex-1 font-mono text-xs`} />
                    <button onClick={() => removeHelp(i)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-gray-400 hover:text-red-500 shrink-0"><X size={12} /></button>
                  </div>
                ))}
                <button onClick={addHelp} className="flex items-center gap-1 text-xs text-gray-500 hover:text-amber-600"><Plus size={12} /> Añadir link</button>
              </div>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-2">Contacto</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Dirección</label>
                  <input value={contact.address} onChange={(e) => setContact((p) => ({ ...p, address: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Teléfono</label>
                  <input value={contact.phone} onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>WhatsApp</label>
                  <input value={contact.whatsapp} onChange={(e) => setContact((p) => ({ ...p, whatsapp: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input value={contact.email} onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))} className={inputCls} />
                </div>
              </div>
            </div>

            {/* Horario */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-2">Horario de atención</h4>
              <input value={hours} onChange={(e) => setHours(e.target.value)} className={inputCls} placeholder="Lun–Dom · 6am – 10pm" />
            </div>
          </div>
        )}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancelar</button>
          {error && <span className="text-xs text-red-500">{error}</span>}
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 rounded-xl">
            {saving && <Loader2 size={14} className="animate-spin" />} Guardar footer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Product Types Selector ──
interface LandingProductType { id: number; code: string; name: string; count: number; isActive: boolean; selected: boolean; }

function ProductTypeEditor({
  productTypes,
  onClose,
  onSaved,
}: {
  productTypes: LandingProductType[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [items, setItems] = useState(productTypes);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "count">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [batchBusy, setBatchBusy] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const toggleSelected = (code: string) => {
    setItems((prev) => prev.map((t) => (t.code === code ? { ...t, selected: !t.selected } : t)));
  };

  const toggleActive = async (pt: LandingProductType) => {
    const newActive = !pt.isActive;
    try {
      await fetch(`${API_BASE}/admin/landing/product-types/${pt.id}/active`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newActive }),
      });
      setItems((prev) => prev.map((t) => (t.id === pt.id ? { ...t, isActive: newActive } : t)));
    } catch (e) { console.error(e); }
  };

  const allSelected = items.length > 0 && items.every((t) => t.selected);
  const selectedItems = items.filter((t) => t.selected);

  const toggleSelectAll = () => {
    setItems((prev) => prev.map((t) => ({ ...t, selected: !allSelected })));
  };

  const setSelectedActive = async (isActive: boolean) => {
    const targets = items.filter((t) => t.selected);
    if (targets.length === 0) return;
    setBatchBusy(true);
    try {
      for (const pt of targets) {
        await fetch(`${API_BASE}/admin/landing/product-types/${pt.id}/active`, {
          method: "PATCH", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive }),
        });
        setItems((prev) => prev.map((t) => (t.id === pt.id ? { ...t, isActive } : t)));
      }
    } catch (e) { console.error(e); }
    finally { setBatchBusy(false); }
  };

  const deleteSelected = async () => {
    const targets = items.filter((t) => t.selected);
    if (targets.length === 0) return;
    setBatchBusy(true);
    try {
      for (const pt of targets) {
        await fetch(`${API_BASE}/admin/catalog/product-types/${pt.id}`, {
          method: "DELETE", credentials: "include",
        });
      }
      setItems((prev) => prev.filter((t) => !t.selected));
      setDeleteConfirm(false);
    } catch (e) { console.error(e); }
    finally { setBatchBusy(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const codes = items.filter((t) => t.selected).map((t) => t.code);
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
      await fetch(`${API_BASE}/admin/landing/product-types`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes }),
      });
      onSaved();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const activeCount = items.filter((t) => t.isActive).length;
  const inactiveCount = items.length - activeCount;

  const q = search.trim().toLowerCase();
  const filtered = items
    .filter((t) => {
      const matchesSearch = !q || t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? t.isActive : !t.isActive);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortKey === "count") {
        return sortDir === "desc" ? b.count - a.count : a.count - b.count;
      }
      return a.name.localeCompare(b.name, "es");
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900">Tipos de Producto en Home</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {activeCount} activos · {inactiveCount} inactivos de {items.length} totales
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"><X size={16} /></button>
        </div>
        <div className="px-6 pt-4 pb-1 space-y-3 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tipo de producto..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={`${sortKey}-${sortDir}`}
              onChange={(e) => {
                const [k, d] = e.target.value.split("-");
                setSortKey(k as "name" | "count");
                setSortDir(d as "asc" | "desc");
              }}
              className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <option value="name-asc">Orden: Nombre (A–Z)</option>
              <option value="count-desc">Más productos primero</option>
              <option value="count-asc">Menos productos primero</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
              className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <option value="all">Todos</option>
              <option value="active">Solo activos</option>
              <option value="inactive">Solo inactivos</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-2 border-t border-gray-100 shrink-0">
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-3.5 h-3.5 rounded border-gray-300 text-amber-500" />
            Seleccionar todos
          </label>
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-amber-700 mr-1">{selectedItems.length} seleccionados</span>
              <button onClick={() => setSelectedActive(true)} disabled={batchBusy} className="px-2 py-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50">Activar</button>
              <button onClick={() => setSelectedActive(false)} disabled={batchBusy} className="px-2 py-1 text-[11px] font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 disabled:opacity-50">Inactivar</button>
              <button onClick={() => setDeleteConfirm(true)} disabled={batchBusy} className="px-2 py-1 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50">Eliminar</button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-1">
          {filtered.map((t) => (
            <div key={t.code} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <label className="flex items-center gap-3 flex-1 cursor-pointer">
                <input type="checkbox" checked={t.selected} onChange={() => toggleSelected(t.code)} className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-300" />
                <span className={`flex-1 text-sm ${t.isActive ? 'text-gray-700' : 'text-gray-300 line-through'}`}>{t.name}</span>
                <span className="text-xs text-gray-400">{t.count} productos</span>
              </label>
              {/* isActive toggle switch */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleActive(t); }}
                className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 cursor-pointer ${t.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${t.isActive ? 'left-4' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-xs text-gray-400 py-8">Sin resultados</p>
          )}
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 rounded-xl">
            {saving && <Loader2 size={14} className="animate-spin" />}Guardar selección
          </button>
        </div>
      </div>

      {/* Confirmación de eliminación masiva */}
      {deleteConfirm && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/40" onClick={() => setDeleteConfirm(false)} />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-amber-500" />
                </div>
                <div><h3 className="font-bold text-sm text-gray-900">Eliminar tipos seleccionados</h3></div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                ¿Eliminar <span className="font-semibold">{selectedItems.length}</span> tipo(s) de producto?
              </p>
              <p className="text-xs text-gray-500 mb-5">
                Los productos asociados quedarán sin tipo asignado. Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setDeleteConfirm(false)} disabled={batchBusy} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500">Cancelar</button>
                <button onClick={deleteSelected} disabled={batchBusy} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50">Eliminar</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Featured Products Manager ──
function FeaturedProductsManager({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [tabs, setTabs] = useState<FeaturedTab[]>([]);
  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [creating, setCreating] = useState(false);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<FeaturedProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<FeaturedTab | null>(null);
  const [error, setError] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadTabs = useCallback(async () => {
    const data = await featuredService.getTabs();
    setTabs(data);
    setSelectedTab((prev) => {
      if (prev !== null && data.some((t) => t.id === prev)) return prev;
      return data.length ? data[0].id : null;
    });
    setLoading(false);
  }, []);

  const loadProducts = useCallback(async (tabId: number) => {
    setProductsLoading(true);
    try {
      setProducts(await featuredService.getTabProducts(tabId));
    } catch (e: any) { setError(e.message || "Error"); }
    finally { setProductsLoading(false); }
  }, []);

  useEffect(() => { void loadTabs(); }, [loadTabs]);

  useEffect(() => {
    if (selectedTab === null) { setProducts([]); return; }
    void loadProducts(selectedTab);
  }, [selectedTab, loadProducts]);

  const handleCreateTab = async () => {
    if (!newTabName.trim()) return;
    setCreating(true); setError("");
    try {
      const data = await featuredService.createTab({ name: newTabName.trim() });
      setTabs(data);
      setNewTabName("");
      const created = data[data.length - 1];
      setSelectedTab(created.id);
    } catch (e: any) { setError(e.message || "Error"); }
    finally { setCreating(false); }
  };

  const handleRename = async (id: number) => {
    if (!renameValue.trim()) { setRenamingId(null); return; }
    setError("");
    try {
      const data = await featuredService.updateTab(id, { name: renameValue.trim() });
      setTabs(data);
    } catch (e: any) { setError(e.message || "Error"); }
    finally { setRenamingId(null); }
  };

  const handleToggleActive = async (tab: FeaturedTab) => {
    setError("");
    try {
      const data = await featuredService.updateTab(tab.id, { isActive: !tab.isActive });
      setTabs(data);
    } catch (e: any) { setError(e.message || "Error"); }
  };

  const handleMove = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= tabs.length) return;
    const reordered = [...tabs];
    const [item] = reordered.splice(index, 1);
    reordered.splice(target, 0, item);
    setTabs(reordered);
    setError("");
    try {
      for (let i = 0; i < reordered.length; i++) {
        await featuredService.updateTab(reordered[i].id, { position: i });
      }
    } catch (e: any) { setError(e.message || "Error al reordenar"); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setError("");
    try {
      const data = await featuredService.deleteTab(deleteConfirm.id);
      setTabs(data);
      setDeleteConfirm(null);
      setSelectedTab(data.length ? data[0].id : null);
    } catch (e: any) { setError(e.message || "Error"); }
  };

  const handleSearch = (q: string) => {
    setSearch(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      if (!q.trim()) { setSearchResults([]); return; }
      setSearching(true);
      try {
        setSearchResults(await featuredService.searchProducts(q.trim()));
      } catch (e: any) { setError(e.message || "Error"); }
      finally { setSearching(false); }
    }, 350);
  };

  const handleAdd = async (productId: number) => {
    if (selectedTab === null) return;
    setAdding(true); setError("");
    try {
      const data = await featuredService.assignProducts(selectedTab, [productId]);
      setProducts(data);
      setSearch(""); setSearchResults([]);
      await loadTabs();
    } catch (e: any) { setError(e.message || "Error"); }
    finally { setAdding(false); }
  };

  const handleRemove = async (productId: number) => {
    if (selectedTab === null) return;
    setError("");
    try {
      const data = await featuredService.removeProduct(selectedTab, productId);
      setProducts(data);
      await loadTabs();
    } catch (e: any) { setError(e.message || "Error"); }
  };

  const handleMoveProduct = async (index: number, dir: -1 | 1) => {
    if (selectedTab === null) return;
    const target = index + dir;
    if (target < 0 || target >= products.length) return;
    const reordered = [...products];
    const [item] = reordered.splice(index, 1);
    reordered.splice(target, 0, item);
    setProducts(reordered);
    setError("");
    try {
      const data = await featuredService.reorderProducts(
        selectedTab,
        reordered.map((p) => p.id),
      );
      setProducts(data);
    } catch (e: any) { setError(e.message || "Error al reordenar"); }
  };

  const selected = tabs.find((t) => t.id === selectedTab) ?? null;
  const assignedIds = new Set(products.map((p) => p.id));

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-full max-w-5xl bg-white flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Productos Destacados</h2>
            <p className="text-xs text-gray-400 mt-0.5">Pestañas y productos que aparecen en la sección de destacados</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"><X size={16} /></button>
        </div>

        {error && <div className="mx-6 mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</div>}

        <div className="flex-1 flex overflow-hidden">
          {/* Left: Tabs */}
          <div className="w-72 border-r border-gray-100 flex flex-col shrink-0">
            <div className="p-4 border-b border-gray-100 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pestañas</p>
              <div className="flex gap-2">
                <input
                  value={newTabName}
                  onChange={(e) => setNewTabName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") void handleCreateTab(); }}
                  placeholder="Nueva pestaña..."
                  className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
                <button
                  onClick={handleCreateTab}
                  disabled={creating || !newTabName.trim()}
                  className="px-3 py-2 text-xs font-bold bg-amber-400 text-amber-900 rounded-xl hover:bg-amber-500 disabled:opacity-40 flex items-center gap-1"
                >
                  {creating ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Añadir
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-gray-300" /></div>
              ) : tabs.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">Crea la primera pestaña</p>
              ) : (
                tabs.map((tab, i) => (
                  <div
                    key={tab.id}
                    className={`group rounded-xl px-3 py-2.5 cursor-pointer transition-colors ${selectedTab === tab.id ? "bg-amber-50 border border-amber-200" : "border border-transparent hover:bg-gray-50"}`}
                    onClick={() => setSelectedTab(tab.id)}
                  >
                    {renamingId === tab.id ? (
                      <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") void handleRename(tab.id); }}
                          autoFocus
                          className="flex-1 px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                        />
                        <button onClick={() => void handleRename(tab.id)} className="p-1 text-green-600"><Check size={13} /></button>
                        <button onClick={() => setRenamingId(null)} className="p-1 text-gray-400"><X size={13} /></button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className={`flex-1 text-sm font-semibold ${tab.isActive ? "text-gray-800" : "text-gray-300 line-through"}`}>
                            {tab.name}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">{tab.productCount}</span>
                        </div>
                        <div className="flex items-center gap-0.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleMove(i, -1)} disabled={i === 0} className="p-1 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-30"><ArrowUp size={11} /></button>
                          <button onClick={() => handleMove(i, 1)} disabled={i === tabs.length - 1} className="p-1 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-30"><ArrowDown size={11} /></button>
                          <button onClick={() => { setRenamingId(tab.id); setRenameValue(tab.name); }} className="p-1 rounded hover:bg-gray-200 text-gray-500"><Edit size={11} /></button>
                          <button onClick={() => handleToggleActive(tab)} className={`p-1 rounded hover:bg-gray-200 ${tab.isActive ? "text-green-600" : "text-gray-400"}`}>{tab.isActive ? <Eye size={11} /> : <Eye size={11} />}</button>
                          {!tab.isDefault && (
                            <button onClick={() => setDeleteConfirm(tab)} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 size={11} /></button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Products */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="p-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {selected ? `Productos en "${selected.name}" (${products.length})` : "Selecciona una pestaña"}
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Buscar producto por nombre, PLU o código..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
              {searching && <div className="mt-2 text-xs text-gray-400"><Loader2 size={12} className="animate-spin inline mr-1" />Buscando...</div>}
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-56 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                  {searchResults.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 px-3 py-2">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700 truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-400">{p.plu || p.externalId || p.barcode || "—"} · ${p.price.toLocaleString("es-CO")}</p>
                      </div>
                      <button
                        onClick={() => void handleAdd(p.id)}
                        disabled={adding || assignedIds.has(p.id)}
                        className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-amber-400 text-amber-900 hover:bg-amber-500 disabled:opacity-40 flex items-center gap-1"
                      >
                        {assignedIds.has(p.id) ? <Check size={11} /> : <Plus size={11} />}
                        {assignedIds.has(p.id) ? "Agregado" : "Agregar"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {productsLoading ? (
                <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-gray-300" /></div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={28} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">Sin productos asignados</p>
                  <p className="text-xs text-gray-300">Busca y agrega productos desde la barra superior</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {products.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3 px-3 py-2 rounded-xl border border-gray-100 hover:border-amber-200 transition-colors">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => handleMoveProduct(i, -1)} disabled={i === 0} className="p-0.5 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-30"><ArrowUp size={11} /></button>
                        <button onClick={() => handleMoveProduct(i, 1)} disabled={i === products.length - 1} className="p-0.5 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-30"><ArrowDown size={11} /></button>
                      </div>
                      <div className="w-11 h-11 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700 truncate">{p.name}</p>
                        <p className="text-[11px] text-gray-400">{p.plu || p.externalId || p.barcode || "—"}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-800">${p.price.toLocaleString("es-CO")}</span>
                      {p.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">${p.originalPrice.toLocaleString("es-CO")}</span>
                      )}
                      <button onClick={() => void handleRemove(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cerrar</button>
          <button onClick={onSaved} className="px-4 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl flex items-center gap-2">
            <Save size={14} /> Guardar cambios
          </button>
        </div>
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="font-bold text-gray-900 mb-2">Eliminar pestaña</h3>
            <p className="text-sm text-gray-500 mb-4">
              ¿Seguro que quieres eliminar "{deleteConfirm.name}"? Se quitarán sus productos asignados.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-600">Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──
export default function Banners() {
  const [slides, setSlides] = useState<Banner[]>([]);
  const [promos, setPromos] = useState<Banner[]>([]);
  const [benefits, setBenefits] = useState<Banner[]>([]);
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [managerOpen, setManagerOpen] = useState(false);
  const [promoManagerOpen, setPromoManagerOpen] = useState(false);
  const [prodTypesOpen, setProdTypesOpen] = useState(false);
  const [featuredOpen, setFeaturedOpen] = useState(false);
  const [dealsOpen, setDealsOpen] = useState(false);
  const [landingTypes, setLandingTypes] = useState<LandingProductType[]>([]);
  const [landingBrands, setLandingBrands] = useState<LandingBrand[]>([]);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [landingBranches, setLandingBranches] = useState<LandingBranchItem[]>([]);
  const [branchesOpen, setBranchesOpen] = useState(false);
  const [benefitsOpen, setBenefitsOpen] = useState(false);
  const [footerOpen, setFooterOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p, b, f] = await Promise.all([
        bannersService.getAll({ bannerType: "hero" }),
        bannersService.getAll({ bannerType: "promo" }),
        bannersService.getAll({ bannerType: "benefits" }),
        filtersService.getAll(),
      ]);
      setSlides(s);
      setPromos(p);
      setBenefits(b);
      setFilters(f);

      // Load landing product types
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_BASE}/admin/landing/product-types`, { credentials: "include" });
      if (res.ok) setLandingTypes(await res.json());

      // Load landing brands
      const brandRes = await fetch(`${API_BASE}/admin/landing/brands`, { credentials: "include" });
      if (brandRes.ok) setLandingBrands(await brandRes.json());

      // Load landing branches
      const branchRes = await fetch(`${API_BASE}/admin/branches`, { credentials: "include" });
      if (branchRes.ok) setLandingBranches(await branchRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const activeCount = slides.filter((s) => s.status === "activo").length;
  const promosActive = promos.filter((p) => p.status === "activo").length;

  return (
    <>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Home</h1>
          <p className="text-sm text-gray-500 mt-0.5">Administra los banners de la página principal</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
        ) : (
          <>
            {/* Hero Carousel card */}
            <div
              onClick={() => setManagerOpen(true)}
              className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-amber-200 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <LayoutTemplate size={18} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Carousel Hero</h3>
                  <p className="text-xs text-gray-500">Sección principal del sitio · 1920×600px</p>
                </div>
              </div>
              <div className="flex gap-6 text-sm">
                <div><span className="font-bold text-gray-900">{slides.length}</span> <span className="text-gray-400 text-xs">slides</span></div>
                <div><span className="font-bold text-green-600">{activeCount}</span> <span className="text-gray-400 text-xs">activos</span></div>
              </div>
              {slides.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-hidden">
                  {slides.slice(0, 5).map((s) => (
                    <div key={s.id} className="w-20 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {s.image && <img src={s.image} alt="" className="w-full h-full object-cover" />}
                    </div>
                  ))}
                  {slides.length > 5 && (
                    <div className="w-20 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400 shrink-0">+{slides.length - 5}</div>
                  )}
                </div>
              )}
            </div>

            {/* Product Types card */}
            <div
              onClick={() => setProdTypesOpen(true)}
              className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-amber-200 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Layers size={18} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Tipos de Producto</h3>
                  <p className="text-xs text-gray-500">Selecciona cuáles mostrar en la landing</p>
                </div>
              </div>
              <div className="flex gap-6 text-sm">
                <div><span className="font-bold text-gray-900">{landingTypes.length}</span> <span className="text-gray-400 text-xs">tipos</span></div>
                <div><span className="font-bold text-green-600">{landingTypes.filter((t) => t.isActive).length}</span> <span className="text-gray-400 text-xs">activos</span></div>
                <div><span className="font-bold text-red-500">{landingTypes.filter((t) => !t.isActive).length}</span> <span className="text-gray-400 text-xs">inactivos</span></div>
              </div>
            </div>

            {/* Benefits card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <Zap size={18} className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Barra de Beneficios</h3>
                  <p className="text-xs text-gray-500">Textos promocionales debajo del carousel de tipos</p>
                </div>
              </div>
              <BenefitsInlineEditor benefits={benefits} onSaved={fetchData} />
            </div>

            {/* Featured Products card */}
            <div
              onClick={() => setFeaturedOpen(true)}
              className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-amber-200 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  <Package size={18} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Productos Destacados</h3>
                  <p className="text-xs text-gray-500">Pestañas (Más vendidos, Promociones...) y productos asignados</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">Administra las pestañas y adjunta productos a cada una</p>
            </div>

            {/* Daily Deals card */}
            <div
              onClick={() => setDealsOpen(true)}
              className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-amber-200 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <Clock size={18} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Ofertas del Día</h3>
                  <p className="text-xs text-gray-500">Display rotativo y carousel de ofertas</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">Administra el display izquierdo y los productos del carousel</p>
            </div>

            {/* Landing Brands card */}
            <div
              onClick={() => setBrandsOpen(true)}
              className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-amber-200 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                  <Tag size={18} className="text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Marcas en Home</h3>
                  <p className="text-xs text-gray-500">Selecciona las marcas visibles en la landing</p>
                </div>
              </div>
              <div className="flex gap-6 text-sm">
                <div><span className="font-bold text-gray-900">{landingBrands.length}</span> <span className="text-gray-400 text-xs">marcas</span></div>
                <div><span className="font-bold text-green-600">{landingBrands.filter((b) => b.isActive).length}</span> <span className="text-gray-400 text-xs">activas</span></div>
                <div><span className="font-bold text-red-500">{landingBrands.filter((b) => !b.isActive).length}</span> <span className="text-gray-400 text-xs">inactivas</span></div>
              </div>
            </div>

            {/* Landing Branches card */}
            <div
              onClick={() => setBranchesOpen(true)}
              className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-amber-200 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                  <Store size={18} className="text-sky-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Sucursales</h3>
                  <p className="text-xs text-gray-500">Visibilidad y datos de las sucursales</p>
                </div>
              </div>
              <div className="flex gap-6 text-sm">
                <div><span className="font-bold text-gray-900">{landingBranches.length}</span> <span className="text-gray-400 text-xs">sucursales</span></div>
                <div><span className="font-bold text-green-600">{landingBranches.filter((b) => b.isActive).length}</span> <span className="text-gray-400 text-xs">visibles</span></div>
                <div><span className="font-bold text-red-500">{landingBranches.filter((b) => !b.isActive).length}</span> <span className="text-gray-400 text-xs">ocultas</span></div>
              </div>
            </div>

            {/* Landing Benefits card */}
            <div
              onClick={() => setBenefitsOpen(true)}
              className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-amber-200 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                  <Star size={18} className="text-rose-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Beneficios</h3>
                  <p className="text-xs text-gray-500">Sección ¿Por qué comprar en Mercaldas?</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">Administra los beneficios (icono, título y descripción)</p>
            </div>

            {/* Footer card */}
            <div
              onClick={() => setFooterOpen(true)}
              className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-amber-200 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                  <LayoutTemplate size={18} className="text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Footer</h3>
                  <p className="text-xs text-gray-500">Configuración del pie de página del sitio</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">Descripción, redes sociales, categorías, ayuda, contacto y horarios</p>
            </div>

            {/* Promo/Advertising card */}
            <div
              onClick={() => setPromoManagerOpen(true)}
              className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-amber-200 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Megaphone size={18} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Banners Promocionales</h3>
                  <p className="text-xs text-gray-500">Sección debajo de productos destacados</p>
                </div>
              </div>
              <div className="flex gap-6 text-sm">
                <div><span className="font-bold text-gray-900">{promos.length}</span> <span className="text-gray-400 text-xs">banners</span></div>
                <div><span className="font-bold text-green-600">{promosActive}</span> <span className="text-gray-400 text-xs">activos</span></div>
              </div>
              {promos.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-hidden">
                  {promos.slice(0, 5).map((p) => (
                    <div key={p.id} className="w-20 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                    </div>
                  ))}
                  {promos.length > 5 && <div className="w-20 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400 shrink-0">+{promos.length - 5}</div>}
                </div>
              )}
            </div>

          </>
        )}
      </div>

      {/* Hero carousel manager */}
      {managerOpen && (
        <CarouselManager
          slides={slides}
          filters={filters}
          onClose={() => { setManagerOpen(false); fetchData(); }}
          onSaved={fetchData}
        />
      )}

      {/* Promo manager */}
      {promoManagerOpen && (
        <PromoManager
          slides={promos}
          filters={filters}
          onClose={() => { setPromoManagerOpen(false); fetchData(); }}
          onSaved={fetchData}
        />
      )}

      {/* Product types editor */}
      {prodTypesOpen && (
        <ProductTypeEditor
          productTypes={landingTypes}
          onClose={() => setProdTypesOpen(false)}
          onSaved={() => { setProdTypesOpen(false); fetchData(); }}
        />
      )}

      {/* Featured products manager */}
      {featuredOpen && (
        <FeaturedProductsManager
          onClose={() => setFeaturedOpen(false)}
          onSaved={() => { setFeaturedOpen(false); }}
        />
      )}

      {/* Daily deals manager */}
      {dealsOpen && <DailyDealsManager onClose={() => setDealsOpen(false)} />}

      {/* Landing brands manager */}
      {brandsOpen && (
        <BrandsLandingManager
          brands={landingBrands}
          onClose={() => setBrandsOpen(false)}
          onSaved={() => { setBrandsOpen(false); fetchData(); }}
        />
      )}

      {/* Landing branches manager */}
      {branchesOpen && (
        <BranchesLandingManager onClose={() => { setBranchesOpen(false); fetchData(); }} />
      )}

      {/* Landing benefits manager */}
      {benefitsOpen && <BenefitsLandingManager onClose={() => setBenefitsOpen(false)} />}

      {/* Footer manager */}
      {footerOpen && <FooterLandingManager onClose={() => setFooterOpen(false)} />}
    </>
  );
}

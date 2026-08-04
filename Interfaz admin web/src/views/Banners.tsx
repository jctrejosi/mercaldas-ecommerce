import { useState, useEffect, useCallback } from "react";
import {
  Plus, Edit, Trash2, X, Loader2, Filter, GripVertical,
  Image, Type, Palette, Link, Calendar, Eye, ChevronLeft, ChevronRight,
  LayoutTemplate, SlidersHorizontal, Zap, Truck, ShieldCheck, Clock, Megaphone,
} from "lucide-react";
import {
  bannersService,
  type Banner,
  type CreateBannerData,
} from "../services/banners.service";
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
            <h2 className="font-bold text-gray-900">Carousel Hero — Landing Page</h2>
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
            <h2 className="font-bold text-gray-900">Banners Promocionales — Landing Page</h2>
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

function BenefitsEditor({
  benefits,
  onClose,
  onSaved,
}: {
  benefits: Banner[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [items, setItems] = useState(() => {
    if (benefits.length > 0) {
      return benefits
        .sort((a, b) => a.position - b.position)
        .map((b) => ({ id: b.id, icon: b.subtitle || "zap", text: b.title || "" }));
    }
    return BENEFIT_DEFAULTS.map((d, i) => ({ id: -(i + 1), icon: d.icon, text: d.text }));
  });
  const [saving, setSaving] = useState(false);

  const addItem = () => {
    setItems([...items, { id: -Date.now(), icon: "zap", text: "" }]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: "icon" | "text", value: string) => {
    setItems(items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Delete existing benefits
      for (const b of benefits) {
        await bannersService.remove(b.id).catch(() => {});
      }
      // Create new ones
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.text.trim()) continue;
        await bannersService.create({
          title: item.text.trim(),
          subtitle: item.icon,
          bannerType: "benefits" as any,
          mediaId: await createMediaFromUrl("https://images.unsplash.com/photo-1?w=1&h=1&fit=crop").catch(() => 1),
          position: i,
        });
      }
      onSaved();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900">Barra de Beneficios</h2>
            <p className="text-xs text-gray-400 mt-0.5">Landing Page — textos promocionales</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"><X size={16} /></button>
        </div>

        {/* Preview */}
        <div className="mx-6 mt-5 rounded-xl p-4" style={{ background: "#FFF200" }}>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-bold" style={{ color: "#1A1A2E" }}>
            {items.map((item, i) => {
              const Icon = BENEFIT_ICONS[item.icon] || Zap;
              return (
                <span key={i} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" /> {item.text || "(vacío)"}
                </span>
              );
            })}
            {items.length === 0 && <span className="opacity-50">Sin beneficios configurados</span>}
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {items.map((item, i) => (
            <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <select
                value={item.icon}
                onChange={(e) => updateItem(i, "icon", e.target.value)}
                className="w-24 px-2.5 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
              >
                <option value="truck">🚚 Envío</option>
                <option value="shield">🛡 Seguro</option>
                <option value="clock">⏱ Rapidez</option>
                <option value="zap">⚡ Promo</option>
              </select>
              <input
                value={item.text}
                onChange={(e) => updateItem(i, "text", e.target.value)}
                placeholder="Texto del beneficio"
                className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
              <button
                onClick={() => removeItem(i)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          <button
            onClick={addItem}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-gray-500 border border-dashed border-gray-300 rounded-xl hover:border-amber-300 hover:text-amber-600 transition-colors"
          >
            <Plus size={13} /> Añadir beneficio
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 rounded-xl">
            {saving && <Loader2 size={14} className="animate-spin" />}
            Guardar cambios
          </button>
        </div>
      </div>
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
  const [benefitsOpen, setBenefitsOpen] = useState(false);

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
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const activeCount = slides.filter((s) => s.status === "activo").length;
  const promosActive = promos.filter((p) => p.status === "activo").length;
  const benefitsActive = benefits.filter((b) => b.isActive).length;

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
                  <h3 className="font-semibold text-gray-900 text-sm">Carousel Hero — Landing Page</h3>
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
                  <h3 className="font-semibold text-gray-900 text-sm">Banners Promocionales — Landing Page</h3>
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

            {/* Benefits/Promo card */}
            <div
              onClick={() => setBenefitsOpen(true)}
              className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-amber-200 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Zap size={18} className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Barra de Beneficios — Landing Page</h3>
                  <p className="text-xs text-gray-500">Textos promocionales debajo del carousel</p>
                </div>
              </div>
              <div className="flex gap-6 text-sm">
                <div><span className="font-bold text-gray-900">{benefits.length}</span> <span className="text-gray-400 text-xs">ítems</span></div>
                <div><span className="font-bold text-green-600">{benefitsActive}</span> <span className="text-gray-400 text-xs">activos</span></div>
              </div>
              {benefits.length > 0 && (
                <div className="mt-3 rounded-lg p-3" style={{ background: "#FFF200" }}>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold" style={{ color: "#1A1A2E" }}>
                    {benefits.sort((a, b) => a.position - b.position).map((b) => {
                      const Icon = BENEFIT_ICONS[b.subtitle || "zap"] || Zap;
                      return (
                        <span key={b.id} className="flex items-center gap-1.5">
                          <Icon size={13} /> {b.title}
                        </span>
                      );
                    })}
                  </div>
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

      {/* Benefits editor */}
      {benefitsOpen && (
        <BenefitsEditor
          benefits={benefits}
          onClose={() => { setBenefitsOpen(false); fetchData(); }}
          onSaved={() => { setBenefitsOpen(false); fetchData(); }}
        />
      )}
    </>
  );
}

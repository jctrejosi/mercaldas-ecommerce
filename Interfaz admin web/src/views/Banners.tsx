import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Calendar,
  Loader2,
} from "lucide-react";
import {
  bannersService,
  type Banner,
  type BannerType,
  type CreateBannerData,
} from "../services/banners.service";

const BANNER_TYPE_LABEL: Record<string, string> = {
  hero: "Hero Principal",
  promo: "Banner Promo",
  sidebar: "Lateral",
  footer: "Pie de Página",
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

function BannerDrawer({
  banner,
  onClose,
  onSaved,
}: {
  banner: Banner | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!banner;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(banner?.title ?? "");
  const [subtitle, setSubtitle] = useState(banner?.subtitle ?? "");
  const [imageUrl, setImageUrl] = useState(banner?.image ?? "");
  const [mobileImageUrl, setMobileImageUrl] = useState(banner?.mobileImage ?? "");
  const [bannerType, setBannerType] = useState<BannerType>(banner?.bannerType ?? "promo");
  const [linkUrl, setLinkUrl] = useState(banner?.linkUrl ?? "");
  const [ctaText, setCtaText] = useState(banner?.ctaText ?? "");
  const [bgColor, setBgColor] = useState(banner?.bgColor ?? "#1A1A2E");
  const [accentColor, setAccentColor] = useState(banner?.accentColor ?? "#FFF200");
  const [position, setPosition] = useState(banner?.position?.toString() ?? "0");
  const [isActive, setIsActive] = useState(banner?.isActive ?? true);
  const [startDate, setStartDate] = useState(
    banner?.startDate
      ? new Date(banner.startDate).toISOString().slice(0, 16)
      : "",
  );
  const [endDate, setEndDate] = useState(
    banner?.endDate
      ? new Date(banner.endDate).toISOString().slice(0, 16)
      : "",
  );

  const handleSave = async () => {
    if (!title.trim()) {
      setError("El título es obligatorio");
      return;
    }
    if (!imageUrl.trim()) {
      setError("La imagen es obligatoria");
      return;
    }

    setError("");
    setSaving(true);
    try {
      // Create a media record for the image URL
      const imageMediaId = await createMediaFromUrl(imageUrl.trim());
      const mobileMediaId = mobileImageUrl.trim()
        ? await createMediaFromUrl(mobileImageUrl.trim())
        : undefined;

      const data: CreateBannerData = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        mediaId: imageMediaId,
        mobileImageId: mobileMediaId,
        linkUrl: linkUrl.trim() || undefined,
        ctaText: ctaText.trim() || undefined,
        bgColor: bgColor.trim() || undefined,
        accentColor: accentColor.trim() || undefined,
        bannerType,
        position: parseInt(position) || 0,
        isActive,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      };

      if (isEdit && banner) {
        await bannersService.update(banner.id, data);
      } else {
        await bannersService.create(data);
      }
      onSaved();
    } catch (e: any) {
      setError(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-xl bg-white flex flex-col shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-900">
            {isEdit ? "Editar Banner" : "Nuevo Banner"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Título *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
              placeholder="Ej: Oferta de verano — Frutas"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subtítulo (para hero slides)</label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
              placeholder="Texto descriptivo debajo del título"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tipo de banner</label>
              <select
                value={bannerType}
                onChange={(e) => setBannerType(e.target.value as BannerType)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
              >
                {Object.entries(BANNER_TYPE_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Prioridad</label>
              <input
                type="number"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                min={0}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">URL de imagen (escritorio) *</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono"
              placeholder="https://..."
            />
            {imageUrl && (
              <div className="mt-2 rounded-xl overflow-hidden bg-gray-100 h-24">
                <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">URL de imagen (móvil)</label>
            <input
              value={mobileImageUrl}
              onChange={(e) => setMobileImageUrl(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono"
              placeholder="https://... (opcional)"
            />
          </div>

          {bannerType === "hero" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Color de fondo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0"
                  />
                  <input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Color de acento</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0"
                  />
                  <input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">URL de destino</label>
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono"
                placeholder="/categoria/ofertas"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Texto del botón (CTA)</label>
              <input
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
                placeholder="Ver ofertas"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fecha inicio</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fecha fin</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-300"
            />
            <span className="text-sm text-gray-700">Banner activo</span>
          </label>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 sticky bottom-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 rounded-xl transition-colors"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Guardar cambios" : "Crear Banner"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper: create a media record from a URL
async function createMediaFromUrl(url: string): Promise<number> {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const res = await fetch(`${API_BASE_URL}/admin/banners/upload-url`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error("Error al crear media");
  const data = await res.json();
  return data.mediaId;
}

export default function Banners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Banner | null>(null);
  const [filter, setFilter] = useState<"todas" | "activo" | "programado" | "inactivo" | "expirado">("todas");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bannersService.getAll({
        bannerType: typeFilter || undefined,
      });
      setBanners(data);
    } catch (e) {
      console.error("Error fetching banners", e);
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleEdit = (b: Banner) => {
    setEditingBanner(b);
    setDrawerOpen(true);
  };

  const handleCreate = () => {
    setEditingBanner(null);
    setDrawerOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await bannersService.remove(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchBanners();
    } catch (e) {
      console.error("Error deleting banner", e);
    }
  };

  const filtered = banners.filter((b) => {
    if (filter !== "todas" && b.status !== filter) return false;
    return true;
  });

  const heroBanners = banners.filter((b) => b.bannerType === "hero");
  const activeHeroCount = heroBanners.filter((b) => b.status === "activo").length;
  const scheduledHeroCount = heroBanners.filter((b) => b.status === "programado").length;

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Banners CMS</h1>
            <p className="text-sm text-gray-500 mt-0.5">Gestiona los banners del sitio web</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors"
          >
            <Plus size={14} /> Nuevo banner
          </button>
        </div>

        {/* Layout map */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm">Mapa de posiciones — Homepage</h3>
          <div className="space-y-2 max-w-2xl mx-auto">
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3 text-center">
              <p className="text-xs font-bold text-amber-700">HERO PRINCIPAL — 1920×600px</p>
              <p className="text-xs text-amber-600 mt-0.5">
                {activeHeroCount} activos · {scheduledHeroCount} programados
              </p>
            </div>
          </div>
        </div>

        {/* Type filter tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit">
          {[
            { key: "", label: "Todos" },
            { key: "hero", label: "Hero" },
            { key: "promo", label: "Promo" },
            { key: "sidebar", label: "Lateral" },
            { key: "footer", label: "Footer" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTypeFilter(t.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                typeFilter === t.key
                  ? "bg-amber-400 text-amber-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit">
          {(["todas", "activo", "programado", "inactivo", "expirado"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                filter === f
                  ? "bg-amber-400 text-amber-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f === "todas" ? "Todos" : STATUS_LABEL[f]}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        )}

        {/* Banner cards */}
        {!loading && (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-400">
                No se encontraron banners
              </div>
            ) : (
              filtered.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4 p-4">
                    <div className="w-48 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {b.image ? (
                        <img src={b.image} alt={b.title ?? ""} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          Sin imagen
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{b.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {BANNER_TYPE_LABEL[b.bannerType] ?? b.bannerType} · Prioridad {b.position}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_BADGE[b.status]}`}>
                          {STATUS_LABEL[b.status]}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                        {b.startDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} /> {new Date(b.startDate).toLocaleDateString("es-CO")}
                            {b.endDate && ` → ${new Date(b.endDate).toLocaleDateString("es-CO")}`}
                          </span>
                        )}
                        {b.linkUrl && <span className="font-mono">{b.linkUrl}</span>}
                      </div>
                      <div className="flex items-center gap-6 mt-3">
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-700">{b.views.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">Vistas</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-700">{b.clicks.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">Clics</p>
                        </div>
                        {b.views > 0 && (
                          <div className="text-center">
                            <p className="text-sm font-bold text-amber-600">
                              {((b.clicks / b.views) * 100).toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-400">CTR</p>
                          </div>
                        )}
                        <div className="ml-auto flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(b)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(b)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {drawerOpen && (
        <BannerDrawer
          banner={editingBanner}
          onClose={() => {
            setDrawerOpen(false);
            setEditingBanner(null);
          }}
          onSaved={() => {
            setDrawerOpen(false);
            setEditingBanner(null);
            fetchBanners();
          }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Eliminar banner</h3>
            <p className="text-sm text-gray-500 mb-5">
              ¿Estás seguro de eliminar "{deleteConfirm.title}"?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-600">Cancelar</button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
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

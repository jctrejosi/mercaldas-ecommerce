import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  X,
  Search,
  Calendar,
  Edit,
  Trash2,
  Loader2,
  ChevronDown,
  Clock,
  Package,
  User,
  Tag,
  Zap,
} from "lucide-react";
import {
  promotionsService,
  type Promotion,
  type PromotionStats,
  type PromotionUsage,
  type CreatePromotionData,
  type DiscountType,
} from "../services/promotions.service";

const STATUS_BADGE: Record<string, string> = {
  activo: "bg-green-50 text-green-700 border-green-200",
  programado: "bg-blue-50 text-blue-700 border-blue-200",
  inactivo: "bg-gray-100 text-gray-500 border-gray-200",
  expirado: "bg-red-50 text-red-600 border-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  activo: "Activo",
  programado: "Programado",
  inactivo: "Inactivo",
  expirado: "Expirado",
};

const DISCOUNT_TYPES: { id: DiscountType; label: string; icon: string }[] = [
  { id: "porcentaje", label: "% Descuento", icon: "%" },
  { id: "fijo", label: "Monto fijo", icon: "$" },
  { id: "cupon", label: "Cupón", icon: "🎟️" },
];

function formatCurrency(n: number): string {
  return "$" + n.toLocaleString("es-CO");
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function toLocalDatetime(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type ActiveCard = "activas" | "programadas" | "usosHoy" | null;

// ── Modal for creating / editing ──

function PromotionModal({
  promotion,
  onClose,
  onSaved,
}: {
  promotion: Promotion | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!promotion;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(promotion?.name ?? "");
  const [description, setDescription] = useState(promotion?.description ?? "");
  const [discountType, setDiscountType] = useState<DiscountType>(
    promotion?.discountType ?? "porcentaje",
  );
  const [discountValue, setDiscountValue] = useState(
    promotion?.discountValue ? promotion.discountValue.replace(/\D/g, "") : "",
  );
  const [couponCode, setCouponCode] = useState(promotion?.couponCode ?? "");
  const [maxUsesTotal, setMaxUsesTotal] = useState(
    promotion?.couponMaxUsesTotal?.toString() ?? "",
  );
  const [maxUsesPerCustomer, setMaxUsesPerCustomer] = useState(
    promotion?.couponMaxUsesPerCustomer?.toString() ?? "1",
  );
  const [usageLimit, setUsageLimit] = useState(
    promotion?.usageLimit?.toString() ?? "",
  );
  const [startDate, setStartDate] = useState(
    toLocalDatetime(promotion?.startDate ?? new Date().toISOString()),
  );
  const [endDate, setEndDate] = useState(
    toLocalDatetime(
      promotion?.endDate ??
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    ),
  );
  const [isActive, setIsActive] = useState(promotion?.isActive ?? true);
  const [priority, setPriority] = useState(promotion?.priority?.toString() ?? "0");

  const handleSave = async () => {
    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!discountValue || parseInt(discountValue) <= 0) {
      setError("Ingresa un valor de descuento válido");
      return;
    }
    if (discountType === "cupon" && !couponCode.trim()) {
      setError("El código de cupón es obligatorio");
      return;
    }
    if (!startDate || !endDate) {
      setError("Las fechas de inicio y fin son obligatorias");
      return;
    }

    setError("");
    setSaving(true);
    try {
      const data: CreatePromotionData = {
        name: name.trim(),
        description: description.trim() || undefined,
        discountType,
        discountValue: parseInt(discountValue),
        couponCode: discountType === "cupon" ? couponCode.trim().toUpperCase() : undefined,
        maxUsesTotal: maxUsesTotal ? parseInt(maxUsesTotal) : undefined,
        maxUsesPerCustomer: parseInt(maxUsesPerCustomer) || 1,
        usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isActive,
        priority: parseInt(priority) || 0,
      };

      if (isEdit && promotion) {
        await promotionsService.update(promotion.id, data);
      } else {
        await promotionsService.create(data);
      }
      onSaved();
    } catch (e: any) {
      setError(e.message || "Error al guardar la promoción");
    } finally {
      setSaving(false);
    }
  };

  const valuePrefix = discountType === "porcentaje" ? "%" : "$";
  const valuePlaceholder = discountType === "porcentaje" ? "20" : "10000";

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-xl bg-white shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-900">
            {isEdit ? "Editar Promoción" : "Nueva Promoción"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Nombre de la promoción *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
              placeholder="Ej: Flash Sale Viernes"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
              placeholder="Descripción opcional..."
            />
          </div>

          {/* Tipo de descuento */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Tipo de descuento
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DISCOUNT_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDiscountType(t.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                    discountType === t.id
                      ? "border-amber-400 bg-amber-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-xs font-medium text-gray-600">
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Valor + Código */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Valor del descuento *
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-300">
                <span className="px-3 py-2.5 text-sm text-gray-500 bg-gray-50 border-r border-gray-200">
                  {valuePrefix}
                </span>
                <input
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value.replace(/\D/g, ""))}
                  className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                  placeholder={valuePlaceholder}
                />
              </div>
            </div>
            {discountType === "cupon" && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Código del cupón *
                </label>
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 uppercase font-mono"
                  placeholder="FRUTAS20"
                />
              </div>
            )}
          </div>

          {/* Límites de uso (cupón) */}
          {discountType === "cupon" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Máx. usos totales
                </label>
                <input
                  value={maxUsesTotal}
                  onChange={(e) => setMaxUsesTotal(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
                  placeholder="Sin límite"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Máx. usos por cliente
                </label>
                <input
                  value={maxUsesPerCustomer}
                  onChange={(e) => setMaxUsesPerCustomer(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
                  placeholder="1"
                />
              </div>
            </div>
          )}

          {/* Límite de usos general */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Límite de usos de la promoción
            </label>
            <input
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value.replace(/\D/g, ""))}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
              placeholder="Sin límite (vacío = ilimitado)"
            />
            <p className="text-xs text-gray-400 mt-1">
              Cantidad máxima de veces que se puede aplicar esta promoción.
            </p>
          </div>

          {/* Fechas - Programación */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Programación
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Fecha y hora de inicio *
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Fecha y hora de fin *
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
            </div>
          </div>

          {/* Configuración */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-600">
              Configuración adicional
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-300"
              />
              <span className="text-sm text-gray-700">Promoción activa</span>
            </label>

            <div className="flex items-center gap-4">
              <label className="text-xs text-gray-500 w-20">Prioridad</label>
              <input
                value={priority}
                onChange={(e) => setPriority(e.target.value.replace(/\D/g, ""))}
                className="w-20 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 text-center"
              />
              <span className="text-xs text-gray-400">
                Mayor número = más prioridad
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 rounded-xl transition-colors"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Guardar cambios" : "Crear Promoción"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Usages detail modal ──

function UsagesModal({
  promotionId,
  promotionName,
  onClose,
}: {
  promotionId: number;
  promotionName: string;
  onClose: () => void;
}) {
  const [usages, setUsages] = useState<PromotionUsage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    promotionsService
      .getUsages(promotionId, "today")
      .then(setUsages)
      .catch(() => setUsages([]))
      .finally(() => setLoading(false));
  }, [promotionId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900">Usos hoy</h3>
            <p className="text-xs text-gray-500 mt-0.5">{promotionName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-gray-400" />
            </div>
          ) : usages.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">
              No se ha usado esta promoción hoy
            </div>
          ) : (
            usages.map((u) => (
              <div
                key={u.redemptionId}
                className="bg-gray-50 rounded-xl p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-gray-700">
                    {u.couponCode}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(u.usedAt).toLocaleTimeString("es-CO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {u.order && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Package size={12} />
                    <span className="font-mono">
                      #{u.order.orderNumber}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span>
                      {formatCurrency(
                        parseInt(u.order.total || "0"),
                      )}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span>{u.order.status}</span>
                  </div>
                )}
                {u.customer && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <User size={12} />
                    <span>{u.customer.name}</span>
                    <span className="text-gray-300">·</span>
                    <span>{u.customer.email}</span>
                  </div>
                )}
                {u.discountAmount && (
                  <div className="text-xs font-medium text-green-600">
                    Descuento:{" "}
                    {formatCurrency(parseInt(u.discountAmount))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Promotions view ──

export default function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [stats, setStats] = useState<PromotionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCard, setActiveCard] = useState<ActiveCard>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [usagesModal, setUsagesModal] = useState<{
    promotionId: number;
    promotionName: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Promotion | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [promos, statsData] = await Promise.all([
        promotionsService.getAll({
          status: activeCard === "usosHoy" ? undefined : activeCard ?? undefined,
          usagesToday: activeCard === "usosHoy" ? "true" : undefined,
          search: search || undefined,
        }),
        promotionsService.getStats(),
      ]);
      setPromotions(promos);
      setStats(statsData);
    } catch (e) {
      console.error("Error fetching promotions", e);
    } finally {
      setLoading(false);
    }
  }, [activeCard, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCardClick = (card: ActiveCard) => {
    // Toggle: if already active, deselect
    setActiveCard((prev) => (prev === card ? null : card));
  };

  const handleEdit = (promo: Promotion) => {
    setEditingPromotion(promo);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingPromotion(null);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await promotionsService.remove(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchData();
    } catch (e) {
      console.error("Error deleting promotion", e);
    }
  };

  const activeLabel =
    activeCard === "activas"
      ? "activas"
      : activeCard === "programadas"
        ? "programadas"
        : activeCard === "usosHoy"
          ? "con usos hoy"
          : null;

  return (
    <>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Promociones</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {activeLabel
                ? `Mostrando promociones ${activeLabel}`
                : `${stats?.activas ?? 0} promociones activas en este momento`}
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors"
          >
            <Plus size={14} /> Nueva promoción
          </button>
        </div>

        {/* Stats cards - clickable filters (except descuento aplicado) */}
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              key: "activas" as const,
              label: "Activas",
              value: stats?.activas?.toString() ?? "-",
              icon: "⚡",
              color: "bg-green-50 border-green-200",
              clickable: true,
            },
            {
              key: "programadas" as const,
              label: "Programadas",
              value: stats?.programadas?.toString() ?? "-",
              icon: "📅",
              color: "bg-blue-50 border-blue-200",
              clickable: true,
            },
            {
              key: "usosHoy" as const,
              label: "Usos hoy",
              value: stats?.usosHoy?.toString() ?? "-",
              icon: "👆",
              color: "bg-amber-50 border-amber-200",
              clickable: true,
            },
            {
              key: null,
              label: "Descuento aplicado",
              value: stats?.descuentoAplicado
                ? formatCurrency(stats.descuentoAplicado)
                : "-",
              icon: "💰",
              color: "bg-purple-50 border-purple-200",
              clickable: false,
            },
          ].map((s) => (
            <div
              key={s.label}
              onClick={() => s.clickable && s.key && handleCardClick(s.key)}
              className={`rounded-2xl border p-4 ${s.color} ${
                s.clickable
                  ? "cursor-pointer hover:shadow-md transition-shadow " +
                    (activeCard === s.key ? "ring-2 ring-amber-400 ring-offset-1" : "")
                  : ""
              }`}
            >
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
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
            placeholder="Buscar promoción o código..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
          />
        </div>

        {/* Active filter indicator */}
        {activeCard && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              Filtro activo:{" "}
              <span className="font-semibold text-gray-700">
                {activeCard === "activas"
                  ? "Activas"
                  : activeCard === "programadas"
                    ? "Programadas"
                    : "Con usos hoy"}
              </span>
            </span>
            <button
              onClick={() => setActiveCard(null)}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium underline"
            >
              Limpiar filtro
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        )}

        {/* Promotions list */}
        {!loading && (
          <div className="space-y-3">
            {promotions.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-400">
                No se encontraron promociones
              </div>
            ) : (
              promotions.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl shrink-0">
                    {p.discountType === "cupon" ? "🎟️" : p.discountType === "fijo" ? "💵" : "⚡"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{p.name}</p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[p.status]}`}
                      >
                        {STATUS_LABEL[p.status]}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 flex-wrap">
                      <span>
                        <Calendar size={10} className="inline mr-1" />
                        {formatDate(p.startDate)} → {formatDate(p.endDate)}
                      </span>
                      {p.couponCode && (
                        <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                          {p.couponCode}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Zap size={10} />
                        {p.timesUsed.toLocaleString()} usos totales
                      </span>
                      {p.usagesToday > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUsagesModal({
                              promotionId: p.id,
                              promotionName: p.name,
                            });
                          }}
                          className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium underline underline-offset-2"
                        >
                          <Clock size={10} />
                          {p.usagesToday} usos hoy
                        </button>
                      )}
                      {p.usageLimit && (
                        <span className="text-gray-400">
                          Límite: {p.usageLimit} · {p.timesUsed} usados
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-amber-600">
                      {p.discountType === "fijo"
                        ? formatCurrency(
                            parseInt(
                              p.discountValue.replace(/\D/g, "") || "0",
                            ),
                          )
                        : p.discountValue
                          ? `${p.discountValue}%`
                          : "—"}
                    </p>
                    <p className="text-xs text-gray-400">descuento</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(p)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(p)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <PromotionModal
          promotion={editingPromotion}
          onClose={() => {
            setModalOpen(false);
            setEditingPromotion(null);
          }}
          onSaved={() => {
            setModalOpen(false);
            setEditingPromotion(null);
            fetchData();
          }}
        />
      )}

      {/* Usages Detail Modal */}
      {usagesModal && (
        <UsagesModal
          promotionId={usagesModal.promotionId}
          promotionName={usagesModal.promotionName}
          onClose={() => setUsagesModal(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              Eliminar promoción
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              ¿Estás seguro de eliminar "{deleteConfirm.name}"? Esta acción no
              se puede deshacer.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
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

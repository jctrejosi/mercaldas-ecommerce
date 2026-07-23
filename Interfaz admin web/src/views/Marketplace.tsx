import { useState } from "react";
import { Plus, Calendar, BarChart2, Eye, ExternalLink, ChevronRight } from "lucide-react";

const SLOTS = [
  { id: "SL1", name: "Hero Principal — Posición 1", size: "1920×600px", price: "$2.500.000/sem", status: "ocupado", supplier: "Alquería S.A.", campaign: "Verano Lácteo 2025", start: "2025-07-21", end: "2025-07-27", clicks: 2341, impressions: 18420 },
  { id: "SL2", name: "Hero Principal — Posición 2", size: "1920×600px", price: "$2.000.000/sem", status: "ocupado", supplier: "Campollo Ltda.", campaign: "Proteína Fresca", start: "2025-07-21", end: "2025-07-27", clicks: 1890, impressions: 15200 },
  { id: "SL3", name: "Hero Principal — Posición 3", size: "1920×600px", price: "$1.800.000/sem", status: "disponible", supplier: null, campaign: null, start: null, end: null, clicks: 0, impressions: 0 },
  { id: "SL4", name: "Banner Promo Medio", size: "1280×300px", price: "$1.200.000/sem", status: "ocupado", supplier: "P&G Colombia", campaign: "Mes de la Limpieza", start: "2025-07-01", end: "2025-07-31", clicks: 890, impressions: 7300 },
  { id: "SL5", name: "Sección Marketplace Bloque 1", size: "400×300px x3", price: "$800.000/sem", status: "disponible", supplier: null, campaign: null, start: null, end: null, clicks: 0, impressions: 0 },
  { id: "SL6", name: "Lateral — Derecha", size: "300×600px", price: "$600.000/sem", status: "programado", supplier: "Nestlé Colombia", campaign: "Café Nescafé Otoño", start: "2025-07-28", end: "2025-08-03", clicks: 0, impressions: 0 },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  ocupado: { label: "Ocupado", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  disponible: { label: "Disponible", color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
  programado: { label: "Programado", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
};

export default function Marketplace() {
  const [view, setView] = useState<"slots" | "map">("map");

  const occupied = SLOTS.filter((s) => s.status === "ocupado").length;
  const available = SLOTS.filter((s) => s.status === "disponible").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Publicidad Marketplace</h1>
          <p className="text-sm text-gray-500 mt-0.5">Venta de espacios publicitarios a proveedores</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white border border-gray-200 rounded-xl p-1">
            {(["map", "slots"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${view === v ? "bg-amber-400 text-amber-900 shadow-sm" : "text-gray-500"}`}>
                {v === "map" ? "Mapa visual" : "Lista de slots"}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors">
            <Plus size={14} /> Nueva campaña
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Slots ocupados", value: `${occupied}/${SLOTS.length}`, color: "text-red-600" },
          { label: "Disponibles", value: String(available), color: "text-green-600" },
          { label: "Ingresos esta semana", value: "$6.3M", color: "text-amber-600" },
          { label: "CTR promedio", value: "4.2%", color: "text-blue-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Visual map */}
      {view === "map" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-5">Mapa Visual — Homepage</h3>
          <div className="max-w-2xl mx-auto space-y-3">
            {/* Hero slots */}
            <div className="rounded-xl overflow-hidden border-2 border-dashed border-gray-200">
              <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                <p className="text-xs font-bold text-gray-500">HERO PRINCIPAL — 1920×600px</p>
              </div>
              <div className="grid grid-cols-3 gap-0 divide-x divide-gray-200">
                {SLOTS.slice(0, 3).map((s, i) => {
                  const cfg = STATUS_CONFIG[s.status];
                  return (
                    <div key={s.id} className={`p-4 text-center ${cfg.bg}`}>
                      <p className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{s.supplier || "Disponible"}</p>
                      {s.campaign && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{s.campaign}</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-3 rounded-xl overflow-hidden border-2 border-dashed border-blue-200">
                <div className="bg-blue-50 px-3 py-2 border-b border-blue-100">
                  <p className="text-xs font-bold text-blue-600">BANNER PROMO MEDIO — 1280×300px</p>
                </div>
                <div className="p-3 bg-red-50 text-center">
                  <p className="text-xs font-bold text-red-700">Ocupado</p>
                  <p className="text-[10px] text-gray-500 mt-1">{SLOTS[3].supplier}</p>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border-2 border-dashed border-purple-200">
                <div className="bg-purple-50 px-2 py-2 border-b border-purple-100">
                  <p className="text-[10px] font-bold text-purple-600">LATERAL 300×600px</p>
                </div>
                <div className="p-3 bg-blue-50 text-center h-20 flex flex-col items-center justify-center">
                  <p className="text-xs font-bold text-blue-700">Programado</p>
                  <p className="text-[10px] text-gray-400 mt-1">Jul 28</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border-2 border-dashed border-green-200">
              <div className="bg-green-50 px-3 py-2 text-center">
                <p className="text-xs font-bold text-green-600">SECCIÓN MARKETPLACE — 3 bloques · Disponible ✓</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slots list */}
      {view === "slots" && (
        <div className="space-y-3">
          {SLOTS.map((s) => {
            const cfg = STATUS_CONFIG[s.status];
            return (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                <div className={`w-3 h-16 rounded-full shrink-0 ${s.status === "ocupado" ? "bg-red-400" : s.status === "programado" ? "bg-blue-400" : "bg-green-400"}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.size} · {s.price}</p>
                  {s.supplier && (
                    <p className="text-xs text-gray-500 mt-1">{s.supplier} — {s.campaign}</p>
                  )}
                  {s.start && <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Calendar size={10} />{s.start} → {s.end}</p>}
                </div>
                {s.impressions > 0 && (
                  <div className="flex gap-6 text-right shrink-0">
                    <div>
                      <p className="text-sm font-bold text-gray-700">{s.impressions.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">impresiones</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">{s.clicks.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">clics</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-600">{((s.clicks / s.impressions) * 100).toFixed(1)}%</p>
                      <p className="text-xs text-gray-400">CTR</p>
                    </div>
                  </div>
                )}
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border shrink-0 ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                  {cfg.label}
                </span>
                {s.status === "disponible" && (
                  <button className="px-3 py-1.5 text-xs font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 rounded-xl transition-colors shrink-0">
                    Asignar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

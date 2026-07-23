import { useState } from "react";
import { Plus, Percent, Zap, Tag, Calendar, Eye, Edit, Trash2, ToggleLeft, X, Search } from "lucide-react";

const PROMOS = [
  { id: "P1", name: "Flash Sale Viernes", type: "porcentaje", value: "30%", code: null, startDate: "2025-07-25", endDate: "2025-07-25", status: "programado", uses: 0, scope: "Toda la tienda", icon: "⚡" },
  { id: "P2", name: "FRUTAS20", type: "cupon", value: "20%", code: "FRUTAS20", startDate: "2025-07-01", endDate: "2025-07-31", status: "activo", uses: 234, scope: "Frutas y Verduras", icon: "🎟️" },
  { id: "P3", name: "2x1 en Lácteos martes", type: "2x1", value: "2x1", code: null, startDate: "2025-07-01", endDate: "2025-07-31", status: "activo", uses: 891, scope: "Lácteos", icon: "🥛" },
  { id: "P4", name: "Descuento $10K en primer pedido", type: "fijo", value: "$10.000", code: "NUEVO10", startDate: "2025-01-01", endDate: "2025-12-31", status: "activo", uses: 1203, scope: "Nuevos clientes", icon: "🎁" },
  { id: "P5", name: "Semana del Pollo", type: "porcentaje", value: "25%", code: null, startDate: "2025-07-14", endDate: "2025-07-20", status: "expirado", uses: 542, scope: "Carnes y Pollo", icon: "🍗" },
];

const STATUS_BADGE: Record<string, string> = {
  activo: "bg-green-50 text-green-700 border-green-200",
  programado: "bg-blue-50 text-blue-700 border-blue-200",
  inactivo: "bg-gray-100 text-gray-500 border-gray-200",
  expirado: "bg-red-50 text-red-600 border-red-200",
};

function NewPromoDrawer({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState("porcentaje");
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-xl bg-white shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-bold text-gray-900">Nueva Promoción</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre de la promoción *</label>
            <input className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="Ej: Flash Sale Viernes" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Tipo de descuento</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "porcentaje", label: "% Descuento", icon: "%" },
                { id: "fijo", label: "Monto fijo", icon: "$" },
                { id: "2x1", label: "2x1 / BxGy", icon: "🎁" },
                { id: "cupon", label: "Cupón", icon: "🎟️" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${type === t.id ? "border-amber-400 bg-amber-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-xs font-medium text-gray-600">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Valor del descuento</label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-300">
                <span className="px-3 py-2.5 text-sm text-gray-500 bg-gray-50 border-r border-gray-200">{type === "porcentaje" ? "%" : "$"}</span>
                <input className="flex-1 px-3 py-2.5 text-sm focus:outline-none" placeholder={type === "porcentaje" ? "20" : "10000"} />
              </div>
            </div>
            {type === "cupon" && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Código del cupón</label>
                <input className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 uppercase font-mono" placeholder="FRUTAS20" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fecha inicio</label>
              <input type="date" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fecha fin</label>
              <input type="date" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Alcance</label>
            <select className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white">
              <option>Toda la tienda</option>
              <option>Categoría específica</option>
              <option>Productos específicos</option>
              <option>Solo nuevos clientes</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 sticky bottom-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancelar</button>
          <button className="px-4 py-2 text-sm font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 rounded-xl transition-colors">Crear Promoción</button>
        </div>
      </div>
    </div>
  );
}

export default function Promotions() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = PROMOS.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || (p.code && p.code.toLowerCase().includes(search.toLowerCase())));

  return (
    <>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Promociones</h1>
            <p className="text-sm text-gray-500 mt-0.5">8 promociones activas en este momento</p>
          </div>
          <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors">
            <Plus size={14} /> Nueva promoción
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Activas", value: "8", icon: "⚡", color: "bg-green-50 border-green-200" },
            { label: "Programadas", value: "3", icon: "📅", color: "bg-blue-50 border-blue-200" },
            { label: "Usos hoy", value: "247", icon: "👆", color: "bg-amber-50 border-amber-200" },
            { label: "Descuento aplicado", value: "$1.2M", icon: "💰", color: "bg-purple-50 border-purple-200" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar promoción o código..." className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white" />
        </div>

        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl shrink-0">{p.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGE[p.status]}`}>{p.status}</span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                  <span>{p.scope}</span>
                  <span><Calendar size={10} className="inline mr-1" />{p.startDate} → {p.endDate}</span>
                  {p.code && <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{p.code}</span>}
                  <span>{p.uses.toLocaleString()} usos</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-amber-600">{p.value}</p>
                <p className="text-xs text-gray-400">descuento</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><Edit size={14} /></button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {drawerOpen && <NewPromoDrawer onClose={() => setDrawerOpen(false)} />}
    </>
  );
}

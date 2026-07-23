import { Search, AlertTriangle, ArrowUpRight, ArrowDownRight, Plus, Download } from "lucide-react";
import { useState } from "react";

const LOW_STOCK = [
  { id: "P001", name: "Leche Alquería 1.1L", stock: 12, min: 50, category: "Lácteos", expires: "2025-08-05" },
  { id: "P003", name: "Arroz Diana 5kg", stock: 0, min: 30, category: "Despensa", expires: "2026-01-01" },
  { id: "P008", name: "Agua Cristal 600ml x6", stock: 3, min: 40, category: "Bebidas", expires: "2026-06-01" },
  { id: "P012", name: "Yogur Alquería Fresa 200g", stock: 8, min: 25, category: "Lácteos", expires: "2025-07-30" },
  { id: "P019", name: "Aceite de Canola 3L", stock: 15, min: 35, category: "Despensa", expires: "2026-03-01" },
];

const MOVEMENTS = [
  { id: "M001", type: "entrada", product: "Pechuga de Pollo x kg", qty: "+120 kg", warehouse: "Principal", date: "2025-07-23 09:00", user: "Carlos V." },
  { id: "M002", type: "salida", product: "Leche Alquería 1.1L", qty: "-36 und", warehouse: "Principal", date: "2025-07-23 08:30", user: "Sistema" },
  { id: "M003", type: "transferencia", product: "Arroz Diana 5kg", qty: "50 und", warehouse: "Norte → Principal", date: "2025-07-22 17:00", user: "Ana M." },
  { id: "M004", type: "entrada", product: "Huevos AA x30", qty: "+200 und", warehouse: "Principal", date: "2025-07-22 14:00", user: "Luis K." },
];

const WAREHOUSES = [
  { name: "Principal — Medellín", address: "Calle 65 #48-72, Medellín", products: 2841, capacity: "85%", status: "normal" },
  { name: "Bodega Norte", address: "Carrera 80 #12-45, Bello", products: 620, capacity: "42%", status: "normal" },
  { name: "Bodega Sur", address: "Av. El Poblado #4-55, Envigado", products: 351, capacity: "28%", status: "low" },
];

const MOV_TYPE: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  entrada: { label: "Entrada", color: "text-green-600 bg-green-50", icon: ArrowUpRight },
  salida: { label: "Salida", color: "text-red-600 bg-red-50", icon: ArrowDownRight },
  transferencia: { label: "Transferencia", color: "text-blue-600 bg-blue-50", icon: ArrowUpRight },
};

export default function Inventory() {
  const [search, setSearch] = useState("");
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-sm text-gray-500 mt-0.5">Control de stock y movimientos</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Download size={14} /> Exportar
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors">
            <Plus size={14} /> Orden de compra
          </button>
        </div>
      </div>

      {/* Warehouses */}
      <div className="grid grid-cols-3 gap-4">
        {WAREHOUSES.map((w) => (
          <div key={w.name} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-gray-900 text-sm">{w.name}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${w.status === "normal" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                {w.status === "normal" ? "Normal" : "Bajo"}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-3">{w.address}</p>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">{w.products} SKUs</span>
              <span className="font-bold text-gray-800">{w.capacity}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: w.capacity }} />
            </div>
          </div>
        ))}
      </div>

      {/* Low stock alert */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <AlertTriangle size={16} className="text-amber-500" />
          <h3 className="font-semibold text-gray-900">Productos con stock bajo</h3>
          <span className="ml-auto text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{LOW_STOCK.length}</span>
        </div>
        <div className="divide-y divide-gray-50">
          {LOW_STOCK.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-400">{p.category} · Vence: {p.expires}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${p.stock === 0 ? "text-red-600" : "text-amber-600"}`}>{p.stock} und</p>
                <p className="text-xs text-gray-400">Mín: {p.min}</p>
              </div>
              <button className="px-3 py-1.5 text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors shrink-0">
                Reponer
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Movements */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Movimientos Recientes</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {MOVEMENTS.map((m) => {
            const cfg = MOV_TYPE[m.type];
            return (
              <div key={m.id} className="flex items-center gap-4 px-5 py-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                  <cfg.icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{m.product}</p>
                  <p className="text-xs text-gray-400">{m.warehouse} · {m.user}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${m.type === "entrada" ? "text-green-600" : m.type === "salida" ? "text-red-600" : "text-blue-600"}`}>{m.qty}</p>
                  <p className="text-xs text-gray-400">{m.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

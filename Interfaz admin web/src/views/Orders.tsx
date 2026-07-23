import { useState } from "react";
import {
  LayoutGrid, List, Search, Filter, Download, Eye, Package,
  Clock, CheckCircle, Truck, XCircle, ChevronRight, MoreHorizontal,
  MapPin, Phone, CreditCard, Printer, RefreshCw,
} from "lucide-react";

interface Order {
  id: string; customer: string; phone: string; address: string;
  items: { name: string; qty: number; price: number }[];
  total: number; payment: string; status: OrderStatus;
  date: string; time: string; note?: string;
}

type OrderStatus = "pendiente" | "confirmado" | "preparando" | "listo" | "en camino" | "entregado" | "cancelado";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; border: string; colBg: string }> = {
  pendiente:  { label: "Pendiente",  color: "text-gray-600",   bg: "bg-gray-100",   border: "border-gray-200",  colBg: "bg-gray-50" },
  confirmado: { label: "Confirmado", color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200",  colBg: "bg-blue-50/50" },
  preparando: { label: "Preparando", color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-200", colBg: "bg-amber-50/40" },
  listo:      { label: "Listo",      color: "text-teal-700",   bg: "bg-teal-50",    border: "border-teal-200",  colBg: "bg-teal-50/50" },
  "en camino":{ label: "En Camino",  color: "text-purple-700", bg: "bg-purple-50",  border: "border-purple-200",colBg: "bg-purple-50/40" },
  entregado:  { label: "Entregado",  color: "text-green-700",  bg: "bg-green-50",   border: "border-green-200", colBg: "bg-green-50/40" },
  cancelado:  { label: "Cancelado",  color: "text-red-700",    bg: "bg-red-50",     border: "border-red-200",   colBg: "bg-red-50/40" },
};

const ORDERS: Order[] = [
  { id: "MC-3821", customer: "Laura Martínez", phone: "+57 300 555 0101", address: "Calle 50 #45-12, Laureles, Medellín", items: [{ name: "Leche Alquería 1.1L", qty: 3, price: 4350 }, { name: "Huevos AA x30", qty: 1, price: 18900 }, { name: "Arroz Diana 5kg", qty: 1, price: 22500 }], total: 54550, payment: "Tarjeta", status: "preparando", date: "2025-07-23", time: "10:32", },
  { id: "MC-3820", customer: "Carlos Gómez", phone: "+57 301 555 0202", address: "Carrera 80 #30-45, Belén, Medellín", items: [{ name: "Pechuga de Pollo x kg", qty: 2, price: 12900 }], total: 25800, payment: "Efectivo", status: "confirmado", date: "2025-07-23", time: "10:18", },
  { id: "MC-3819", customer: "Sofía Herrera", phone: "+57 310 555 0303", address: "Av. Las Vegas #56-22, El Poblado, Medellín", items: [{ name: "Aguacate Hass x und", qty: 5, price: 2800 }, { name: "Detergente Ariel 3L", qty: 1, price: 28900 }, { name: "Tomates 500g", qty: 2, price: 3200 }], total: 53500, payment: "PSE", status: "en camino", date: "2025-07-23", time: "09:55", },
  { id: "MC-3818", customer: "Miguel Torres", phone: "+57 312 555 0404", address: "Calle 10 #65-80, Estadio, Medellín", items: [{ name: "Leche Alquería 1.1L", qty: 6, price: 4350 }], total: 26100, payment: "Nequi", status: "entregado", date: "2025-07-23", time: "09:12", },
  { id: "MC-3817", customer: "Ana Rodríguez", phone: "+57 315 555 0505", address: "Carrera 45 #70-15, Robledo, Medellín", items: [{ name: "Arroz Diana 5kg", qty: 2, price: 22500 }, { name: "Huevos AA x30", qty: 1, price: 18900 }], total: 63900, payment: "Tarjeta", status: "pendiente", date: "2025-07-23", time: "08:47", note: "Dejar en portería" },
  { id: "MC-3816", customer: "Felipe Castro", phone: "+57 317 555 0606", address: "Calle 33 #69-12, La América, Medellín", items: [{ name: "Pechuga de Pollo x kg", qty: 3, price: 12900 }], total: 38700, payment: "Tarjeta", status: "listo", date: "2025-07-23", time: "08:23", },
  { id: "MC-3815", customer: "Valentina López", phone: "+57 318 555 0707", address: "Av. Oriental #45-67, Centro, Medellín", items: [{ name: "Tomates 500g", qty: 4, price: 3200 }], total: 12800, payment: "Nequi", status: "cancelado", date: "2025-07-23", time: "07:58", note: "Cliente canceló por error de dirección" },
];

const fmt = (n: number) => "$" + n.toLocaleString("es-CO");

function KanbanCard({ order, onClick }: { order: Order; onClick: () => void }) {
  const cfg = STATUS_CONFIG[order.status];
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-100 p-3 hover:shadow-md transition-all cursor-pointer hover:border-gray-200"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono font-bold text-gray-600">{order.id}</span>
        <span className="text-xs text-gray-400">{order.time}</span>
      </div>
      <p className="text-sm font-semibold text-gray-800 mb-1">{order.customer}</p>
      <p className="text-xs text-gray-400 mb-3 truncate">{order.address}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-900">{fmt(order.total)}</span>
        <span className="text-xs text-gray-400">{order.items.length} items</span>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{order.payment}</span>
        {order.note && <span className="text-[10px] text-gray-400">📝 nota</span>}
      </div>
    </div>
  );
}

const STATUSES: OrderStatus[] = ["pendiente", "confirmado", "preparando", "listo", "en camino", "entregado", "cancelado"];

function OrderDetail({ order, onClose }: { order: Order; onClose: () => void }) {
  const cfg = STATUS_CONFIG[order.status];
  const timeline: { status: OrderStatus; time: string; done: boolean }[] = [
    { status: "pendiente", time: order.time, done: true },
    { status: "confirmado", time: "+" + Math.floor(Math.random() * 5 + 2) + "m", done: ["confirmado", "preparando", "listo", "en camino", "entregado"].includes(order.status) },
    { status: "preparando", time: "+" + Math.floor(Math.random() * 10 + 5) + "m", done: ["preparando", "listo", "en camino", "entregado"].includes(order.status) },
    { status: "listo", time: "+" + Math.floor(Math.random() * 15 + 10) + "m", done: ["listo", "en camino", "entregado"].includes(order.status) },
    { status: "en camino", time: "+" + Math.floor(Math.random() * 10 + 5) + "m", done: ["en camino", "entregado"].includes(order.status) },
    { status: "entregado", time: "+" + Math.floor(Math.random() * 20 + 20) + "m", done: order.status === "entregado" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-lg bg-white flex flex-col shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-bold text-gray-900 font-mono">{order.id}</h2>
            <p className="text-xs text-gray-400">{order.date} a las {order.time}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Printer size={12} /> Factura
            </button>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Status badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {cfg.label}
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-600 mb-3">Línea de tiempo</p>
            <div className="space-y-3">
              {timeline.map((t, i) => (
                <div key={t.status} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${t.done ? "bg-amber-400" : "bg-gray-200"}`}>
                    {t.done ? <CheckCircle size={12} className="text-white" /> : <Clock size={12} className="text-gray-400" />}
                  </div>
                  <p className={`text-xs flex-1 ${t.done ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                    {STATUS_CONFIG[t.status].label}
                  </p>
                  <span className="text-xs text-gray-400 font-mono">{t.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-600 mb-3">Cliente</p>
            <p className="font-semibold text-gray-800">{order.customer}</p>
            <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-500">
              <Phone size={12} /><span>{order.phone}</span>
            </div>
            <div className="flex items-start gap-2 mt-1.5 text-sm text-gray-500">
              <MapPin size={12} className="mt-0.5 shrink-0" /><span>{order.address}</span>
            </div>
            {order.note && (
              <div className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                📝 {order.note}
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-3">Productos</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm text-gray-700">{item.name}</p>
                    <p className="text-xs text-gray-400">x{item.qty}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{fmt(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Total</span>
              <span className="text-lg font-bold text-gray-900">{fmt(order.total)}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">Pago</p>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CreditCard size={14} className="text-gray-400" />
              {order.payment} — <span className="text-green-600 font-semibold">Confirmado</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 text-sm font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 rounded-xl transition-colors">
              Avanzar estado
            </button>
            <button className="px-4 py-2.5 text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [mode, setMode] = useState<"kanban" | "table">("kanban");
  const [selected, setSelected] = useState<Order | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "todos">("todos");

  const filtered = ORDERS.filter((o) => {
    const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search);
    const matchStatus = statusFilter === "todos" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
            <p className="text-sm text-gray-500 mt-0.5">94 pedidos hoy · 8 pendientes de acción</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1">
              <button onClick={() => setMode("kanban")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === "kanban" ? "bg-amber-400 text-amber-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                <LayoutGrid size={14} /> Kanban
              </button>
              <button onClick={() => setMode("table")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === "table" ? "bg-amber-400 text-amber-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                <List size={14} /> Tabla
              </button>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Download size={14} /> Exportar
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 lg:grid-cols-7 gap-3">
          {STATUSES.map((s) => {
            const count = ORDERS.filter((o) => o.status === s).length;
            const cfg = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? "todos" : s)}
                className={`rounded-xl border p-3 text-left transition-all hover:shadow-sm ${statusFilter === s ? `${cfg.bg} ${cfg.border}` : "bg-white border-gray-100"}`}
              >
                <p className={`text-lg font-bold ${statusFilter === s ? cfg.color : "text-gray-800"}`}>{count}</p>
                <p className={`text-[10px] font-semibold ${statusFilter === s ? cfg.color : "text-gray-500"}`}>{cfg.label}</p>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pedido o cliente..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
          />
        </div>

        {/* Kanban */}
        {mode === "kanban" && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STATUSES.map((s) => {
              const cfg = STATUS_CONFIG[s];
              const col = filtered.filter((o) => o.status === s);
              return (
                <div key={s} className="min-w-60 w-60 shrink-0">
                  <div className={`rounded-xl p-3 mb-3 flex items-center justify-between ${cfg.bg}`}>
                    <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
                    <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                      {col.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {col.map((o) => (
                      <KanbanCard key={o.id} order={o} onClick={() => setSelected(o)} />
                    ))}
                    {col.length === 0 && (
                      <div className="text-center py-6 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                        Sin pedidos
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Table */}
        {mode === "table" && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pedido</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pago</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hora</th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((o) => {
                  const cfg = STATUS_CONFIG[o.status];
                  return (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelected(o)}>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono font-bold text-gray-700">{o.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-800">{o.customer}</p>
                        <p className="text-xs text-gray-400">{o.items.length} productos</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-bold text-gray-900">{fmt(o.total)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{o.payment}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400 font-mono">{o.time}</span>
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight size={14} className="text-gray-400" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <OrderDetail order={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

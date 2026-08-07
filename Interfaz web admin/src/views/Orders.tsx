import { useState, useEffect, useCallback } from "react";
import {
  LayoutGrid, List, Search, Download, Eye, Package,
  Clock, CheckCircle, Truck, XCircle, ChevronRight, MoreHorizontal,
  MapPin, Phone, CreditCard, Printer, RefreshCw, X,
} from "lucide-react";
import { ordersService, type Order, type OrderDetail, type OrderStatus } from "../services/orders.service";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; border: string; colBg: string }> = {
  pendiente:  { label: "Pendiente",  color: "text-gray-600",   bg: "bg-gray-100",   border: "border-gray-200",  colBg: "bg-gray-50" },
  confirmado: { label: "Confirmado", color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200",  colBg: "bg-blue-50/50" },
  preparando: { label: "Preparando", color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-200", colBg: "bg-amber-50/40" },
  listo:      { label: "Listo",      color: "text-teal-700",   bg: "bg-teal-50",    border: "border-teal-200",  colBg: "bg-teal-50/50" },
  "en camino":{ label: "En Camino",  color: "text-purple-700", bg: "bg-purple-50",  border: "border-purple-200",colBg: "bg-purple-50/40" },
  entregado:  { label: "Entregado",  color: "text-green-700",  bg: "bg-green-50",   border: "border-green-200", colBg: "bg-green-50/40" },
  cancelado:  { label: "Cancelado",  color: "text-red-700",    bg: "bg-red-50",     border: "border-red-200",   colBg: "bg-red-50/40" },
};

const STATUSES: OrderStatus[] = ["pendiente", "confirmado", "preparando", "listo", "en camino", "entregado", "cancelado"];

const fmt = (n: number) => "$" + n.toLocaleString("es-CO");

function KanbanCard({ order, onClick, onConfirmPayment }: { order: Order; onClick: () => void; onConfirmPayment?: (o: Order) => void }) {
  const cfg = STATUS_CONFIG[order.status];
  const isPending = order.status === "pendiente";
  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all hover:border-gray-200 overflow-hidden">
      {isPending && onConfirmPayment && (
        <button
          onClick={(e) => { e.stopPropagation(); onConfirmPayment(order); }}
          className="w-full px-3 py-1.5 text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
        >
          <CheckCircle size={10} /> Confirmar pago
        </button>
      )}
      <div
        onClick={onClick}
        className="p-3 cursor-pointer"
      >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono font-bold text-gray-600">{order.id}</span>
        <span className="text-xs text-gray-400">{order.time}</span>
      </div>
      <p className="text-sm font-semibold text-gray-800 mb-1">{order.customer}</p>
      <p className="text-xs text-gray-400 mb-3 truncate">{order.address}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-900">{fmt(order.total)}</span>
        <span className="text-xs text-gray-400">{order.itemsCount} items</span>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{order.payment}</span>
        {order.note && <span className="text-[10px] text-gray-400">📝 nota</span>}
      </div>
      </div>
    </div>
  );
}

function OrderDetail({ order: initialOrder, onClose }: { order: Order; onClose: () => void }) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const cfg = STATUS_CONFIG[initialOrder.status];

  useEffect(() => {
    ordersService.getById(initialOrder.orderId.toString())
      .then(setOrder)
      .catch(() => setOrder({ ...initialOrder, items: [] }))
      .finally(() => setLoading(false));
  }, [initialOrder.orderId]);

  const timeline = order?.statusHistory?.map((h, i, arr) => ({
    status: h.status,
    time: h.time,
    done: i < arr.length,
  })) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-lg bg-white flex flex-col shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-bold text-gray-900 font-mono">{initialOrder.id}</h2>
            <p className="text-xs text-gray-400">{initialOrder.date} a las {initialOrder.time}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Printer size={12} /> Factura
            </button>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer">✕</button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Cliente */}
          <div>
            <p className="text-sm font-bold text-gray-800">{initialOrder.customer}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Phone size={10} /> {initialOrder.phone}</span>
              <span className="flex items-center gap-1"><MapPin size={10} /> {initialOrder.address}</span>
            </div>
          </div>

          {/* Estado actual */}
          <div className={`rounded-xl p-4 border ${cfg.bg} ${cfg.border}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                {initialOrder.payment}
              </span>
            </div>
          </div>

          {/* Timeline */}
          {timeline.length > 0 && (
            <div className="relative pl-6 border-l-2 border-gray-200 space-y-4">
              {timeline.map((step, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-[25px] w-3 h-3 rounded-full border-2 ${step.done ? "bg-amber-400 border-amber-400" : "bg-white border-gray-300"}`} />
                  <p className={`text-xs font-semibold ${step.done ? "text-gray-800" : "text-gray-400"}`}>
                    {step.status}
                  </p>
                  <p className="text-[10px] text-gray-400">{step.time}</p>
                </div>
              ))}
            </div>
          )}

          {/* Items */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-2">Productos</h4>
            <div className="space-y-2">
              {loading ? (
                <p className="text-xs text-gray-400">Cargando...</p>
              ) : (
                (order?.items ?? []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.qty} x {fmt(item.price)}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{fmt(item.qty * item.price)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-sm font-semibold text-gray-800">Total</span>
            <span className="text-lg font-bold text-gray-900">{fmt(initialOrder.total)}</span>
          </div>

          {/* Nota */}
          {initialOrder.note && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-700">{initialOrder.note}</p>
            </div>
          )}
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ordersService.getAll({
        status: statusFilter !== "todos" ? statusFilter : undefined,
        search: search || undefined,
        limit: 100,
      });
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  const handleConfirmPayment = async (o: Order) => {
    try {
      await ordersService.updateStatus(o.orderId.toString(), "confirmado");
      fetchOrders();
    } catch (err) {
      console.error("Error confirming payment:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Mark loaded orders as reviewed
  useEffect(() => {
    if (orders.length > 0) {
      orders.forEach((o) => {
        ordersService.markAsReviewed(o.orderId.toString()).catch(() => {});
      });
    }
  }, [orders]);

  const filtered = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = STATUSES.reduce(
    (acc, s) => {
      acc[s] = orders.filter((o) => o.status === s).length;
      return acc;
    },
    {} as Record<OrderStatus, number>,
  );

  return (
    <>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? "Cargando..." : `${orders.length} pedidos · ${counts.pendiente ?? 0} pendientes de acción`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1">
              <button onClick={() => setMode("kanban")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${mode === "kanban" ? "bg-amber-400 text-amber-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                <LayoutGrid size={14} /> Kanban
              </button>
              <button onClick={() => setMode("table")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${mode === "table" ? "bg-amber-400 text-amber-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
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
            const count = counts[s] ?? 0;
            const cfg = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? "todos" : s)}
                className={`rounded-xl border p-3 text-left transition-all hover:shadow-sm cursor-pointer ${statusFilter === s ? `${cfg.bg} ${cfg.border}` : "bg-white border-gray-100"}`}
              >
                <p className={`text-lg font-bold ${statusFilter === s ? cfg.color : "text-gray-800"}`}>{count}</p>
                <p className={`text-[10px] font-semibold ${statusFilter === s ? cfg.color : "text-gray-500"}`}>{cfg.label}</p>
              </button>
            );
          })}
        </div>

        {/* Search + Filter tags */}
        <div className="space-y-3">
          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar pedido o cliente..."
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
            />
          </div>

          {/* Status filter tags below search */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatusFilter("todos")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                statusFilter === "todos"
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Todos
            </button>
            {STATUSES.map((s) => {
              const cfg = STATUS_CONFIG[s];
              const isActive = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(isActive ? "todos" : s)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {cfg.label}
                  {isActive && <X size={12} />}
                </button>
              );
            })}
          </div>
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
                      <KanbanCard key={o.id} order={o} onClick={() => setSelected(o)} onConfirmPayment={handleConfirmPayment} />
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
            {loading ? (
              <div className="p-8 text-center text-sm text-gray-400">Cargando pedidos...</div>
            ) : (
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
                          <p className="text-xs text-gray-400">{o.itemsCount} productos</p>
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
                          <div className="flex items-center gap-2">
                            {o.status === "pendiente" && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleConfirmPayment(o); }}
                                className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                              >
                                Confirmar
                              </button>
                            )}
                            <ChevronRight size={14} className="text-gray-400" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                        No se encontraron pedidos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {selected && <OrderDetail order={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

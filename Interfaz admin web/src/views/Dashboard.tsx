import { useState } from "react";
import {
  TrendingUp, TrendingDown, ShoppingCart, Users, Package, Truck,
  AlertTriangle, Zap, ArrowUpRight, MoreHorizontal, Plus,
  RefreshCw, CheckCircle, Clock, XCircle, Eye,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const revenueData = [
  { day: "Lu", revenue: 3200000, orders: 48 },
  { day: "Ma", revenue: 4100000, orders: 62 },
  { day: "Mi", revenue: 3800000, orders: 55 },
  { day: "Ju", revenue: 5200000, orders: 78 },
  { day: "Vi", revenue: 6800000, orders: 94 },
  { day: "Sá", revenue: 7400000, orders: 110 },
  { day: "Do", revenue: 4900000, orders: 73 },
];

const categoryData = [
  { name: "Frutas y Verd.", value: 28 },
  { name: "Lácteos", value: 22 },
  { name: "Carnes", value: 18 },
  { name: "Despensa", value: 16 },
  { name: "Limpieza", value: 10 },
  { name: "Otros", value: 6 },
];

const COLORS = ["#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#6B7280"];

const recentOrders = [
  { id: "MC-3821", customer: "Laura Martínez", items: 5, total: 124900, status: "preparando", time: "hace 8m" },
  { id: "MC-3820", customer: "Carlos Gómez", items: 2, total: 37500, status: "confirmado", time: "hace 15m" },
  { id: "MC-3819", customer: "Sofía Herrera", items: 8, total: 210400, status: "en camino", time: "hace 28m" },
  { id: "MC-3818", customer: "Miguel Torres", items: 3, total: 58200, status: "entregado", time: "hace 45m" },
  { id: "MC-3817", customer: "Ana Rodríguez", items: 6, total: 145600, status: "pendiente", time: "hace 1h" },
];

const activity = [
  { type: "order", text: "Nuevo pedido #MC-3821 de Laura Martínez", time: "hace 8m" },
  { type: "stock", text: "Stock bajo en Leche Alquería 1.1L — 12 unidades", time: "hace 22m" },
  { type: "promo", text: "Campaña Flash Sale activada — 47 productos afectados", time: "hace 1h" },
  { type: "user", text: "102 nuevos clientes registrados hoy", time: "hace 2h" },
  { type: "order", text: "Pedido #MC-3815 entregado exitosamente", time: "hace 2h" },
  { type: "banner", text: "Banner Hero actualizado — Oferta Semanal", time: "hace 3h" },
];

const STATUS_STYLES: Record<string, string> = {
  pendiente: "bg-gray-100 text-gray-600",
  confirmado: "bg-blue-50 text-blue-700",
  preparando: "bg-amber-50 text-amber-700",
  "en camino": "bg-purple-50 text-purple-700",
  entregado: "bg-green-50 text-green-700",
  cancelado: "bg-red-50 text-red-700",
};

function fmt(n: number) {
  return "$" + n.toLocaleString("es-CO");
}

function StatCard({
  label, value, sub, trend, icon: Icon, accent,
}: {
  label: string; value: string; sub: string; trend: "up" | "down" | "neutral";
  icon: React.ElementType; accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon size={18} />
        </div>
        {trend !== "neutral" && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend === "up" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
            {trend === "up" ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {sub}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3">
      <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name === "revenue" ? fmt(p.value) : p.value + " pedidos"}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("7d");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buenos días, Jorge 👋</h1>
          <p className="text-sm text-gray-500 mt-0.5">Miércoles, 23 de julio 2025 — Aquí tienes el resumen del día</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <RefreshCw size={14} />
            Actualizar
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors">
            <Plus size={14} />
            Acción rápida
          </button>
        </div>
      </div>

      {/* Alert */}
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <AlertTriangle size={16} className="text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800 font-medium">
          <strong>5 productos con stock bajo</strong> — Leche Alquería, Arroz Diana, Huevos AA y 2 más requieren reposición urgente.
        </p>
        <button className="ml-auto text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2 shrink-0">
          Ver inventario
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Ingresos hoy" value="$6.84M" sub="+12.4%" trend="up" icon={TrendingUp} accent="bg-amber-100 text-amber-600" />
        <StatCard label="Pedidos hoy" value="94" sub="+8 vs ayer" trend="up" icon={ShoppingCart} accent="bg-blue-100 text-blue-600" />
        <StatCard label="Clientes activos" value="1,247" sub="+3.2%" trend="up" icon={Users} accent="bg-green-100 text-green-600" />
        <StatCard label="Productos activos" value="3,812" sub="5 stock bajo" trend="down" icon={Package} accent="bg-purple-100 text-purple-600" />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Entregas pendientes", value: "23", icon: Truck, color: "text-blue-500" },
          { label: "Alertas de stock", value: "5", icon: AlertTriangle, color: "text-amber-500" },
          { label: "Promociones activas", value: "8", icon: Zap, color: "text-green-500" },
          { label: "Banners activos", value: "3", icon: Eye, color: "text-purple-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4">
            <s.icon size={22} className={s.color} />
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue area chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900">Ingresos y Pedidos</h3>
              <p className="text-xs text-gray-400 mt-0.5">Últimos 7 días</p>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {(["7d", "30d", "90d"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${period === p ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#F59E0B" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category bar chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Ventas por Categoría</h3>
          <p className="text-xs text-gray-400 mb-4">% del total esta semana</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: -20, right: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip formatter={(v: any) => [`${v}%`, "Participación"]} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {categoryData.map((_, i) => (
                  <rect key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent orders + activity */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent orders table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Pedidos Recientes</h3>
            <button className="flex items-center gap-1 text-xs text-amber-600 font-semibold hover:text-amber-700 transition-colors">
              Ver todos <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800 font-mono">{o.id}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[o.status]}`}>
                      {o.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{o.customer} · {o.items} productos</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{fmt(o.total)}</p>
                  <p className="text-xs text-gray-400">{o.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Actividad Reciente</h3>
          </div>
          <div className="p-4 space-y-3">
            {activity.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <div>
                  <p className="text-xs text-gray-700 leading-relaxed">{a.text}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Nuevo producto", icon: Package, color: "hover:border-amber-300 hover:bg-amber-50" },
            { label: "Crear promoción", icon: Zap, color: "hover:border-green-300 hover:bg-green-50" },
            { label: "Ver pedidos", icon: ShoppingCart, color: "hover:border-blue-300 hover:bg-blue-50" },
            { label: "Editar inicio", icon: Package, color: "hover:border-purple-300 hover:bg-purple-50" },
          ].map((a) => (
            <button
              key={a.label}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 transition-all ${a.color}`}
            >
              <a.icon size={20} className="text-gray-500" />
              <span className="text-xs font-medium text-gray-600 text-center">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

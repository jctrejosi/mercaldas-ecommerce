import { useState } from "react";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const monthlyRevenue = [
  { month: "Ene", revenue: 145000000, orders: 2100 },
  { month: "Feb", revenue: 132000000, orders: 1950 },
  { month: "Mar", revenue: 168000000, orders: 2400 },
  { month: "Abr", revenue: 155000000, orders: 2200 },
  { month: "May", revenue: 178000000, orders: 2600 },
  { month: "Jun", revenue: 192000000, orders: 2800 },
  { month: "Jul", revenue: 204000000, orders: 2950 },
];

const topProducts = [
  { name: "Leche Alquería 1.1L", sales: 4820, revenue: 20967000 },
  { name: "Pechuga de Pollo x kg", sales: 3100, revenue: 39990000 },
  { name: "Huevos AA x30", sales: 2870, revenue: 54243000 },
  { name: "Arroz Diana 5kg", sales: 2340, revenue: 52650000 },
  { name: "Tomates Chonto 500g", sales: 2100, revenue: 6720000 },
];

const categoryShare = [
  { name: "Lácteos", value: 28 },
  { name: "Carnes", value: 22 },
  { name: "Despensa", value: 18 },
  { name: "Frutas y Verd.", value: 16 },
  { name: "Limpieza", value: 10 },
  { name: "Bebidas", value: 6 },
];

const COLORS = ["#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#6B7280"];

const weeklyOrders = [
  { day: "Lu", entregado: 38, cancelado: 3 },
  { day: "Ma", entregado: 52, cancelado: 5 },
  { day: "Mi", entregado: 45, cancelado: 2 },
  { day: "Ju", entregado: 63, cancelado: 4 },
  { day: "Vi", entregado: 88, cancelado: 6 },
  { day: "Sá", entregado: 104, cancelado: 7 },
  { day: "Do", entregado: 71, cancelado: 2 },
];

const fmt = (n: number) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3">
      <p className="text-xs font-semibold text-gray-500 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-sm font-bold" style={{ color: p.color }}>
          {typeof p.value === "number" && p.value > 1000 ? fmt(p.value) : p.value}
          {" "}<span className="text-xs font-normal text-gray-500">{p.name}</span>
        </p>
      ))}
    </div>
  );
};

const TABS = ["Ingresos", "Ventas", "Clientes", "Categorías", "Proveedores"];

export default function Reports() {
  const [tab, setTab] = useState("Ingresos");
  const [period, setPeriod] = useState("7d");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Analítica e inteligencia de negocio</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1">
            {["7d", "30d", "90d", "1a"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${period === p ? "bg-amber-400 text-amber-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Download size={14} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ingresos totales", value: "$204M", change: "+6.2%", up: true },
          { label: "Pedidos del mes", value: "2,950", change: "+5.4%", up: true },
          { label: "Ticket promedio", value: "$69,200", change: "+0.8%", up: true },
          { label: "Tasa de cancelación", value: "3.8%", change: "-0.5%", up: false },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-500 mb-3">{kpi.label}</p>
            <p className="text-2xl font-bold text-gray-900 mb-2">{kpi.value}</p>
            <div className={`flex items-center gap-1 text-xs font-semibold ${kpi.up ? "text-green-600" : "text-red-600"}`}>
              {kpi.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {kpi.change} vs. mes anterior
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-amber-400 text-amber-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Ingresos Mensuales</h3>
          <p className="text-xs text-gray-400 mb-4">Últimos 7 meses</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => fmt(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Ingresos" stroke="#F59E0B" strokeWidth={2.5} fill="url(#rGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Por Categoría</h3>
          <p className="text-xs text-gray-400 mb-2">Participación en ventas</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={categoryShare} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} innerRadius={40}>
                {categoryShare.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => [`${v}%`, "Participación"]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5">
            {categoryShare.map((c, i) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i] }} />
                <span className="text-xs text-gray-600 flex-1">{c.name}</span>
                <span className="text-xs font-bold text-gray-800">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Orders bar chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Pedidos Semanales</h3>
          <p className="text-xs text-gray-400 mb-4">Entregados vs. cancelados</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyOrders} barSize={14} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="entregado" name="Entregados" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cancelado" name="Cancelados" fill="#FCA5A5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Productos Más Vendidos</h3>
          <div className="space-y-3">
            {topProducts.map((p, i) => {
              const maxSales = topProducts[0].sales;
              const pct = (p.sales / maxSales) * 100;
              return (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</span>
                      <span className="text-sm text-gray-700">{p.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{p.sales.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

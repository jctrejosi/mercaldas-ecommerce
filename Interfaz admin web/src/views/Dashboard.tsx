import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, ShoppingCart, Users, Package, Truck,
  AlertTriangle, Zap, Eye, X, Loader2, ArrowUpRight, RefreshCw,
  Megaphone, Mail,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return '$' + n.toLocaleString('es-CO');
}

function fmtNum(n: number) {
  return n.toLocaleString('es-CO');
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function getTodayString() {
  const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const now = new Date();
  return `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} ${now.getFullYear()}`;
}

const STATUS_STYLES: Record<string, string> = {
  pendiente: 'bg-gray-100 text-gray-600',
  confirmado: 'bg-blue-50 text-blue-700',
  preparando: 'bg-amber-50 text-amber-700',
  'en camino': 'bg-purple-50 text-purple-700',
  entregado: 'bg-green-50 text-green-700',
  cancelado: 'bg-red-50 text-red-700',
};

const COLORS = ['#F59E0B','#10B981','#3B82F6','#8B5CF6','#EC4899','#6B7280','#EF4444','#14B8A6','#F97316','#6366F1'];

const BREAKDOWN_TABS = [
  { key: 'category', label: 'Categoría' },
  { key: 'brand', label: 'Marca' },
  { key: 'supplier', label: 'Proveedor' },
  { key: 'branch', label: 'Sucursal' },
  { key: 'productType', label: 'Tipo Producto' },
] as const;

// ─── types ──────────────────────────────────────────────────────────────────

interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  activeCustomers: number;
  activeProducts: number;
  pendingDeliveries: number;
  lowStockAlerts: number;
  activePromotions: number;
  activeBanners: number;
  activePopups: number;
  newCustomersToday: number;
}

interface RevenueDay {
  day: string;
  date: string;
  revenue: number;
  orders: number;
}

interface SalesBreakdown {
  id: string;
  name: string;
  total: number;
  count: number;
}

interface OrderItem {
  id: string;
  referenceCode: string;
  status: string;
  grandTotal: number;
  customerName: string;
  createdAt: string;
  itemsCount: number;
}

interface LowStockItem {
  productId: string;
  productName: string;
  stock: number;
  minimumStock: number;
  reorderPoint: number;
}

interface ActiveCustomer {
  id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
  lastActivityAt: string;
}

interface BannerPopupItem {
  id: string;
  type: 'banner' | 'popup';
  title: string;
  subType: string;
  isActive: boolean;
  status: string;
}

interface PromotionItem {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  timesUsed: number;
}

interface DeliveryItem {
  id: string;
  orderId: string;
  status: string;
  recipientName: string;
  address: string;
  trackingNumber: string;
  estimatedDeliveryAt: string;
}

interface DashboardProps {
  userName?: string;
  onNavigate?: (view: string) => void;
}

type ModalType = 'todayOrders' | 'customers' | 'lowStock' | 'deliveries' | 'promotions' | 'banners' | 'orderDetail' | null;

type BreakdownKey = typeof BREAKDOWN_TABS[number]['key'];

// ─── shared sub-components ──────────────────────────────────────────────────

function Modal({
  title, onClose, children,
}: {
  title: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div className="flex justify-center py-12">
      <Loader2 size={size} className="animate-spin text-amber-500" />
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <Icon size={32} className="mb-2" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function ChartTooltip({ active, payload, label, metric }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3">
      <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-sm font-bold" style={{ color: p.color || '#F59E0B' }}>
          {metric === 'revenue' ? fmt(p.value) : p.value + ' pedidos'}
        </p>
      ))}
    </div>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export default function Dashboard({ userName = 'Usuario', onNavigate }: DashboardProps) {
  // Data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [revenueData, setRevenueData] = useState<RevenueDay[]>([]);
  const [revenueLoading, setRevenueLoading] = useState(true);

  const [breakdownData, setBreakdownData] = useState<SalesBreakdown[]>([]);
  const [breakdownLoading, setBreakdownLoading] = useState(true);

  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [lowStockLoading, setLowStockLoading] = useState(true);

  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [recentOrdersLoading, setRecentOrdersLoading] = useState(true);

  const [activeCustomers, setActiveCustomers] = useState<ActiveCustomer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);

  const [bannersPopups, setBannersPopups] = useState<BannerPopupItem[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);

  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [promotionsLoading, setPromotionsLoading] = useState(true);

  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(true);

  // Chart controls
  const [revenuePeriod, setRevenuePeriod] = useState<'7' | '30' | '90'>('7');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders'>('revenue');
  const [breakdownKey, setBreakdownKey] = useState<BreakdownKey>('category');
  const [breakdownPeriod, setBreakdownPeriod] = useState<'today' | 'week' | 'month'>('week');

  // Modal state
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [orderStatusTab, setOrderStatusTab] = useState('');
  const [todayOrders, setTodayOrders] = useState<OrderItem[]>([]);
  const [todayOrdersLoading, setTodayOrdersLoading] = useState(false);

  // ─── fetching ───────────────────────────────────────────────────────────

  const fetchJSON = useCallback(async (path: string) => {
    const res = await fetch(`${API_BASE_URL}${path}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }, []);

  // Initial data
  useEffect(() => {
    fetchJSON('/admin/dashboard/stats')
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, [fetchJSON]);

  // Revenue by day
  useEffect(() => {
    setRevenueLoading(true);
    fetchJSON(`/admin/dashboard/revenue-by-day?days=${revenuePeriod}`)
      .then(setRevenueData)
      .catch(() => setRevenueData([]))
      .finally(() => setRevenueLoading(false));
  }, [fetchJSON, revenuePeriod]);

  // Sales breakdown
  useEffect(() => {
    setBreakdownLoading(true);
    const endpointMap: Record<BreakdownKey, string> = {
      category: 'sales-by-category',
      brand: 'sales-by-brand',
      supplier: 'sales-by-supplier',
      branch: 'sales-by-branch',
      productType: 'sales-by-product-type',
    };
    const p = breakdownKey === 'category' ? breakdownPeriod : 'week';
    fetchJSON(`/admin/dashboard/${endpointMap[breakdownKey]}?period=${p}`)
      .then(setBreakdownData)
      .catch(() => setBreakdownData([]))
      .finally(() => setBreakdownLoading(false));
  }, [fetchJSON, breakdownKey, breakdownPeriod]);

  // Bulk data on mount
  useEffect(() => {
    const endpoints = [
      { key: 'lowStock', path: '/admin/dashboard/low-stock', setter: setLowStock, loadingSetter: setLowStockLoading },
      { key: 'recentOrders', path: '/admin/dashboard/recent-orders?limit=10', setter: setRecentOrders, loadingSetter: setRecentOrdersLoading },
      { key: 'customers', path: '/admin/dashboard/active-customers', setter: setActiveCustomers, loadingSetter: setCustomersLoading },
      { key: 'banners', path: '/admin/dashboard/active-banners-popups', setter: setBannersPopups, loadingSetter: setBannersLoading },
      { key: 'promotions', path: '/admin/dashboard/active-promotions', setter: setPromotions, loadingSetter: setPromotionsLoading },
      { key: 'deliveries', path: '/admin/dashboard/pending-deliveries', setter: setDeliveries, loadingSetter: setDeliveriesLoading },
    ];
    endpoints.forEach(({ path, setter, loadingSetter }) => {
      fetchJSON(path)
        .then(setter)
        .catch(() => setter([]))
        .finally(() => loadingSetter(false));
    });
  }, [fetchJSON]);

  // Today orders (modal)
  const loadTodayOrders = useCallback(async (status?: string) => {
    setTodayOrdersLoading(true);
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    try {
      const data = await fetchJSON(`/admin/dashboard/today-orders${qs}`);
      setTodayOrders(data);
    } catch {
      setTodayOrders([]);
    } finally {
      setTodayOrdersLoading(false);
    }
  }, [fetchJSON]);

  const openOrdersModal = useCallback(() => {
    setModal('todayOrders');
    setOrderStatusTab('');
    loadTodayOrders();
  }, [loadTodayOrders]);

  const handleOrderTab = useCallback((s: string) => {
    setOrderStatusTab(s);
    loadTodayOrders(s || undefined);
  }, [loadTodayOrders]);

  const openModal = useCallback((type: ModalType) => {
    if (type === 'todayOrders') {
      openOrdersModal();
    } else {
      setModal(type);
    }
  }, [openOrdersModal]);

  const closeModal = useCallback(() => {
    setModal(null);
    setSelectedOrder(null);
  }, []);

  // ─── derived data ───────────────────────────────────────────────────────

  const chartData = revenueData.map((d) => ({
    ...d,
    displayValue: chartMetric === 'revenue' ? d.revenue : d.orders,
  }));

  const breakdownChart = breakdownData.map((d) => ({
    name: d.name,
    value: d.total,
  }));

  const chartTitle = chartMetric === 'revenue' ? 'Ingresos' : 'Pedidos';
  const showBreakdownPeriod = breakdownKey === 'category';

  // ─── stat card configs ──────────────────────────────────────────────────

  const primaryCards = stats
    ? [
        { label: 'Ingresos hoy', value: fmt(stats.todayRevenue), icon: TrendingUp, accent: 'bg-amber-100 text-amber-600', modal: 'todayOrders' as ModalType },
        { label: 'Pedidos hoy', value: fmtNum(stats.todayOrders), icon: ShoppingCart, accent: 'bg-blue-100 text-blue-600', modal: 'todayOrders' as ModalType },
        { label: 'Clientes activos', value: fmtNum(stats.activeCustomers), icon: Users, accent: 'bg-green-100 text-green-600', modal: 'customers' as ModalType },
        { label: 'Productos activos', value: fmtNum(stats.activeProducts), icon: Package, accent: 'bg-purple-100 text-purple-600', modal: 'lowStock' as ModalType },
      ]
    : [];

  const secondaryCards = stats
    ? [
        { label: 'Entregas pendientes', value: fmtNum(stats.pendingDeliveries), icon: Truck, color: 'text-blue-500', modal: 'deliveries' as ModalType },
        { label: 'Alertas de stock', value: fmtNum(stats.lowStockAlerts), icon: AlertTriangle, color: 'text-amber-500', modal: 'lowStock' as ModalType },
        { label: 'Promociones activas', value: fmtNum(stats.activePromotions), icon: Megaphone, color: 'text-green-500', modal: 'promotions' as ModalType },
        { label: 'Banners & Popups', value: fmtNum(stats.activeBanners + stats.activePopups), icon: Eye, color: 'text-purple-500', modal: 'banners' as ModalType },
      ]
    : [];

  // ─── render ─────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">

      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {userName} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {getTodayString()} — Aquí tienes el resumen del día
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} />
          Actualizar
        </button>
      </div>

      {/* ── Alert banner ───────────────────────── */}
      {!lowStockLoading && lowStock.length > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle size={16} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 font-medium min-w-0">
            <strong>{lowStock.length} productos con stock bajo</strong>
            {' — '}
            {lowStock.slice(0, 3).map((p) => p.productName).join(', ')}
            {lowStock.length > 3 && ` y ${lowStock.length - 3} más`}
            {' requieren reposición urgente.'}
          </p>
          <button
            onClick={() => setModal('lowStock')}
            className="ml-auto text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2 shrink-0"
          >
            Ver inventario
          </button>
        </div>
      )}

      {/* ── Primary stat cards ─────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <div className="col-span-full"><LoadingSpinner /></div>
        ) : (
          primaryCards.map((c) => (
            <button
              key={c.label}
              onClick={() => openModal(c.modal)}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow text-left cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.accent}`}>
                  <c.icon size={18} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{c.value}</p>
              <p className="text-sm text-gray-500">{c.label}</p>
            </button>
          ))
        )}
      </div>

      {/* ── Secondary stat cards ───────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <div className="col-span-full"><LoadingSpinner /></div>
        ) : (
          secondaryCards.map((c) => (
            <button
              key={c.label}
              onClick={() => openModal(c.modal)}
              className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer text-left"
            >
              <c.icon size={22} className={c.color} />
              <div>
                <p className="text-xl font-bold text-gray-900">{c.value}</p>
                <p className="text-xs text-gray-500">{c.label}</p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* ── Charts row ─────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Area chart: revenue / orders by day */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div>
              <h3 className="font-semibold text-gray-900">{chartTitle} por Día</h3>
              <p className="text-xs text-gray-400 mt-0.5">Últimos {revenuePeriod} días</p>
            </div>
            <div className="flex items-center gap-2">
              {/* metric toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setChartMetric('revenue')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    chartMetric === 'revenue'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Ingresos
                </button>
                <button
                  onClick={() => setChartMetric('orders')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    chartMetric === 'orders'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Pedidos
                </button>
              </div>
              {/* period toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {(['7', '30', '90'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setRevenuePeriod(p)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      revenuePeriod === p
                        ? 'bg-white text-gray-800 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {p}d
                  </button>
                ))}
              </div>
            </div>
          </div>
          {revenueLoading ? (
            <LoadingSpinner />
          ) : chartData.length === 0 ? (
            <EmptyState icon={TrendingUp} message="Sin datos para este período" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={
                    chartMetric === 'revenue'
                      ? (v: number) => `$${(v / 1_000_000).toFixed(1)}M`
                      : (v: number) => String(v)
                  }
                />
                <Tooltip content={<ChartTooltip metric={chartMetric} />} />
                <Area type="monotone" dataKey="displayValue" stroke="#F59E0B" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar chart: sales breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          {/* breakdown tabs */}
          <div className="flex items-center gap-1 mb-2 overflow-x-auto">
            {BREAKDOWN_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setBreakdownKey(t.key);
                  if (t.key !== 'category') setBreakdownPeriod('week');
                }}
                className={`px-2 py-1 text-[10px] font-semibold rounded-md whitespace-nowrap transition-all ${
                  breakdownKey === t.key
                    ? 'bg-amber-100 text-amber-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400">
              por {BREAKDOWN_TABS.find((t) => t.key === breakdownKey)?.label || ''}
            </p>
            {showBreakdownPeriod && (
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                {(['today', 'week', 'month'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setBreakdownPeriod(p)}
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-all ${
                      breakdownPeriod === p
                        ? 'bg-white text-gray-800 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {p === 'today' ? 'Hoy' : p === 'week' ? 'Semana' : 'Mes'}
                  </button>
                ))}
              </div>
            )}
          </div>
          {breakdownLoading ? (
            <LoadingSpinner />
          ) : breakdownChart.length === 0 ? (
            <EmptyState icon={TrendingUp} message="Sin datos de ventas" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={breakdownChart} layout="vertical" margin={{ left: -20, right: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => fmt(v)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip formatter={(v: any) => [fmt(Number(v) || 0), 'Total']} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {breakdownChart.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Bottom row ─────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Pedidos Recientes</h3>
            <button
              onClick={() => onNavigate?.('orders')}
              className="flex items-center gap-1 text-xs text-amber-600 font-semibold hover:text-amber-700 transition-colors"
            >
              Ver todos <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrdersLoading ? (
              <LoadingSpinner />
            ) : recentOrders.length === 0 ? (
              <EmptyState icon={ShoppingCart} message="No hay pedidos recientes" />
            ) : (
              recentOrders.map((o) => (
                <button
                  key={o.id}
                  onClick={() => { setSelectedOrder(o); setModal('orderDetail'); }}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800 font-mono">
                        {o.referenceCode || o.id}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        STATUS_STYLES[o.status] || 'bg-gray-100 text-gray-600'
                      }`}>
                        {o.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {o.customerName} · {o.itemsCount} productos
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">{fmt(o.grandTotal)}</p>
                    <p className="text-xs text-gray-400">
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Banners & Popups summary */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Banners & Popups</h3>
            <button
              onClick={() => setModal('banners')}
              className="text-xs text-amber-600 font-semibold hover:text-amber-700 transition-colors"
            >
              Ver todos
            </button>
          </div>
          <div className="p-4 space-y-1.5 max-h-[320px] overflow-y-auto">
            {bannersLoading ? (
              <LoadingSpinner />
            ) : bannersPopups.length === 0 ? (
              <EmptyState icon={Eye} message="Sin banners ni popups activos" />
            ) : (
              bannersPopups.slice(0, 8).map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate?.(item.type === 'banner' ? 'banners' : 'popups')}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-left"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    item.type === 'banner'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {item.type === 'banner' ? <Eye size={14} /> : <Mail size={14} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-800 truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-400 capitalize">{item.type}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        item.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.status || (item.isActive ? 'Activo' : 'Inactivo')}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── MODALS ─────────────────────────────── */}

      {/* Today orders modal */}
      {modal === 'todayOrders' && (
        <Modal title="Pedidos de hoy" onClose={closeModal}>
          {/* status tabs */}
          <div className="flex items-center gap-1 mb-4 overflow-x-auto">
            {(['', 'pendiente', 'confirmado', 'preparando', 'en camino', 'entregado', 'cancelado'] as const).map((tab) => {
              const labels: Record<string, string> = {
                '': 'Todos', pendiente: 'Pendiente', confirmado: 'Confirmado',
                preparando: 'Preparando', 'en camino': 'En camino',
                entregado: 'Entregado', cancelado: 'Cancelado',
              };
              return (
                <button
                  key={tab}
                  onClick={() => handleOrderTab(tab)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                    orderStatusTab === tab
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>
          {todayOrdersLoading ? (
            <LoadingSpinner />
          ) : todayOrders.length === 0 ? (
            <EmptyState icon={ShoppingCart} message={`No hay pedidos${orderStatusTab ? ` con estado "${orderStatusTab}"` : ''} hoy`} />
          ) : (
            <div className="space-y-2">
              {todayOrders.map((o) => (
                <div key={o.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800 font-mono">{o.referenceCode || o.id}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[o.status] || 'bg-gray-100 text-gray-600'}`}>
                        {o.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{o.customerName} · {o.itemsCount} productos</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">{fmt(o.grandTotal)}</p>
                    <p className="text-xs text-gray-400">
                      {o.createdAt ? new Date(o.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={() => onNavigate?.('orders')}
              className="flex items-center gap-1 text-xs text-amber-600 font-semibold hover:text-amber-700 transition-colors"
            >
              Ver todos los pedidos <ArrowUpRight size={12} />
            </button>
          </div>
        </Modal>
      )}

      {/* Active customers modal */}
      {modal === 'customers' && (
        <Modal title="Clientes activos" onClose={closeModal}>
          {customersLoading ? (
            <LoadingSpinner />
          ) : activeCustomers.length === 0 ? (
            <EmptyState icon={Users} message="No hay clientes activos" />
          ) : (
            <div className="space-y-2">
              {[...activeCustomers]
                .sort((a, b) => {
                  const aNew = new Date(a.createdAt).toDateString() === new Date().toDateString();
                  const bNew = new Date(b.createdAt).toDateString() === new Date().toDateString();
                  if (aNew && !bNew) return -1;
                  if (!aNew && bNew) return 1;
                  return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
                })
                .map((c) => {
                  const isNew = new Date(c.createdAt).toDateString() === new Date().toDateString();
                  return (
                    <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                      <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {(c.name || c.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-800 truncate">{c.name || c.email}</p>
                          {isNew && (stats?.newCustomersToday ?? 0) > 0 && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 shrink-0">
                              Nuevo hoy
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {c.email}{c.phone ? ` · ${c.phone}` : ''}
                        </p>
                      </div>
                      <p className="text-[10px] text-gray-400 shrink-0">
                        {c.lastActivityAt ? new Date(c.lastActivityAt).toLocaleDateString('es-CO') : ''}
                      </p>
                    </div>
                  );
                })}
            </div>
          )}
        </Modal>
      )}

      {/* Low stock modal */}
      {modal === 'lowStock' && (
        <Modal title="Productos con stock bajo" onClose={closeModal}>
          {lowStockLoading ? (
            <LoadingSpinner />
          ) : lowStock.length === 0 ? (
            <EmptyState icon={Package} message="No hay productos con stock bajo" />
          ) : (
            <div className="space-y-2">
              {lowStock.map((item) => (
                <div key={item.productId} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100">
                  <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <AlertTriangle size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">
                        Stock: <strong className="text-red-600">{item.stock}</strong>
                      </span>
                      <span className="text-xs text-gray-500">Mín: {item.minimumStock}</span>
                      <span className="text-xs text-gray-500">Reorden: {item.reorderPoint}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, (item.stock / Math.max(1, item.minimumStock)) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Pending deliveries modal */}
      {modal === 'deliveries' && (
        <Modal title="Entregas pendientes" onClose={closeModal}>
          {deliveriesLoading ? (
            <LoadingSpinner />
          ) : deliveries.length === 0 ? (
            <EmptyState icon={Truck} message="No hay entregas pendientes" />
          ) : (
            <div className="space-y-2">
              {deliveries.map((d) => (
                <div key={d.id} className="p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-800 font-mono">Pedido #{d.orderId}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[d.status] || 'bg-gray-100 text-gray-600'}`}>
                      {d.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{d.recipientName}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{d.address}</p>
                  {d.trackingNumber && (
                    <p className="text-xs text-gray-400 mt-0.5">Guía: {d.trackingNumber}</p>
                  )}
                  {d.estimatedDeliveryAt && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Entrega est.: {new Date(d.estimatedDeliveryAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Active promotions modal */}
      {modal === 'promotions' && (
        <Modal title="Promociones activas" onClose={closeModal}>
          {promotionsLoading ? (
            <LoadingSpinner />
          ) : promotions.length === 0 ? (
            <EmptyState icon={Megaphone} message="No hay promociones activas" />
          ) : (
            <div className="space-y-2">
              {promotions.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onNavigate?.('promotions')}
                  className="w-full text-left p-3 rounded-xl border border-gray-100 hover:bg-amber-50 hover:border-amber-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-800">{p.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      p.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  {p.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">{p.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    {p.startDate && (
                      <span className="text-[10px] text-gray-400">
                        {new Date(p.startDate).toLocaleDateString('es-CO')}
                        {p.endDate ? ` — ${new Date(p.endDate).toLocaleDateString('es-CO')}` : ''}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400">Usada {p.timesUsed} veces</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={() => onNavigate?.('promotions')}
              className="flex items-center gap-1 text-xs text-amber-600 font-semibold hover:text-amber-700 transition-colors"
            >
              Gestionar promociones <ArrowUpRight size={12} />
            </button>
          </div>
        </Modal>
      )}

      {/* Banners & Popups modal */}
      {modal === 'banners' && (
        <Modal title="Banners & Popups" onClose={closeModal}>
          {bannersLoading ? (
            <LoadingSpinner />
          ) : bannersPopups.length === 0 ? (
            <EmptyState icon={Eye} message="No hay banners ni popups activos" />
          ) : (
            <div className="space-y-2">
              {bannersPopups.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate?.(item.type === 'banner' ? 'banners' : 'popups')}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    item.type === 'banner'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {item.type === 'banner' ? <Eye size={16} /> : <Mail size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-400 capitalize">{item.type}</span>
                      {item.subType && <span className="text-[10px] text-gray-400">{item.subType}</span>}
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        item.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.status || (item.isActive ? 'Activo' : 'Inactivo')}
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight size={14} className="text-gray-300 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Order detail modal */}
      {modal === 'orderDetail' && selectedOrder && (
        <Modal title={`Pedido ${selectedOrder.referenceCode || selectedOrder.id}`} onClose={closeModal}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Cliente</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">{selectedOrder.customerName}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Estado</p>
                <span className={`inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  STATUS_STYLES[selectedOrder.status] || 'bg-gray-100 text-gray-600'
                }`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total</p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">{fmt(selectedOrder.grandTotal)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Productos</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">{selectedOrder.itemsCount} items</p>
              </div>
            </div>
            {selectedOrder.createdAt && (
              <p className="text-xs text-gray-400">
                Creado: {new Date(selectedOrder.createdAt).toLocaleString('es-CO')}
              </p>
            )}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              {selectedOrder.status === 'pendiente' && (
                <button
                  onClick={() => { closeModal(); onNavigate?.('orders'); }}
                  className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors"
                >
                  Ir a Pedidos
                </button>
              )}
              {selectedOrder.itemsCount > 0 && (
                <button
                  onClick={() => { closeModal(); onNavigate?.('orders'); }}
                  className="px-4 py-2 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
                >
                  Ver pedido
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

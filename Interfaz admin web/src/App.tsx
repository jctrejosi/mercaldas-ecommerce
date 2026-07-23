import { useState, useEffect, useRef, useCallback } from "react";
import {
  LayoutDashboard, Package, FolderTree, Tag, Truck, Users,
  ShoppingCart, Megaphone, Image, Layers, Percent, Store,
  Warehouse, BarChart2, Shield, Settings, Search, Bell,
  ChevronRight, Plus, X, LogOut, User, HelpCircle, Command,
  Zap, Hash, FileText, Globe, ChevronDown, Menu,
  Building2, AlertTriangle, LayoutTemplate,
} from "lucide-react";
import Dashboard from "./views/Dashboard";
import Products from "./views/Products";
import Orders from "./views/Orders";
import HomepageEditor from "./views/HomepageEditor";
import Banners from "./views/Banners";
import Reports from "./views/Reports";
import Customers from "./views/Customers";
import Categories from "./views/Categories";
import Brands from "./views/Brands";
import Suppliers from "./views/Suppliers";
import Promotions from "./views/Promotions";
import Marketplace from "./views/Marketplace";
import Inventory from "./views/Inventory";
import Delivery from "./views/Delivery";
import UsersView from "./views/Users";
import SettingsView from "./views/Settings";

export type ViewId =
  | "dashboard" | "products" | "categories" | "brands" | "suppliers"
  | "orders" | "customers" | "promotions"
  | "homepage" | "banners" | "marketplace"
  | "inventory" | "delivery"
  | "reports" | "users" | "settings";

interface NavItem {
  id: ViewId;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    title: "Visión General",
    items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Catálogo",
    items: [
      { id: "products", label: "Productos", icon: Package },
      { id: "categories", label: "Categorías", icon: FolderTree },
      { id: "brands", label: "Marcas", icon: Tag },
      { id: "suppliers", label: "Proveedores", icon: Building2 },
    ],
  },
  {
    title: "Comercio",
    items: [
      { id: "orders", label: "Pedidos", icon: ShoppingCart, badge: 8 },
      { id: "customers", label: "Clientes", icon: Users },
      { id: "promotions", label: "Promociones", icon: Percent },
    ],
  },
  {
    title: "Contenido",
    items: [
      { id: "homepage", label: "Editor de Inicio", icon: LayoutTemplate },
      { id: "banners", label: "Banners CMS", icon: Image },
      { id: "marketplace", label: "Publicidad", icon: Megaphone },
    ],
  },
  {
    title: "Operaciones",
    items: [
      { id: "inventory", label: "Inventario", icon: Warehouse },
      { id: "delivery", label: "Entregas", icon: Truck },
    ],
  },
  {
    title: "Analítica",
    items: [{ id: "reports", label: "Reportes", icon: BarChart2 }],
  },
  {
    title: "Administración",
    items: [
      { id: "users", label: "Usuarios y Permisos", icon: Shield },
      { id: "settings", label: "Configuración", icon: Settings },
    ],
  },
];

const LABELS: Record<ViewId, string> = {
  dashboard: "Dashboard",
  products: "Productos",
  categories: "Categorías",
  brands: "Marcas",
  suppliers: "Proveedores",
  orders: "Pedidos",
  customers: "Clientes",
  promotions: "Promociones",
  homepage: "Editor de Inicio",
  banners: "Banners CMS",
  marketplace: "Publicidad Marketplace",
  inventory: "Inventario",
  delivery: "Entregas",
  reports: "Reportes",
  users: "Usuarios y Permisos",
  settings: "Configuración",
};

const QUICK_COMMANDS = [
  { icon: LayoutDashboard, label: "Ir al Dashboard", view: "dashboard" as ViewId },
  { icon: Plus, label: "Crear nuevo producto", view: "products" as ViewId },
  { icon: ShoppingCart, label: "Ver pedidos pendientes", view: "orders" as ViewId },
  { icon: LayoutTemplate, label: "Editar página de inicio", view: "homepage" as ViewId },
  { icon: Image, label: "Gestionar banners", view: "banners" as ViewId },
  { icon: Megaphone, label: "Campañas publicitarias", view: "marketplace" as ViewId },
  { icon: BarChart2, label: "Ver reportes", view: "reports" as ViewId },
  { icon: Users, label: "Gestionar clientes", view: "customers" as ViewId },
  { icon: Percent, label: "Crear promoción", view: "promotions" as ViewId },
  { icon: Warehouse, label: "Control de inventario", view: "inventory" as ViewId },
];

function CommandPalette({ onNavigate, onClose }: { onNavigate: (v: ViewId) => void; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = QUICK_COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar o ejecutar comando..."
            className="flex-1 outline-none text-sm text-gray-800 placeholder-gray-400"
          />
          <kbd className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-mono">ESC</kbd>
        </div>
        <div className="py-2 max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">Sin resultados</div>
          ) : (
            filtered.map((cmd) => (
              <button
                key={cmd.label}
                onClick={() => { onNavigate(cmd.view); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 text-left transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-amber-100 flex items-center justify-center shrink-0 transition-colors">
                  <cmd.icon size={15} className="text-gray-500 group-hover:text-amber-600" />
                </div>
                <span className="text-sm text-gray-700">{cmd.label}</span>
                <ChevronRight size={14} className="ml-auto text-gray-300 group-hover:text-amber-400" />
              </button>
            ))
          )}
        </div>
        <div className="px-4 py-2.5 border-t border-gray-100 flex items-center gap-4">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <kbd className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">↑↓</kbd> navegar
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <kbd className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">↵</kbd> abrir
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <kbd className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">ESC</kbd> cerrar
          </span>
        </div>
      </div>
    </div>
  );
}

function Notifications({ onClose }: { onClose: () => void }) {
  const items = [
    { icon: AlertTriangle, color: "text-amber-500 bg-amber-50", title: "Stock bajo detectado", sub: "Leche Alquería — quedan 12 unidades", time: "hace 5m" },
    { icon: ShoppingCart, color: "text-blue-500 bg-blue-50", title: "Nuevo pedido #MC-3821", sub: "Total: $124.900 — Pago confirmado", time: "hace 12m" },
    { icon: Zap, color: "text-green-500 bg-green-50", title: "Campaña activada", sub: "Flash Sale Viernes — 47 productos", time: "hace 1h" },
    { icon: Users, color: "text-purple-500 bg-purple-50", title: "100 nuevos clientes hoy", sub: "+18% comparado con ayer", time: "hace 2h" },
  ];

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-40" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="font-semibold text-sm text-gray-900">Notificaciones</span>
        <button onClick={onClose} className="text-xs text-amber-600 hover:text-amber-700 font-medium">Marcar todo como leído</button>
      </div>
      <div className="divide-y divide-gray-50">
        {items.map((n) => (
          <div key={n.title} className="flex gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.color}`}>
              <n.icon size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{n.title}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{n.sub}</p>
            </div>
            <span className="text-xs text-gray-400 shrink-0">{n.time}</span>
          </div>
        ))}
      </div>
      <div className="px-4 py-2.5 border-t border-gray-100">
        <button className="text-xs text-gray-500 hover:text-gray-700 w-full text-center">Ver todas las notificaciones</button>
      </div>
    </div>
  );
}

function Sidebar({
  current,
  onNavigate,
  collapsed,
}: {
  current: ViewId;
  onNavigate: (v: ViewId) => void;
  collapsed: boolean;
}) {
  return (
    <aside
      className="flex flex-col h-full border-r border-white/[0.06] transition-all duration-300"
      style={{ background: "#0C0C0D", width: collapsed ? 56 : 240 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06] shrink-0">
        <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center shrink-0">
          <Store size={16} className="text-amber-900" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-sm leading-tight">Mercaldas</p>
            <p className="text-white/40 text-xs">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV.map((section) => (
          <div key={section.title} className="mb-4">
            {!collapsed && (
              <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest px-2 mb-1">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const active = current === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-all mb-0.5 group relative ${
                    active
                      ? "bg-white/10 text-amber-400"
                      : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
                  }`}
                >
                  <item.icon size={15} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="ml-auto bg-amber-400 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {item.badge}
                    </span>
                  )}
                  {collapsed && item.badge && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="shrink-0 border-t border-white/[0.06] p-3">
        <div className={`flex items-center gap-2.5 rounded-lg p-2 hover:bg-white/[0.06] cursor-pointer transition-colors ${collapsed ? "justify-center" : ""}`}>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">JR</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-xs font-semibold truncate">Jorge Ramírez</p>
              <p className="text-white/30 text-[10px] truncate">Administrador</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function TopBar({
  current,
  onOpenCommand,
  collapsed,
  onToggleCollapse,
}: {
  current: ViewId;
  onOpenCommand: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  useEffect(() => {
    const handler = () => { setNotifOpen(false); setUserOpen(false); };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center gap-3 px-4 shrink-0 z-30">
      <button
        onClick={onToggleCollapse}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
      >
        <Menu size={16} />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-gray-400">Mercaldas</span>
        <ChevronRight size={14} className="text-gray-300" />
        <span className="text-gray-800 font-semibold">{LABELS[current]}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Search trigger */}
        <button
          onClick={onOpenCommand}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
        >
          <Search size={14} />
          <span className="hidden sm:inline">Buscar...</span>
          <kbd className="hidden sm:inline text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </button>

        {/* Notifications */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false); }}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-400 rounded-full" />
          </button>
          {notifOpen && <Notifications onClose={() => setNotifOpen(false)} />}
        </div>

        {/* User */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">JR</span>
            </div>
            <ChevronDown size={13} className="text-gray-400" />
          </button>
          {userOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-40">
              <div className="px-4 py-2 border-b border-gray-100 mb-1">
                <p className="text-sm font-semibold text-gray-800">Jorge Ramírez</p>
                <p className="text-xs text-gray-500">jorge@mercaldas.com</p>
              </div>
              {[
                { icon: User, label: "Mi perfil" },
                { icon: HelpCircle, label: "Ayuda y soporte" },
                { icon: Command, label: "Atajos de teclado" },
              ].map((item) => (
                <button key={item.label} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <item.icon size={14} className="text-gray-400" />
                  {item.label}
                </button>
              ))}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut size={14} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function ViewRenderer({ view }: { view: ViewId }) {
  switch (view) {
    case "dashboard": return <Dashboard />;
    case "products": return <Products />;
    case "orders": return <Orders />;
    case "customers": return <Customers />;
    case "categories": return <Categories />;
    case "brands": return <Brands />;
    case "suppliers": return <Suppliers />;
    case "promotions": return <Promotions />;
    case "homepage": return <HomepageEditor />;
    case "banners": return <Banners />;
    case "marketplace": return <Marketplace />;
    case "inventory": return <Inventory />;
    case "delivery": return <Delivery />;
    case "reports": return <Reports />;
    case "users": return <UsersView />;
    case "settings": return <SettingsView />;
    default: return <Dashboard />;
  }
}

export default function App() {
  const [view, setView] = useState<ViewId>("dashboard");
  const [cmdOpen, setCmdOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
      if (e.key === "Escape") setCmdOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar current={view} onNavigate={setView} collapsed={collapsed} />

      <div className="flex flex-col flex-1 min-w-0">
        <TopBar
          current={view}
          onOpenCommand={() => setCmdOpen(true)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
        <main className="flex-1 overflow-y-auto">
          <ViewRenderer view={view} />
        </main>
      </div>

      {cmdOpen && (
        <CommandPalette onNavigate={setView} onClose={() => setCmdOpen(false)} />
      )}
    </div>
  );
}

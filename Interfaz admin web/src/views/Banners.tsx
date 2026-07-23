import { useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, ArrowUp, ArrowDown, X, Upload, ExternalLink, BarChart2 } from "lucide-react";

interface Banner {
  id: string; title: string; position: "hero" | "promo" | "sidebar" | "footer";
  status: "activo" | "programado" | "inactivo"; link: string;
  startDate: string; endDate: string; priority: number;
  image: string; mobileImage: string; clicks: number; views: number;
}

const BANNERS: Banner[] = [
  { id: "b1", title: "Oferta Semanal — Frutas y Verduras", position: "hero", status: "activo", link: "/ofertas/frutas", startDate: "2025-07-20", endDate: "2025-07-27", priority: 1, image: "https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=600&h=200&fit=crop&auto=format", mobileImage: "https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=300&h=200&fit=crop&auto=format", clicks: 2341, views: 18420 },
  { id: "b2", title: "Flash Sale Viernes 25 julio", position: "hero", status: "programado", link: "/flash-sale", startDate: "2025-07-25", endDate: "2025-07-25", priority: 2, image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=200&fit=crop&auto=format", mobileImage: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&h=200&fit=crop&auto=format", clicks: 0, views: 0 },
  { id: "b3", title: "Alquería — Lácteos frescos", position: "promo", status: "activo", link: "/marcas/alqueria", startDate: "2025-07-01", endDate: "2025-07-31", priority: 1, image: "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=600&h=150&fit=crop&auto=format", mobileImage: "", clicks: 890, views: 7300 },
  { id: "b4", title: "Domicilios express — Zona norte", position: "sidebar", status: "activo", link: "/domicilios", startDate: "2025-07-15", endDate: "2025-07-31", priority: 1, image: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=300&h=400&fit=crop&auto=format", mobileImage: "", clicks: 420, views: 5100 },
  { id: "b5", title: "App Mercaldas — Descarga ya", position: "footer", status: "inactivo", link: "/app", startDate: "2025-06-01", endDate: "2025-06-30", priority: 1, image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=100&fit=crop&auto=format", mobileImage: "", clicks: 1230, views: 9800 },
];

const POSITION_LABEL: Record<string, string> = { hero: "Hero Principal", promo: "Banner Promo", sidebar: "Lateral", footer: "Pie de Página" };
const STATUS_BADGE: Record<string, string> = {
  activo: "bg-green-50 text-green-700 border-green-200",
  programado: "bg-blue-50 text-blue-700 border-blue-200",
  inactivo: "bg-gray-100 text-gray-600 border-gray-200",
};

function BannerDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-xl bg-white flex flex-col shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-bold text-gray-900">Nuevo Banner</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Título del banner *</label>
            <input className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="Ej: Oferta de verano — Frutas" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Posición</label>
              <select className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white">
                {Object.entries(POSITION_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Prioridad</label>
              <input type="number" defaultValue={1} min={1} max={10} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">URL de destino</label>
            <input className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono" placeholder="/categoria/ofertas" />
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
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Imagen escritorio (1920×600px)</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-amber-300 transition-colors cursor-pointer">
              <Upload size={20} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Arrastra o <span className="text-amber-600 font-semibold">sube imagen</span></p>
              <p className="text-xs text-gray-400 mt-1">Recomendado: 1920×600px, PNG/JPG</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Imagen móvil (600×400px)</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-amber-300 transition-colors cursor-pointer">
              <Upload size={16} className="mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">Recomendado: 600×400px</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 sticky bottom-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
          <button className="px-4 py-2 text-sm font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 rounded-xl transition-colors">
            Crear Banner
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Banners() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filter, setFilter] = useState<"todos" | "activo" | "programado" | "inactivo">("todos");

  const filtered = BANNERS.filter((b) => filter === "todos" || b.status === filter);

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Banners CMS</h1>
            <p className="text-sm text-gray-500 mt-0.5">Gestiona los banners del sitio web</p>
          </div>
          <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors">
            <Plus size={14} /> Nuevo banner
          </button>
        </div>

        {/* Layout map */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm">Mapa de posiciones — Homepage</h3>
          <div className="space-y-2 max-w-2xl mx-auto">
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3 text-center">
              <p className="text-xs font-bold text-amber-700">HERO PRINCIPAL — 1920×600px</p>
              <p className="text-xs text-amber-600 mt-0.5">2 banners activos · 1 programado</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 bg-blue-50 border-2 border-blue-200 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-blue-700">BANNER PROMO — 1280×300px</p>
                <p className="text-xs text-blue-600 mt-0.5">1 activo</p>
              </div>
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-purple-700">LATERAL</p>
                <p className="text-xs text-purple-600 mt-0.5">300×600px · 1 activo</p>
              </div>
            </div>
            <div className="bg-gray-100 border-2 border-gray-200 rounded-xl p-3 text-center">
              <p className="text-xs font-bold text-gray-600">PIE DE PÁGINA — 1920×120px</p>
              <p className="text-xs text-gray-500 mt-0.5">1 inactivo</p>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit">
          {(["todos", "activo", "programado", "inactivo"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${filter === f ? "bg-amber-400 text-amber-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              {f === "todos" ? "Todos" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Banner cards */}
        <div className="space-y-3">
          {filtered.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex gap-4 p-4">
                <div className="w-48 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{b.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{POSITION_LABEL[b.position]} · Prioridad {b.priority}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_BADGE[b.status]}`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {b.startDate} → {b.endDate}</span>
                    <span className="font-mono">{b.link}</span>
                  </div>
                  <div className="flex items-center gap-6 mt-3">
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-700">{b.views.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">Vistas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-700">{b.clicks.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">Clics</p>
                    </div>
                    {b.views > 0 && (
                      <div className="text-center">
                        <p className="text-sm font-bold text-amber-600">{((b.clicks / b.views) * 100).toFixed(1)}%</p>
                        <p className="text-xs text-gray-400">CTR</p>
                      </div>
                    )}
                    <div className="ml-auto flex items-center gap-1">
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <Edit size={14} />
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <Eye size={14} />
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {drawerOpen && <BannerDrawer onClose={() => setDrawerOpen(false)} />}
    </>
  );
}

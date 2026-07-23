import { useState } from "react";
import { Plus, Search, Building2, Phone, Mail, Package, BarChart2, ChevronRight, X, TrendingUp } from "lucide-react";

interface Supplier {
  id: string; name: string; contact: string; email: string; phone: string;
  products: number; status: "activo" | "inactivo"; city: string;
  revenue: string; campaigns: number; lastDelivery: string;
}

const SUPPLIERS: Supplier[] = [
  { id: "S1", name: "Alquería S.A.", contact: "Roberto Salcedo", email: "rsalcedo@alqueria.com.co", phone: "+57 4 340 0000", products: 45, status: "activo", city: "Bogotá", revenue: "$3.2M", campaigns: 2, lastDelivery: "2025-07-22" },
  { id: "S2", name: "Campollo Ltda.", contact: "María Quintero", email: "mquintero@campollo.com", phone: "+57 4 238 5000", products: 89, status: "activo", city: "Medellín", revenue: "$5.8M", campaigns: 3, lastDelivery: "2025-07-23" },
  { id: "S3", name: "Molinos Diana", contact: "Andrés Pérez", email: "aperez@diana.com.co", phone: "+57 1 310 0000", products: 34, status: "activo", city: "Bogotá", revenue: "$2.1M", campaigns: 1, lastDelivery: "2025-07-20" },
  { id: "S4", name: "P&G Colombia", contact: "Sandra Ríos", email: "srios@pg.com", phone: "+57 1 320 0000", products: 22, status: "activo", city: "Bogotá", revenue: "$1.9M", campaigns: 4, lastDelivery: "2025-07-18" },
  { id: "S5", name: "Agrofrío S.A.", contact: "Luis Cárdenas", email: "lcardenas@agrofrio.com", phone: "+57 4 250 0000", products: 67, status: "activo", city: "Rionegro", revenue: "$4.4M", campaigns: 0, lastDelivery: "2025-07-23" },
];

function SupplierDetail({ s, onClose }: { s: Supplier; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-bold text-gray-900">Perfil del Proveedor</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <Building2 size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{s.name}</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">{s.status}</span>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-semibold text-gray-800">{s.contact}</p>
            <div className="flex items-center gap-2"><Mail size={13} className="text-gray-400" />{s.email}</div>
            <div className="flex items-center gap-2"><Phone size={13} className="text-gray-400" />{s.phone}</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[{ label: "Productos", value: s.products }, { label: "Ingresos", value: s.revenue }, { label: "Campañas", value: s.campaigns }].map((stat) => (
              <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-amber-800 mb-2">Estadísticas de rendimiento</h4>
            <div className="space-y-2">
              {[{ label: "Tasa de entrega a tiempo", value: "94%" }, { label: "Calidad del producto", value: "4.8/5" }, { label: "Tiempo promedio de entrega", value: "1.2 días" }].map((m) => (
                <div key={m.label} className="flex justify-between text-xs">
                  <span className="text-amber-700">{m.label}</span>
                  <span className="font-bold text-amber-900">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Suppliers() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Supplier | null>(null);
  const filtered = SUPPLIERS.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
            <p className="text-sm text-gray-500 mt-0.5">{SUPPLIERS.length} proveedores activos</p>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors">
            <Plus size={14} /> Nuevo proveedor
          </button>
        </div>
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar proveedor..." className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Proveedor", "Contacto", "Ciudad", "Productos", "Ingresos", "Campañas", "Último envío", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => setSelected(s)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center"><Building2 size={14} className="text-blue-600" /></div>
                      <span className="text-sm font-semibold text-gray-800">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.contact}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.city}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700">{s.products}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{s.revenue}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.campaigns > 0 ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                      {s.campaigns > 0 ? `${s.campaigns} activas` : "Sin campañas"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.lastDelivery}</td>
                  <td className="px-4 py-3"><ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selected && <SupplierDetail s={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

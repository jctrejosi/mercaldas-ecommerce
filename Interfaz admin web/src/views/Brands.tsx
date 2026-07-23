import { useState } from "react";
import { Plus, Search, Edit, ExternalLink, Package } from "lucide-react";

const BRANDS = [
  { id: "b1", name: "Alquería", logo: "🥛", products: 45, country: "Colombia", status: "activo", website: "alqueria.com.co" },
  { id: "b2", name: "Campollo", logo: "🍗", products: 89, country: "Colombia", status: "activo", website: "campollo.com" },
  { id: "b3", name: "Diana", logo: "🌾", products: 34, country: "Colombia", status: "activo", website: "diana.com.co" },
  { id: "b4", name: "Ariel (P&G)", logo: "🧴", products: 22, country: "USA", status: "activo", website: "pg.com" },
  { id: "b5", name: "Postobón", logo: "🥤", products: 67, country: "Colombia", status: "activo", website: "postobon.com" },
  { id: "b6", name: "Nestlé", logo: "☕", products: 112, country: "Suiza", status: "activo", website: "nestle.com.co" },
  { id: "b7", name: "Kikes", logo: "🥚", products: 12, country: "Colombia", status: "activo", website: "kikes.com.co" },
  { id: "b8", name: "Corona", logo: "🍺", products: 8, country: "Colombia", status: "activo", website: "corona.com.co" },
];

export default function Brands() {
  const [search, setSearch] = useState("");
  const filtered = BRANDS.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marcas</h1>
          <p className="text-sm text-gray-500 mt-0.5">{BRANDS.length} marcas en el catálogo</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors">
          <Plus size={14} /> Nueva marca
        </button>
      </div>
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar marca..." className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl">{b.logo}</div>
              <button className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-all"><Edit size={13} /></button>
            </div>
            <h3 className="font-bold text-gray-900">{b.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{b.country}</p>
            <div className="flex items-center gap-2 mt-3">
              <Package size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500">{b.products} productos</span>
              <a href="#" className="ml-auto text-gray-300 hover:text-gray-500 transition-colors">
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

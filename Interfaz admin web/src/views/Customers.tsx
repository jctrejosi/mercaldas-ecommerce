import { useState } from "react";
import { Search, Star, ShoppingBag, MapPin, Phone, Mail, ChevronRight, X } from "lucide-react";

interface Customer {
  id: string; name: string; email: string; phone: string;
  city: string; orders: number; spent: number; loyalty: "bronce" | "plata" | "oro" | "platino";
  joined: string; lastOrder: string; avatar: string;
}

const CUSTOMERS: Customer[] = [
  { id: "C001", name: "Laura Martínez", email: "laura.m@gmail.com", phone: "+57 300 555 0101", city: "Medellín", orders: 34, spent: 1245000, loyalty: "oro", joined: "2024-01-15", lastOrder: "2025-07-23", avatar: "LM" },
  { id: "C002", name: "Carlos Gómez", email: "cgomez@hotmail.com", phone: "+57 301 555 0202", city: "Medellín", orders: 12, spent: 480000, loyalty: "plata", joined: "2024-06-20", lastOrder: "2025-07-23", avatar: "CG" },
  { id: "C003", name: "Sofía Herrera", email: "sofia.h@outlook.com", phone: "+57 310 555 0303", city: "Bello", orders: 67, spent: 3120000, loyalty: "platino", joined: "2023-11-08", lastOrder: "2025-07-23", avatar: "SH" },
  { id: "C004", name: "Miguel Torres", email: "m.torres@gmail.com", phone: "+57 312 555 0404", city: "Envigado", orders: 8, spent: 210000, loyalty: "bronce", joined: "2025-03-12", lastOrder: "2025-07-23", avatar: "MT" },
  { id: "C005", name: "Ana Rodríguez", email: "ana.r@yahoo.com", phone: "+57 315 555 0505", city: "Itagüí", orders: 22, spent: 780000, loyalty: "plata", joined: "2024-04-05", lastOrder: "2025-07-23", avatar: "AR" },
];

const LOYALTY_BADGE: Record<string, string> = {
  bronce: "bg-amber-100 text-amber-700",
  plata: "bg-gray-100 text-gray-600",
  oro: "bg-yellow-100 text-yellow-700",
  platino: "bg-purple-100 text-purple-700",
};
const LOYALTY_ICON: Record<string, string> = { bronce: "🥉", plata: "🥈", oro: "🥇", platino: "💎" };

const fmt = (n: number) => "$" + n.toLocaleString("es-CO");

function CustomerDetail({ c, onClose }: { c: Customer; onClose: () => void }) {
  const purchases = [
    { id: "MC-3821", date: "2025-07-23", total: 54550, items: 5 },
    { id: "MC-3790", date: "2025-07-18", total: 38200, items: 3 },
    { id: "MC-3762", date: "2025-07-12", total: 92100, items: 8 },
  ];
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-900">Perfil del Cliente</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg">{c.avatar}</div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{c.name}</h3>
              <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full mt-1 ${LOYALTY_BADGE[c.loyalty]}`}>
                {LOYALTY_ICON[c.loyalty]} {c.loyalty.charAt(0).toUpperCase() + c.loyalty.slice(1)}
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2"><Mail size={13} className="text-gray-400" />{c.email}</div>
            <div className="flex items-center gap-2"><Phone size={13} className="text-gray-400" />{c.phone}</div>
            <div className="flex items-center gap-2"><MapPin size={13} className="text-gray-400" />{c.city}</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[{ label: "Pedidos", value: c.orders }, { label: "Total gastado", value: fmt(c.spent) }, { label: "Desde", value: c.joined }].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-sm font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">Historial de pedidos</p>
            <div className="space-y-2">
              {purchases.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-mono text-gray-700">{p.id}</p>
                    <p className="text-xs text-gray-400">{p.date} · {p.items} productos</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{fmt(p.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);

  const filtered = CUSTOMERS.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
            <p className="text-sm text-gray-500 mt-0.5">12,847 clientes registrados</p>
          </div>
        </div>

        {/* Loyalty stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { tier: "Platino", icon: "💎", count: 234, color: "bg-purple-50 border-purple-200" },
            { tier: "Oro", icon: "🥇", count: 1203, color: "bg-yellow-50 border-yellow-200" },
            { tier: "Plata", icon: "🥈", count: 4521, color: "bg-gray-50 border-gray-200" },
            { tier: "Bronce", icon: "🥉", count: 6889, color: "bg-amber-50 border-amber-200" },
          ].map((t) => (
            <div key={t.tier} className={`rounded-2xl border p-4 ${t.color}`}>
              <p className="text-2xl mb-1">{t.icon}</p>
              <p className="text-lg font-bold text-gray-900">{t.count.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{t.tier}</p>
            </div>
          ))}
        </div>

        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cliente..." className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ciudad</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Pedidos</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total gastado</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Lealtad</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Último pedido</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => setSelected(c)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{c.avatar}</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.city}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{c.orders}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">{fmt(c.spent)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${LOYALTY_BADGE[c.loyalty]}`}>
                      {LOYALTY_ICON[c.loyalty]} {c.loyalty}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{c.lastOrder}</td>
                  <td className="px-4 py-3"><ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selected && <CustomerDetail c={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

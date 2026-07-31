import { useState, useEffect, useCallback } from "react";
import { Search, Star, ShoppingBag, MapPin, Phone, Mail, ChevronRight, X } from "lucide-react";
import { customersService, type Customer, type CustomerDetail, type LoyaltyTier, type LoyaltyStats } from "../services/customers.service";

const LOYALTY_BADGE: Record<string, string> = {
  bronce: "bg-amber-100 text-amber-700",
  plata: "bg-gray-100 text-gray-600",
  oro: "bg-yellow-100 text-yellow-700",
  platino: "bg-purple-100 text-purple-700",
};
const LOYALTY_ICON: Record<string, string> = { bronce: "🥉", plata: "🥈", oro: "🥇", platino: "💎" };
const LOYALTY_LABEL: Record<string, string> = { bronce: "Bronce", plata: "Plata", oro: "Oro", platino: "Platino" };

const fmt = (n: number) => "$" + n.toLocaleString("es-CO");

function CustomerDetail({ c, onClose }: { c: Customer; onClose: () => void }) {
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customersService.getById(c.rawId.toString())
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [c.rawId]);

  const recentOrders = detail?.recentOrders ?? [];
  const data = detail ?? c;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-900">Perfil del Cliente</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg">{c.avatar}</div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{c.name}</h3>
              <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full mt-1 ${LOYALTY_BADGE[data.loyalty]}`}>
                {LOYALTY_ICON[data.loyalty]} {LOYALTY_LABEL[data.loyalty]}
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2"><Mail size={13} className="text-gray-400" />{c.email}</div>
            <div className="flex items-center gap-2"><Phone size={13} className="text-gray-400" />{c.phone}</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Pedidos", value: data.orders },
              { label: "Total gastado", value: fmt(data.spent) },
              { label: "Desde", value: data.joined },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-sm font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">Historial de pedidos</p>
            <div className="space-y-2">
              {loading ? (
                <p className="text-xs text-gray-400">Cargando...</p>
              ) : recentOrders.length === 0 ? (
                <p className="text-xs text-gray-400">Sin pedidos</p>
              ) : (
                recentOrders.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-mono text-gray-700">{p.id}</p>
                      <p className="text-xs text-gray-400">{p.date}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{fmt(p.total)}</span>
                  </div>
                ))
              )}
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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loyaltyStats, setLoyaltyStats] = useState<LoyaltyStats>({ platino: 0, oro: 0, plata: 0, bronce: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await customersService.getAll({
        search: search || undefined,
        limit: 50,
      });
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    customersService.getLoyaltyStats()
      .then(setLoyaltyStats)
      .catch(() => {});
  }, []);

  const filtered = customers.filter((c) =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? "Cargando..." : `${customers.length} clientes`}
            </p>
          </div>
        </div>

        {/* Loyalty stats */}
        <div className="grid grid-cols-4 gap-4">
          {([
            { tier: "platino" as LoyaltyTier, icon: "💎", color: "bg-purple-50 border-purple-200" },
            { tier: "oro" as LoyaltyTier, icon: "🥇", color: "bg-yellow-50 border-yellow-200" },
            { tier: "plata" as LoyaltyTier, icon: "🥈", color: "bg-gray-50 border-gray-200" },
            { tier: "bronce" as LoyaltyTier, icon: "🥉", color: "bg-amber-50 border-amber-200" },
          ]).map((t) => (
            <div key={t.tier} className={`rounded-2xl border p-4 ${t.color}`}>
              <p className="text-2xl mb-1">{t.icon}</p>
              <p className="text-lg font-bold text-gray-900">{(loyaltyStats[t.tier] ?? 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500">{LOYALTY_LABEL[t.tier]}</p>
            </div>
          ))}
        </div>

        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cliente..." className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-400">Cargando clientes...</div>
          ) : (
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
                    <td className="px-4 py-3 text-sm text-gray-600">—</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{c.orders}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">{fmt(c.spent)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${LOYALTY_BADGE[c.loyalty]}`}>
                        {LOYALTY_ICON[c.loyalty]} {LOYALTY_LABEL[c.loyalty]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{c.lastOrder}</td>
                    <td className="px-4 py-3"><ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" /></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                      No se encontraron clientes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {selected && <CustomerDetail c={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

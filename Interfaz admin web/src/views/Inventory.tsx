import { useState, useEffect } from "react";
import { Search, AlertTriangle, Edit, X, Loader2, Save, Package } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface InventoryItem {
  id: number;
  productId: number;
  productName: string;
  variantId: number;
  sku: string | null;
  barcode: string | null;
  price: string | null;
  branchId: number;
  branchName: string;
  stock: number;
  reservedStock: number;
  reorderPoint: number;
  minimumStock: number;
  maximumStock: number;
  targetStock: number | null;
  lastMovementAt: string | null;
  updatedAt: string;
}

interface BranchStat {
  branchId: number;
  branchName: string;
  totalProducts: number;
  totalStock: number;
  lowStockCount: number;
}

async function fetchJson(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const fmt = (n: any) => (n ?? 0).toLocaleString("es-CO");

function StockBadge({ stock, reorder }: { stock: number; reorder: number }) {
  if (stock <= 0) return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">Agotado</span>;
  if (stock <= reorder) return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Bajo</span>;
  return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">Normal</span>;
}

function EditDrawer({ item, onClose, onSaved }: { item: InventoryItem; onClose: () => void; onSaved: () => void }) {
  const [stock, setStock] = useState(item.stock.toString());
  const [min, setMin] = useState(item.minimumStock.toString());
  const [reorder, setReorder] = useState(item.reorderPoint.toString());
  const [max, setMax] = useState((item.maximumStock ?? 999999).toString());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/inventory/${item.id}`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock: parseInt(stock) || 0,
          minimumStock: parseInt(min) || 0,
          reorderPoint: parseInt(reorder) || 0,
          maximumStock: parseInt(max) || 999999,
        }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      onSaved();
    } catch (e: any) { setError(e.message || "Error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Editar Inventario</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Producto</p>
            <p className="text-sm font-semibold text-gray-900">{item.productName}</p>
            {item.sku && <p className="text-xs text-gray-500">SKU: {item.sku}</p>}
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Sucursal</p>
            <p className="text-sm font-semibold text-gray-900">{item.branchName}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Stock</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Stock mínimo</label>
              <input type="number" value={min} onChange={(e) => setMin(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Punto reorden</label>
              <input type="number" value={reorder} onChange={(e) => setReorder(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Stock máximo</label>
              <input type="number" value={max} onChange={(e) => setMax(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div>}
          <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 rounded-xl">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Inventory() {
  const [branches, setBranches] = useState<BranchStat[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [editing, setEditing] = useState<InventoryItem | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (branchFilter) params.set("branchId", branchFilter);
      if (search) params.set("search", search);
      if (stockFilter !== "all") params.set("stockFilter", stockFilter);
      const res = await fetchJson(`/admin/inventory?${params.toString()}`);
      setItems(res.items);
      setTotal(res.total);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchJson("/admin/inventory/branches").then(setBranches).catch(() => {});
  }, []);

  useEffect(() => { fetchData(); }, [branchFilter, stockFilter]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(fetchData, 400);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package size={24} className="text-amber-500" />
            Inventario
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{fmt(total)} registros — control de stock por sucursal</p>
        </div>
      </div>

      {/* Branch stats */}
      {branches.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {branches.map((b) => (
            <button
              key={b.branchId}
              onClick={() => setBranchFilter(b.branchId.toString())}
              className={`text-left rounded-xl border p-3 transition-all hover:shadow-md ${branchFilter === b.branchId.toString() ? "border-amber-400 bg-amber-50" : "border-gray-100 bg-white"}`}
            >
              <p className="text-xs font-semibold text-gray-900 truncate">{b.branchName}</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{fmt(b.totalStock)}</p>
              <p className="text-[10px] text-gray-500">{fmt(b.totalProducts)} prod</p>
              {b.lowStockCount > 0 && (
                <p className="text-[10px] text-amber-600 mt-0.5 font-semibold">{b.lowStockCount} bajo stock</p>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto o SKU..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
        </div>
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white"
        >
          <option value="">Todas las sucursales</option>
          {branches.map((b) => (
            <option key={b.branchId} value={b.branchId}>{b.branchName}</option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white"
        >
          <option value="all">Todo el stock</option>
          <option value="low">Stock bajo</option>
          <option value="out">Agotados</option>
          <option value="normal">Normal</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-amber-500" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">Sin resultados</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sucursal</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Reservado</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Mín</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Reorden</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5">
                    <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">{item.productName}</p>
                    {item.sku && <p className="text-[10px] text-gray-400">{item.sku}</p>}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-600">{item.branchName}</td>
                  <td className="px-4 py-2.5 text-right text-sm font-bold text-gray-900">{fmt(item.stock)}</td>
                  <td className="px-4 py-2.5 text-right text-sm text-gray-500">{item.reservedStock > 0 ? fmt(item.reservedStock) : "—"}</td>
                  <td className="px-4 py-2.5 text-right text-sm text-gray-600">{fmt(item.minimumStock)}</td>
                  <td className="px-4 py-2.5 text-right text-sm text-gray-600">{fmt(item.reorderPoint)}</td>
                  <td className="px-4 py-2.5 text-center"><StockBadge stock={item.stock} reorder={item.reorderPoint} /></td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => setEditing(item)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-amber-600">
                      <Edit size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && <EditDrawer item={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); fetchData(); }} />}
    </div>
  );
}

import { useState } from "react";
import {
  Plus, Search, Filter, Download, Upload, MoreHorizontal,
  Edit, Trash2, Eye, ChevronDown, Tag, Package,
  ArrowUpDown, CheckSquare, X, ChevronLeft, ChevronRight,
} from "lucide-react";

interface Product {
  id: string; sku: string; name: string; category: string; brand: string;
  price: number; stock: number; status: "activo" | "inactivo" | "agotado";
  image: string; supplier: string; barcode: string;
}

const PRODUCTS: Product[] = [
  { id: "P001", sku: "LAC-001", name: "Leche Alquería Entera 1.1L", category: "Lácteos", brand: "Alquería", price: 4350, stock: 12, status: "activo", image: "https://images.unsplash.com/photo-1604095853918-1a1823a63dd5?w=64&h=64&fit=crop&auto=format", supplier: "Alquería S.A.", barcode: "7702153000012" },
  { id: "P002", sku: "CAR-015", name: "Pechuga de Pollo Fresca x Kg", category: "Carnes", brand: "Campollo", price: 12900, stock: 48, status: "activo", image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=64&h=64&fit=crop&auto=format", supplier: "Campollo Ltda.", barcode: "7701234056789" },
  { id: "P003", sku: "DES-042", name: "Arroz Diana Extra Premium 5kg", category: "Despensa", brand: "Diana", price: 22500, stock: 0, status: "agotado", image: "https://images.unsplash.com/photo-1557844352-761f2565b576?w=64&h=64&fit=crop&auto=format", supplier: "Molinos Diana", barcode: "7701234001122" },
  { id: "P004", sku: "FRU-033", name: "Aguacate Hass Mediano x und", category: "Frutas y Verduras", brand: "Mercaldas", price: 2800, stock: 150, status: "activo", image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=64&h=64&fit=crop&auto=format", supplier: "Agrofrío S.A.", barcode: "7709876543210" },
  { id: "P005", sku: "LIM-007", name: "Detergente Ariel Líquido 3L", category: "Limpieza", brand: "Ariel", price: 28900, stock: 34, status: "activo", image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=64&h=64&fit=crop&auto=format", supplier: "P&G Colombia", barcode: "5000000000001" },
  { id: "P006", sku: "LAC-008", name: "Huevos AA Blancos x30", category: "Lácteos", brand: "Kikes", price: 18900, stock: 67, status: "activo", image: "https://images.unsplash.com/photo-1729622493745-03ca9590c64a?w=64&h=64&fit=crop&auto=format", supplier: "Avícola Kikes", barcode: "7704321000099" },
  { id: "P007", sku: "FRU-018", name: "Tomates Chonto Frescos 500g", category: "Frutas y Verduras", brand: "Mercaldas", price: 3200, stock: 88, status: "activo", image: "https://images.unsplash.com/photo-1485637701894-09ad422f6de6?w=64&h=64&fit=crop&auto=format", supplier: "Agrofrío S.A.", barcode: "7709999000011" },
  { id: "P008", sku: "BEB-004", name: "Agua Cristal 600ml x6", category: "Bebidas", brand: "Cristal", price: 8900, stock: 3, status: "activo", image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=64&h=64&fit=crop&auto=format", supplier: "Postobón S.A.", barcode: "7701234099001" },
];

const STATUS_BADGE: Record<string, string> = {
  activo: "bg-green-50 text-green-700 border-green-200",
  inactivo: "bg-gray-100 text-gray-600 border-gray-200",
  agotado: "bg-red-50 text-red-700 border-red-200",
};

function fmt(n: number) { return "$" + n.toLocaleString("es-CO"); }

type DrawerMode = "create" | "edit" | null;

function ProductDrawer({ mode, product, onClose }: { mode: DrawerMode; product?: Product; onClose: () => void }) {
  const [tab, setTab] = useState<"general" | "stock" | "seo" | "nutrition">("general");
  const title = mode === "create" ? "Crear Producto" : "Editar Producto";

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-2xl bg-white flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {(["general", "stock", "nutrition", "seo"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? "border-amber-400 text-amber-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {t === "nutrition" ? "Nutrición" : t === "seo" ? "SEO" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {tab === "general" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre del Producto *</label>
                  <input
                    defaultValue={product?.name || ""}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    placeholder="Ej: Leche Entera Alquería 1.1L"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">SKU</label>
                  <input defaultValue={product?.sku || ""} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="LAC-001" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Código de barras</label>
                  <input defaultValue={product?.barcode || ""} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 font-mono" placeholder="7702153000012" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Precio *</label>
                  <input defaultValue={product?.price || ""} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="0" type="number" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Precio original (tachado)</label>
                  <input className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="0" type="number" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Categoría</label>
                  <select defaultValue={product?.category || ""} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white">
                    <option value="">Seleccionar...</option>
                    {["Lácteos", "Carnes", "Frutas y Verduras", "Despensa", "Limpieza", "Bebidas"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Marca</label>
                  <input defaultValue={product?.brand || ""} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="Alquería" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Proveedor</label>
                  <select className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white">
                    <option>Seleccionar...</option>
                    <option>Alquería S.A.</option>
                    <option>Campollo Ltda.</option>
                    <option>P&G Colombia</option>
                    <option>Agrofrío S.A.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Unidad</label>
                  <input className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="x 1.1L, x kg, x und..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descripción</label>
                  <textarea rows={3} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none" placeholder="Descripción del producto..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tags</label>
                  <input className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="fresco, oferta, nuevo... (separados por coma)" />
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Imágenes</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-amber-300 transition-colors cursor-pointer">
                  <Upload size={20} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Arrastra imágenes o <span className="text-amber-600 font-semibold">haz clic para subir</span></p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG hasta 10MB</p>
                </div>
              </div>
            </>
          )}

          {tab === "stock" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stock actual</label>
                  <input defaultValue={product?.stock} type="number" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stock mínimo (alerta)</label>
                  <input type="number" defaultValue={20} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bodega</label>
                  <select className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white">
                    <option>Principal — Medellín</option>
                    <option>Bodega Norte</option>
                    <option>Bodega Sur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Estado de inventario</label>
                  <select defaultValue={product?.status || "activo"} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white">
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="agotado">Agotado</option>
                  </select>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-800 mb-1">Control de fecha de vencimiento</p>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block text-xs text-amber-700 mb-1">Fecha de vencimiento</label>
                    <input type="date" className="w-full px-3 py-2 text-sm border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-amber-700 mb-1">Lote</label>
                    <input className="w-full px-3 py-2 text-sm border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white" placeholder="LOT-20250723" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "nutrition" && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Información nutricional por 100g / 100ml</p>
              {[
                { label: "Calorías (kcal)", placeholder: "65" },
                { label: "Proteínas (g)", placeholder: "3.5" },
                { label: "Carbohidratos (g)", placeholder: "4.8" },
                { label: "Azúcares (g)", placeholder: "4.8" },
                { label: "Grasas totales (g)", placeholder: "3.2" },
                { label: "Grasas saturadas (g)", placeholder: "2.1" },
                { label: "Sodio (mg)", placeholder: "50" },
                { label: "Fibra dietética (g)", placeholder: "0" },
              ].map((f) => (
                <div key={f.label} className="grid grid-cols-2 gap-3 items-center">
                  <label className="text-sm text-gray-700">{f.label}</label>
                  <input className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder={f.placeholder} />
                </div>
              ))}
            </div>
          )}

          {tab === "seo" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Slug URL</label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">/producto/</span>
                  <input className="flex-1 px-3 py-2.5 text-sm focus:outline-none" placeholder="leche-alqueria-entera-1-1l" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Meta título</label>
                <input className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Meta descripción</label>
                <textarea rows={3} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancelar</button>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">Guardar borrador</button>
            <button className="px-4 py-2 text-sm font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 rounded-xl transition-colors">
              {mode === "create" ? "Publicar Producto" : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [drawer, setDrawer] = useState<{ mode: DrawerMode; product?: Product }>({ mode: null });
  const [catFilter, setCatFilter] = useState("Todos");
  const [page, setPage] = useState(1);

  const cats = ["Todos", ...Array.from(new Set(PRODUCTS.map((p) => p.category)))];

  const filtered = PRODUCTS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "Todos" || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const allSelected = filtered.length > 0 && filtered.every((p) => selected.includes(p.id));
  const toggleAll = () => setAllSelected();
  function setAllSelected() {
    if (allSelected) setSelected([]);
    else setSelected(filtered.map((p) => p.id));
  }

  return (
    <>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
            <p className="text-sm text-gray-500 mt-0.5">3,812 productos en el catálogo</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Upload size={14} /> Importar
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Download size={14} /> Exportar
            </button>
            <button
              onClick={() => setDrawer({ mode: "create" })}
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors"
            >
              <Plus size={14} /> Nuevo producto
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, SKU, barcode..."
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
            />
          </div>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${catFilter === c ? "bg-amber-400 text-amber-900" : "text-gray-500 hover:text-gray-700"}`}
              >
                {c}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Filter size={14} /> Más filtros
          </button>
        </div>

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-sm font-semibold text-amber-800">{selected.length} seleccionados</span>
            <div className="flex gap-2 ml-auto">
              {["Activar", "Desactivar", "Editar precio", "Eliminar"].map((a) => (
                <button key={a} className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${a === "Eliminar" ? "border-red-200 text-red-600 hover:bg-red-50" : "border-amber-300 text-amber-700 hover:bg-amber-100"}`}>
                  {a}
                </button>
              ))}
              <button onClick={() => setSelected([])} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded accent-amber-400"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={(e) => setSelected(e.target.checked ? [...selected, p.id] : selected.filter((id) => id !== p.id))}
                      className="w-4 h-4 rounded accent-amber-400"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.brand} · {p.supplier}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">{p.sku}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{p.category}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold text-gray-900">{fmt(p.price)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-semibold ${p.stock === 0 ? "text-red-600" : p.stock < 20 ? "text-amber-600" : "text-gray-700"}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_BADGE[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setDrawer({ mode: "edit", product: p })}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit size={13} />
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Mostrando {filtered.length} de 3,812 productos</p>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-30" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft size={14} />
              </button>
              {[1, 2, 3, "...", 48].map((p, i) => (
                <button key={i} className={`w-8 h-8 text-xs font-semibold rounded-lg transition-colors ${p === page ? "bg-amber-400 text-amber-900" : "hover:bg-gray-100 text-gray-600"}`}>
                  {p}
                </button>
              ))}
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" onClick={() => setPage((p) => p + 1)}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {drawer.mode && (
        <ProductDrawer mode={drawer.mode} product={drawer.product} onClose={() => setDrawer({ mode: null })} />
      )}
    </>
  );
}

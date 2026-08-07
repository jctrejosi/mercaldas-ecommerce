import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, X, Loader2 } from "lucide-react";
import { filtersService, type FilterConfig, type CreateFilterData } from "../services/filters.service";

function FilterModal({
  filter,
  onClose,
  onSaved,
}: {
  filter: FilterConfig | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!filter;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState(filter?.name ?? "");
  const [categoryIds, setCategoryIds] = useState(
    filter?.categoryIds?.join(", ") ?? "",
  );
  const [brandId, setBrandId] = useState(filter?.brandId?.toString() ?? "");
  const [productTypeCode, setProductTypeCode] = useState(filter?.productTypeCode ?? "");
  const [onSale, setOnSale] = useState(filter?.onSale ?? false);
  const [search, setSearch] = useState(filter?.search ?? "");
  const [sort, setSort] = useState(filter?.sort ?? "");
  const [priceMin, setPriceMin] = useState(filter?.priceMin?.toString() ?? "");
  const [priceMax, setPriceMax] = useState(filter?.priceMax?.toString() ?? "");

  const handleSave = async () => {
    if (!name.trim()) { setError("El nombre es obligatorio"); return; }
    setError(""); setSaving(true);
    try {
      const data: CreateFilterData = {
        name: name.trim(),
        categoryIds: categoryIds
          ? categoryIds.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n))
          : [],
        brandId: brandId ? parseInt(brandId) : null,
        productTypeCode: productTypeCode.trim() || undefined,
        onSale,
        search: search.trim() || undefined,
        sort: sort || undefined,
        priceMin: priceMin ? parseInt(priceMin) : undefined,
        priceMax: priceMax ? parseInt(priceMax) : undefined,
      };
      if (isEdit && filter) await filtersService.update(filter.id, data);
      else await filtersService.create(data);
      onSaved();
    } catch (e: any) {
      setError(e.message || "Error al guardar");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">{isEdit ? "Editar Filtro" : "Nuevo Filtro"}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>
        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="Ej: Frutas y Verduras" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">IDs de categorías (coma separados)</label>
            <input value={categoryIds} onChange={(e) => setCategoryIds(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="1, 2, 3" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">ID de marca</label>
            <input value={brandId} onChange={(e) => setBrandId(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="1" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo de producto</label>
            <input value={productTypeCode} onChange={(e) => setProductTypeCode(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="simple" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Búsqueda</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="leche" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ordenar por</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white">
              <option value="">Por defecto</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="nombre-asc">Nombre A-Z</option>
              <option value="nombre-desc">Nombre Z-A</option>
              <option value="descuento">Mayor descuento</option>
              <option value="relevancia">Más relevante</option>
              <option value="vendidos">Más vendidos</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Precio mínimo</label>
              <input value={priceMin} onChange={(e) => setPriceMin(e.target.value)} type="number" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Precio máximo</label>
              <input value={priceMax} onChange={(e) => setPriceMax(e.target.value)} type="number" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-amber-500" />
            <span className="text-sm text-gray-700">Solo en oferta</span>
          </label>
        </div>
        <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Guardar" : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Filters() {
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FilterConfig | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<FilterConfig | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try { setFilters(await filtersService.getAll()); } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try { await filtersService.remove(deleteConfirm.id); setDeleteConfirm(null); fetchAll(); } catch {}
  };

  return (
    <>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Filtros Guardados</h1>
            <p className="text-sm text-gray-500 mt-0.5">Configura filtros reutilizables para banners y redirecciones</p>
          </div>
          <button onClick={() => { setEditing(null); setModalOpen(true); }} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl">
            <Plus size={14} /> Nuevo filtro
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
        ) : filters.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">No hay filtros guardados</div>
        ) : (
          <div className="space-y-3">
            {filters.map((f) => (
              <div key={f.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{f.name}</p>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                      {f.categoryIds.length > 0 && <span className="bg-amber-50 px-2 py-0.5 rounded">Cat: {f.categoryIds.join(", ")}</span>}
                      {f.brandId && <span className="bg-blue-50 px-2 py-0.5 rounded">Marca: {f.brandId}</span>}
                      {f.productTypeCode && <span className="bg-purple-50 px-2 py-0.5 rounded">Tipo: {f.productTypeCode}</span>}
                      {f.onSale && <span className="bg-green-50 px-2 py-0.5 rounded">En oferta</span>}
                      {f.search && <span className="bg-gray-100 px-2 py-0.5 rounded">Buscar: {f.search}</span>}
                      {f.sort && <span className="bg-gray-100 px-2 py-0.5 rounded">Orden: {f.sort}</span>}
                      {f.priceMin && <span className="bg-gray-100 px-2 py-0.5 rounded">≥ ${f.priceMin.toLocaleString()}</span>}
                      {f.priceMax && <span className="bg-gray-100 px-2 py-0.5 rounded">≤ ${f.priceMax.toLocaleString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditing(f); setModalOpen(true); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"><Edit size={14} /></button>
                    <button onClick={() => setDeleteConfirm(f)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && <FilterModal filter={editing} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); fetchAll(); }} />}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Eliminar filtro</h3>
            <p className="text-sm text-gray-500 mb-5">¿Eliminar "{deleteConfirm.name}"?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-600">Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Search,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  catalogService,
  type CatalogProduct,
} from "../services/catalog.service";

interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  displayOrder: number;
  description: string | null;
  isActive: boolean;
  level: number;
  createdAt: string;
  imagePath: string | null;
}

function CategoryRow({
  cat,
  depth = 0,
  editingId,
  editName,
  setEditName,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onToggleActive,
}: {
  cat: AdminCategory;
  depth?: number;
  editingId: number | null;
  editName: string;
  setEditName: (v: string) => void;
  onStartEdit: (cat: AdminCategory) => void;
  onSaveEdit: (id: number) => void;
  onCancelEdit: () => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, isActive: boolean) => void;
}) {
  return (
    <div className="divide-y divide-gray-50">
      <div
        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group"
        style={{ paddingLeft: depth * 24 + 16 }}
      >
        <div className="text-gray-300 hover:text-gray-500 cursor-grab transition-colors">
          <GripVertical size={14} />
        </div>
        <div className="w-5" />
        <span className="flex-1 text-sm font-medium text-gray-700 flex items-center gap-2">
          {editingId === cat.id ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSaveEdit(cat.id);
              }}
              className="flex items-center gap-2 flex-1"
            >
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="submit"
                className="text-xs font-bold bg-amber-400 text-amber-900 px-2 py-1 rounded"
              >
                ✓
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className="text-xs text-gray-500 px-2 py-1 rounded hover:bg-gray-100"
              >
                ✕
              </button>
            </form>
          ) : (
            <>
              <span>{cat.name}</span>
              <span className="text-[10px] text-gray-400 font-normal">
                {cat.slug}
              </span>
            </>
          )}
        </span>
        {!cat.isActive && (
          <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-semibold">
            Oculta
          </span>
        )}
        <span className="text-xs text-gray-400">{cat.displayOrder ?? "-"}</span>
        <button
          onClick={() => onToggleActive(cat.id, !cat.isActive)}
          className={`w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
            cat.isActive
              ? "text-green-500 hover:bg-green-50"
              : "text-gray-300 hover:bg-gray-100"
          }`}
          title={cat.isActive ? "Ocultar" : "Mostrar"}
        >
          {cat.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
        </button>
        <button
          onClick={() => onStartEdit(cat)}
          className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-100 text-gray-400 hover:text-gray-600"
        >
          <Edit size={13} />
        </button>
        <button
          onClick={() => onDelete(cat.id)}
          className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 text-gray-400 hover:text-red-500"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [newParent, setNewParent] = useState<number | string>("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [uncategorized, setUncategorized] = useState<CatalogProduct[]>([]);
  const [uncatLoading, setUncatLoading] = useState(false);

  const loadCategories = async () => {
    try {
      setCategories(await catalogService.getCategoriesAdmin());
    } catch {
      setCategories([]);
    }
    setLoading(false);
  };

  const loadUncategorized = async () => {
    setUncatLoading(true);
    try {
      setUncategorized(await catalogService.getUncategorizedProducts());
    } catch {
      setUncategorized([]);
    }
    setUncatLoading(false);
  };

  useEffect(() => {
    loadCategories();
    loadUncategorized();
  }, []);

  const createCategory = async () => {
    if (!newName.trim()) return;
    try {
      await catalogService.createCategory({
        name: newName.trim(),
        parentId: newParent ? Number(newParent) : undefined,
      });
      setNewName("");
      setNewParent("");
      setShowNewForm(false);
      await loadCategories();
    } catch {}
  };

  const startEdit = (cat: AdminCategory) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const saveEdit = async (id: number) => {
    if (!editName.trim()) return;
    try {
      await catalogService.updateCategory(id, { name: editName.trim() });
      setEditingId(null);
      await loadCategories();
    } catch {}
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    try {
      await catalogService.updateCategory(id, { isActive });
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive } : c)),
      );
    } catch {}
  };

  const deleteCategory = async (id: number) => {
    try {
      await catalogService.deleteCategory(id);
      await loadCategories();
    } catch {}
  };

  const parents = categories.filter((c) => !c.parentId);
  const childrenOf = (parentId: number) =>
    categories.filter((c) => c.parentId === parentId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-3 border-gray-300 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Árbol jerárquico de categorías
          </p>
        </div>
        <button
          onClick={() => {
            setShowNewForm(!showNewForm);
            setNewName("");
            setNewParent("");
          }}
          className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors"
        >
          <Plus size={14} /> Nueva categoría
        </button>
      </div>

      {/* Create form */}
      {showNewForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 flex-wrap">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre de la categoría..."
            className="flex-1 min-w-[200px] text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <select
            value={newParent}
            onChange={(e) => setNewParent(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none"
          >
            <option value="">Principal (sin padre)</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            onClick={createCategory}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 transition-colors"
          >
            Crear
          </button>
          <button
            onClick={() => setShowNewForm(false)}
            className="px-4 py-2.5 rounded-xl text-sm border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Categorías principales", value: String(parents.length) },
          {
            label: "Subcategorías",
            value: String(categories.filter((c) => c.parentId).length),
          },
          {
            label: "Productos sin clasificar",
            value: String(uncategorized.length),
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-gray-100 p-4 text-center"
          >
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Category tree */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Categoría
          </p>
          <div className="flex gap-12 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Orden</span>
            <span>Acciones</span>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {parents.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-400">Sin categorías aún</p>
              <p className="text-xs text-gray-400 mt-1">
                Crea tu primera categoría usando el botón superior
              </p>
            </div>
          ) : (
            parents.map((parent) => (
              <div key={parent.id}>
                <CategoryRow
                  cat={parent}
                  editingId={editingId}
                  editName={editName}
                  setEditName={setEditName}
                  onStartEdit={startEdit}
                  onSaveEdit={saveEdit}
                  onCancelEdit={() => setEditingId(null)}
                  onDelete={deleteCategory}
                  onToggleActive={toggleActive}
                />
                {childrenOf(parent.id).map((child) => (
                  <CategoryRow
                    key={child.id}
                    cat={child}
                    depth={1}
                    editingId={editingId}
                    editName={editName}
                    setEditName={setEditName}
                    onStartEdit={startEdit}
                    onSaveEdit={saveEdit}
                    onCancelEdit={() => setEditingId(null)}
                    onDelete={deleteCategory}
                    onToggleActive={toggleActive}
                  />
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Uncategorized products */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Productos sin categoría
            </p>
          </div>
          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
            {uncategorized.length}
          </span>
        </div>
        {uncatLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : uncategorized.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-400">
              Todos los productos están clasificados
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Los productos sin categoría aparecerán aquí para ser asignados
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {uncategorized.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {p.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      maximumFractionDigits: 0,
                    }).format(p.price)}
                  </p>
                </div>
                {p.productTypeCode && (
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {p.productTypeCode}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

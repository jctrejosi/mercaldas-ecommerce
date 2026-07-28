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
  AlertTriangle,
  X,
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
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
  level: number;
  createdAt: string;
  imagePath: string | null;
  productCount: number;
}

function CategoryRow({
  cat,
  depth = 0,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  cat: AdminCategory;
  depth?: number;
  onEdit: (cat: AdminCategory) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, isActive: boolean) => void;
}) {
  return (
    <div className="divide-y divide-gray-50">
      <div
        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group cursor-pointer"
        style={{ paddingLeft: depth * 24 + 16 }}
        onClick={() => onEdit(cat)}
      >
        <div
          className="text-gray-300 hover:text-gray-500 cursor-grab transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </div>
        <div className="w-5" />
        <span className="flex-1 text-sm font-medium text-gray-700">
          {cat.name}
        </span>
        {!cat.isActive && (
          <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-semibold">
            Oculta
          </span>
        )}
        <span className="text-xs text-gray-400 w-16 text-right font-medium">
          {cat.productCount} prod.
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleActive(cat.id, !cat.isActive);
          }}
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
          onClick={(e) => {
            e.stopPropagation();
            onEdit(cat);
          }}
          className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-100 text-gray-400 hover:text-gray-600"
        >
          <Edit size={13} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(cat.id);
          }}
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
  const [newName, setNewName] = useState("");
  const [newParent, setNewParent] = useState<number | string>("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [uncategorized, setUncategorized] = useState<CatalogProduct[]>([]);
  const [uncatLoading, setUncatLoading] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState(false);
  const [editTab, setEditTab] = useState<"attrs" | "products">("attrs");
  const [catProducts, setCatProducts] = useState<
    Array<{
      id: number;
      name: string;
      slug: string;
      price: number;
      image: string | null;
      productTypeCode: string | null;
    }>
  >([]);
  const [catProductsLoading, setCatProductsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: number;
      name: string;
      price: number;
      image: string | null;
      productTypeCode: string | null;
    }>
  >([]);
  const [searching, setSearching] = useState(false);

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

  const openEdit = (cat: AdminCategory) => {
    setEditing(cat);
    setEditTab("attrs");
    setEditForm({
      name: cat.name,
      description: cat.description || "",
      parentId: cat.parentId ?? "",
      displayOrder: cat.displayOrder,
      metaTitle: cat.metaTitle || "",
      metaDescription: cat.metaDescription || "",
      isActive: cat.isActive,
      imageUrl: cat.imagePath || "",
    });
    loadCategoryProducts(cat.id);
  };

  const loadCategoryProducts = async (catId: number) => {
    setCatProductsLoading(true);
    setSearchQuery("");
    setSearchResults([]);
    try {
      setCatProducts(await catalogService.getCategoryProducts(catId));
    } catch {
      setCatProducts([]);
    }
    setCatProductsLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("code", `cat_${editing?.id ?? "new"}`);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/upload/image`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();
      setEditForm((f) => ({ ...f, imageUrl: data.url }));
    } catch {}
    setUploading(false);
  };

  const handleProductSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const data = await catalogService.getProducts({
        search: searchQuery.trim(),
        limit: 20,
      });
      const existingIds = new Set(catProducts.map((p) => p.id));
      setSearchResults(
        data
          .filter((p) => !existingIds.has(p.id))
          .map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image || null,
            productTypeCode: p.productTypeCode || null,
          })),
      );
    } catch {
      setSearchResults([]);
    }
    setSearching(false);
  };

  const addProduct = async (productId: number) => {
    if (!editing) return;
    try {
      await catalogService.addProductToCategory(editing.id, productId);
      await loadCategoryProducts(editing.id);
      await loadCategories();
    } catch {}
  };

  const removeProduct = async (productId: number) => {
    if (!editing) return;
    try {
      await catalogService.removeProductFromCategory(editing.id, productId);
      setCatProducts((prev) => prev.filter((p) => p.id !== productId));
      await loadCategories();
    } catch {}
  };

  const saveEdit = async () => {
    if (!editing || !editForm.name?.trim()) return;
    try {
      await catalogService.updateCategory(editing.id, {
        name: editForm.name.trim(),
        description: editForm.description || null,
        parentId: editForm.parentId ? Number(editForm.parentId) : null,
        displayOrder: Number(editForm.displayOrder) || 0,
        metaTitle: editForm.metaTitle || null,
        metaDescription: editForm.metaDescription || null,
        isActive: editForm.isActive,
        imageUrl: editForm.imageUrl || undefined,
      });
      setEditing(null);
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

      <div className="flex gap-5">
        {/* Category tree */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex-1">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Categoría
            </p>
            <div className="flex gap-8 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>Productos</span>
              <span>Acciones</span>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {parents.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-gray-400">Sin categorías aún</p>
                <p className="text-xs text-gray-400 mt-1">
                  Crea tu primera categoría
                </p>
              </div>
            ) : (
              parents.map((parent) => (
                <div key={parent.id}>
                  <CategoryRow
                    cat={parent}
                    onEdit={openEdit}
                    onDelete={deleteCategory}
                    onToggleActive={toggleActive}
                  />
                  {childrenOf(parent.id).map((child) => (
                    <CategoryRow
                      key={child.id}
                      cat={child}
                      depth={1}
                      onEdit={openEdit}
                      onDelete={deleteCategory}
                      onToggleActive={toggleActive}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit panel - floating overlay */}
      {editing && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setEditing(null)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">
                Editar categoría
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setEditTab("attrs")}
                className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${editTab === "attrs" ? "text-amber-600 border-b-2 border-amber-400" : "text-gray-400 hover:text-gray-600"}`}
              >
                Atributos
              </button>
              <button
                onClick={() => setEditTab("products")}
                className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${editTab === "products" ? "text-amber-600 border-b-2 border-amber-400" : "text-gray-400 hover:text-gray-600"}`}
              >
                Productos ({catProducts.length})
              </button>
            </div>

            {editTab === "attrs" && (
              <div className="px-5 py-4 space-y-4">
                {[
                  { key: "name", label: "Nombre", type: "text" },
                  { key: "description", label: "Descripción", type: "text" },
                  {
                    key: "metaTitle",
                    label: "Meta título (SEO)",
                    type: "text",
                  },
                  {
                    key: "metaDescription",
                    label: "Meta descripción (SEO)",
                    type: "text",
                  },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={editForm[key] ?? ""}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                ))}

                {/* Image upload */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Imagen
                  </label>
                  {editForm.imageUrl ? (
                    <div className="relative mb-2">
                      <img
                        src={editForm.imageUrl}
                        alt="Preview"
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() =>
                          setEditForm((f) => ({ ...f, imageUrl: "" }))
                        }
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-24 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                      {editing.imagePath ? (
                        <img
                          src={editing.imagePath}
                          alt={editing.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        "Sin imagen"
                      )}
                    </div>
                  )}
                  <label className="mt-2 flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    {uploading ? "Subiendo..." : "Subir imagen"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Categoría padre
                  </label>
                  <select
                    value={editForm.parentId ?? ""}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, parentId: e.target.value }))
                    }
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none"
                  >
                    <option value="">Principal (sin padre)</option>
                    {parents
                      .filter((p) => p.id !== editing.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Orden
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.displayOrder ?? 0}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        displayOrder: e.target.value,
                      }))
                    }
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isActive ?? true}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, isActive: e.target.checked }))
                    }
                    className="rounded accent-amber-400"
                  />
                  <span className="text-sm text-gray-700">Visible</span>
                </label>

                <button
                  onClick={saveEdit}
                  className="w-full py-2.5 rounded-xl text-sm font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 transition-colors"
                >
                  Guardar cambios
                </button>
              </div>
            )}

            {editTab === "products" && (
              <div className="px-5 py-4 space-y-4">
                {/* Current products */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Productos en esta categoría
                  </p>
                  {catProductsLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-amber-400 rounded-full animate-spin" />
                    </div>
                  ) : catProducts.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center">
                      Sin productos asignados
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                      {catProducts.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="w-8 h-8 rounded bg-gray-200 overflow-hidden shrink-0">
                            {p.image && (
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <span className="text-xs text-gray-700 flex-1 truncate">
                            {p.name}
                          </span>
                          <button
                            onClick={() => removeProduct(p.id)}
                            className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="Quitar de categoría"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add product */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Buscar y asignar
                  </p>
                  <div className="flex gap-2">
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleProductSearch()
                      }
                      placeholder="Buscar producto..."
                      className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <button
                      onClick={handleProductSearch}
                      className="px-3 py-2 text-xs font-semibold bg-amber-400 text-amber-900 rounded-lg hover:bg-amber-500 transition-colors"
                    >
                      {searching ? "..." : "Buscar"}
                    </button>
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                      {searchResults.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => addProduct(p.id)}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-amber-50 transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded bg-gray-200 overflow-hidden shrink-0">
                            {p.image && (
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <span className="text-xs text-gray-700 flex-1 truncate">
                            {p.name}
                          </span>
                          <Plus size={12} className="text-amber-500 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

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
          </div>
        ) : (
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {uncategorized.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

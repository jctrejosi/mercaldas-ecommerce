import { useState, useEffect, useCallback } from "react";
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
  Search,
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
  const [creating, setCreating] = useState(false);
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
      category: string;
    }>
  >([]);
  const [searching, setSearching] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminCategory | null>(
    null,
  );
  const [assignProductId, setAssignProductId] = useState<number | null>(null);
  const [assignCategoryId, setAssignCategoryId] = useState<number | string>("");
  const [replaceProduct, setReplaceProduct] = useState<{
    productId: number;
    name: string;
    currentCategory: string;
  } | null>(null);
  const [catSearch, setCatSearch] = useState("");
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);

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

  const openNewCategory = () => {
    setCreating(true);
    setEditTab("attrs");
    setEditForm({
      name: "",
      description: "",
      parentId: "",
      displayOrder: 0,
      metaTitle: "",
      metaDescription: "",
      isActive: true,
      imageUrl: "",
    });
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
    const cat = categories.find((c) => c.id === id);
    if (cat) setDeleteConfirm(cat);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await catalogService.deleteCategory(deleteConfirm.id);
      if (editing?.id === deleteConfirm.id) setEditing(null);
      await loadCategories();
    } catch {}
    setDeleteConfirm(null);
  };

  const assignProduct = async () => {
    if (!assignProductId || !assignCategoryId) return;
    try {
      await catalogService.addProductToCategory(
        Number(assignCategoryId),
        assignProductId,
      );
      setAssignProductId(null);
      setAssignCategoryId("");
      await Promise.all([loadCategories(), loadUncategorized()]);
    } catch {}
  };

  const openEdit = (cat: AdminCategory) => {
    setCreating(false);
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

  const handleProductSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        // Load default products when search is empty
        setSearching(true);
        try {
          const data = await catalogService.getProducts({
            limit: 20,
            sort: "relevancia",
          });
          const existingIds = new Set(catProducts.map((p) => p.id));
          setSearchResults(
            data
              .filter((p) => !existingIds.has(p.id))
              .slice(0, 8)
              .map((p) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                image: p.image || null,
                productTypeCode: p.productTypeCode || null,
                category: p.category,
              })),
          );
        } catch {
          setSearchResults([]);
        }
        setSearching(false);
        return;
      }
      setSearching(true);
      try {
        const data = await catalogService.getProducts({
          search: query.trim(),
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
              category: p.category,
            })),
        );
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    },
    [catProducts],
  );

  // Load default products when submodal opens
  useEffect(() => {
    if (showAddProduct) {
      setSearchQuery("");
      handleProductSearch("");
    }
  }, [showAddProduct]);

  // Debounce search
  useEffect(() => {
    if (!showAddProduct) return;
    const timer = setTimeout(() => handleProductSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, showAddProduct, handleProductSearch]);

  const addProduct = async (productId: number) => {
    if (!editing) return;
    try {
      await catalogService.replaceProductCategory(productId, editing.id);
      await loadCategoryProducts(editing.id);
      setSearchResults((prev) => prev.filter((p) => p.id !== productId));
      setShowAddProduct(false);
      await Promise.all([loadCategories(), loadUncategorized()]);
    } catch {}
    setReplaceProduct(null);
  };

  const removeProduct = async (productId: number) => {
    if (!editing) return;
    try {
      await catalogService.removeProductFromCategory(editing.id, productId);
      setCatProducts((prev) => prev.filter((p) => p.id !== productId));
      await Promise.all([loadCategories(), loadUncategorized()]);
    } catch {}
  };

  const saveEdit = async () => {
    if (!editForm.name?.trim()) return;
    if (creating) {
      try {
        const { id } = await catalogService.createCategory({
          name: editForm.name.trim(),
          parentId: editForm.parentId ? Number(editForm.parentId) : undefined,
        });
        await catalogService.updateCategory(id, {
          description: editForm.description || null,
          displayOrder: Number(editForm.displayOrder) || 0,
          metaTitle: editForm.metaTitle || null,
          metaDescription: editForm.metaDescription || null,
          isActive: editForm.isActive,
          imageUrl: editForm.imageUrl || undefined,
        });
        setCreating(false);
        setEditing(null);
        await loadCategories();
      } catch {}
      return;
    }
    if (!editing) return;
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
          onClick={openNewCategory}
          className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors"
        >
          <Plus size={14} /> Nueva categoría
        </button>
      </div>

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

      {/* Edit/Create panel - floating overlay */}
      {(editing || creating) && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => {
              setEditing(null);
              setCreating(false);
            }}
          />
          <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">
                {creating ? "Nueva categoría" : "Editar categoría"}
              </h3>
              <button
                onClick={() => {
                  setEditing(null);
                  setCreating(false);
                }}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            {editing && (
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
            )}

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
                      {editing?.imagePath ? (
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
                      .filter((p) => (editing ? p.id !== editing.id : true))
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
                  {creating ? "Crear categoría" : "Guardar cambios"}
                </button>
              </div>
            )}

            {editTab === "products" && (
              <div className="px-5 py-4 space-y-4">
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 transition-colors"
                >
                  <Plus size={14} />
                  Añadir productos
                </button>

                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Productos ({catProducts.length})
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
                  <div className="flex flex-col gap-2 max-h-[calc(100vh-18rem)] overflow-y-auto">
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
                        <span className="text-xs text-gray-700 truncate">
                          {p.name}
                        </span>
                        <button
                          onClick={() => removeProduct(p.id)}
                          className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                          title="Quitar de categoría"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                onClick={() => {
                  setAssignProductId(p.id);
                  setAssignCategoryId("");
                  setCatSearch("");
                }}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer"
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

      {/* Add product submodal */}
      {showAddProduct && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[60]"
            onClick={() => setShowAddProduct(false)}
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-gray-900">
                  Añadir productos a "{editing?.name}"
                </h3>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar producto..."
                    className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
              {searchResults.length > 0 ? (
                <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() =>
                        setReplaceProduct({
                          productId: p.id,
                          name: p.name,
                          currentCategory: p.category || "Ninguna",
                        })
                      }
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-amber-50 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                        {p.image && (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            maximumFractionDigits: 0,
                          }).format(p.price)}
                        </p>
                      </div>
                      <Plus size={14} className="text-amber-500 shrink-0" />
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim() && !searching ? (
                <p className="text-xs text-gray-400 py-8 text-center">
                  Sin resultados
                </p>
              ) : null}
            </div>
          </div>
        </>
      )}

      {/* Replace category confirmation */}
      {replaceProduct && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[65]"
            onClick={() => setReplaceProduct(null)}
          />
          <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">
                    Reemplazar categoría
                  </h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">{replaceProduct.name}</span>
              </p>
              <p className="text-xs text-gray-500 mb-5">
                Categoría actual:{" "}
                <span className="font-semibold">
                  {replaceProduct.currentCategory}
                </span>
                . Se reemplazará por{" "}
                <span className="font-semibold text-amber-700">
                  {editing?.name}
                </span>
                .
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setReplaceProduct(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => addProduct(replaceProduct.productId)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 transition-colors"
                >
                  Reemplazar
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Assign category modal */}
      {assignProductId && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[55]"
            onClick={() => setAssignProductId(null)}
          />
          <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-sm text-gray-900">
                  Asignar categoría
                </h3>
                <button
                  onClick={() => setAssignProductId(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 mb-4 flex items-center gap-3">
                {uncategorized.find((p) => p.id === assignProductId)?.image && (
                  <img
                    src={
                      uncategorized.find((p) => p.id === assignProductId)!
                        .image!
                    }
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700 truncate">
                    {uncategorized.find((p) => p.id === assignProductId)?.name}
                  </p>
                </div>
              </div>

              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Seleccionar categoría
              </label>

              {/* Searchable category picker */}
              <div className="relative mb-4">
                <input
                  value={
                    assignCategoryId
                      ? categories.find(
                          (c) => c.id === Number(assignCategoryId),
                        )?.name || ""
                      : catSearch
                  }
                  onChange={(e) => {
                    if (assignCategoryId) {
                      setAssignCategoryId("");
                      setCatSearch(e.target.value);
                    } else {
                      setCatSearch(e.target.value);
                    }
                    setCatDropdownOpen(true);
                  }}
                  onFocus={() => setCatDropdownOpen(true)}
                  onBlur={() =>
                    setTimeout(() => setCatDropdownOpen(false), 200)
                  }
                  placeholder="Buscar o elegir categoría..."
                  className={`w-full text-sm border rounded-xl pl-4 pr-9 py-2.5 focus:outline-none focus:ring-2 ${!assignCategoryId && catSearch.trim() ? "border-red-300 focus:ring-red-300" : "border-gray-200 focus:ring-amber-400"}`}
                />
                {assignCategoryId && (
                  <button
                    onClick={() => setAssignCategoryId("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                  >
                    <X size={12} className="text-gray-500" />
                  </button>
                )}
                {catDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                    {(() => {
                      const filtered = categories.filter(
                        (c) =>
                          c.isActive &&
                          (!catSearch ||
                            c.name
                              .toLowerCase()
                              .includes(catSearch.toLowerCase())),
                      );
                      if (filtered.length === 0 && catSearch.trim()) {
                        return (
                          <div className="px-4 py-3 text-xs text-red-500">
                            No se encontró "{catSearch}"
                          </div>
                        );
                      }
                      return filtered.map((c) => (
                        <button
                          key={c.id}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setAssignCategoryId(c.id);
                            setCatSearch("");
                            setCatDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-amber-50 transition-colors flex items-center gap-2 ${Number(assignCategoryId) === c.id ? "bg-amber-50 font-semibold text-amber-900" : "text-gray-700"}`}
                          style={{ paddingLeft: 16 + c.level * 16 }}
                        >
                          {c.level === 0 ? (
                            <span className="text-xs opacity-50">📁</span>
                          ) : (
                            <span className="text-xs opacity-50 ml-1">↳</span>
                          )}
                          {c.name}
                        </button>
                      ));
                    })()}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setAssignProductId(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={assignProduct}
                  disabled={!assignCategoryId}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 transition-colors disabled:opacity-40"
                >
                  Asignar
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <Trash2 size={18} className="text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">
                    Eliminar categoría
                  </h3>
                  <p className="text-xs text-gray-500">
                    "{deleteConfirm.name}"
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-5">
                ¿Estás seguro? Las subcategorías de esta categoría pasarán a ser
                categorías principales.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

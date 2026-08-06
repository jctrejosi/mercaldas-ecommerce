import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  Layers,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface AdminProductType {
  id: number;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  imagePath: string | null;
  productCount: number;
}

interface TypeProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  productTypeCode?: string | null;
}

interface EditForm {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  imageUrl: string;
}

function ProductTypeRow({
  t,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  t: AdminProductType;
  onEdit: (t: AdminProductType) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, isActive: boolean) => void;
}) {
  return (
    <div className="divide-y divide-gray-50">
      <div
        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group cursor-pointer"
        onClick={() => onEdit(t)}
      >
        <div className="w-7 h-7 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
          {t.imagePath ? (
            <img
              src={t.imagePath}
              alt={t.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <Layers size={14} className="text-gray-400" />
          )}
        </div>
        <span className="flex-1 text-sm font-medium text-gray-700 truncate">
          {t.name}
        </span>
        {t.code && (
          <span className="text-[10px] text-gray-400 font-mono">{t.code}</span>
        )}
        {!t.isActive && (
          <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-semibold">
            Inactivo
          </span>
        )}
        <span className="text-xs text-gray-400 w-16 text-right font-medium">
          {t.productCount} prod.
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleActive(t.id, !t.isActive);
          }}
          className={`w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
            t.isActive
              ? "text-green-500 hover:bg-green-50"
              : "text-gray-300 hover:bg-gray-100"
          }`}
          title={t.isActive ? "Inactivar" : "Activar"}
        >
          {t.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(t);
          }}
          className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-100 text-gray-400 hover:text-gray-600"
        >
          <Edit size={13} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(t.id);
          }}
          className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 text-gray-400 hover:text-red-500"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export default function ProductTypes() {
  const [types, setTypes] = useState<AdminProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminProductType | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: "",
    code: "",
    description: "",
    isActive: true,
    imageUrl: "",
  });
  const [editTab, setEditTab] = useState<"attrs" | "products">("attrs");
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<AdminProductType | null>(null);

  const [typeProducts, setTypeProducts] = useState<TypeProduct[]>([]);
  const [tpLoading, setTpLoading] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TypeProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadTypes = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/catalog/product-types`, {
        credentials: "include",
      });
      if (res.ok) setTypes(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTypes();
  }, [loadTypes]);

  const openNew = () => {
    setCreating(true);
    setEditing(null);
    setEditTab("attrs");
    setEditForm({ name: "", code: "", description: "", isActive: true, imageUrl: "" });
    setPendingFile(null);
    setPendingPreview("");
    setSaveError("");
  };

  const openEdit = (t: AdminProductType) => {
    setEditing(t);
    setCreating(false);
    setEditTab("attrs");
    setEditForm({
      name: t.name,
      code: t.code,
      description: t.description ?? "",
      isActive: t.isActive,
      imageUrl: t.imagePath ?? "",
    });
    setPendingFile(null);
    setPendingPreview("");
    setSaveError("");
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    const prev = types;
    setTypes((ts) => ts.map((t) => (t.id === id ? { ...t, isActive } : t)));
    try {
      const res = await fetch(`${API_BASE_URL}/admin/catalog/product-types/${id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) setTypes(prev);
    } catch {
      setTypes(prev);
    }
  };

  const confirmDelete = (t: AdminProductType) => setDeleteConfirm(t);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await fetch(`${API_BASE_URL}/admin/catalog/product-types/${deleteConfirm.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setDeleteConfirm(null);
      await loadTypes();
    } catch (e) {
      console.error(e);
    }
  };

  const handleImageUpload = (file: File) => {
    if (!file) return;
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
  };

  const uploadPendingImage = async (): Promise<string> => {
    if (!pendingFile) return editForm.imageUrl;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", pendingFile);
      fd.append(
        "code",
        `product_type_${editForm.code || editForm.name.replace(/\s+/g, "_")}`,
      );
      const res = await fetch(`${API_BASE_URL}/upload/image`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error("Error al subir imagen");
      const data = await res.json();
      return data.url;
    } finally {
      setUploading(false);
    }
  };

  const clearPendingImage = () => {
    setPendingFile(null);
    setPendingPreview("");
    setEditForm((f) => ({ ...f, imageUrl: "" }));
  };

  const loadTypeProducts = async (id: number) => {
    setTpLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/catalog/product-types/${id}/products`,
        { credentials: "include" },
      );
      if (res.ok) setTypeProducts(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setTpLoading(false);
    }
  };

  const handleProductSearch = (q: string) => {
    setSearchQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      if (!q.trim()) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const res = await fetch(`${API_BASE_URL}/admin/catalog/products`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ search: q.trim(), limit: 15 }),
        });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.products ?? [];
          setSearchResults(
            list.map((p: any) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              price: Number(p.price ?? 0),
              image: p.image ?? null,
              productTypeCode: p.productTypeCode ?? null,
            })),
          );
        }
      } catch {
        /* noop */
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const addProduct = async (productId: number) => {
    if (!editing) return;
    try {
      await fetch(`${API_BASE_URL}/admin/catalog/product-types/${editing.id}/products`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      setShowAddProduct(false);
      setSearchQuery("");
      setSearchResults([]);
      await loadTypeProducts(editing.id);
      await loadTypes();
    } catch (e) {
      console.error(e);
    }
  };

  const removeProduct = async (productId: number) => {
    if (!editing) return;
    try {
      await fetch(
        `${API_BASE_URL}/admin/catalog/product-types/${editing.id}/products/${productId}`,
        { method: "DELETE", credentials: "include" },
      );
      await loadTypeProducts(editing.id);
      await loadTypes();
    } catch (e) {
      console.error(e);
    }
  };

  const saveEdit = async () => {
    if (!editForm.name.trim()) {
      setSaveError("El nombre es obligatorio");
      return;
    }
    setSaveError("");
    setUploading(true);
    try {
      const imageUrl = await uploadPendingImage();
      const payload: any = {
        name: editForm.name.trim(),
        code: editForm.code.trim() || undefined,
        description: editForm.description.trim() || null,
        isActive: editForm.isActive,
      };
      if (imageUrl) payload.imageUrl = imageUrl;

      const url = creating
        ? `${API_BASE_URL}/admin/catalog/product-types`
        : `${API_BASE_URL}/admin/catalog/product-types/${editing!.id}`;
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setSaveError(err?.message || "Error al guardar");
        return;
      }
      setEditing(null);
      setCreating(false);
      await loadTypes();
    } catch (e: any) {
      setSaveError(e.message || "Error al guardar");
    } finally {
      setUploading(false);
    }
  };

  const currency = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tipos de Producto</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Clasifica los productos por tipo para la landing y el catálogo
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors"
        >
          <Plus size={15} /> Nuevo tipo de producto
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-amber-500" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Todos los tipos
            </p>
          </div>
          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
            {types.length}
          </span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : types.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-400">Sin tipos de producto aún</p>
            <p className="text-xs text-gray-400 mt-1">
              Crea tu primer tipo de producto
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {types.map((t) => (
              <ProductTypeRow
                key={t.id}
                t={t}
                onEdit={openEdit}
                onDelete={(id) => {
                  const target = types.find((x) => x.id === id);
                  if (target) confirmDelete(target);
                }}
                onToggleActive={toggleActive}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit/Create drawer */}
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
            {uploading && (
              <div className="absolute inset-0 bg-white/75 z-10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-amber-400 rounded-full animate-spin" />
                  <span className="text-sm font-semibold text-gray-600">
                    Guardando...
                  </span>
                </div>
              </div>
            )}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">
                {creating ? "Nuevo tipo de producto" : "Editar tipo de producto"}
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
                  className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                    editTab === "attrs"
                      ? "text-amber-600 border-b-2 border-amber-400"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Atributos
                </button>
                <button
                  onClick={() => {
                    setEditTab("products");
                    void loadTypeProducts(editing.id);
                  }}
                  className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                    editTab === "products"
                      ? "text-amber-600 border-b-2 border-amber-400"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Productos ({typeProducts.length})
                </button>
              </div>
            )}

            {editTab === "attrs" && (
              <div className="px-5 py-4 space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Nombre <span className="text-red-400 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    value={editForm.code}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, code: e.target.value }))
                    }
                    placeholder="Opcional, se autogenera"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, description: e.target.value }))
                    }
                    rows={2}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  />
                </div>

                {/* Image */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Imagen
                  </label>
                  {editForm.imageUrl || pendingFile ? (
                    <div className="relative mb-2">
                      <img
                        src={pendingPreview || editForm.imageUrl}
                        alt="Preview"
                        className="w-full h-24 object-contain rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={clearPendingImage}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-24 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                      Sin imagen
                    </div>
                  )}
                  <label className="mt-2 flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    {uploading ? "Subiendo..." : "Subir imagen"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImageUpload(f);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, isActive: e.target.checked }))
                    }
                    className="rounded accent-amber-400"
                  />
                  <span className="text-sm text-gray-700">Visible</span>
                </label>

                {saveError && <p className="text-xs text-red-500">{saveError}</p>}

                <button
                  onClick={saveEdit}
                  disabled={uploading}
                  className="w-full py-2.5 rounded-xl text-sm font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 transition-colors disabled:opacity-50"
                >
                  {uploading
                    ? "Guardando..."
                    : creating
                      ? "Crear tipo de producto"
                      : "Guardar cambios"}
                </button>
              </div>
            )}

            {editTab === "products" && editing && (
              <div className="px-5 py-4 space-y-4">
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 transition-colors"
                >
                  <Plus size={14} /> Añadir productos
                </button>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Productos ({typeProducts.length})
                </p>
                {tpLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-amber-400 rounded-full animate-spin" />
                  </div>
                ) : typeProducts.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center">
                    Sin productos asignados
                  </p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[calc(100vh-18rem)] overflow-y-auto">
                    {typeProducts.map((p) => (
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
                        <span className="text-xs text-gray-700 truncate flex-1">
                          {p.name}
                        </span>
                        <button
                          onClick={() => removeProduct(p.id)}
                          className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                          title="Quitar del tipo"
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

      {/* Delete confirm */}
      {deleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[60]"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">
                    Eliminar tipo de producto
                  </h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                ¿Seguro que deseas eliminar{" "}
                <span className="font-semibold">{deleteConfirm.name}</span>?
              </p>
              <p className="text-xs text-gray-500 mb-5">
                Los productos asociados quedarán sin este tipo asignado.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add products submodal */}
      {showAddProduct && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[70]"
            onClick={() => setShowAddProduct(false)}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
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
              <div className="flex-1 relative mb-3">
                <input
                  value={searchQuery}
                  onChange={(e) => handleProductSearch(e.target.value)}
                  placeholder="Buscar producto..."
                  className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              </div>
              {searching ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-amber-400 rounded-full animate-spin" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addProduct(p.id)}
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
                          {currency.format(p.price)}
                        </p>
                      </div>
                      <Plus size={14} className="text-amber-500 shrink-0" />
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <p className="text-xs text-gray-400 py-8 text-center">
                  Sin resultados
                </p>
              ) : (
                <p className="text-xs text-gray-400 py-8 text-center">
                  Escribe para buscar productos
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

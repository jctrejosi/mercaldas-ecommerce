import { useState } from "react";
import { ChevronRight, ChevronDown, Plus, Edit, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";

interface Category { id: string; name: string; icon: string; products: number; visible: boolean; children?: Category[]; }

const CATEGORIES: Category[] = [
  { id: "c1", name: "Frutas y Verduras", icon: "🥦", products: 234, visible: true, children: [
    { id: "c1a", name: "Frutas Frescas", icon: "🍎", products: 89, visible: true },
    { id: "c1b", name: "Verduras Frescas", icon: "🥕", products: 112, visible: true },
    { id: "c1c", name: "Hierbas y Condimentos", icon: "🌿", products: 33, visible: true },
  ]},
  { id: "c2", name: "Lácteos y Huevos", icon: "🥛", products: 156, visible: true, children: [
    { id: "c2a", name: "Leches", icon: "🥛", products: 45, visible: true },
    { id: "c2b", name: "Quesos", icon: "🧀", products: 67, visible: true },
    { id: "c2c", name: "Huevos", icon: "🥚", products: 12, visible: true },
    { id: "c2d", name: "Yogur", icon: "🍶", products: 32, visible: false },
  ]},
  { id: "c3", name: "Carnes y Pollo", icon: "🥩", products: 198, visible: true, children: [
    { id: "c3a", name: "Carnes de Res", icon: "🐄", products: 78, visible: true },
    { id: "c3b", name: "Pollo", icon: "🍗", products: 89, visible: true },
    { id: "c3c", name: "Cerdo", icon: "🐷", products: 31, visible: true },
  ]},
  { id: "c4", name: "Despensa", icon: "🛒", products: 421, visible: true },
  { id: "c5", name: "Limpieza del Hogar", icon: "🧽", products: 187, visible: true },
  { id: "c6", name: "Bebidas", icon: "🥤", products: 312, visible: false },
];

function CategoryRow({ cat, depth = 0 }: { cat: Category; depth?: number }) {
  const [open, setOpen] = useState(depth === 0 && !!cat.children);
  const hasChildren = !!cat.children?.length;
  return (
    <>
      <div className={`flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group ${depth > 0 ? "pl-" + (depth * 4 + 4) : ""}`} style={{ paddingLeft: depth * 24 + 16 }}>
        <div className="text-gray-300 hover:text-gray-500 cursor-grab transition-colors"><GripVertical size={14} /></div>
        {hasChildren ? (
          <button onClick={() => setOpen(!open)} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : <div className="w-5" />}
        <span className="text-lg">{cat.icon}</span>
        <span className="flex-1 text-sm font-medium text-gray-700">{cat.name}</span>
        <span className="text-xs text-gray-400">{cat.products} productos</span>
        <button className={`w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all ${cat.visible ? "text-green-500 hover:bg-green-50" : "text-gray-300 hover:bg-gray-100"}`}>
          {cat.visible ? <Eye size={13} /> : <EyeOff size={13} />}
        </button>
        <button className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-100 text-gray-400 hover:text-gray-600">
          <Edit size={13} />
        </button>
        <button className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 text-gray-400 hover:text-red-500">
          <Trash2 size={13} />
        </button>
      </div>
      {open && cat.children?.map((child) => <CategoryRow key={child.id} cat={child} depth={depth + 1} />)}
    </>
  );
}

export default function Categories() {
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-sm text-gray-500 mt-0.5">Árbol jerárquico de categorías</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors">
          <Plus size={14} /> Nueva categoría
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[{ label: "Categorías principales", value: "12" }, { label: "Subcategorías", value: "48" }, { label: "Productos clasificados", value: "3,812" }].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</p>
          <div className="flex gap-12 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Productos</span>
            <span>Acciones</span>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {CATEGORIES.map((cat) => <CategoryRow key={cat.id} cat={cat} />)}
        </div>
      </div>
    </div>
  );
}

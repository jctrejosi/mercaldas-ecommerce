import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { ProductCardProps } from "../../types";

/* ─── Helpers ────────────────────────────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

export function ProductCard({
  product,
  cartItems,
  onAdd,
  onRemove,
  onProductClick,
}: ProductCardProps) {
  const inCart = cartItems.find((c) => c.id === product.id);
  const cartQty = inCart?.quantity ?? 0;
  const [localQty, setLocalQty] = useState(1);

  // Reset local quantity when product changes
  // (Only if the component remounts, which happens on filter changes)

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden group hover:shadow-md transition-shadow duration-200 flex flex-col">
      <button
        className="relative bg-muted aspect-square overflow-hidden w-full"
        onClick={() => onProductClick(product)}
        aria-label={`Ver detalle de ${product.name}`}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.badge && (
          <span
            className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full text-white"
            style={{
              background: product.badge === "Nuevo" ? "#1A1A2E" : "#FF4444",
            }}
          >
            {product.badge}
          </span>
        )}
      </button>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-xs text-muted-foreground">{product.category}</p>
        <button className="text-left" onClick={() => onProductClick(product)}>
          <h3 className="text-sm font-semibold leading-snug text-foreground line-clamp-2 hover:text-primary-foreground/70 transition-colors">
            {product.name}
          </h3>
        </button>
        <p className="text-xs text-muted-foreground">{product.unit}</p>
        <div className="flex items-end gap-1.5 mt-auto pt-1">
          <span
            className="font-bold text-base text-foreground"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            {fmt(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {fmt(product.originalPrice)}
            </span>
          )}
        </div>
        {/* Local quantity stepper — solo controla el estado local */}
        <div className="flex items-center justify-between border border-border rounded-lg overflow-hidden mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLocalQty((prev) => Math.max(1, prev - 1));
            }}
            disabled={localQty <= 1}
            className="flex-1 flex items-center justify-center py-1.5 transition-colors disabled:opacity-25 hover:bg-muted"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="font-bold text-sm w-8 text-center tabular-nums">
            {localQty}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLocalQty((prev) => prev + 1);
            }}
            className="flex-1 flex items-center justify-center py-1.5 hover:bg-muted transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        {/* Agregar button — agrega la cantidad local al carrito */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(product, localQty);
          }}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-semibold text-sm mt-1.5 transition-all hover:brightness-95 active:scale-95"
          style={{ background: "#FFF200", color: "#1A1A2E" }}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          {cartQty === 0 ? `Agregar ${localQty}` : `Agregar ${localQty} más`}
        </button>
      </div>
    </div>
  );
}

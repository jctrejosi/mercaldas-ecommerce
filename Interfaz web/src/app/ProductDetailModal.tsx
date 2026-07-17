import { useEffect, useState } from "react";
import { ProductDetailModalProps, Product } from "./types";
import { Minus, Plus, ShoppingCart, TrendingUp, X } from "lucide-react";
import { catalogService } from "../services/catalog.service";

const MOCK_SPECS: Record<string, Array<{ label: string; value: string }>> = {
  "Carnes y Pollo": [
    { label: "Origen", value: "Colombia" },
    { label: "Temperatura", value: "Refrigerado 0–4 °C" },
    { label: "Proteína", value: "23 g por 100 g" },
    { label: "Grasa total", value: "3.5 g por 100 g" },
  ],
  Lácteos: [
    { label: "Origen", value: "Caldas, Colombia" },
    { label: "Temperatura", value: "Refrigerado 0–4 °C" },
    { label: "Calcio", value: "120 mg por 100 mL" },
    { label: "Proteína", value: "3.2 g por 100 mL" },
  ],
  "Frutas y Verduras": [
    { label: "Origen", value: "Región Andina, Colombia" },
    { label: "Conservación", value: "Lugar fresco y seco" },
    { label: "Calorías", value: "Aprox. 40–80 kcal / 100 g" },
    { label: "Libre de", value: "Conservantes artificiales" },
  ],
  Despensa: [
    { label: "Contenido", value: "Ver empaque" },
    { label: "Conservación", value: "Lugar fresco y seco" },
    { label: "Registro INVIMA", value: "RSA-F-0012345" },
    { label: "Hecho en", value: "Colombia" },
  ],
  Limpieza: [
    { label: "Rendimiento", value: "Hasta 80 lavadas" },
    { label: "Concentración", value: "Alta" },
    { label: "Fragancia", value: "Brisa marina" },
    { label: "Biodegradable", value: "Sí" },
  ],
  "Cuidado Personal": [
    { label: "pH", value: "Balanceado (5.5)" },
    { label: "Libre de parabenos", value: "Sí" },
    { label: "Tipo de piel", value: "Todo tipo" },
    { label: "Dermatológicamente probado", value: "Sí" },
  ],
  "Cuidado del Bebé": [
    { label: "Hipoalergénico", value: "Sí" },
    { label: "Libre de fragancias fuertes", value: "Sí" },
    { label: "Dermatológicamente probado", value: "Sí" },
    { label: "Edad recomendada", value: "Desde el nacimiento" },
  ],
};

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);

function getSpec(category: string) {
  return (
    MOCK_SPECS[category] ?? [
      { label: "Contenido neto", value: "Ver empaque" },
      { label: "País de origen", value: "Colombia" },
      { label: "Registro", value: "RSA-F-0012345" },
      { label: "Garantía", value: "Según fabricante" },
    ]
  );
}

const MOCK_DESCRIPTIONS: Record<string, string> = {
  "Carnes y Pollo":
    "Producto de primera calidad, seleccionado directamente de proveedores locales certificados. Garantizamos la cadena de frío y frescura desde el origen hasta tu mesa.",
  Lácteos:
    "Producto lácteo de alta calidad elaborado con leche fresca de vacas alimentadas en pasturas naturales. Rico en calcio, proteínas y vitaminas esenciales.",
  "Frutas y Verduras":
    "Producto fresco traído directamente de las fincas de la región. Sin conservantes, seleccionado en su punto óptimo de madurez para garantizar el mejor sabor.",
  Despensa:
    "Producto de despensa esencial para tu hogar. Elaborado con ingredientes de alta calidad y procesos certificados de inocuidad alimentaria.",
  Limpieza:
    "Fórmula concentrada de alto rendimiento. Eficaz contra el 99.9% de gérmenes y bacterias, con un aroma fresco duradero.",
  "Cuidado Personal":
    "Formulado dermatológicamente para el cuidado diario. pH balanceado, sin parabenos. Adecuado para todo tipo de piel.",
  "Cuidado del Bebé":
    "Especialmente formulado para la delicada piel del bebé. Dermatológicamente probado, hipoalergénico y libre de sustancias agresivas.",
  "Vinos y Licores":
    "Seleccionado por nuestros expertos enólogos. Proveniente de viñedos de altitud con características organolépticas excepcionales.",
  Hogar:
    "Diseñado para durar. Fabricado con materiales resistentes y de alta calidad para el uso cotidiano del hogar.",
  Tecnología:
    "Tecnología de última generación. Compatible con los principales estándares del mercado, con garantía oficial del fabricante.",
  Mascotas:
    "Nutricionalmente balanceado para cubrir todas las necesidades de tu mascota en cada etapa de su vida.",
  Electrodomésticos:
    "Electrodoméstico de alta eficiencia energética. Certificado con garantía del fabricante y soporte técnico especializado.",
};

export function ProductDetailModal({
  product,
  cartItems,
  onAdd,
  onRemove,
  onClose,
}: ProductDetailModalProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const inCart = product ? cartItems.find((c) => c.id === product.id) : null;
  const qty = inCart?.quantity ?? 0;

  useEffect(() => {
    if (!product) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let mounted = true;

    const loadRelatedProducts = async () => {
      if (!product) return;
      const related = await catalogService.getRelatedProducts(product);
      if (mounted) {
        setRelatedProducts(related.slice(0, 4));
      }
    };

    loadRelatedProducts();

    return () => {
      mounted = false;
    };
  }, [product]);

  if (!product) return null;

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const specs = getSpec(product.category);
  const description =
    MOCK_DESCRIPTIONS[product.category] ??
    "Producto de excelente calidad seleccionado por el equipo Mercaldas para garantizar la mejor experiencia de compra.";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative bg-background w-full sm:max-w-3xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: "slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors backdrop-blur-sm"
        >
          <X className="w-4.5 h-4.5 text-foreground" />
        </button>

        <div className="overflow-y-auto flex-1">
          {/* Hero image + info */}
          <div className="grid sm:grid-cols-2">
            {/* Image */}
            <div className="relative bg-muted aspect-square">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <span
                  className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full text-white"
                  style={{
                    background:
                      product.badge === "Nuevo" ? "#1A1A2E" : "#FF4444",
                  }}
                >
                  {product.badge}
                </span>
              )}
              {discount && (
                <div
                  className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "#FF4444" }}
                >
                  <TrendingUp className="w-3 h-3" />
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-5 flex flex-col gap-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {product.category}
                </p>
                <h2
                  className="text-xl font-bold text-foreground leading-tight mt-1"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  {product.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {product.unit}
                </p>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-2">
                <span
                  className="text-3xl font-bold text-foreground"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  {fmt(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-muted-foreground line-through">
                    {fmt(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Stepper */}
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center border border-border rounded-xl overflow-hidden flex-shrink-0">
                  <button
                    onClick={() => onRemove(product.id)}
                    disabled={qty === 0}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-25"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-base tabular-nums">
                    {qty}
                  </span>
                  <button
                    onClick={() => onAdd(product)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => onAdd(product)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all hover:brightness-95 active:scale-[0.98]"
                  style={{ background: "#FFF200", color: "#1A1A2E" }}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {qty === 0 ? "Agregar al carrito" : "Agregar uno más"}
                </button>
              </div>

              {qty > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  {qty} {qty === 1 ? "unidad" : "unidades"} en el carrito ·
                  subtotal {fmt(product.price * qty)}
                </p>
              )}

              {/* Description */}
              <div className="border-t border-border pt-3">
                <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-1.5">
                  Descripción
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Specs */}
              <div className="border-t border-border pt-3">
                <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-2">
                  Especificaciones
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {specs.map((s) => (
                    <div key={s.label}>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="text-xs font-semibold text-foreground">
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Related products */}
          {relatedProducts.length > 0 && (
            <div className="border-t border-border px-5 py-4">
              <p className="text-sm font-bold text-foreground mb-3">
                Productos relacionados
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedProducts.map((rp) => {
                  const rpInCart = cartItems.find((c) => c.id === rp.id);
                  const rpQty = rpInCart?.quantity ?? 0;
                  return (
                    <div
                      key={rp.id}
                      className="border border-border rounded-xl overflow-hidden"
                    >
                      <div className="aspect-square bg-muted">
                        <img
                          src={rp.image}
                          alt={rp.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-semibold line-clamp-2 text-foreground leading-snug">
                          {rp.name}
                        </p>
                        <p
                          className="text-xs font-bold mt-1"
                          style={{
                            fontFamily: "'Bricolage Grotesque', sans-serif",
                          }}
                        >
                          {fmt(rp.price)}
                        </p>
                        <div className="flex items-center border border-border rounded-lg overflow-hidden mt-1.5">
                          <button
                            onClick={() => onRemove(rp.id)}
                            disabled={rpQty === 0}
                            className="flex-1 flex items-center justify-center py-1 disabled:opacity-25 hover:bg-muted transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-6 text-center">
                            {rpQty}
                          </span>
                          <button
                            onClick={() => onAdd(rp)}
                            className="flex-1 flex items-center justify-center py-1 hover:bg-muted transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(40px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
    </div>
  );
}

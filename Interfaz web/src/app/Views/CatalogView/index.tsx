import { useEffect, useState } from "react";
import {
  Search,
  ShoppingCart,
  MapPin,
  User,
  Package,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  Trash2,
  X,
  Truck,
  CreditCard,
  ShieldCheck,
  Clock,
  Phone,
  Store,
  Menu,
  TrendingUp,
  ArrowUpRight,
  Beef,
  Baby,
  Milk,
  Zap,
  PawPrint,
  Apple,
  Sparkles,
  ShoppingBag,
  Laptop,
  Home,
  Wine,
  Heart,
  Mail,
  Bone as Facebook,
  Bone as Instagram,
  Bone as Twitter,
  Bone as Youtube,
  ChevronDown,
  CheckCircle2,
  ArrowLeft,
  Building2,
  Wallet,
  Banknote,
  Smartphone,
} from "lucide-react";
import { useCatalog } from "../../../hooks/useCatalog";
import { InfiniteScrollTrigger } from "./InfiniteScrollTrigger";
import { ProductCard } from "./ProductCard";
import { CatalogPageProps, Product } from "../../types";

const PRICE_RANGES = [
  { id: "all", label: "Todos los precios" },
  { id: "0-10000", label: "Hasta $10.000" },
  { id: "10000-30000", label: "$10.000 – $30.000" },
  { id: "30000-70000", label: "$30.000 – $70.000" },
  { id: "70000+", label: "Más de $70.000" },
];

const SORT_OPTIONS = [
  { id: "relevancia", label: "Relevancia" },
  { id: "precio-asc", label: "Precio: menor a mayor" },
  { id: "precio-desc", label: "Precio: mayor a menor" },
  { id: "descuento", label: "Mayor descuento" },
  { id: "nombre", label: "Nombre A–Z" },
];

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Pechuga de Pollo Fresca x kg",
    price: 12900,
    originalPrice: 15900,
    image:
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=400&fit=crop&auto=format",
    category: "Carnes y Pollo",
    badge: "19% OFF",
    tabs: ["vendidos", "promociones"],
    unit: "x kg",
  },
  {
    id: 2,
    name: "Leche Entera Alquería 1.1 L",
    price: 4350,
    image:
      "https://images.unsplash.com/photo-1604095853918-1a1823a63dd5?w=400&h=400&fit=crop&auto=format",
    category: "Lácteos",
    tabs: ["vendidos", "recomendados"],
    unit: "x 1.1 L",
  },
  {
    id: 3,
    name: "Arroz Diana Extra Premium 5 kg",
    price: 22500,
    originalPrice: 26000,
    image:
      "https://images.unsplash.com/photo-1557844352-761f2565b576?w=400&h=400&fit=crop&auto=format",
    category: "Despensa",
    badge: "13% OFF",
    tabs: ["vendidos", "promociones"],
    unit: "x 5 kg",
  },
  {
    id: 4,
    name: "Huevos AA Blancos x30",
    price: 18900,
    image:
      "https://images.unsplash.com/photo-1729622493745-03ca9590c64a?w=400&h=400&fit=crop&auto=format",
    category: "Lácteos",
    tabs: ["vendidos", "recomendados"],
    unit: "x 30 und",
  },
  {
    id: 5,
    name: "Tomates Chonto Frescos x 500 g",
    price: 3200,
    originalPrice: 4500,
    image:
      "https://images.unsplash.com/photo-1485637701894-09ad422f6de6?w=400&h=400&fit=crop&auto=format",
    category: "Frutas y Verduras",
    badge: "29% OFF",
    tabs: ["promociones", "recomendados"],
    unit: "x 500 g",
  },
  {
    id: 6,
    name: "Aguacate Hass Mediano x und",
    price: 2800,
    image:
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=400&fit=crop&auto=format",
    category: "Frutas y Verduras",
    tabs: ["vendidos", "recomendados"],
    unit: "x und",
  },
  {
    id: 7,
    name: "Detergente Ariel Líquido 3 L",
    price: 28900,
    originalPrice: 35900,
    image:
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=400&fit=crop&auto=format",
    category: "Limpieza",
    badge: "20% OFF",
    tabs: ["promociones", "vendidos"],
    unit: "x 3 L",
  },
  {
    id: 8,
    name: "Jabón Protex Original x3",
    price: 14500,
    originalPrice: 17000,
    image:
      "https://images.unsplash.com/photo-1624372635277-283042097f31?w=400&h=400&fit=crop&auto=format",
    category: "Cuidado Personal",
    badge: "15% OFF",
    tabs: ["novedades", "promociones"],
    unit: "x 3 und",
  },
  {
    id: 9,
    name: "Pañales Huggies Talla M x40",
    price: 69900,
    originalPrice: 79900,
    image:
      "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400&h=400&fit=crop&auto=format",
    category: "Cuidado del Bebé",
    badge: "13% OFF",
    tabs: ["vendidos", "promociones"],
    unit: "x 40 und",
  },
  {
    id: 10,
    name: "Queso Campesino Fresco x500 g",
    price: 12500,
    image:
      "https://images.unsplash.com/photo-1566454825481-4e48f80aa4d7?w=400&h=400&fit=crop&auto=format",
    category: "Lácteos",
    badge: "Nuevo",
    tabs: ["novedades", "recomendados"],
    unit: "x 500 g",
  },
  {
    id: 11,
    name: "Aceite Palmera Vegetal 3 L",
    price: 19900,
    originalPrice: 24500,
    image:
      "https://images.unsplash.com/photo-1609780447631-05b93e5a88ea?w=400&h=400&fit=crop&auto=format",
    category: "Despensa",
    badge: "19% OFF",
    tabs: ["vendidos", "promociones"],
    unit: "x 3 L",
  },
  {
    id: 12,
    name: "Vino Casillero Cabernet 750 mL",
    price: 38900,
    originalPrice: 46000,
    image:
      "https://images.unsplash.com/photo-1527264935190-1401c51b5bbc?w=400&h=400&fit=crop&auto=format",
    category: "Vinos y Licores",
    badge: "16% OFF",
    tabs: ["novedades", "promociones"],
    unit: "x 750 mL",
  },
  {
    id: 13,
    name: "Café Juan Valdez Molido 500 g",
    price: 32500,
    image:
      "https://images.unsplash.com/photo-1512106374988-c95f566d39ef?w=400&h=400&fit=crop&auto=format",
    category: "Despensa",
    tabs: ["recomendados", "vendidos"],
    unit: "x 500 g",
  },
  {
    id: 14,
    name: "Shampoo Head & Shoulders 700 mL",
    price: 22900,
    originalPrice: 27500,
    image:
      "https://images.unsplash.com/photo-1649005011845-ef225c89da86?w=400&h=400&fit=crop&auto=format",
    category: "Cuidado Personal",
    badge: "17% OFF",
    tabs: ["promociones", "recomendados"],
    unit: "x 700 mL",
  },
  {
    id: 15,
    name: "Pasta Doria Espagueti x500 g",
    price: 3800,
    image:
      "https://images.unsplash.com/photo-1685564060600-53036354762b?w=400&h=400&fit=crop&auto=format",
    category: "Despensa",
    badge: "Nuevo",
    tabs: ["novedades", "recomendados"],
    unit: "x 500 g",
  },
  {
    id: 16,
    name: "Limpiapisos Fabuloso Lavanda 1.8 L",
    price: 9900,
    originalPrice: 12500,
    image:
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=400&fit=crop&auto=format",
    category: "Limpieza",
    badge: "21% OFF",
    tabs: ["novedades", "promociones"],
    unit: "x 1.8 L",
  },
  {
    id: 17,
    name: "Plátano Maduro x kg",
    price: 2500,
    image:
      "https://images.unsplash.com/photo-1560960378-8435837546b7?w=400&h=400&fit=crop&auto=format",
    category: "Frutas y Verduras",
    tabs: ["vendidos", "recomendados"],
    unit: "x kg",
  },
  {
    id: 18,
    name: "Papa Criolla Limpia x kg",
    price: 3800,
    originalPrice: 4800,
    image:
      "https://images.unsplash.com/photo-1589894308598-8ddba0593e91?w=400&h=400&fit=crop&auto=format",
    category: "Frutas y Verduras",
    badge: "21% OFF",
    tabs: ["promociones", "vendidos"],
    unit: "x kg",
  },
  {
    id: 19,
    name: "Carne Molida de Res x kg",
    price: 18500,
    image:
      "https://images.unsplash.com/photo-1690983323238-0b91789e1b5a?w=400&h=400&fit=crop&auto=format",
    category: "Carnes y Pollo",
    tabs: ["vendidos", "recomendados"],
    unit: "x kg",
  },
  {
    id: 20,
    name: "Yogurt Alpina Trozos Fresa 200 g",
    price: 2900,
    image:
      "https://images.unsplash.com/photo-1604095853918-1a1823a63dd5?w=400&h=400&fit=crop&auto=format",
    category: "Lácteos",
    badge: "Nuevo",
    tabs: ["novedades", "recomendados"],
    unit: "x 200 g",
  },
  {
    id: 21,
    name: "Mantequilla Anchor Sin Sal 200 g",
    price: 11900,
    originalPrice: 14200,
    image:
      "https://images.unsplash.com/photo-1566454825481-4e48f80aa4d7?w=400&h=400&fit=crop&auto=format",
    category: "Lácteos",
    badge: "16% OFF",
    tabs: ["promociones", "recomendados"],
    unit: "x 200 g",
  },
  {
    id: 22,
    name: "Frijoles Cargamanto x kg",
    price: 7200,
    image:
      "https://images.unsplash.com/photo-1557844352-761f2565b576?w=400&h=400&fit=crop&auto=format",
    category: "Despensa",
    tabs: ["vendidos", "recomendados"],
    unit: "x kg",
  },
  {
    id: 23,
    name: "Atún Van Camps en Agua x3",
    price: 14500,
    originalPrice: 17000,
    image:
      "https://images.unsplash.com/photo-1685564060600-53036354762b?w=400&h=400&fit=crop&auto=format",
    category: "Despensa",
    badge: "15% OFF",
    tabs: ["promociones", "vendidos"],
    unit: "x 3 und",
  },
  {
    id: 24,
    name: "Papel Higiénico Scott Doble Hoja x12",
    price: 22900,
    originalPrice: 27000,
    image:
      "https://images.unsplash.com/photo-1649005011845-ef225c89da86?w=400&h=400&fit=crop&auto=format",
    category: "Limpieza",
    badge: "15% OFF",
    tabs: ["vendidos", "promociones"],
    unit: "x 12 und",
  },
  {
    id: 25,
    name: "Crema Dental Colgate Triple Acción x2",
    price: 12800,
    image:
      "https://images.unsplash.com/photo-1624372635277-283042097f31?w=400&h=400&fit=crop&auto=format",
    category: "Cuidado Personal",
    tabs: ["vendidos", "recomendados"],
    unit: "x 2 und",
  },
  {
    id: 26,
    name: "Pañales Pampers Baby-Dry Talla G x36",
    price: 74900,
    originalPrice: 89000,
    image:
      "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400&h=400&fit=crop&auto=format",
    category: "Cuidado del Bebé",
    badge: "16% OFF",
    tabs: ["promociones", "vendidos"],
    unit: "x 36 und",
  },
  {
    id: 27,
    name: "Comida Whiskas Gato Adulto 500 g",
    price: 9500,
    originalPrice: 11200,
    image:
      "https://images.unsplash.com/photo-1729622493745-03ca9590c64a?w=400&h=400&fit=crop&auto=format",
    category: "Mascotas",
    badge: "15% OFF",
    tabs: ["promociones", "recomendados"],
    unit: "x 500 g",
  },
  {
    id: 28,
    name: "Cerveza Águila Lata x6",
    price: 18500,
    image:
      "https://images.unsplash.com/photo-1527264935190-1401c51b5bbc?w=400&h=400&fit=crop&auto=format",
    category: "Vinos y Licores",
    tabs: ["vendidos", "recomendados"],
    unit: "x 6 und",
  },
  {
    id: 29,
    name: "Aceite de Oliva Dante Extra Virgen 500 mL",
    price: 29900,
    originalPrice: 35000,
    image:
      "https://images.unsplash.com/photo-1609780447631-05b93e5a88ea?w=400&h=400&fit=crop&auto=format",
    category: "Despensa",
    badge: "15% OFF",
    tabs: ["novedades", "promociones"],
    unit: "x 500 mL",
  },
  {
    id: 30,
    name: "Shampoo Pantene Pro-V 400 mL",
    price: 19900,
    originalPrice: 24500,
    image:
      "https://images.unsplash.com/photo-1649005011845-ef225c89da86?w=400&h=400&fit=crop&auto=format",
    category: "Cuidado Personal",
    badge: "19% OFF",
    tabs: ["promociones", "vendidos"],
    unit: "x 400 mL",
  },
  {
    id: 31,
    name: "Lentejas Verdes x500 g",
    price: 4800,
    image:
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=400&fit=crop&auto=format",
    category: "Despensa",
    badge: "Nuevo",
    tabs: ["novedades", "recomendados"],
    unit: "x 500 g",
  },
  {
    id: 32,
    name: "Jabón de Manos Protex Líquido 221 mL",
    price: 8900,
    originalPrice: 10500,
    image:
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=400&fit=crop&auto=format",
    category: "Cuidado Personal",
    badge: "15% OFF",
    tabs: ["promociones", "novedades"],
    unit: "x 221 mL",
  },
];

const FALLBACK_CATEGORIES = [
  {
    id: 1,
    name: "Carnes y Pollo",
    icon: Beef,
    color: "#FF6B6B",
    bg: "#FFF0F0",
  },
  {
    id: 2,
    name: "Cuidado del Bebé",
    icon: Baby,
    color: "#FF9F7F",
    bg: "#FFF5F0",
  },
  { id: 3, name: "Lácteos", icon: Milk, color: "#4FC3F7", bg: "#F0F9FF" },
  {
    id: 4,
    name: "Electrodomésticos",
    icon: Zap,
    color: "#FFB300",
    bg: "#FFFBF0",
  },
  { id: 5, name: "Mascotas", icon: PawPrint, color: "#A5D6A7", bg: "#F0FFF0" },
  {
    id: 6,
    name: "Frutas y Verduras",
    icon: Apple,
    color: "#66BB6A",
    bg: "#F0FBF0",
  },
  { id: 7, name: "Limpieza", icon: Sparkles, color: "#29B6F6", bg: "#F0F8FF" },
  {
    id: 8,
    name: "Despensa",
    icon: ShoppingBag,
    color: "#FF8A65",
    bg: "#FFF3F0",
  },
  { id: 9, name: "Tecnología", icon: Laptop, color: "#7986CB", bg: "#F3F0FF" },
  { id: 10, name: "Hogar", icon: Home, color: "#8D6E63", bg: "#FBF8F5" },
  {
    id: 11,
    name: "Vinos y Licores",
    icon: Wine,
    color: "#AB47BC",
    bg: "#F9F0FF",
  },
  {
    id: 12,
    name: "Cuidado Personal",
    icon: Heart,
    color: "#EC407A",
    bg: "#FFF0F6",
  },
];

export function CatalogPage({
  cartItems,
  onAdd,
  onRemove,
  onBack,
  onProductClick,
  catalogCategory,
  setCatalogCategory,
  catalogOnSale,
  setCatalogOnSale,
  catalogPriceRange,
  setCatalogPriceRange,
  catalogSort,
  setCatalogSort,
  catalogSearch,
  setCatalogSearch,
  mobileFiltersOpen,
  setMobileFiltersOpen,
}: CatalogPageProps) {
  const { categories, products, loading: catalogLoading } = useCatalog();
  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    catalogCategory,
    catalogOnSale,
    catalogPriceRange,
    catalogSort,
    catalogSearch,
  ]);

  const toggleCategory = (cat: string) => {
    setCatalogCategory(
      catalogCategory.includes(cat)
        ? catalogCategory.filter((c) => c !== cat)
        : [...catalogCategory, cat],
    );
  };

  const priceMatch = (p: Product) => {
    const price = p.price;
    if (catalogPriceRange === "all") return true;
    if (catalogPriceRange === "0-10000") return price <= 10000;
    if (catalogPriceRange === "10000-30000")
      return price > 10000 && price <= 30000;
    if (catalogPriceRange === "30000-70000")
      return price > 30000 && price <= 70000;
    if (catalogPriceRange === "70000+") return price > 70000;
    return true;
  };

  const catalogProducts = products.length > 0 ? products : FALLBACK_PRODUCTS;
  const catalogCategories =
    categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  let filtered = catalogProducts.filter((p) => {
    const catMatch =
      catalogCategory.length === 0 || catalogCategory.includes(p.category);
    const saleMatch = !catalogOnSale || !!p.originalPrice;
    const searchMatch =
      catalogSearch.trim() === "" ||
      p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(catalogSearch.toLowerCase());
    return catMatch && saleMatch && priceMatch(p) && searchMatch;
  });

  if (catalogSort === "precio-asc")
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (catalogSort === "precio-desc")
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  else if (catalogSort === "descuento")
    filtered = [...filtered].sort((a, b) => {
      const dA = a.originalPrice
        ? (a.originalPrice - a.price) / a.originalPrice
        : 0;
      const dB = b.originalPrice
        ? (b.originalPrice - b.price) / b.originalPrice
        : 0;
      return dB - dA;
    });
  else if (catalogSort === "nombre")
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  const activeFilterCount =
    catalogCategory.length +
    (catalogOnSale ? 1 : 0) +
    (catalogPriceRange !== "all" ? 1 : 0);

  const clearAll = () => {
    setCatalogCategory([]);
    setCatalogOnSale(false);
    setCatalogPriceRange("all");
    setCatalogSearch("");
  };

  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-bold text-sm text-foreground mb-3">Categorías</h3>
        <div className="space-y-1.5">
          {catalogCategories.map((cat) => {
            const Icon = cat.icon;
            const count = catalogProducts.filter(
              (p) => p.category === cat.name,
            ).length;
            const checked = catalogCategory.includes(cat.name);
            return (
              <label
                key={cat.id}
                className="flex items-center gap-2.5 py-1 px-2 rounded-lg cursor-pointer hover:bg-muted transition-colors group"
              >
                <div
                  className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    borderColor: checked ? "#1A1A2E" : "#D1D5DB",
                    background: checked ? "#1A1A2E" : "white",
                  }}
                  onClick={() => toggleCategory(cat.name)}
                >
                  {checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4l2.5 2.5L9 1"
                        stroke="#FFF200"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <div
                  className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                  style={{ background: cat.bg }}
                >
                  <Icon className="w-3 h-3" style={{ color: cat.color }} />
                </div>
                <span
                  className="text-sm flex-1 transition-colors"
                  style={{
                    color: checked ? "#1A1A2E" : "#6B7280",
                    fontWeight: checked ? 600 : 400,
                  }}
                  onClick={() => toggleCategory(cat.name)}
                >
                  {cat.name}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price range */}
      <div className="border-t border-border pt-5">
        <h3 className="font-bold text-sm text-foreground mb-3">
          Rango de precio
        </h3>
        <div className="space-y-1.5">
          {PRICE_RANGES.map((r) => (
            <label
              key={r.id}
              className="flex items-center gap-2.5 py-1 px-2 rounded-lg cursor-pointer hover:bg-muted transition-colors"
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{
                  borderColor:
                    catalogPriceRange === r.id ? "#1A1A2E" : "#D1D5DB",
                }}
                onClick={() => setCatalogPriceRange(r.id)}
              >
                {catalogPriceRange === r.id && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: "#1A1A2E" }}
                  />
                )}
              </div>
              <span
                className="text-sm cursor-pointer"
                style={{
                  color: catalogPriceRange === r.id ? "#1A1A2E" : "#6B7280",
                  fontWeight: catalogPriceRange === r.id ? 600 : 400,
                }}
                onClick={() => setCatalogPriceRange(r.id)}
              >
                {r.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* On sale */}
      <div className="border-t border-border pt-5">
        <label className="flex items-center justify-between cursor-pointer group">
          <div>
            <p className="font-bold text-sm text-foreground">Solo ofertas</p>
            <p className="text-xs text-muted-foreground">
              Productos con descuento
            </p>
          </div>
          <div
            className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
            style={{ background: catalogOnSale ? "#FFF200" : "#E5E7EB" }}
            onClick={() => setCatalogOnSale(!catalogOnSale)}
          >
            <div
              className="absolute top-1 w-4 h-4 rounded-full bg-foreground transition-all shadow-sm"
              style={{ left: catalogOnSale ? "calc(100% - 20px)" : "4px" }}
            />
          </div>
        </label>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearAll}
          className="w-full py-2 rounded-xl text-sm font-semibold text-muted-foreground border border-border hover:border-foreground hover:text-foreground transition-all"
        >
          Limpiar todos los filtros
        </button>
      )}
    </div>
  );

  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="bg-muted/40" style={{ minHeight: "calc(100vh - 108px)" }}>
      {/* ── Two-column body ── */}
      <div className="max-w-7xl mx-auto px-4 py-5 flex gap-5 items-start">
        {/* Desktop sidebar */}
        <aside
          className="hidden md:flex flex-col w-56 flex-shrink-0 bg-white rounded-xl border border-border overflow-hidden"
          style={{
            position: "sticky",
            top: "80px",
            maxHeight: "calc(100vh - 96px)",
            overflowY: "auto",
          }}
        >
          {/* Search inside sidebar */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Buscar en catálogo..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-border bg-muted/60 focus:outline-none"
                onFocus={(e) => {
                  e.target.style.boxShadow = "0 0 0 2px #FFF200";
                  e.target.style.borderColor = "#FFF200";
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = "";
                }}
              />
            </div>
          </div>
          <div className="p-4">
            <SidebarContent />
          </div>
        </aside>

        {/* Products column */}
        <div
          className="flex-1 min-w-0 flex flex-col"
          style={{ minHeight: "calc(100vh - 200px)" }}
        >
          {/* Sort row + mobile filters trigger */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-sm text-muted-foreground hidden md:block">
              <strong className="text-foreground">{filtered.length}</strong>{" "}
              productos
            </p>
            <div className="flex items-center gap-2 ml-auto">
              {/* Mobile filters button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold md:hidden hover:bg-muted transition-colors"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                  <line x1="11" y1="18" x2="13" y2="18" />
                </svg>
                Filtros
                {activeFilterCount > 0 && (
                  <span
                    className="w-4 h-4 rounded-full text-xs font-black flex items-center justify-center"
                    style={{ background: "#FFF200", color: "#1A1A2E" }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>
              {/* Sort */}
              <select
                value={catalogSort}
                onChange={(e) => setCatalogSort(e.target.value)}
                className="pl-3 pr-7 py-2 text-xs rounded-lg border border-border bg-white focus:outline-none appearance-none cursor-pointer font-medium"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 6px center",
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {(catalogCategory.length > 0 ||
            catalogOnSale ||
            catalogPriceRange !== "all" ||
            catalogSearch) && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {catalogCategory.map((cat) => (
                <span
                  key={cat}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border-2 border-foreground text-foreground"
                >
                  {cat}
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="hover:opacity-60 ml-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              {catalogOnSale && (
                <span
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ background: "#FF4444" }}
                >
                  Solo ofertas
                  <button
                    onClick={() => setCatalogOnSale(false)}
                    className="hover:opacity-70 ml-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {catalogPriceRange !== "all" && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border border-border text-muted-foreground">
                  {PRICE_RANGES.find((r) => r.id === catalogPriceRange)?.label}
                  <button
                    onClick={() => setCatalogPriceRange("all")}
                    className="hover:opacity-70 ml-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {catalogSearch && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border border-border text-muted-foreground">
                  "{catalogSearch}"
                  <button
                    onClick={() => setCatalogSearch("")}
                    className="hover:opacity-70 ml-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground underline hover:text-foreground transition-colors self-center ml-1"
              >
                Limpiar todo
              </button>
            </div>
          )}

          {/* Grid */}
          {filtered.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 flex-1">
                {catalogLoading ? (
                  <div className="col-span-full text-center py-12 text-sm text-muted-foreground">
                    Cargando catálogo...
                  </div>
                ) : (
                  visibleProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      cartItems={cartItems}
                      onAdd={onAdd}
                      onRemove={onRemove}
                      onProductClick={onProductClick}
                    />
                  ))
                )}
              </div>

              {/* Sentinel + skeletons */}
              {hasMore && (
                <InfiniteScrollTrigger
                  onIntersect={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  count={Math.min(PAGE_SIZE, filtered.length - visibleCount)}
                />
              )}

              {!hasMore && filtered.length > PAGE_SIZE && (
                <p className="text-center text-xs text-muted-foreground mt-10 pb-8">
                  ✓ Has visto todos los {filtered.length} productos
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="font-bold text-foreground">Sin resultados</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Intenta con otros filtros o categorías.
              </p>
              <button
                onClick={clearAll}
                className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-95"
                style={{ background: "#FFF200", color: "#1A1A2E" }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filters drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-72 bg-white h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <h2 className="font-bold text-base">Filtros</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <SidebarContent />
            </div>
            <div className="border-t border-border p-4">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:brightness-95"
                style={{ background: "#1A1A2E", color: "#FFF200" }}
              >
                Ver {filtered.length} productos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

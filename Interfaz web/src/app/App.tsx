import { useState, useEffect, useRef } from "react";
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

/* ─── Types ──────────────────────────────────────────────── */
interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  badge?: string;
  tabs: string[];
  unit: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  bg: string;
  accent: string;
}

interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  shipping: number;
  address: string;
  paymentMethod: string;
  status: "preparando" | "en camino" | "entregado";
}

/* ─── Data ───────────────────────────────────────────────── */
const CATEGORIES = [
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

const PRODUCTS: Product[] = [
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

const HERO_SLIDES: Slide[] = [
  {
    id: 1,
    title: "Frutas y Verduras\nFrescas del Día",
    subtitle:
      "Directo de los mejores cultivadores de la región. Frescura garantizada en cada entrega.",
    cta: "Ver Frutas y Verduras",
    image:
      "https://images.unsplash.com/photo-1729622493745-03ca9590c64a?w=1200&h=600&fit=crop&auto=format",
    bg: "#1A1A2E",
    accent: "#FFF200",
  },
  {
    id: 2,
    title: "Hasta 30% OFF\nen Productos Seleccionados",
    subtitle:
      "Aprovecha nuestras promociones de temporada. Ofertas válidas hasta agotar existencias.",
    cta: "Ver Todas las Ofertas",
    image:
      "https://images.unsplash.com/photo-1607083207685-aaf05f2c908c?w=1200&h=600&fit=crop&auto=format",
    bg: "#8B0000",
    accent: "#FFF200",
  },
  {
    id: 3,
    title: "Tu Mercado Completo\nSin Salir de Casa",
    subtitle: "Miles de productos, domicilio en Manizales en menos de 2 horas.",
    cta: "Empezar a Comprar",
    image:
      "https://images.unsplash.com/photo-1533413710577-c1b62c5fc55b?w=1200&h=600&fit=crop&auto=format",
    bg: "#1A4A2E",
    accent: "#FFF200",
  },
];

const SUCURSALES = [
  {
    id: 1,
    name: "Mercaldas Milán",
    barrio: "Milán",
    address: "Cra 23 # 64-60, Barrio Milán",
    hours: "Lun–Dom 6am–10pm",
    phone: "(606) 890-1001",
    services: ["Domicilios", "Parqueadero", "Panadería", "Carnicería"],
    image:
      "https://images.unsplash.com/photo-1779370139349-c5a1d667cc9e?w=400&h=260&fit=crop&auto=format",
    badge: "Principal",
  },
  {
    id: 2,
    name: "Mercaldas El Cable",
    barrio: "El Cable",
    address: "Cll 65 # 23B-10, Barrio El Cable",
    hours: "Lun–Dom 7am–9pm",
    phone: "(606) 890-1002",
    services: ["Domicilios", "Parqueadero", "Drogería"],
    image:
      "https://images.unsplash.com/photo-1759178388578-d3589d058c0f?w=400&h=260&fit=crop&auto=format",
    badge: null,
  },
  {
    id: 3,
    name: "Mercaldas Chipre",
    barrio: "Chipre",
    address: "Av. 12 de Octubre # 41-55, Chipre",
    hours: "Lun–Dom 7am–9pm",
    phone: "(606) 890-1003",
    services: ["Domicilios", "Recogida en tienda", "Panadería"],
    image:
      "https://images.unsplash.com/photo-1779370139349-c5a1d667cc9e?w=400&h=260&fit=crop&auto=format&crop=right",
    badge: null,
  },
  {
    id: 4,
    name: "Mercaldas Palermo",
    barrio: "Palermo",
    address: "Cra 18 # 70-24, Barrio Palermo",
    hours: "Lun–Dom 6am–10pm",
    phone: "(606) 890-1004",
    services: ["Domicilios", "Parqueadero", "Carnicería", "Licores"],
    image:
      "https://images.unsplash.com/photo-1758701446898-83d8dcf6309c?w=400&h=260&fit=crop&auto=format",
    badge: "24h Sáb",
  },
  {
    id: 5,
    name: "Mercaldas La Enea",
    barrio: "La Enea",
    address: "Cll 50 # 36-80, Barrio La Enea",
    hours: "Lun–Sáb 7am–8pm · Dom 8am–6pm",
    phone: "(606) 890-1005",
    services: ["Domicilios", "Recogida en tienda"],
    image:
      "https://images.unsplash.com/photo-1770993189356-f8def91ec5a5?w=400&h=260&fit=crop&auto=format",
    badge: null,
  },
  {
    id: 6,
    name: "Mercaldas Av. Santander",
    barrio: "Av. Santander",
    address: "Av. Santander # 52-34, Centro",
    hours: "Lun–Dom 6am–10pm",
    phone: "(606) 890-1006",
    services: [
      "Domicilios",
      "Parqueadero",
      "Panadería",
      "Drogería",
      "Carnicería",
    ],
    image:
      "https://images.unsplash.com/photo-1770927423667-3c701c99ba3a?w=400&h=260&fit=crop&auto=format",
    badge: "Nueva",
  },
];

const BENEFITS = [
  {
    icon: Truck,
    title: "Domicilio en 2 horas",
    desc: "Entregamos en toda el área metropolitana de Manizales con seguimiento en tiempo real.",
  },
  {
    icon: MapPin,
    title: "Cobertura completa",
    desc: "Barrios Milán, El Cable, Chipre, Palermo, La Enea y más de 50 zonas de la ciudad.",
  },
  {
    icon: CreditCard,
    title: "Múltiples métodos de pago",
    desc: "Efectivo, tarjeta de crédito/débito, Nequi, Daviplata, PSE y contra entrega.",
  },
  {
    icon: ShieldCheck,
    title: "Compra 100% segura",
    desc: "Transacciones cifradas, datos protegidos y garantía de devolución en todos los pedidos.",
  },
  {
    icon: Phone,
    title: "Atención al cliente",
    desc: "Lunes a domingo de 6 a.m. a 10 p.m. por WhatsApp, chat y línea directa.",
  },
  {
    icon: Store,
    title: "Recogida en tienda",
    desc: "Haz tu pedido en línea y recógelo en cualquiera de nuestras 8 sedes sin costo adicional.",
  },
];

const PAYMENT_ICONS = [
  "Visa",
  "Mastercard",
  "PSE",
  "Nequi",
  "Daviplata",
  "Efecty",
];

const PRODUCT_TABS = [
  { id: "vendidos", label: "Más Vendidos" },
  { id: "promociones", label: "Promociones" },
  { id: "recomendados", label: "Recomendados" },
  { id: "novedades", label: "Novedades" },
];

/* ─── Helpers ────────────────────────────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

/* ─── ProductCard ────────────────────────────────────────── */
interface ProductCardProps {
  product: Product;
  cartItems: CartItem[];
  onAdd: (p: Product) => void;
  onRemove: (id: number) => void;
  onProductClick: (p: Product) => void;
}

function ProductCard({
  product,
  cartItems,
  onAdd,
  onRemove,
  onProductClick,
}: ProductCardProps) {
  const inCart = cartItems.find((c) => c.id === product.id);
  const qty = inCart?.quantity ?? 0;

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
        {/* Quantity stepper — always visible */}
        <div className="flex items-center justify-between border border-border rounded-lg overflow-hidden mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(product.id);
            }}
            disabled={qty === 0}
            className="flex-1 flex items-center justify-center py-1.5 transition-colors disabled:opacity-25 hover:bg-muted"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="font-bold text-sm w-8 text-center tabular-nums">
            {qty}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(product);
            }}
            className="flex-1 flex items-center justify-center py-1.5 hover:bg-muted transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        {/* Agregar button — always visible */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(product);
          }}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-semibold text-sm mt-1.5 transition-all hover:brightness-95 active:scale-95"
          style={{ background: "#FFF200", color: "#1A1A2E" }}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          {qty === 0 ? "Agregar" : "Agregar uno más"}
        </button>
      </div>
    </div>
  );
}

/* ─── Product Detail Modal ───────────────────────────────── */
interface ProductDetailModalProps {
  product: Product | null;
  cartItems: CartItem[];
  onAdd: (p: Product) => void;
  onRemove: (id: number) => void;
  onClose: () => void;
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

function ProductDetailModal({
  product,
  cartItems,
  onAdd,
  onRemove,
  onClose,
}: ProductDetailModalProps) {
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

  if (!product) return null;

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id,
  ).slice(0, 4);

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

/* ─── Social Auth Buttons ────────────────────────────────── */
function SocialAuthButtons({ label }: { label: string }) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-border bg-white hover:bg-muted transition-colors text-sm font-semibold text-foreground"
      >
        {/* Google icon */}
        <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
          <path
            d="M43.611 20.083H42V20H24v8h11.303C33.92 32.657 29.418 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
            fill="#FFC107"
          />
          <path
            d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
            fill="#FF3D00"
          />
          <path
            d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.402 0-9.894-3.338-11.298-7.976l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
            fill="#4CAF50"
          />
          <path
            d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
            fill="#1976D2"
          />
        </svg>
        {label} con Google
      </button>
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-border text-sm font-semibold text-white transition-all hover:brightness-110"
        style={{ background: "#1877F2" }}
      >
        {/* Facebook icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.27h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
        </svg>
        {label} con Facebook
      </button>
      <div className="flex items-center gap-2 pt-1">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">
          o continúa con correo
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
    </div>
  );
}

/* ─── Logo ───────────────────────────────────────────────── */
function Logo({ dark = true }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-1 select-none">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-lg leading-none"
        style={{
          background: "#FFF200",
          color: "#1A1A2E",
          fontFamily: "'Bricolage Grotesque', sans-serif",
        }}
      >
        M
      </div>
      <span
        className="font-black text-xl tracking-tight leading-none"
        style={{
          color: dark ? "#1A1A2E" : "#ffffff",
          fontFamily: "'Bricolage Grotesque', sans-serif",
          letterSpacing: "-0.02em",
        }}
      >
        ERCALDAS
      </span>
    </div>
  );
}

/* ─── Skeleton card ─────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="aspect-square relative overflow-hidden bg-muted">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
            animation: "shimmer 1.4s infinite",
            backgroundSize: "200% 100%",
          }}
        />
      </div>
      <div className="p-3 space-y-2.5">
        <div className="relative overflow-hidden h-2.5 rounded bg-muted w-3/4">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
              animation: "shimmer 1.4s infinite",
              backgroundSize: "200% 100%",
            }}
          />
        </div>
        <div className="relative overflow-hidden h-2.5 rounded bg-muted w-1/2">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
              animation: "shimmer 1.4s infinite 0.2s",
              backgroundSize: "200% 100%",
            }}
          />
        </div>
        <div className="relative overflow-hidden h-4 rounded bg-muted w-1/3 mt-1">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
              animation: "shimmer 1.4s infinite 0.1s",
              backgroundSize: "200% 100%",
            }}
          />
        </div>
        <div className="relative overflow-hidden h-8 rounded-lg bg-muted mt-2">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
              animation: "shimmer 1.4s infinite 0.3s",
              backgroundSize: "200% 100%",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Infinite scroll trigger ────────────────────────────── */
function InfiniteScrollTrigger({
  onIntersect,
  count,
}: {
  onIntersect: () => void;
  count: number;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !firedRef.current) {
          firedRef.current = true;
          setTimeout(onIntersect, 600);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onIntersect]);

  return (
    <div>
      {/* Skeleton grid shown while scrolling into view */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mt-3">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      {/* Invisible sentinel at the bottom */}
      <div ref={sentinelRef} className="h-1 w-full" />
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

/* ─── Catalog Page ───────────────────────────────────────── */
interface CatalogPageProps {
  cartItems: CartItem[];
  onAdd: (p: Product) => void;
  onRemove: (id: number) => void;
  onBack: () => void;
  onOpenCategory: (cat: string) => void;
  onProductClick: (p: Product) => void;
  catalogCategory: string[];
  setCatalogCategory: (v: string[]) => void;
  catalogOnSale: boolean;
  setCatalogOnSale: (v: boolean) => void;
  catalogPriceRange: string;
  setCatalogPriceRange: (v: string) => void;
  catalogSort: string;
  setCatalogSort: (v: string) => void;
  catalogSearch: string;
  setCatalogSearch: (v: string) => void;
  mobileFiltersOpen: boolean;
  setMobileFiltersOpen: (v: boolean) => void;
}

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

function CatalogPage({
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

  let filtered = PRODUCTS.filter((p) => {
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
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = PRODUCTS.filter(
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
                {visibleProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    cartItems={cartItems}
                    onAdd={onAdd}
                    onRemove={onRemove}
                    onProductClick={onProductClick}
                  />
                ))}
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

/* ─── Main App ───────────────────────────────────────────── */
export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "catalog">("home");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("vendidos");
  // catalog filters
  const [catalogCategory, setCatalogCategory] = useState<string[]>([]);
  const [catalogOnSale, setCatalogOnSale] = useState(false);
  const [catalogPriceRange, setCatalogPriceRange] = useState<string>("all");
  const [catalogSort, setCatalogSort] = useState("relevancia");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loginModal, setLoginModal] = useState(false);
  const [modalView, setModalView] = useState<"choice" | "login" | "register">(
    "choice",
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [checkoutAddress, setCheckoutAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "Manizales",
    notes: "",
  });
  const [checkoutShipping, setCheckoutShipping] = useState<
    "standard" | "express"
  >("standard");
  const [checkoutPayment, setCheckoutPayment] = useState<
    "efectivo" | "tarjeta" | "nequi" | "pse"
  >("efectivo");
  const [lastOrderId, setLastOrderId] = useState("");

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const ex = prev.find((c) => c.id === product.id);
      if (ex)
        return prev.map((c) =>
          c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems((prev) => {
      const ex = prev.find((c) => c.id === id);
      if (!ex) return prev;
      if (ex.quantity === 1) return prev.filter((c) => c.id !== id);
      return prev.map((c) =>
        c.id === id ? { ...c, quantity: c.quantity - 1 } : c,
      );
    });
  };

  const deleteFromCart = (id: number) =>
    setCartItems((prev) => prev.filter((c) => c.id !== id));

  const openCatalog = (category?: string) => {
    setCatalogCategory(category ? [category] : []);
    setCatalogOnSale(false);
    setCatalogPriceRange("all");
    setCatalogSort("relevancia");
    setCatalogSearch("");
    setCurrentView("catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openModal = (view: "choice" | "login" | "register") => {
    setModalView(view);
    setLoginModal(true);
  };

  const closeModal = () => setLoginModal(false);

  const handleAuthSuccess = () => {
    setLoginModal(false);
    setCartOpen(false);
    setCheckoutStep(1);
    setCheckoutOpen(true);
  };

  const cartTotal = cartItems.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cartItems.reduce((s, c) => s + c.quantity, 0);
  const fmt = (n: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(n);

  const placeOrder = () => {
    const shippingCost = checkoutShipping === "express" ? 9900 : 4900;
    const orderId = `MER-${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id: orderId,
      date: new Date().toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      items: [...cartItems],
      total: cartTotal + shippingCost,
      shipping: shippingCost,
      address: `${checkoutAddress.address}, ${checkoutAddress.city}`,
      paymentMethod: checkoutPayment,
      status: "preparando",
    };
    setOrders((prev) => [newOrder, ...prev]);
    setLastOrderId(orderId);
    setCartItems([]);
    setCheckoutStep(4);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const POPULAR_SEARCHES = [
    "Leche Alquería",
    "Aguacate",
    "Arroz Diana",
    "Pollo",
    "Huevos",
    "Café Juan Valdez",
  ];
  const SUGGESTED_CATEGORIES = CATEGORIES.slice(0, 6);

  const searchResults =
    searchQuery.trim().length >= 2
      ? PRODUCTS.filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()),
        ).slice(0, 5)
      : [];

  const suggestedCategories =
    searchQuery.trim().length >= 2
      ? CATEGORIES.filter((c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ).slice(0, 3)
      : [];

  const startSlideTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentSlide((s) => (s + 1) % HERO_SLIDES.length);
    }, 4500);
  };

  useEffect(() => {
    startSlideTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const goSlide = (dir: number) => {
    setCurrentSlide((s) => (s + dir + HERO_SLIDES.length) % HERO_SLIDES.length);
    startSlideTimer();
  };

  const filteredProducts = PRODUCTS.filter((p) => p.tabs.includes(activeTab));

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setEmailSent(true);
      setEmail("");
    }
  };

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div
      className="min-h-screen bg-background"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        {/* Top strip */}
        <div className="hidden md:block" style={{ background: "#1A1A2E" }}>
          <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              <MapPin className="w-3 h-3" />
              <span>
                Entrega en Manizales · Zona:{" "}
                <strong className="text-white">
                  El Cable, Milán, Chipre y más
                </strong>
              </span>
            </div>
            <div
              className="flex items-center gap-4 text-xs"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> Lun–Dom 6am–10pm
              </span>
              <span>📞 (606) 890-1234</span>
            </div>
          </div>
        </div>

        {/* Main header row */}
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <a href="#" className="flex-shrink-0">
            <Logo dark={true} />
          </a>

          <div className="flex-1 max-w-2xl mx-auto" ref={searchRef}>
            <div className="relative">
              {/* Input */}
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Busca productos, marcas y categorías..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-muted/60 text-sm focus:outline-none transition-all"
                  style={
                    searchOpen
                      ? {
                          boxShadow: "0 0 0 2px #FFF200",
                          borderColor: "#FFF200",
                          borderBottomLeftRadius: searchOpen ? "0" : "",
                          borderBottomRightRadius: searchOpen ? "0" : "",
                        }
                      : {}
                  }
                />
                {searchQuery && (
                  <button
                    className="absolute right-3 p-0.5 rounded-full hover:bg-muted transition-colors"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchOpen(false);
                    }}
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Dropdown */}
              {searchOpen && (
                <div
                  className="absolute top-full left-0 right-0 bg-white border border-border rounded-b-xl shadow-xl z-50 overflow-hidden"
                  style={{
                    borderTop: "none",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  }}
                >
                  {/* Estado vacío: populares y categorías */}
                  {searchQuery.trim().length < 2 && (
                    <div className="p-3 space-y-4">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide px-1 mb-2 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Búsquedas populares
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {POPULAR_SEARCHES.map((q) => (
                            <button
                              key={q}
                              onClick={() => {
                                setSearchQuery(q);
                              }}
                              className="px-3 py-1.5 rounded-full text-xs font-medium border border-border hover:border-foreground hover:bg-muted transition-all"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide px-1 mb-2">
                          Categorías destacadas
                        </p>
                        <div className="grid grid-cols-3 gap-1">
                          {SUGGESTED_CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            return (
                              <button
                                key={cat.id}
                                className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                                onClick={() => {
                                  setSearchQuery(cat.name);
                                }}
                              >
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{ background: cat.bg }}
                                >
                                  <Icon
                                    className="w-3.5 h-3.5"
                                    style={{ color: cat.color }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-foreground leading-tight">
                                  {cat.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Con query: resultados + sugerencias */}
                  {searchQuery.trim().length >= 2 && (
                    <div>
                      {/* Categorías sugeridas */}
                      {suggestedCategories.length > 0 && (
                        <div className="px-3 pt-3 pb-2 border-b border-border">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                            Categorías
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {suggestedCategories.map((cat) => {
                              const Icon = cat.icon;
                              return (
                                <button
                                  key={cat.id}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border hover:bg-muted transition-all"
                                  onClick={() => {
                                    setSearchQuery(cat.name);
                                  }}
                                >
                                  <Icon
                                    className="w-3 h-3"
                                    style={{ color: cat.color }}
                                  />
                                  {cat.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Productos encontrados */}
                      {searchResults.length > 0 ? (
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide px-3 pt-3 pb-1.5">
                            Productos ({searchResults.length})
                          </p>
                          <ul>
                            {searchResults.map((p) => {
                              const inCart = cartItems.find(
                                (c) => c.id === p.id,
                              );
                              return (
                                <li
                                  key={p.id}
                                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors border-b border-border last:border-0"
                                >
                                  <div className="w-11 h-11 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                                    <img
                                      src={p.image}
                                      alt={p.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground truncate">
                                      {p.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span
                                        className="text-sm font-bold"
                                        style={{
                                          fontFamily:
                                            "'Bricolage Grotesque', sans-serif",
                                        }}
                                      >
                                        {fmt(p.price)}
                                      </span>
                                      {p.originalPrice && (
                                        <span className="text-xs text-muted-foreground line-through">
                                          {fmt(p.originalPrice)}
                                        </span>
                                      )}
                                      {p.badge && (
                                        <span
                                          className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
                                          style={{ background: "#FF4444" }}
                                        >
                                          {p.badge}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                                      <button
                                        onClick={() => removeFromCart(p.id)}
                                        disabled={(inCart?.quantity ?? 0) === 0}
                                        className="px-2 py-1.5 hover:bg-muted transition-colors disabled:opacity-25"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="w-6 text-center text-xs font-bold tabular-nums">
                                        {inCart?.quantity ?? 0}
                                      </span>
                                      <button
                                        onClick={() => addToCart(p)}
                                        className="px-2 py-1.5 hover:bg-muted transition-colors"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <button
                                      onClick={() => addToCart(p)}
                                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0 transition-all hover:brightness-95 whitespace-nowrap"
                                      style={{
                                        background: "#FFF200",
                                        color: "#1A1A2E",
                                      }}
                                    >
                                      <Plus className="w-3 h-3" />
                                      Agregar
                                    </button>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                          {/* Ver todos */}
                          <button
                            className="w-full flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-foreground hover:bg-muted transition-colors"
                            onClick={() => {
                              setSearchOpen(false);
                              setCatalogSearch(searchQuery);
                              openCatalog();
                            }}
                          >
                            Ver todos los resultados para "{searchQuery}"
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <p className="text-sm font-semibold text-foreground">
                            Sin resultados para "{searchQuery}"
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Intenta con otro término o explora las categorías.
                          </p>
                          <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                            {POPULAR_SEARCHES.slice(0, 4).map((q) => (
                              <button
                                key={q}
                                onClick={() => setSearchQuery(q)}
                                className="px-3 py-1.5 rounded-full text-xs font-medium border border-border hover:bg-muted transition-all"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => openModal("login")}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium whitespace-nowrap"
            >
              <User className="w-4 h-4" />
              <span className="hidden lg:inline">Iniciar sesión</span>
            </button>
            <button
              onClick={() => {
                setSelectedOrder(null);
                setOrdersOpen(true);
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium whitespace-nowrap relative"
            >
              <Package className="w-4 h-4" />
              <span className="hidden lg:inline">Pedidos</span>
              {orders.length > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ background: "#FF4444", color: "#fff" }}
                >
                  {orders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden lg:inline">Carrito</span>
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ background: "#FFF200", color: "#1A1A2E" }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white px-4 py-3 flex flex-col gap-1">
            {[
              "Inicio",
              "Categorías",
              "Promociones",
              "Marketplace",
              "Ayuda",
            ].map((item) => (
              <a
                key={item}
                href="#"
                className="py-2.5 px-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors border-b border-border last:border-0"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* ── NavBar ── */}
      <nav className="hidden md:block bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 flex items-center">
          <button
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-white"
            style={{ background: "#1A1A2E" }}
          >
            <Menu className="w-4 h-4" />
            Todas las categorías
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {["Inicio", "Promociones", "Marketplace", "Ayuda"].map((item) => (
            <a
              key={item}
              href="#"
              className="px-4 py-3 text-sm font-medium text-foreground transition-colors border-b-2 border-transparent hover:border-accent hover:text-accent"
            >
              {item}
            </a>
          ))}

          <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            <MapPin className="w-3.5 h-3.5" />
            <span>
              Entregar en <strong className="text-foreground">Manizales</strong>
            </span>
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>
      </nav>

      {currentView === "catalog" && (
        <CatalogPage
          cartItems={cartItems}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onBack={() => setCurrentView("home")}
          onProductClick={setSelectedProduct}
          onOpenCategory={openCatalog}
          catalogCategory={catalogCategory}
          setCatalogCategory={setCatalogCategory}
          catalogOnSale={catalogOnSale}
          setCatalogOnSale={setCatalogOnSale}
          catalogPriceRange={catalogPriceRange}
          setCatalogPriceRange={setCatalogPriceRange}
          catalogSort={catalogSort}
          setCatalogSort={setCatalogSort}
          catalogSearch={catalogSearch}
          setCatalogSearch={setCatalogSearch}
          mobileFiltersOpen={mobileFiltersOpen}
          setMobileFiltersOpen={setMobileFiltersOpen}
        />
      )}

      <main className={currentView === "catalog" ? "hidden" : ""}>
        {/* ── Hero Carousel ── */}
        <section
          className="relative overflow-hidden"
          style={{ background: slide.bg, transition: "background 0.5s ease" }}
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="relative flex items-center min-h-[320px] md:min-h-[420px]">
              {/* Content */}
              <div className="relative z-10 flex-1 py-10 max-w-xl">
                <div
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5"
                  style={{ background: slide.accent, color: "#1A1A2E" }}
                >
                  <Sparkles className="w-3 h-3" />
                  Mercaldas · Manizales
                </div>
                <h1
                  className="font-black text-3xl md:text-5xl leading-[1.1] mb-4 text-white whitespace-pre-line"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  {slide.title}
                </h1>
                <p
                  className="text-sm md:text-base mb-7 max-w-sm"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  {slide.subtitle}
                </p>
                <button
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:brightness-95 active:scale-95"
                  style={{ background: slide.accent, color: "#1A1A2E" }}
                >
                  {slide.cta}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Background image */}
              <div className="absolute right-0 top-0 h-full w-1/2 md:w-5/12">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  style={{ opacity: 0.45 }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to right, ${slide.bg} 10%, transparent 60%)`,
                  }}
                />
              </div>

              {/* Arrows */}
              <button
                onClick={() => goSlide(-1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => goSlide(1)}
                className="absolute right-2 md:right-[42%] top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentSlide(i);
                  startSlideTimer();
                }}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === currentSlide ? "24px" : "6px",
                  background:
                    i === currentSlide ? "#FFF200" : "rgba(255,255,255,0.4)",
                }}
              />
            ))}
          </div>
        </section>

        {/* ── Quick Categories ── */}
        <section className="py-8 bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-5">
              <h2
                className="font-black text-lg text-foreground"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                Categorías
              </h2>
              <a
                href="#"
                className="text-xs font-medium text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Ver todas <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
            <div
              className="flex gap-4 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "none" }}
            >
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => openCatalog(cat.name)}
                    className="flex-shrink-0 flex flex-col items-center gap-2 group"
                  >
                    <div
                      className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                      style={{ background: cat.bg }}
                    >
                      <Icon
                        className="w-6 h-6 md:w-7 md:h-7"
                        style={{ color: cat.color }}
                      />
                    </div>
                    <span
                      className="text-xs font-medium text-center leading-tight text-foreground"
                      style={{ maxWidth: "72px" }}
                    >
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Promo Banner Strip ── */}
        <section className="py-4" style={{ background: "#FFF200" }}>
          <div
            className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm font-bold"
            style={{ color: "#1A1A2E" }}
          >
            <span className="flex items-center gap-2">
              <Truck className="w-4 h-4" /> Domicilio gratis en pedidos +$80.000
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Compra 100% segura
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> Entrega en 2 horas
            </span>
          </div>
        </section>

        {/* ── Featured Products ── */}
        <section className="py-10 bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="font-black text-2xl text-foreground"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                Productos Destacados
              </h2>
              <button
                onClick={() => openCatalog()}
                className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Ver catálogo completo <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div
              className="flex gap-2 mb-6 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none" }}
            >
              {PRODUCT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
                  style={
                    activeTab === tab.id
                      ? { background: "#FFF200", color: "#1A1A2E" }
                      : { background: "#F4F4F6", color: "#6B7280" }
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  cartItems={cartItems}
                  onAdd={addToCart}
                  onRemove={removeFromCart}
                  onProductClick={setSelectedProduct}
                />
              ))}
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => openCatalog()}
                className="px-8 py-3 rounded-xl font-bold text-sm border-2 transition-all hover:bg-foreground hover:text-white"
                style={{ borderColor: "#1A1A2E", color: "#1A1A2E" }}
              >
                Ver todos los productos
              </button>
            </div>
          </div>
        </section>

        {/* ── Sucursales ── */}
        <section className="py-10 bg-muted">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-start justify-between mb-6 gap-4">
              <div>
                <div
                  className="inline-block px-2 py-0.5 rounded text-xs font-black tracking-widest mb-2"
                  style={{ background: "#1A1A2E", color: "#FFF200" }}
                >
                  NUESTRAS TIENDAS
                </div>
                <h2
                  className="font-black text-2xl text-foreground"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  Sucursales en Manizales
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  6 tiendas en toda la ciudad. Compra en línea y recoge en la
                  más cercana sin costo adicional.
                </p>
              </div>
              <a
                href="#"
                className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap mt-6"
              >
                Ver en el mapa <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SUCURSALES.map((s) => (
                <div
                  key={s.id}
                  className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-md transition-shadow group flex flex-col"
                >
                  <div className="relative h-40 bg-muted overflow-hidden flex-shrink-0">
                    <img
                      src={s.image}
                      alt={s.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(26,26,46,0.6) 0%, transparent 55%)",
                      }}
                    />
                    {s.badge && (
                      <span
                        className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "#FFF200", color: "#1A1A2E" }}
                      >
                        {s.badge}
                      </span>
                    )}
                    <div className="absolute bottom-2 left-3">
                      <p
                        className="text-white font-black text-base leading-tight"
                        style={{
                          fontFamily: "'Bricolage Grotesque', sans-serif",
                        }}
                      >
                        {s.barrio}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <div>
                      <h3 className="font-bold text-sm text-foreground">
                        {s.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-start gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        {s.address}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        {s.hours}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        {s.phone}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-auto">
                      {s.services.map((sv) => (
                        <span
                          key={sv}
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: "#F4F4F6", color: "#6B7280" }}
                        >
                          {sv}
                        </span>
                      ))}
                    </div>
                    <button
                      className="w-full py-2 rounded-lg text-xs font-bold transition-all hover:brightness-95 mt-1"
                      style={{ background: "#FFF200", color: "#1A1A2E" }}
                    >
                      Cómo llegar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Benefits ── */}
        <section className="py-10 bg-white border-y border-border">
          <div className="max-w-7xl mx-auto px-4">
            <h2
              className="font-black text-2xl text-foreground mb-8 text-center"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              ¿Por qué comprar en Mercaldas?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {BENEFITS.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.title}
                    className="flex gap-3 p-4 rounded-xl hover:bg-muted/60 transition-colors"
                  >
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: "#FFF200" }}
                    >
                      <Icon className="w-5 h-5" style={{ color: "#1A1A2E" }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">
                        {b.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {b.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Newsletter ── */}
        <section className="py-14" style={{ background: "#1A1A2E" }}>
          <div className="max-w-xl mx-auto px-4 text-center">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
              style={{ background: "#FFF200" }}
            >
              <Mail className="w-6 h-6" style={{ color: "#1A1A2E" }} />
            </div>
            <h2
              className="font-black text-2xl md:text-3xl text-white mb-2"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Recibe las mejores ofertas
            </h2>
            <p
              className="text-sm mb-7"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Suscríbete y sé el primero en enterarte de promociones exclusivas,
              descuentos de temporada y novedades de Mercaldas.
            </p>
            {emailSent ? (
              <div
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
                style={{ background: "#FFF200", color: "#1A1A2E" }}
              >
                <ShieldCheck className="w-4 h-4" />
                ¡Listo! Te notificaremos las mejores ofertas.
              </div>
            ) : (
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex gap-2 max-w-sm mx-auto"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm border-0 focus:outline-none bg-white text-foreground"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:brightness-95 active:scale-95 whitespace-nowrap"
                  style={{ background: "#FFF200", color: "#1A1A2E" }}
                >
                  Suscribirme
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="pt-12 pb-6" style={{ background: "#111827" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <Logo dark={false} />
              <p
                className="text-xs mt-3 leading-relaxed"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                El supermercado de Manizales con más de 30 años llevando los
                mejores productos a los hogares del Eje Cafetero.
              </p>
              <div className="flex gap-2 mt-4">
                {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/20"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <Icon
                      className="w-3.5 h-3.5"
                      style={{ color: "rgba(255,255,255,0.65)" }}
                    />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">
                Categorías
              </h4>
              <ul className="space-y-2">
                {[
                  "Frutas y Verduras",
                  "Carnes y Pollo",
                  "Lácteos",
                  "Despensa",
                  "Limpieza",
                  "Cuidado Personal",
                ].map((c) => (
                  <li key={c}>
                    <a
                      href="#"
                      className="text-xs hover:text-white transition-colors"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      {c}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Ayuda</h4>
              <ul className="space-y-2">
                {[
                  "Centro de ayuda",
                  "Cómo comprar",
                  "Métodos de pago",
                  "Política de devoluciones",
                  "Términos y condiciones",
                  "Privacidad",
                ].map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-xs hover:text-white transition-colors"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">
                Contacto
              </h4>
              <ul className="space-y-2">
                <li
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  📍 Cra 23 # 64-60, Manizales
                </li>
                <li
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  📞 (606) 890-1234
                </li>
                <li
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  ✉️ servicio@mercaldas.com.co
                </li>
                <li className="text-xs font-semibold text-white mt-3">
                  Horario de atención
                </li>
                <li
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Lun–Dom · 6am – 10pm
                </li>
              </ul>
            </div>
          </div>

          {/* Payment methods */}
          <div
            className="border-t py-5"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <p
              className="text-xs mb-3 font-medium"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Medios de pago aceptados
            </p>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_ICONS.map((pm) => (
                <div
                  key={pm}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.65)",
                  }}
                >
                  {pm}
                </div>
              ))}
            </div>
          </div>

          <div
            className="border-t pt-4 flex flex-col md:flex-row items-center justify-between gap-2"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              © 2025 Mercaldas S.A.S. · NIT 890.800.427-3 · Todos los derechos
              reservados
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              Manizales, Caldas, Colombia
            </p>
          </div>
        </div>
      </footer>

      {/* ── Cart Drawer ── */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(2px)",
            }}
            onClick={() => setCartOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <h2
                  className="font-black text-lg"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  Mi Carrito
                </h2>
                {cartCount > 0 && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "#FFF200", color: "#1A1A2E" }}
                  >
                    {cartCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-foreground">
                    Tu carrito está vacío
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Agrega productos desde el catálogo.
                  </p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-95"
                    style={{ background: "#FFF200", color: "#1A1A2E" }}
                  >
                    Seguir comprando
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 rounded-xl border border-border"
                  >
                    <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.unit}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-sm font-bold">
                          {fmt(item.price * item.quantity)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center hover:bg-border transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center hover:bg-border transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteFromCart(item.id)}
                            className="w-6 h-6 rounded-lg ml-1 flex items-center justify-center hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3 h-3 text-accent" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-border px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Subtotal ({cartCount} productos)
                  </span>
                  <span className="font-bold text-xl">{fmt(cartTotal)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
                  <Truck className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Domicilio calculado al finalizar el pedido</span>
                </div>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    openModal("choice");
                  }}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:brightness-95 active:scale-95"
                  style={{ background: "#1A1A2E", color: "#FFF200" }}
                >
                  Finalizar pedido →
                </button>
                <button
                  onClick={() => setCartOpen(false)}
                  className="w-full py-2 rounded-xl font-semibold text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Seguir comprando
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Product Detail Modal ── */}
      <ProductDetailModal
        product={selectedProduct}
        cartItems={cartItems}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onClose={() => setSelectedProduct(null)}
      />

      {/* ── Auth Modal ── */}
      {loginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
            }}
            onClick={closeModal}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header strip */}
            <div className="px-6 pt-6 pb-4 border-b border-border">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <Logo dark={true} />
              {modalView === "choice" && (
                <>
                  <h2
                    className="font-black text-xl mt-3"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Ingresa para continuar
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Necesitas una cuenta para completar tu pedido.
                  </p>
                </>
              )}
              {modalView === "login" && (
                <>
                  <h2
                    className="font-black text-xl mt-3"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Iniciar sesión
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Bienvenido de nuevo a Mercaldas.
                  </p>
                </>
              )}
              {modalView === "register" && (
                <>
                  <h2
                    className="font-black text-xl mt-3"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Crear cuenta
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Regístrate gratis y empieza a comprar.
                  </p>
                </>
              )}
            </div>

            <div className="px-6 py-5 space-y-3">
              {/* ── Vista: choice ── */}
              {modalView === "choice" && (
                <>
                  <button
                    onClick={() => setModalView("login")}
                    className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:brightness-95 active:scale-95"
                    style={{ background: "#1A1A2E", color: "#FFF200" }}
                  >
                    Iniciar sesión
                  </button>
                  <button
                    onClick={() => setModalView("register")}
                    className="w-full py-3 rounded-xl font-bold text-sm border border-border hover:bg-muted transition-colors text-foreground"
                  >
                    Crear cuenta gratis
                  </button>
                  <p className="text-xs text-center text-muted-foreground pt-1">
                    Al continuar aceptas nuestros{" "}
                    <a href="#" className="underline hover:text-foreground">
                      Términos de uso
                    </a>{" "}
                    y{" "}
                    <a href="#" className="underline hover:text-foreground">
                      Privacidad
                    </a>
                  </p>
                </>
              )}

              {/* ── Vista: login ── */}
              {modalView === "login" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAuthSuccess();
                  }}
                  className="space-y-3"
                >
                  <SocialAuthButtons label="Iniciar sesión" />
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      placeholder="tu@correo.com"
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none transition-all"
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
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-foreground">
                        Contraseña
                      </label>
                      <a
                        href="#"
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none transition-all"
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
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:brightness-95 active:scale-95"
                    style={{ background: "#1A1A2E", color: "#FFF200" }}
                  >
                    Iniciar sesión
                  </button>
                  <p className="text-xs text-center text-muted-foreground pt-1">
                    ¿No tienes cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => setModalView("register")}
                      className="font-semibold text-foreground underline hover:no-underline"
                    >
                      Regístrate gratis
                    </button>
                  </p>
                </form>
              )}

              {/* ── Vista: register ── */}
              {modalView === "register" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAuthSuccess();
                  }}
                  className="space-y-3"
                >
                  <SocialAuthButtons label="Registrarse" />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        placeholder="Carlos"
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none transition-all"
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
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Apellido
                      </label>
                      <input
                        type="text"
                        placeholder="Ríos"
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none transition-all"
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
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      placeholder="tu@correo.com"
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none transition-all"
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
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Celular
                    </label>
                    <input
                      type="tel"
                      placeholder="300 123 4567"
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none transition-all"
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
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none transition-all"
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
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:brightness-95 active:scale-95"
                    style={{ background: "#1A1A2E", color: "#FFF200" }}
                  >
                    Crear mi cuenta
                  </button>
                  <p className="text-xs text-center text-muted-foreground pt-1">
                    ¿Ya tienes cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => setModalView("login")}
                      className="font-semibold text-foreground underline hover:no-underline"
                    >
                      Inicia sesión
                    </button>
                  </p>
                  <p className="text-xs text-center text-muted-foreground">
                    Al registrarte aceptas nuestros{" "}
                    <a href="#" className="underline hover:text-foreground">
                      Términos de uso
                    </a>{" "}
                    y{" "}
                    <a href="#" className="underline hover:text-foreground">
                      Privacidad
                    </a>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Checkout Modal ─────────────────────────────────── */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-muted overflow-y-auto">
          <div className="bg-white border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
            {checkoutStep < 4 && (
              <button
                onClick={() =>
                  checkoutStep === 1
                    ? setCheckoutOpen(false)
                    : setCheckoutStep((s) => s - 1)
                }
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex-1">
              <Logo dark={true} />
            </div>
            {checkoutStep < 4 && (
              <button
                onClick={() => setCheckoutOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {checkoutStep < 4 && (
            <div className="bg-white px-6 pb-4 pt-2 flex items-center gap-2 border-b border-border">
              {["Resumen", "Dirección", "Pago"].map((label, i) => {
                const step = i + 1;
                const active = checkoutStep === step;
                const done = checkoutStep > step;
                return (
                  <div key={step} className="flex items-center gap-2 shrink-0">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={
                        done
                          ? { background: "#34C759", color: "#fff" }
                          : active
                            ? { background: "#1A1A2E", color: "#FFF200" }
                            : { background: "#F4F4F6", color: "#6B7280" }
                      }
                    >
                      {done ? <CheckCircle2 className="w-4 h-4" /> : step}
                    </div>
                    <span
                      className={`text-xs font-semibold ${active ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {label}
                    </span>
                    {i < 2 && (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-4">
            {checkoutStep === 1 && (
              <>
                <h2
                  className="text-xl font-black"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  Resumen del pedido
                </h2>
                <div className="bg-white rounded-2xl border border-border divide-y divide-border overflow-hidden">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-xl"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.unit} × {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-bold shrink-0">
                        {fmt(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-2xl border border-border p-4 space-y-3">
                  <h3 className="text-sm font-bold">Tipo de envío</h3>
                  {(["standard", "express"] as const).map((type) => (
                    <label
                      key={type}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${checkoutShipping === type ? "border-yellow-300 bg-yellow-50" : "border-border hover:bg-muted/40"}`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={type}
                        checked={checkoutShipping === type}
                        onChange={() => setCheckoutShipping(type)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${checkoutShipping === type ? "border-yellow-500" : "border-muted-foreground"}`}
                      >
                        {checkoutShipping === type && (
                          <div className="w-2 h-2 rounded-full bg-foreground" />
                        )}
                      </div>
                      <Truck className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">
                          {type === "standard"
                            ? "Envío estándar"
                            : "Envío express"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {type === "standard"
                            ? "2-3 horas hábiles"
                            : "45-60 minutos"}
                        </p>
                      </div>
                      <span className="text-sm font-bold">
                        {fmt(type === "standard" ? 4900 : 9900)}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="bg-white rounded-2xl border border-border p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">{fmt(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="font-semibold">
                      {fmt(checkoutShipping === "express" ? 9900 : 4900)}
                    </span>
                  </div>
                  <div className="flex justify-between font-black text-base border-t border-border pt-2">
                    <span>Total</span>
                    <span>
                      {fmt(
                        cartTotal +
                          (checkoutShipping === "express" ? 9900 : 4900),
                      )}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setCheckoutStep(2)}
                  className="w-full py-4 rounded-2xl font-black text-base hover:brightness-95 active:scale-95 transition-all"
                  style={{ background: "#1A1A2E", color: "#FFF200" }}
                >
                  Continuar con la dirección →
                </button>
              </>
            )}

            {checkoutStep === 2 && (
              <>
                <h2
                  className="text-xl font-black"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  Dirección de entrega
                </h2>
                <div className="bg-white rounded-2xl border border-border p-4 space-y-3">
                  {[
                    {
                      key: "name" as const,
                      label: "Nombre completo",
                      placeholder: "Carlos Ríos",
                      type: "text",
                    },
                    {
                      key: "phone" as const,
                      label: "Celular",
                      placeholder: "300 123 4567",
                      type: "tel",
                    },
                    {
                      key: "address" as const,
                      label: "Dirección",
                      placeholder: "Cra 23 #45-67, Barrio San José",
                      type: "text",
                    },
                    {
                      key: "city" as const,
                      label: "Ciudad",
                      placeholder: "Manizales",
                      type: "text",
                    },
                    {
                      key: "notes" as const,
                      label: "Indicaciones adicionales (opcional)",
                      placeholder: "Apto 301, timbre no funciona...",
                      type: "text",
                    },
                  ].map(({ key, label, placeholder, type }) => (
                    <div key={key}>
                      <label className="text-xs font-semibold block mb-1">
                        {label}
                      </label>
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={checkoutAddress[key]}
                        onChange={(e) =>
                          setCheckoutAddress((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none"
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
                  ))}
                </div>
                <button
                  onClick={() => setCheckoutStep(3)}
                  disabled={
                    !checkoutAddress.name ||
                    !checkoutAddress.phone ||
                    !checkoutAddress.address
                  }
                  className="w-full py-4 rounded-2xl font-black text-base hover:brightness-95 active:scale-95 transition-all disabled:opacity-40"
                  style={{ background: "#1A1A2E", color: "#FFF200" }}
                >
                  Continuar con el pago →
                </button>
              </>
            )}

            {checkoutStep === 3 && (
              <>
                <h2
                  className="text-xl font-black"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  Método de pago
                </h2>
                <div className="bg-white rounded-2xl border border-border divide-y divide-border overflow-hidden">
                  {[
                    {
                      key: "efectivo" as const,
                      label: "Efectivo contra entrega",
                      Icon: Banknote,
                      desc: "Paga al recibir tu pedido",
                    },
                    {
                      key: "nequi" as const,
                      label: "Nequi",
                      Icon: Smartphone,
                      desc: "Transferencia inmediata",
                    },
                    {
                      key: "pse" as const,
                      label: "PSE",
                      Icon: Building2,
                      desc: "Débito bancario en línea",
                    },
                    {
                      key: "tarjeta" as const,
                      label: "Tarjeta débito / crédito",
                      Icon: CreditCard,
                      desc: "Visa, Mastercard, Amex",
                    },
                  ].map(({ key, label, Icon, desc }) => (
                    <label
                      key={key}
                      className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${checkoutPayment === key ? "bg-yellow-50" : "hover:bg-muted/40"}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={key}
                        checked={checkoutPayment === key}
                        onChange={() => setCheckoutPayment(key)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${checkoutPayment === key ? "border-yellow-500" : "border-muted-foreground"}`}
                      >
                        {checkoutPayment === key && (
                          <div className="w-2 h-2 rounded-full bg-foreground" />
                        )}
                      </div>
                      <Icon className="w-5 h-5 text-muted-foreground shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="bg-white rounded-2xl border border-border p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{fmt(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envío</span>
                    <span>
                      {fmt(checkoutShipping === "express" ? 9900 : 4900)}
                    </span>
                  </div>
                  <div className="flex justify-between font-black text-base border-t border-border pt-2">
                    <span>Total a pagar</span>
                    <span>
                      {fmt(
                        cartTotal +
                          (checkoutShipping === "express" ? 9900 : 4900),
                      )}
                    </span>
                  </div>
                </div>
                <button
                  onClick={placeOrder}
                  className="w-full py-4 rounded-2xl font-black text-base hover:brightness-95 active:scale-95 transition-all"
                  style={{ background: "#FFF200", color: "#1A1A2E" }}
                >
                  Confirmar pedido →
                </button>
              </>
            )}

            {checkoutStep === 4 && (
              <div className="flex flex-col items-center text-center py-10 gap-5">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <div>
                  <h2
                    className="text-2xl font-black"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    ¡Pedido confirmado!
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Tu pedido <strong>{lastOrderId}</strong> ha sido recibido.
                  </p>
                </div>
                <div className="bg-white rounded-2xl border border-border p-4 w-full text-left space-y-2.5">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>
                      {checkoutShipping === "express"
                        ? "Entrega en 45-60 minutos"
                        : "Entrega en 2-3 horas"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>
                      {checkoutAddress.address}, {checkoutAddress.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Wallet className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="capitalize">{checkoutPayment}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCheckoutOpen(false);
                    setSelectedOrder(null);
                    setOrdersOpen(true);
                  }}
                  className="w-full py-4 rounded-2xl font-black text-base hover:brightness-95 active:scale-95 transition-all"
                  style={{ background: "#1A1A2E", color: "#FFF200" }}
                >
                  Ver mis pedidos
                </button>
                <button
                  onClick={() => setCheckoutOpen(false)}
                  className="text-sm text-muted-foreground underline hover:text-foreground"
                >
                  Seguir comprando
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Orders Panel ─────────────────────────────────────── */}
      {ordersOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setOrdersOpen(false);
              setSelectedOrder(null);
            }}
          />
          <div className="relative ml-auto w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
            <div className="px-5 py-4 border-b border-border flex items-center gap-3">
              {selectedOrder && (
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex-1">
                <h2
                  className="font-black text-base"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  {selectedOrder ? `Pedido ${selectedOrder.id}` : "Mis pedidos"}
                </h2>
                {!selectedOrder && (
                  <p className="text-xs text-muted-foreground">
                    {orders.length} pedido{orders.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setOrdersOpen(false);
                  setSelectedOrder(null);
                }}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!selectedOrder && orders.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
                  <Package className="w-12 h-12 text-muted-foreground" />
                  <p className="font-semibold text-sm">No tienes pedidos aún</p>
                  <p className="text-xs text-muted-foreground">
                    Cuando completes una compra, aparecerá aquí.
                  </p>
                  <button
                    onClick={() => setOrdersOpen(false)}
                    className="mt-2 px-6 py-3 rounded-xl font-bold text-sm"
                    style={{ background: "#FFF200", color: "#1A1A2E" }}
                  >
                    Ir a comprar
                  </button>
                </div>
              )}

              {!selectedOrder && orders.length > 0 && (
                <div className="divide-y divide-border">
                  {orders.map((order) => {
                    const statusColor = {
                      preparando: "#FF9500",
                      "en camino": "#007AFF",
                      entregado: "#34C759",
                    }[order.status];
                    const statusLabel = {
                      preparando: "Preparando",
                      "en camino": "En camino",
                      entregado: "Entregado",
                    }[order.status];
                    return (
                      <button
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="w-full text-left px-5 py-4 hover:bg-muted/50 transition-colors flex items-start gap-3"
                      >
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 justify-between">
                            <span className="font-bold text-sm">
                              {order.id}
                            </span>
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-full text-white shrink-0"
                              style={{ background: statusColor }}
                            >
                              {statusLabel}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {order.date}
                          </p>
                          <p className="text-xs mt-0.5">
                            {order.items.length} producto
                            {order.items.length !== 1 ? "s" : ""} ·{" "}
                            {fmt(order.total)}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedOrder &&
                (() => {
                  const statusColor = {
                    preparando: "#FF9500",
                    "en camino": "#007AFF",
                    entregado: "#34C759",
                  }[selectedOrder.status];
                  const statusLabel = {
                    preparando: "Preparando tu pedido",
                    "en camino": "En camino",
                    entregado: "Entregado",
                  }[selectedOrder.status];
                  const stepNum = {
                    preparando: 1,
                    "en camino": 2,
                    entregado: 3,
                  }[selectedOrder.status];
                  const trackSteps = [
                    "Confirmado",
                    "Preparando",
                    "En camino",
                    "Entregado",
                  ];
                  return (
                    <div className="p-5 space-y-4">
                      <div
                        className="rounded-2xl p-4 space-y-3"
                        style={{ background: "#F4F4F6" }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ background: statusColor }}
                          >
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{statusLabel}</p>
                            <p className="text-xs text-muted-foreground">
                              {selectedOrder.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {trackSteps.map((s, i) => (
                            <div
                              key={s}
                              className="flex items-center flex-1 last:flex-none"
                            >
                              <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{
                                  background:
                                    i <= stepNum ? "#34C759" : "#D1D5DB",
                                }}
                              />
                              {i < trackSteps.length - 1 && (
                                <div
                                  className="h-0.5 flex-1"
                                  style={{
                                    background:
                                      i < stepNum ? "#34C759" : "#D1D5DB",
                                  }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          {trackSteps.map((s) => (
                            <span key={s}>{s}</span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold mb-2">Productos</h3>
                        <div className="bg-white rounded-2xl border border-border divide-y divide-border overflow-hidden">
                          {selectedOrder.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 px-4 py-3"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  × {item.quantity}
                                </p>
                              </div>
                              <span className="text-xs font-bold">
                                {fmt(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl border border-border p-4 space-y-2">
                        <h3 className="text-sm font-bold mb-1">
                          Detalles del envío
                        </h3>
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>{selectedOrder.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Wallet className="w-3.5 h-3.5 shrink-0" />
                          <span className="capitalize">
                            {selectedOrder.paymentMethod}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl border border-border p-4 space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Subtotal
                          </span>
                          <span>
                            {fmt(selectedOrder.total - selectedOrder.shipping)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Envío</span>
                          <span>{fmt(selectedOrder.shipping)}</span>
                        </div>
                        <div className="flex justify-between font-black border-t border-border pt-2">
                          <span>Total</span>
                          <span>{fmt(selectedOrder.total)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import {
  Package,
  Heart,
  ClipboardList,
  MapPin,
  CreditCard,
  Gift,
  Star,
  Bell,
  HelpCircle,
  Settings,
  ArrowLeft,
  Award,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShoppingCart,
  Minus,
  Plus,
  Clock,
  RefreshCcw,
  Download,
  MessageCircle,
  AlertCircle,
  Check,
  RotateCcw,
  Truck,
  Phone,
  Pencil,
  Copy,
  Trash2,
  X,
  Tag,
  Sparkles,
  ThumbsUp,
  Camera,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Shield,
  Send,
  Menu,
} from "lucide-react";
import type { CartItem, Order, Product } from "../../types";
import type { AppNotification } from "../../../hooks/useNotifications";
import { ordersService } from "../../../services/orders.service";
import { catalogService } from "../../../services/catalog.service";
import {
  customerAuthService,
  customerAddressService,
  customerPaymentService,
  type CustomerAddress,
  type CustomerPaymentMethod,
} from "../../../services/customer-auth.service";

const MOCK_PRODUCTS: Product[] = [
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

/* ─── Account Module Types ───────────────────────────────── */
export type AccountSection =
  | "orders"
  | "order-detail"
  | "tracking"
  | "favorites"
  | "lists"
  | "addresses"
  | "payments"
  | "coupons"
  | "history"
  | "notifications"
  | "reviews"
  | "support"
  | "profile";

interface ShoppingList {
  id: string;
  name: string;
  items: Array<{ product: Product; quantity: number }>;
}

interface SavedAddress {
  id: string;
  label: string;
  icon: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  isDefault: boolean;
}

interface SavedPayment {
  id: string;
  methodType: "CARD" | "NEQUI";
  label: string;
  last4?: string;
  brand?: string;
  phone?: string;
  cardholderName?: string;
  color: string;
  isDefault: boolean;
}

interface _Coupon {
  id: string;
  code: string;
  description: string;
  discount: string;
  minPurchase: number;
  expiresAt: string;
  used: boolean;
  category?: string;
  color: string;
}

interface AcctNotif {
  id: string;
  type: "order" | "promo" | "coupon" | "new" | "reco";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

interface _ProductReview {
  id: string;
  product: Product;
  rating: number;
  text: string;
  date: string;
  helpful: number;
}

/* ─── Account Mock Data ──────────────────────────────────── */
const MOCK_ACCT_ORDERS = [
  {
    id: "MER-241901",
    date: "18 de julio de 2025",
    items: [MOCK_PRODUCTS[0], MOCK_PRODUCTS[2], MOCK_PRODUCTS[6]].map((p) => ({
      ...p,
      quantity: 2,
    })),
    total: 126200,
    shipping: 4900,
    address: "Cra 23 # 64-60, Apt 301, Barrio Milán, Manizales",
    paymentMethod: "tarjeta",
    status: "entregado" as const,
    estimatedDelivery: "18 jul · 3:45 pm",
    deliveredAt: "18 jul 2025 · 3:32 pm",
  },
  {
    id: "MER-241745",
    date: "12 de julio de 2025",
    items: [MOCK_PRODUCTS[1], MOCK_PRODUCTS[3], MOCK_PRODUCTS[8]].map((p) => ({
      ...p,
      quantity: 1,
    })),
    total: 93150,
    shipping: 4900,
    address: "Cll 65 # 23B-10, Barrio El Cable, Manizales",
    paymentMethod: "nequi",
    status: "en camino" as const,
    estimatedDelivery: "12 jul · 5:00 pm",
    deliveredAt: "",
  },
  {
    id: "MER-241502",
    date: "5 de julio de 2025",
    items: [
      MOCK_PRODUCTS[4],
      MOCK_PRODUCTS[5],
      MOCK_PRODUCTS[9],
      MOCK_PRODUCTS[11],
    ].map((p) => ({ ...p, quantity: 1 })),
    total: 96100,
    shipping: 9900,
    address: "Av. 12 de Octubre # 41-55, Chipre, Manizales",
    paymentMethod: "efectivo",
    status: "preparando" as const,
    estimatedDelivery: "5 jul · 2:00 pm",
    deliveredAt: "",
  },
  {
    id: "MER-241298",
    date: "28 de junio de 2025",
    items: [MOCK_PRODUCTS[12], MOCK_PRODUCTS[13]].map((p) => ({
      ...p,
      quantity: 3,
    })),
    total: 166200,
    shipping: 4900,
    address: "Cra 18 # 70-24, Barrio Palermo, Manizales",
    paymentMethod: "tarjeta",
    status: "entregado" as const,
    estimatedDelivery: "28 jun · 11:30 am",
    deliveredAt: "28 jun 2025 · 11:18 am",
  },
  {
    id: "MER-240987",
    date: "15 de junio de 2025",
    items: [MOCK_PRODUCTS[7], MOCK_PRODUCTS[10]].map((p) => ({
      ...p,
      quantity: 2,
    })),
    total: 97600,
    shipping: 0,
    address: "Cll 50 # 36-80, Barrio La Enea, Manizales",
    paymentMethod: "pse",
    status: "cancelado" as const,
    estimatedDelivery: "15 jun · 4:00 pm",
    deliveredAt: "",
  },
];
type AcctOrder = (typeof MOCK_ACCT_ORDERS)[number];

const INIT_FAVORITES = MOCK_PRODUCTS.filter((p) =>
  [1, 5, 9, 12, 14, 18].includes(p.id),
);

const INIT_LISTS: ShoppingList[] = [
  {
    id: "list-1",
    name: "Mercado Semanal",
    items: [
      { product: MOCK_PRODUCTS[0], quantity: 2 },
      { product: MOCK_PRODUCTS[1], quantity: 3 },
      { product: MOCK_PRODUCTS[3], quantity: 1 },
      { product: MOCK_PRODUCTS[6], quantity: 1 },
    ],
  },
  {
    id: "list-2",
    name: "BBQ del Fin de Semana",
    items: [
      { product: MOCK_PRODUCTS[0], quantity: 3 },
      { product: MOCK_PRODUCTS[18], quantity: 2 },
      { product: MOCK_PRODUCTS[11], quantity: 4 },
    ],
  },
  {
    id: "list-3",
    name: "Esenciales del Mes",
    items: [
      { product: MOCK_PRODUCTS[2], quantity: 2 },
      { product: MOCK_PRODUCTS[10], quantity: 2 },
      { product: MOCK_PRODUCTS[6], quantity: 1 },
      { product: MOCK_PRODUCTS[23], quantity: 3 },
    ],
  },
];

const INIT_ADDRESSES: SavedAddress[] = [
  {
    id: "a1",
    label: "Casa",
    icon: "🏠",
    name: "Carlos Gómez",
    phone: "310 456 7890",
    address: "Cra 23 # 64-60, Apt 301",
    city: "Manizales",
    notes: "Timbre 301 — Edificio Las Palmas",
    isDefault: true,
  },
  {
    id: "a2",
    label: "Trabajo",
    icon: "🏢",
    name: "Carlos Gómez",
    phone: "310 456 7890",
    address: "Cll 65 # 23B-10, Of. 405",
    city: "Manizales",
    notes: "Recepción piso 4",
    isDefault: false,
  },
  {
    id: "a3",
    label: "Padres",
    icon: "👨‍👩‍👦",
    name: "Luis Gómez",
    phone: "312 987 6543",
    address: "Av. 12 de Octubre # 41-55",
    city: "Manizales",
    notes: "Casa blanca — portón negro",
    isDefault: false,
  },
];

const INIT_COUPONS: _Coupon[] = [
  {
    id: "c1",
    code: "MERC20",
    description: "20% de descuento en tu próxima compra",
    discount: "20% OFF",
    minPurchase: 50000,
    expiresAt: "31 ago 2025",
    used: false,
    category: "General",
    color: "#FFF200",
  },
  {
    id: "c2",
    code: "ENVIOGRATIS",
    description: "Envío gratis en cualquier pedido",
    discount: "Envío gratis",
    minPurchase: 0,
    expiresAt: "15 ago 2025",
    used: false,
    category: "Domicilio",
    color: "#1A1A2E",
  },
  {
    id: "c3",
    code: "FRUTA10",
    description: "10% OFF en Frutas y Verduras",
    discount: "10% OFF",
    minPurchase: 20000,
    expiresAt: "1 ago 2025",
    used: false,
    category: "Frutas",
    color: "#66BB6A",
  },
  {
    id: "c4",
    code: "BIENVENIDA",
    description: "Cupón de bienvenida — ya utilizado",
    discount: "15% OFF",
    minPurchase: 30000,
    expiresAt: "1 jun 2025",
    used: true,
    category: "General",
    color: "#6B7280",
  },
];

const INIT_NOTIFS: AcctNotif[] = [
  {
    id: "n1",
    type: "order",
    title: "Tu pedido está en camino",
    body: "El pedido MER-241745 fue despachado y llegará en aprox. 45 minutos.",
    time: "Hace 20 min",
    read: false,
  },
  {
    id: "n2",
    type: "promo",
    title: "Semana del Ahorro activa",
    body: "Hasta 40% de descuento en productos seleccionados. Oferta válida solo hoy.",
    time: "Hace 2 h",
    read: false,
  },
  {
    id: "n3",
    type: "coupon",
    title: "Nuevo cupón disponible",
    body: "Tienes un cupón de 20% OFF esperándote. Vence el 31 de agosto.",
    time: "Ayer",
    read: false,
  },
  {
    id: "n4",
    type: "new",
    title: "Nuevos productos en Despensa",
    body: "Lentejas verdes, pasta integral y más productos nuevos ya están disponibles.",
    time: "Ayer",
    read: true,
  },
  {
    id: "n5",
    type: "order",
    title: "Pedido MER-241901 entregado",
    body: "Tu pedido fue entregado exitosamente el 18 de julio a las 3:32 pm.",
    time: "18 jul",
    read: true,
  },
  {
    id: "n6",
    type: "reco",
    title: "Recomendado para ti",
    body: "Descubre los productos más vendidos de la semana en tus categorías favoritas.",
    time: "17 jul",
    read: true,
  },
];

const INIT_REVIEWS: _ProductReview[] = [
  {
    id: "r1",
    product: MOCK_PRODUCTS[0],
    rating: 5,
    text: "Excelente calidad, la pechuga llegó muy fresca y bien empacada. Definitivamente volveré a pedir.",
    date: "19 jul 2025",
    helpful: 8,
  },
  {
    id: "r2",
    product: MOCK_PRODUCTS[2],
    rating: 4,
    text: "El arroz Diana es siempre una garantía. El precio es competitivo y el domicilio fue puntual.",
    date: "6 jul 2025",
    helpful: 3,
  },
  {
    id: "r3",
    product: MOCK_PRODUCTS[6],
    rating: 5,
    text: "El mejor detergente del mercado, rinde muchísimo y deja la ropa impecable.",
    date: "29 jun 2025",
    helpful: 12,
  },
];

const LOYALTY_PTS = 1840;
const LOYALTY_HISTORY = [
  { desc: "Compra MER-241901", pts: +290, date: "18 jul 2025" },
  { desc: "Compra MER-241298", pts: +380, date: "28 jun 2025" },
  { desc: "Cupón canjeado", pts: -500, date: "15 jun 2025" },
  { desc: "Compra MER-240987", pts: +220, date: "15 jun 2025" },
  { desc: "Bono de bienvenida", pts: +1000, date: "1 jun 2025" },
];

const TRACKING_STEPS = [
  { label: "Pedido recibido", time: "12 jul · 2:15 pm", done: true },
  { label: "Pago confirmado", time: "12 jul · 2:17 pm", done: true },
  { label: "Preparando pedido", time: "12 jul · 2:45 pm", done: true },
  { label: "Listo para despacho", time: "12 jul · 3:30 pm", done: true },
  { label: "En camino", time: "12 jul · 4:05 pm", done: true },
  { label: "Entregado", time: "Estimado: 4:50 pm", done: false },
];

const FAQ_ITEMS = [
  {
    q: "¿Cuánto tiempo tarda el domicilio?",
    a: "Generalmente entre 1 y 2 horas dependiendo de tu zona. Para pedidos express garantizamos entrega en 60 minutos.",
  },
  {
    q: "¿Cómo puedo cancelar mi pedido?",
    a: "Puedes cancelar dentro de los 5 minutos de haberlo realizado desde Mis Pedidos. Pasado ese tiempo, contacta soporte.",
  },
  {
    q: "¿Qué hago si falta un producto?",
    a: "Repórtalo en el detalle del pedido usando el botón 'Reportar problema'. Te reembolsaremos o haremos el reenvío.",
  },
  {
    q: "¿Puedo cambiar la dirección de entrega?",
    a: "Sí, siempre que el pedido no haya sido despachado. Escríbenos por WhatsApp al (606) 890-1234 lo antes posible.",
  },
  {
    q: "¿Cómo funciona el programa de puntos?",
    a: "Acumulas 1 punto por cada $100 pesos en compras. Con 1,000 puntos obtienes $5,000 de descuento.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Aceptamos tarjeta crédito/débito (Visa, Mastercard), Nequi, Daviplata, PSE y efectivo contra entrega.",
  },
];

/* ─── Account Helpers ────────────────────────────────────── */
function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange?: (n: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            className="w-4 h-4"
            fill={(hover || value) >= n ? "#FFF200" : "none"}
            stroke={(hover || value) >= n ? "#F5C518" : "#D1D5DB"}
          />
        </button>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    preparando: { label: "Preparando", bg: "#FFF3CD", color: "#856404" },
    "en camino": { label: "En camino", bg: "#CCE5FF", color: "#004085" },
    entregado: { label: "Entregado", bg: "#D4EDDA", color: "#155724" },
    cancelado: { label: "Cancelado", bg: "#F8D7DA", color: "#721C24" },
  };
  const s = map[status] ?? { label: status, bg: "#F4F4F6", color: "#6B7280" };
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

function EmptyState({
  icon,
  title,
  subtitle,
  cta,
  onCta,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  cta?: string;
  onCta?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
        style={{ background: "#F4F4F6" }}
      >
        {icon}
      </div>
      <p
        className="font-black text-lg text-foreground mb-1"
        style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
      >
        {title}
      </p>
      <p className="text-sm text-muted-foreground max-w-xs">{subtitle}</p>
      {cta && onCta && (
        <button
          onClick={onCta}
          className="mt-6 px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:brightness-95 active:scale-95"
          style={{ background: "#FFF200", color: "#1A1A2E" }}
        >
          {cta}
        </button>
      )}
    </div>
  );
}

function AcctCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white border border-border rounded-xl ${className}`}>
      {children}
    </div>
  );
}

function PaymentMethodIcon({ method }: { method: string }) {
  const labels: Record<string, string> = {
    tarjeta: "💳",
    nequi: "📱",
    efectivo: "💵",
    pse: "🏦",
    daviplata: "📲",
  };
  return <span>{labels[method] ?? "💳"}</span>;
}

/* ─── Account Page ───────────────────────────────────────── */
export interface UserAdminViewProps {
  appOrders: Order[];
  cartItems: CartItem[];
  customer: { firstName?: string; fullName?: string; email?: string } | null;
  onAdd: (p: Product, quantity?: number) => void;
  onRemove: (id: number) => void;
  onProductClick: (p: Product) => void;
  onBack: () => void;
  onViewCatalog: () => void;
  initialSection?: AccountSection;
  notifications?: AppNotification[];
  unreadNotifCount?: number;
  onMarkNotifRead?: (id: number) => void;
  onReplaceCart?: (items: CartItem[]) => void;
  fmt?: (n: number) => string;
  onProfileUpdated?: (
    profile: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      email?: string;
      acceptsMarketing?: boolean;
      password?: string;
    },
  ) => Promise<{
    fullName: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    email: string;
    acceptsMarketing: boolean;
  }>;
}

export function UserAdminView({
  appOrders,
  cartItems,
  customer,
  onAdd,
  onRemove,
  onProductClick,
  onBack,
  onViewCatalog,
  initialSection = "orders",
  notifications = [],
  unreadNotifCount = 0,
  onMarkNotifRead,
  onReplaceCart,
  onProfileUpdated,
}: UserAdminViewProps) {
  const [section, setSection] = useState<AccountSection>(initialSection);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string>("");
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [lists, setLists] = useState<
    Array<{
      id: number;
      name: string;
      items: Array<{
        productId: number;
        productName: string;
        productPrice: number;
        productImage: string | null;
        quantity: number;
      }>;
    }>
  >([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [payments, setPayments] = useState<SavedPayment[]>([]);
  // Triestado: null = cargando config, true = hay métodos almacenables
  // (tarjeta o Nequi vía Wompi), false = la tienda no permite guardar métodos.
  // Mientras carga (null) la sección permanece oculta.
  const [paymentsSectionEnabled, setPaymentsSectionEnabled] = useState<
    boolean | null
  >(null);
  const [coupons, setCoupons] = useState<Coupon[]>(INIT_COUPONS);
  const [notifs, setNotifs] = useState<AcctNotif[]>(() =>
    notifications.map((n) => ({
      id: String(n.id),
      type: (n.type === "ORDER" || n.type === "PAYMENT"
        ? "order"
        : n.type === "PROMOTION"
          ? "promo"
          : "reco") as AcctNotif["type"],
      title: n.title,
      body: n.message,
      time: new Date(n.createdAt).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: n.isRead,
    })),
  );
  const [reviews, setReviews] = useState<ProductReview[]>(INIT_REVIEWS);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [apiOrders, setApiOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    ordersService
      .getOrders()
      .then(setApiOrders)
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, []);

  // Load favorites when section changes to favorites or customer changes
  useEffect(() => {
    if (customer) {
      setFavoritesLoading(true);
      catalogService
        .getFavorites()
        .then(setFavorites)
        .catch(() => setFavorites([]))
        .finally(() => setFavoritesLoading(false));
    }
  }, [customer, section]);

  // Load shopping lists
  useEffect(() => {
    if (customer && section === "lists") {
      setListsLoading(true);
      catalogService
        .getShoppingLists()
        .then((data) => {
          setLists(data);
          if (data.length > 0 && !selectedListId) setSelectedListId(data[0].id);
        })
        .catch(() => setLists([]))
        .finally(() => setListsLoading(false));
    }
  }, [customer, section]);

  // Load addresses
  useEffect(() => {
    if (customer && section === "addresses") {
      setAddressesLoading(true);
      customerAddressService
        .getAddresses()
        .then((data) => setAddresses(data.map(mapCustomerAddress)))
        .catch(() => setAddresses([]))
        .finally(() => setAddressesLoading(false));
    }
  }, [customer, section]);

  // Detectar si el admin tiene métodos almacenables habilitados
  // (tarjeta o Nequi vía Wompi). Si ninguno está habilitado, la sección
  // "Métodos de Pago" se oculta del menú.
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/payments/methods`)
      .then((r) => r.json())
      .then((d) => {
        const wompiOn = d?.wompi?.enabled ?? true;
        const cardEnabled = wompiOn && (d?.wompi?.methods?.card ?? true);
        const nequiEnabled = wompiOn && (d?.wompi?.methods?.nequi ?? true);
        setPaymentsSectionEnabled(cardEnabled || nequiEnabled);
      })
      .catch(() => setPaymentsSectionEnabled(false));
  }, []);

  // Si se llega a la sección "payments" pero la tienda no tiene métodos
  // almacenables habilitados (config ya resuelta), redirigir a otra sección.
  useEffect(() => {
    if (section === "payments" && paymentsSectionEnabled === false) {
      setSection("orders");
    }
  }, [section, paymentsSectionEnabled]);

  // Load payment methods
  useEffect(() => {
    if (customer && section === "payments") {
      customerPaymentService
        .getPaymentMethods()
        .then((data) => setPayments(data.map(mapCustomerPaymentMethod)))
        .catch(() => setPayments([]));
    }
  }, [customer, section]);

  const mapCustomerPaymentMethod = (p: CustomerPaymentMethod): SavedPayment => ({
    id: String(p.id),
    methodType: p.methodType,
    label:
      p.label ||
      (p.methodType === "NEQUI" ? "Nequi" : p.brand || "Tarjeta"),
    last4: p.last4 ?? undefined,
    brand: p.brand ?? undefined,
    phone: p.phone ?? undefined,
    cardholderName: p.cardholderName ?? undefined,
    color: p.methodType === "NEQUI" ? "#430050" : "#1A1F71",
    isDefault: p.isDefault,
  });

  const mapCustomerAddress = (a: CustomerAddress): SavedAddress => ({
    id: String(a.id),
    label: a.alias || "Dirección",
    icon: "📍",
    name: "",
    phone: "",
    address: a.addressLine1,
    city: a.city,
    notes: a.deliveryInstructions || a.reference || "",
    isDefault: a.isDefault,
  });

  const removeFromFavorites = (productId: number) => {
    setFavorites((prev) => prev.filter((p) => p.id !== productId));
    catalogService.removeFavorite(productId).catch(() => {});
  };

  const allOrders: AcctOrder[] = (() => {
    const combined: AcctOrder[] = [
      ...apiOrders.map((o) => ({
        ...o,
        estimatedDelivery: "",
        deliveredAt: o.status === "entregado" ? o.date : "",
      })),
      ...appOrders.map((o) => ({
        ...o,
        status: (o.status === "en camino"
          ? "en camino"
          : o.status === "preparando"
            ? "preparando"
            : "entregado") as AcctOrder["status"],
        estimatedDelivery: "",
        deliveredAt: o.status === "entregado" ? o.date : "",
      })),
    ];
    // Deduplicar por referencia (apiOrders tiene prioridad por ir primero)
    const seen = new Set<string>();
    return combined.filter((o) => {
      if (seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    });
  })();

  // Initialize selected order from API data once loaded
  useEffect(() => {
    if (apiOrders.length > 0) {
      setSelectedOrderId((prev) => prev ?? apiOrders[0].id);
      setTrackingOrderId((prev) => prev || apiOrders[0].id);
    }
  }, [apiOrders]);

  const unreadNotifs = unreadNotifCount;

  const navItems: Array<{
    id: AccountSection;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
  }> = [
    {
      id: "orders",
      label: "Mis Pedidos",
      icon: Package,
      badge:
        allOrders.filter(
          (o) => o.status !== "entregado" && o.status !== "cancelado",
        ).length || undefined,
    },
    {
      id: "favorites",
      label: "Favoritos",
      icon: Heart,
      badge: favorites.length || undefined,
    },
    { id: "lists", label: "Listas de Compras", icon: ClipboardList },
    { id: "history", label: "Historial de Compras", icon: RotateCcw },
    { id: "addresses", label: "Direcciones", icon: MapPin },
    { id: "payments", label: "Métodos de Pago", icon: CreditCard },
    { id: "coupons", label: "Cupones y Recompensas", icon: Gift },
    {
      id: "notifications",
      label: "Notificaciones",
      icon: Bell,
      badge: unreadNotifs || undefined,
    },
    { id: "reviews", label: "Mis Reseñas", icon: Star },
    { id: "support", label: "Centro de Ayuda", icon: HelpCircle },
    { id: "profile", label: "Configuración", icon: Settings },
  ].filter(
    (item) => item.id !== "payments" || paymentsSectionEnabled === true,
  );

  const currentNav = navItems.find(
    (n) =>
      n.id === section ||
      (section === "order-detail" && n.id === "orders") ||
      (section === "tracking" && n.id === "orders"),
  );
  const contentRef = useRef<HTMLElement>(null);

  const navigate = (s: AccountSection) => {
    setSection(s);
    setMobileNavOpen(false);
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fmtCOP = (n: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(n);

  /* ── Sidebar ── */
  const Sidebar = () => (
    <aside className="w-64 flex-shrink-0">
      {/* Profile card */}
      <AcctCard className="p-4 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0"
            style={{
              background: "#FFF200",
              color: "#1A1A2E",
              fontFamily: "'Bricolage Grotesque', sans-serif",
            }}
          >
            C
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-foreground truncate">
              {customer?.fullName || customer?.firstName || "Cliente"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {customer?.email || ""}
            </p>
          </div>
        </div>
      </AcctCard>

      {/* Nav */}
      <AcctCard className="overflow-hidden">
        <nav>
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const active =
              section === item.id ||
              (item.id === "orders" &&
                (section === "order-detail" || section === "tracking"));
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors relative ${idx < navItems.length - 1 ? "border-b border-border" : ""}`}
                style={{ background: active ? "#1A1A2E" : "transparent" }}
              >
                <Icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: active ? "#FFF200" : "#6B7280" }}
                />
                <span
                  className="text-sm font-medium flex-1 truncate"
                  style={{ color: active ? "#FFF200" : "#374151" }}
                >
                  {item.label}
                </span>
                {item.badge !== undefined && (
                  <span
                    className="text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1"
                    style={{
                      background: active ? "#FFF200" : "#1A1A2E",
                      color: active ? "#1A1A2E" : "#FFF200",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </AcctCard>

      <button
        onClick={onBack}
        className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground border border-border hover:border-foreground hover:text-foreground transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver a la tienda
      </button>
    </aside>
  );

  /* ── Orders Section ── */
  const OrdersSection = () => {
    const [filter, setFilter] = useState<string>("todos");
    const [search, setSearch] = useState("");

    const filters = [
      { id: "todos", label: "Todos" },
      { id: "preparando", label: "Preparando" },
      { id: "en camino", label: "En camino" },
      { id: "entregado", label: "Entregado" },
      { id: "cancelado", label: "Cancelado" },
    ];

    const filtered = allOrders.filter((o) => {
      const matchFilter = filter === "todos" || o.status === filter;
      const matchSearch =
        search.trim() === "" ||
        o.id.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });

    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2
            className="font-black text-xl text-foreground"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Mis Pedidos
          </h2>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por número de pedido..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none"
            style={{ boxShadow: "none" }}
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

        {/* Filter tabs */}
        <div
          className="flex gap-2 mb-5 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={
                filter === f.id
                  ? { background: "#1A1A2E", color: "#FFF200" }
                  : { background: "#F4F4F6", color: "#6B7280" }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Package className="w-9 h-9 text-muted-foreground" />}
            title="Sin pedidos aquí"
            subtitle="No encontramos pedidos con ese filtro. Prueba cambiando la búsqueda."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((order) => (
              <AcctCard
                key={order.id}
                className="p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-black text-sm text-foreground"
                        style={{
                          fontFamily: "'Bricolage Grotesque', sans-serif",
                        }}
                      >
                        {order.id}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.date}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className="font-black text-base"
                      style={{
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                      }}
                    >
                      {fmtCOP(order.total)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "producto" : "productos"}
                    </p>
                  </div>
                </div>

                {/* Product thumbs */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 4).map((item, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-lg border-2 border-white overflow-hidden bg-muted flex-shrink-0"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="w-10 h-10 rounded-lg border-2 border-white bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground ml-1">
                    <PaymentMethodIcon method={order.paymentMethod} />
                    <span className="capitalize">{order.paymentMethod}</span>
                  </div>
                  {order.estimatedDelivery && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                      <Clock className="w-3 h-3" />
                      {order.deliveredAt || order.estimatedDelivery}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      navigate("order-detail");
                    }}
                    className="flex-1 py-2 rounded-lg text-xs font-bold border border-border hover:bg-muted transition-colors text-foreground text-center"
                  >
                    Ver detalle
                  </button>
                  {order.status === "en camino" && (
                    <button
                      onClick={() => {
                        setTrackingOrderId(order.id);
                        navigate("tracking");
                      }}
                      className="flex-1 py-2 rounded-lg text-xs font-bold transition-all hover:brightness-95 text-center"
                      style={{ background: "#FFF200", color: "#1A1A2E" }}
                    >
                      Rastrear pedido
                    </button>
                  )}
                  {(order.status === "entregado" ||
                    order.status === "cancelado") && (
                    <button
                      onClick={() =>
                        order.items.forEach((i) =>
                          onAdd(i as unknown as Product),
                        )
                      }
                      className="flex-1 py-2 rounded-lg text-xs font-bold transition-all hover:brightness-95 text-center"
                      style={{ background: "#FFF200", color: "#1A1A2E" }}
                    >
                      Comprar de nuevo
                    </button>
                  )}
                </div>
              </AcctCard>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ── Order Detail Section ── */
  const OrderDetailSection = () => {
    const order =
      allOrders.find((o) => o.id === selectedOrderId) ?? allOrders[0];
    if (!order) return null;
    const subtotal = order.total - order.shipping;
    const tax = Math.round(subtotal * 0.19);

    const actions = [
      {
        icon: RefreshCcw,
        label: "Comprar de nuevo",
        primary: true,
        onClick: () =>
          order.items.forEach((i) => onAdd(i as unknown as Product)),
      },
      {
        icon: Download,
        label: "Descargar factura",
        primary: false,
        onClick: () => {},
      },
      {
        icon: MessageCircle,
        label: "Contactar soporte",
        primary: false,
        onClick: () => navigate("support"),
      },
      {
        icon: AlertCircle,
        label: "Reportar problema",
        primary: false,
        onClick: () => {},
      },
    ];

    const timelineSteps = [
      { label: "Pedido recibido", done: true },
      { label: "Pago confirmado", done: true },
      {
        label: "Preparando pedido",
        done: order.status !== "preparando" || order.status === "entregado",
      },
      {
        label: "En camino",
        done: order.status === "entregado" || order.status === "en camino",
      },
      { label: "Entregado", done: order.status === "entregado" },
    ];

    return (
      <div>
        <button
          onClick={() => navigate("orders")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
        >
          <ChevronLeft className="w-4 h-4" />
          Mis pedidos
        </button>

        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2
              className="font-black text-xl text-foreground"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              {order.id}
            </h2>
            <p className="text-sm text-muted-foreground">{order.date}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Timeline */}
        <AcctCard className="p-5 mb-4">
          <p className="text-xs font-black uppercase tracking-wide text-muted-foreground mb-4">
            Estado del pedido
          </p>
          <div className="flex items-start gap-0">
            {timelineSteps
              .filter((_, i) => !(order.status === "cancelado" && i > 0))
              .map((step, idx, arr) => (
                <div
                  key={step.label}
                  className="flex-1 flex flex-col items-center"
                >
                  <div className="flex items-center w-full">
                    <div
                      className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center z-10 ${idx === 0 ? "ml-auto mr-0" : idx === arr.length - 1 ? "ml-0 mr-auto" : "mx-auto"}`}
                      style={{ background: step.done ? "#1A1A2E" : "#E5E7EB" }}
                    >
                      {step.done ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                      )}
                    </div>
                    {idx < arr.length - 1 && (
                      <div
                        className="flex-1 h-0.5 mx-0"
                        style={{
                          background: step.done ? "#FFF200" : "#E5E7EB",
                        }}
                      />
                    )}
                  </div>
                  <p
                    className="text-[10px] font-semibold text-center mt-1.5 px-0.5 leading-snug"
                    style={{ color: step.done ? "#1A1A2E" : "#9CA3AF" }}
                  >
                    {step.label}
                  </p>
                </div>
              ))}
          </div>
        </AcctCard>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Products */}
          <AcctCard className="p-4">
            <p className="text-xs font-black uppercase tracking-wide text-muted-foreground mb-3">
              Productos ({order.items.length})
            </p>
            <div className="flex flex-col gap-3">
              {order.items.map((item, i) => {
                const prod = item as unknown as CartItem;
                const disc = prod.originalPrice
                  ? prod.originalPrice - prod.price
                  : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">
                        {prod.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        x{prod.quantity} · {fmtCOP(prod.price)} c/u
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-foreground">
                        {fmtCOP(prod.price * prod.quantity)}
                      </p>
                      {disc > 0 && (
                        <p className="text-[10px] text-green-600">
                          -{fmtCOP(disc * prod.quantity)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </AcctCard>

          {/* Summary + address */}
          <div className="flex flex-col gap-4">
            <AcctCard className="p-4">
              <p className="text-xs font-black uppercase tracking-wide text-muted-foreground mb-3">
                Resumen de pago
              </p>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{fmtCOP(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Domicilio</span>
                  <span>
                    {order.shipping === 0 ? "Gratis" : fmtCOP(order.shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IVA incluido</span>
                  <span className="text-xs text-muted-foreground">
                    {fmtCOP(tax)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 mt-1 font-black text-base">
                  <span>Total</span>
                  <span
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    {fmtCOP(order.total)}
                  </span>
                </div>
              </div>
            </AcctCard>
            <AcctCard className="p-4">
              <p className="text-xs font-black uppercase tracking-wide text-muted-foreground mb-2">
                Entrega
              </p>
              <p className="text-xs text-foreground flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-muted-foreground" />
                {order.address}
              </p>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                <PaymentMethodIcon method={order.paymentMethod} />
                <span className="capitalize">{order.paymentMethod}</span>
              </p>
            </AcctCard>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                onClick={a.onClick}
                className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl border border-border hover:shadow-sm transition-all text-center"
                style={
                  a.primary
                    ? { background: "#FFF200", borderColor: "#FFF200" }
                    : {}
                }
              >
                <Icon
                  className="w-5 h-5"
                  style={{ color: a.primary ? "#1A1A2E" : "#6B7280" }}
                />
                <span
                  className="text-xs font-semibold leading-tight"
                  style={{ color: a.primary ? "#1A1A2E" : "#374151" }}
                >
                  {a.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  /* ── Tracking Section ── */
  const TrackingSection = () => {
    const order =
      allOrders.find((o) => o.id === trackingOrderId) ?? allOrders[1];
    return (
      <div>
        <button
          onClick={() => navigate("orders")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
        >
          <ChevronLeft className="w-4 h-4" />
          Mis pedidos
        </button>

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2
              className="font-black text-xl text-foreground"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Rastreo de pedido
            </h2>
            <p className="text-sm text-muted-foreground">{order.id}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Map placeholder */}
        <AcctCard className="mb-4 overflow-hidden">
          <div
            className="relative h-48 flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #E8F4F8 0%, #D1E8F0 100%)",
            }}
          >
            <div className="absolute inset-0 opacity-10">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, #4A90A4 0px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #4A90A4 0px, transparent 1px, transparent 40px)",
                }}
              />
            </div>
            <div className="relative flex flex-col items-center gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: "#FFF200" }}
              >
                <Truck className="w-7 h-7" style={{ color: "#1A1A2E" }} />
              </div>
              <div
                className="px-4 py-2 rounded-xl text-sm font-bold shadow-md"
                style={{ background: "#1A1A2E", color: "#FFF200" }}
              >
                Domiciliario en camino
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow text-xs font-semibold text-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Actualizando ubicación en tiempo real
              </div>
            </div>
          </div>
        </AcctCard>

        {/* Driver info */}
        <AcctCard className="p-4 mb-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0"
              style={{
                background: "#FFF200",
                color: "#1A1A2E",
                fontFamily: "'Bricolage Grotesque', sans-serif",
              }}
            >
              D
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-foreground">
                Diego Martínez
              </p>
              <p className="text-xs text-muted-foreground">
                Domiciliario · Mercaldas Milán
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3" fill="#F5C518" stroke="#F5C518" />
                <span className="text-xs font-semibold">4.9</span>
                <span className="text-xs text-muted-foreground">
                  · 1,247 entregas
                </span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button className="w-10 h-10 rounded-xl flex items-center justify-center border border-border hover:bg-muted transition-colors">
                <Phone className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="w-10 h-10 rounded-xl flex items-center justify-center border border-border hover:bg-muted transition-colors">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
          <div
            className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold"
            style={{ background: "#D4EDDA", color: "#155724" }}
          >
            <Clock className="w-4 h-4" />
            Llegada estimada: 4:50 pm · aprox. 22 minutos
          </div>
        </AcctCard>

        {/* Timeline */}
        <AcctCard className="p-4">
          <p className="text-xs font-black uppercase tracking-wide text-muted-foreground mb-4">
            Historial del pedido
          </p>
          <div className="flex flex-col gap-0">
            {TRACKING_STEPS.map((step, idx) => (
              <div key={step.label} className="flex items-start gap-3">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center border-2"
                    style={{
                      background: step.done ? "#1A1A2E" : "white",
                      borderColor: step.done ? "#1A1A2E" : "#E5E7EB",
                    }}
                  >
                    {step.done ? (
                      <Check className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#E5E7EB" }}
                      />
                    )}
                  </div>
                  {idx < TRACKING_STEPS.length - 1 && (
                    <div
                      className="w-0.5 h-6 mt-0.5"
                      style={{ background: step.done ? "#FFF200" : "#E5E7EB" }}
                    />
                  )}
                </div>
                <div className="pb-5">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: step.done ? "#1A1A2E" : "#9CA3AF" }}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.time}</p>
                </div>
              </div>
            ))}
          </div>
        </AcctCard>
      </div>
    );
  };

  /* ── Favorites Section ── */
  const FavoritesSection = () => {
    const [favSearch, setFavSearch] = useState("");
    const [favCategory, setFavCategory] = useState("Todas");
    const cats = [
      "Todas",
      ...Array.from(new Set(favorites.map((p) => p.category))),
    ];
    const filtered = favorites.filter((p) => {
      const ms =
        favSearch.trim() === "" ||
        p.name.toLowerCase().includes(favSearch.toLowerCase());
      const mc = favCategory === "Todas" || p.category === favCategory;
      return ms && mc;
    });

    if (favoritesLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2
            className="font-black text-xl text-foreground"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Favoritos{" "}
            <span className="text-muted-foreground font-normal text-base">
              ({favorites.length})
            </span>
          </h2>
          {favorites.length > 0 && (
            <button
              onClick={() => favorites.forEach((p) => onAdd(p))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-95"
              style={{ background: "#FFF200", color: "#1A1A2E" }}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Agregar todo al carrito
            </button>
          )}
        </div>

        {favorites.length === 0 ? (
          <EmptyState
            icon={<Heart className="w-9 h-9 text-muted-foreground" />}
            title="Sin favoritos aún"
            subtitle="Guarda tus productos favoritos para encontrarlos fácilmente en tu próxima compra."
            cta="Explorar productos"
            onCta={onViewCatalog}
          />
        ) : (
          <>
            <div className="flex gap-3 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <input
                  value={favSearch}
                  onChange={(e) => setFavSearch(e.target.value)}
                  placeholder="Buscar en favoritos..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-border bg-white focus:outline-none"
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
              <div
                className="flex gap-1.5 overflow-x-auto"
                style={{ scrollbarWidth: "none" }}
              >
                {cats.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFavCategory(c)}
                    className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={
                      favCategory === c
                        ? { background: "#1A1A2E", color: "#FFF200" }
                        : { background: "#F4F4F6", color: "#6B7280" }
                    }
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filtered.map((p) => {
                const inCart = cartItems.find((c) => c.id === p.id);
                const qty = inCart?.quantity ?? 0;
                return (
                  <div
                    key={p.id}
                    className="bg-white border border-border rounded-xl overflow-hidden group hover:shadow-md transition-shadow flex flex-col"
                  >
                    <div className="relative aspect-square bg-muted overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={() => removeFromFavorites(p.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors"
                      >
                        <Heart
                          className="w-3.5 h-3.5"
                          fill="#FF4444"
                          stroke="#FF4444"
                        />
                      </button>
                      {p.badge && (
                        <span
                          className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full text-white"
                          style={{
                            background:
                              p.badge === "Nuevo" ? "#1A1A2E" : "#FF4444",
                          }}
                        >
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <div className="p-3 flex flex-col gap-1 flex-1">
                      <p className="text-xs text-muted-foreground">
                        {p.category}
                      </p>
                      <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                        {p.name}
                      </p>
                      <div className="flex items-end gap-1.5 mt-auto pt-1">
                        <span
                          className="font-bold text-base"
                          style={{
                            fontFamily: "'Bricolage Grotesque', sans-serif",
                          }}
                        >
                          {fmtCOP(p.price)}
                        </span>
                        {p.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            {fmtCOP(p.originalPrice)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center border border-border rounded-lg overflow-hidden mt-2">
                        <button
                          onClick={() => onRemove(p.id)}
                          disabled={qty === 0}
                          className="flex-1 flex items-center justify-center py-1.5 disabled:opacity-25 hover:bg-muted transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-sm w-8 text-center tabular-nums">
                          {qty}
                        </span>
                        <button
                          onClick={() => onAdd(p)}
                          className="flex-1 flex items-center justify-center py-1.5 hover:bg-muted transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => onAdd(p)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-semibold text-xs mt-1 transition-all hover:brightness-95"
                        style={{ background: "#FFF200", color: "#1A1A2E" }}
                      >
                        <ShoppingCart className="w-3 h-3" />
                        {qty === 0 ? "Agregar" : "Agregar uno más"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  /* ── Shopping Lists ── */
  const ListsSection = () => {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [newListName, setNewListName] = useState("");
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [productSearch, setProductSearch] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [searching, setSearching] = useState(false);
    const selectedList = lists.find((l) => l.id === selectedListId);

    // Search products
    useEffect(() => {
      if (!productSearch.trim() || !showAddProduct) {
        setSearchResults([]);
        return;
      }
      const timer = setTimeout(async () => {
        setSearching(true);
        try {
          const results = await catalogService.getProducts({
            search: productSearch.trim(),
            limit: 10,
          });
          setSearchResults(results);
        } catch {
          setSearchResults([]);
        }
        setSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    }, [productSearch, showAddProduct]);

    const refreshLists = async () => {
      try {
        const data = await catalogService.getShoppingLists();
        setLists(data);
        if (selectedListId && !data.find((l) => l.id === selectedListId)) {
          setSelectedListId(data[0]?.id ?? null);
        }
      } catch {}
    };

    const createList = async () => {
      if (!newListName.trim()) return;
      try {
        const { id } = await catalogService.createShoppingList(
          newListName.trim(),
        );
        await refreshLists();
        setSelectedListId(id);
        setNewListName("");
      } catch {}
    };

    const deleteList = async (id: number) => {
      try {
        await catalogService.deleteShoppingList(id);
        await refreshLists();
      } catch {}
    };

    const duplicateList = async (list: (typeof lists)[0]) => {
      try {
        const { id } = await catalogService.createShoppingList(
          `${list.name} (copia)`,
        );
        for (const item of list.items) {
          await catalogService.addToShoppingList(
            id,
            item.productId,
            item.quantity,
          );
        }
        await refreshLists();
        setSelectedListId(id);
      } catch {}
    };

    const renameList = async (id: number, name: string) => {
      try {
        await catalogService.updateShoppingList(id, name);
        setLists((prev) => prev.map((l) => (l.id === id ? { ...l, name } : l)));
        setEditingId(null);
      } catch {}
    };

    const updateQty = async (
      listId: number,
      productId: number,
      newQty: number,
    ) => {
      if (newQty <= 0) {
        await catalogService.removeShoppingListItem(listId, productId);
      } else {
        await catalogService.updateShoppingListItem(listId, productId, newQty);
      }
      setLists((prev) =>
        prev.map((l) => {
          if (l.id !== listId) return l;
          if (newQty <= 0)
            return {
              ...l,
              items: l.items.filter((i) => i.productId !== productId),
            };
          return {
            ...l,
            items: l.items.map((i) =>
              i.productId === productId ? { ...i, quantity: newQty } : i,
            ),
          };
        }),
      );
    };

    const removeItem = async (listId: number, productId: number) => {
      try {
        await catalogService.removeShoppingListItem(listId, productId);
        setLists((prev) =>
          prev.map((l) =>
            l.id === listId
              ? {
                  ...l,
                  items: l.items.filter((i) => i.productId !== productId),
                }
              : l,
          ),
        );
      } catch {}
    };

    const addToList = async (product: Product) => {
      if (!selectedListId) return;
      try {
        await catalogService.addToShoppingList(selectedListId, product.id, 1);
        await refreshLists();
      } catch {}
    };

    const addListToCart = (list: (typeof lists)[0]) => {
      list.items.forEach(
        ({ productId, productName, productPrice, productImage, quantity }) => {
          onAdd(
            {
              id: productId,
              name: productName,
              price: productPrice,
              image: productImage || "",
            } as Product,
            quantity,
          );
        },
      );
    };

    const replaceListToCart = (list: (typeof lists)[0]) => {
      if (!onReplaceCart) return;
      onReplaceCart(
        list.items.map(
          ({ productId, productName, productPrice, productImage, quantity }) =>
            ({
              id: productId,
              name: productName,
              price: productPrice,
              image: productImage || undefined,
              quantity,
            }) as CartItem,
        ),
      );
    };

    if (listsLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    return (
      <div>
        <h2
          className="font-black text-xl text-foreground mb-5"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          Listas de Compras
        </h2>

        {lists.length === 0 ? (
          <div className="flex flex-col items-center">
            <EmptyState
              icon={<ClipboardList className="w-9 h-9 text-muted-foreground" />}
              title="Sin listas aún"
              subtitle="Crea listas para organizar tus compras recurrentes y agilizar tu mercado."
            />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createList();
              }}
              className="flex gap-2 w-full max-w-xs mt-2"
            >
              <input
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Nombre de la lista..."
                className="flex-1 text-sm border border-border rounded-xl px-4 py-2.5 focus:outline-none bg-white"
                onFocus={(e) => {
                  e.target.style.boxShadow = "0 0 0 2px #FFF200";
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl text-sm font-bold flex-shrink-0"
                style={{ background: "#FFF200", color: "#1A1A2E" }}
              >
                Crear
              </button>
            </form>
          </div>
        ) : (
          <div className="flex gap-4 flex-col md:flex-row">
            {/* List selector */}
            <div className="md:w-52 flex-shrink-0 flex flex-col gap-2">
              {lists.map((list) => (
                <div
                  key={list.id}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${selectedListId === list.id ? "border-foreground bg-foreground/5" : "border-border bg-white hover:bg-muted"}`}
                  onClick={() => setSelectedListId(list.id)}
                >
                  {editingId === list.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        renameList(list.id, editName);
                      }}
                      className="flex-1 flex gap-1"
                    >
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 text-xs border border-border rounded px-1.5 py-1 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="text-xs font-bold px-2 rounded"
                        style={{ background: "#FFF200", color: "#1A1A2E" }}
                      >
                        ✓
                      </button>
                    </form>
                  ) : (
                    <>
                      <ClipboardList className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                      <span className="text-xs font-semibold flex-1 truncate">
                        {list.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {list.items.length}
                      </span>
                    </>
                  )}
                </div>
              ))}

              {/* Create new */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createList();
                }}
                className="flex gap-1 mt-1"
              >
                <input
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Nueva lista..."
                  className="flex-1 text-xs border border-border rounded-xl px-3 py-2 focus:outline-none bg-white"
                  onFocus={(e) => {
                    e.target.style.boxShadow = "0 0 0 2px #FFF200";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0"
                  style={{ background: "#FFF200", color: "#1A1A2E" }}
                >
                  +
                </button>
              </form>
            </div>

            {/* Selected list content */}
            {selectedList && (
              <div className="flex-1">
                <AcctCard className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-base text-foreground">
                      {selectedList.name}
                    </h3>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          setEditingId(selectedList.id);
                          setEditName(selectedList.name);
                        }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-colors"
                      >
                        <Pencil className="w-3 h-3 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => duplicateList(selectedList)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-colors"
                      >
                        <Copy className="w-3 h-3 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => deleteList(selectedList.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {selectedList.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Lista vacía. Agrega productos usando el buscador.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3 mb-4">
                      {selectedList.items.map(
                        ({
                          productId,
                          productName,
                          productPrice,
                          productImage,
                          quantity,
                        }) => (
                          <div
                            key={productId}
                            className="flex items-center gap-3"
                          >
                            <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                              {productImage && (
                                <img
                                  src={productImage}
                                  alt={productName}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground line-clamp-1">
                                {productName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {fmtCOP(productPrice)}
                              </p>
                            </div>
                            <div className="flex items-center border border-border rounded-lg overflow-hidden flex-shrink-0">
                              <button
                                onClick={() =>
                                  updateQty(
                                    selectedList.id,
                                    productId,
                                    quantity - 1,
                                  )
                                }
                                className="px-2 py-1.5 hover:bg-muted transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-7 text-center text-xs font-bold">
                                {quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQty(
                                    selectedList.id,
                                    productId,
                                    quantity + 1,
                                  )
                                }
                                className="px-2 py-1.5 hover:bg-muted transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() =>
                                removeItem(selectedList.id, productId)
                              }
                              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0"
                            >
                              <X className="w-3 h-3 text-muted-foreground" />
                            </button>
                          </div>
                        ),
                      )}
                    </div>
                  )}

                  {/* Add product + cart buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddProduct(!showAddProduct)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border-2 border-dashed border-border hover:border-foreground hover:bg-muted transition-all text-muted-foreground"
                    >
                      <Plus className="w-3 h-3" />
                      Agregar producto
                    </button>

                    {selectedList.items.length > 0 ? (
                      <div className="flex gap-2 flex-1">
                        <button
                          onClick={() => addListToCart(selectedList)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all hover:brightness-95"
                          style={{ background: "#FFF200", color: "#1A1A2E" }}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Agregar al carrito
                        </button>
                        {onReplaceCart && (
                          <button
                            onClick={() => replaceListToCart(selectedList)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm border-2 border-[#FFF200] transition-all hover:bg-[#FFF200]/10"
                            style={{ color: "#1A1A2E" }}
                          >
                            <RefreshCcw className="w-4 h-4" />
                            Reemplazar carrito
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* Product search panel */}
                  {showAddProduct && (
                    <div className="mt-4 border-t border-border pt-4">
                      <div className="relative">
                        <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-[#FFF200] focus-within:border-transparent transition-all">
                          <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <input
                            autoFocus
                            type="text"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            placeholder="Buscar producto para agregar..."
                            className="flex-1 text-xs bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground"
                          />
                          {searching && (
                            <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin flex-shrink-0" />
                          )}
                        </div>

                        {/* Search results dropdown */}
                        {productSearch.trim() && searchResults.length > 0 && (
                          <div className="absolute z-20 mt-1 w-full bg-white border border-border rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                            {searchResults.map((product) => {
                              const alreadyInList = selectedList.items.some(
                                (i) => i.productId === product.id,
                              );
                              return (
                                <button
                                  key={product.id}
                                  onClick={() => {
                                    addToList(product);
                                    setProductSearch("");
                                  }}
                                  disabled={alreadyInList}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <div className="w-9 h-9 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                                    {product.image && (
                                      <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-foreground line-clamp-1">
                                      {product.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {fmtCOP(product.price)}
                                    </p>
                                  </div>
                                  {alreadyInList ? (
                                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                                      Ya en lista
                                    </span>
                                  ) : (
                                    <Plus className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* No results message */}
                        {productSearch.trim() &&
                          !searching &&
                          searchResults.length === 0 && (
                            <div className="mt-3 text-center py-4">
                              <p className="text-xs text-muted-foreground">
                                No se encontraron productos con "{productSearch}
                                "
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </AcctCard>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  /* ── Addresses Section ── */
  const AddressesSection = () => {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<Partial<SavedAddress>>({});
    const [saving, setSaving] = useState(false);

    const refreshAddresses = async () => {
      try {
        const data = await customerAddressService.getAddresses();
        setAddresses(data.map(mapCustomerAddress));
      } catch {}
    };

    const setDefault = async (id: string) => {
      try {
        await customerAddressService.setDefault(Number(id));
        setAddresses((prev) =>
          prev.map((a) => ({ ...a, isDefault: a.id === id })),
        );
      } catch {}
    };

    const deleteAddr = async (id: string) => {
      try {
        await customerAddressService.deleteAddress(Number(id));
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      } catch {}
    };

    const saveAddr = async () => {
      if (!form.label || !form.address) return;
      setSaving(true);
      try {
        await customerAddressService.createAddress({
          alias: form.label,
          addressLine1: form.address,
          city: form.city || "Manizales",
          reference: form.notes || undefined,
        });
        await refreshAddresses();
        setShowForm(false);
        setForm({});
      } catch {}
      setSaving(false);
    };

    if (addressesLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2
            className="font-black text-xl text-foreground"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Direcciones
          </h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-95"
            style={{ background: "#FFF200", color: "#1A1A2E" }}
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva dirección
          </button>
        </div>

        {addresses.length === 0 && !showForm ? (
          <EmptyState
            icon={<MapPin className="w-9 h-9 text-muted-foreground" />}
            title="Sin direcciones guardadas"
            subtitle="Guarda tus direcciones frecuentes para hacer tus pedidos más rápido."
            cta="Agregar dirección"
            onCta={() => setShowForm(true)}
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {addresses.map((addr) => (
              <AcctCard
                key={addr.id}
                className={`p-4 ${addr.isDefault ? "outline-2 outline-foreground outline" : ""}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{addr.icon}</span>
                    <div>
                      <p className="font-bold text-sm text-foreground">
                        {addr.label}
                      </p>
                      {addr.isDefault && (
                        <span
                          className="text-[10px] font-black px-2 py-0.5 rounded-full"
                          style={{ background: "#FFF200", color: "#1A1A2E" }}
                        >
                          PREDETERMINADA
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="w-7 h-7 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-colors">
                      <Pencil className="w-3 h-3 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => deleteAddr(addr.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <p className="text-xs font-semibold text-foreground">
                  {addr.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {addr.address}, {addr.city}
                </p>
                {addr.notes && (
                  <p className="text-xs text-muted-foreground mt-0.5 italic">
                    {addr.notes}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {addr.phone}
                </p>
                {!addr.isDefault && (
                  <button
                    onClick={() => setDefault(addr.id)}
                    className="mt-3 text-xs font-semibold text-muted-foreground underline hover:text-foreground transition-colors"
                  >
                    Establecer como predeterminada
                  </button>
                )}
              </AcctCard>
            ))}

            {showForm && (
              <AcctCard className="p-4 ring-2 ring-foreground">
                <p className="font-bold text-sm mb-3">Nueva dirección</p>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      key: "label",
                      placeholder: "Etiqueta (Ej: Casa, Oficina)",
                    },
                    { key: "name", placeholder: "Nombre del receptor" },
                    { key: "phone", placeholder: "Teléfono" },
                    { key: "address", placeholder: "Dirección completa" },
                    { key: "city", placeholder: "Ciudad" },
                    {
                      key: "notes",
                      placeholder: "Notas adicionales (opcional)",
                    },
                  ].map(({ key, placeholder }) => (
                    <input
                      key={key}
                      placeholder={placeholder}
                      value={(form as Record<string, string>)[key] ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                      className="w-full text-xs border border-border rounded-lg px-3 py-2 focus:outline-none"
                      onFocus={(e) => {
                        e.target.style.boxShadow = "0 0 0 2px #FFF200";
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  ))}
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={saveAddr}
                      disabled={saving}
                      className="flex-1 py-2 rounded-lg text-xs font-bold transition-all hover:brightness-95 disabled:opacity-50"
                      style={{ background: "#FFF200", color: "#1A1A2E" }}
                    >
                      {saving ? "Guardando..." : "Guardar"}
                    </button>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setForm({});
                      }}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold border border-border hover:bg-muted transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </AcctCard>
            )}
          </div>
        )}
      </div>
    );
  };

/* ── Payment Methods ── */
  const PaymentsSection = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formType, setFormType] = useState<"CARD" | "NEQUI">("CARD");
    const [form, setForm] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [paymentsConfig, setPaymentsConfig] = useState<{
      cardEnabled: boolean;
      nequiEnabled: boolean;
      pseEnabled: boolean;
      efectivoEnabled: boolean;
      brebEnabled: boolean;
    }>({ cardEnabled: true, nequiEnabled: true, pseEnabled: true, efectivoEnabled: true, brebEnabled: true });

    // Cargar la config de medios de pago del admin para saber
    // qué métodos están habilitados y pueden guardarse.
    useEffect(() => {
      fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/payments/methods`)
        .then((r) => r.json())
        .then((d) => {
          const wompiOn = d?.wompi?.enabled ?? true;
          setPaymentsConfig({
            cardEnabled: wompiOn && (d?.wompi?.methods?.card ?? true),
            nequiEnabled: wompiOn && (d?.wompi?.methods?.nequi ?? true),
            pseEnabled: wompiOn && (d?.wompi?.methods?.pse ?? true),
            efectivoEnabled: d?.efectivo?.enabled ?? true,
            brebEnabled: d?.breb?.enabled ?? true,
          });
        })
        .catch(() => {});
    }, []);

    const refreshPayments = async () => {
      try {
        const data = await customerPaymentService.getPaymentMethods();
        setPayments(data.map(mapCustomerPaymentMethod));
      } catch {}
    };

    const setDefault = async (id: string) => {
      try {
        await customerPaymentService.setDefault(Number(id));
        setPayments((prev) =>
          prev.map((p) => ({ ...p, isDefault: p.id === id })),
        );
      } catch {}
    };

    const del = async (id: string) => {
      if (!window.confirm("¿Eliminar este método de pago?")) return;
      try {
        await customerPaymentService.deletePaymentMethod(Number(id));
        setPayments((prev) => prev.filter((p) => p.id !== id));
      } catch {}
    };

    const startAdd = () => {
      setEditingId(null);
      setForm({});
      setFormType(paymentsConfig.cardEnabled ? "CARD" : "NEQUI");
      setShowForm(true);
    };

    const startEdit = (pm: SavedPayment) => {
      setEditingId(pm.id);
      setFormType(pm.methodType);
      setForm({
        label: pm.label || "",
        cardholderName: pm.cardholderName || "",
        phone: pm.phone || "",
      });
      setShowForm(true);
    };

    const saveMethod = async () => {
      setSaving(true);
      try {
        if (editingId) {
          const id = Number(editingId);
          if (formType === "NEQUI") {
            await customerPaymentService.updatePaymentMethod(id, {
              label: form.label || "Nequi",
              phone: form.phone,
            });
          } else {
            await customerPaymentService.updatePaymentMethod(id, {
              label: form.label || undefined,
              cardholderName: form.cardholderName || undefined,
            });
          }
        } else if (formType === "CARD") {
          if (
            !form.cardholderName ||
            !form.cardNumber ||
            !form.expiryMonth ||
            !form.expiryYear ||
            !form.cvv
          ) {
            throw new Error("Completa todos los datos de la tarjeta");
          }
          const wompi = await ordersService.getWompiConfig();
          if (!wompi?.publicKey) {
            throw new Error(
              "El procesador de tarjetas no está configurado por la tienda",
            );
          }
          const tokenized = await ordersService.tokenizeWompiCard({
            publicKey: wompi.publicKey,
            number: form.cardNumber.replace(/\s/g, ""),
            cvc: form.cvv,
            expMonth: form.expiryMonth,
            expYear: form.expiryYear,
            cardHolder: form.cardholderName,
          });
          await customerPaymentService.createPaymentMethod({
            methodType: "CARD",
            label: form.label || tokenized.brand,
            brand: tokenized.brand,
            last4: tokenized.last_four,
            cardholderName: form.cardholderName,
            token: tokenized.id,
            isDefault: visiblePayments.length === 0,
          });
        } else {
          if (!form.phone) throw new Error("Ingresa el número de Nequi");
          await customerPaymentService.createPaymentMethod({
            methodType: "NEQUI",
            label: form.label || "Nequi",
            phone: form.phone,
            isDefault: visiblePayments.length === 0,
          });
        }
        await refreshPayments();
        setShowForm(false);
        setEditingId(null);
        setForm({});
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "Error al guardar");
      } finally {
        setSaving(false);
      }
    };

    const availableTypes = [
      paymentsConfig.cardEnabled && {
        key: "CARD" as const,
        label: "Tarjeta débito / crédito",
        desc: "Visa, Mastercard, Amex",
      },
      paymentsConfig.nequiEnabled && {
        key: "NEQUI" as const,
        label: "Nequi",
        desc: "Paga con tu número de celular",
      },
    ].filter(Boolean) as Array<{
      key: "CARD" | "NEQUI";
      label: string;
      desc: string;
    }>;

    const acceptedLogos = [
      paymentsConfig.efectivoEnabled && "Efectivo",
      paymentsConfig.cardEnabled && "Visa",
      paymentsConfig.cardEnabled && "Mastercard",
      paymentsConfig.pseEnabled && "PSE",
      paymentsConfig.nequiEnabled && "Nequi",
      paymentsConfig.brebEnabled && "Bre-B",
    ].filter(Boolean) as string[];

    const visiblePayments = payments.filter((p) =>
      p.methodType === "CARD"
        ? paymentsConfig.cardEnabled
        : paymentsConfig.nequiEnabled,
    );

    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2
            className="font-black text-xl text-foreground"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Métodos de Pago
          </h2>
          <button
            onClick={startAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-95"
            style={{ background: "#FFF200", color: "#1A1A2E" }}
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar método
          </button>
        </div>

        {visiblePayments.length === 0 && !showForm ? (
          <EmptyState
            icon={<CreditCard className="w-9 h-9 text-muted-foreground" />}
            title="Sin métodos de pago"
            subtitle="Agrega una tarjeta o Nequi para pagar más rápido."
            cta="Agregar método"
            onCta={startAdd}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {visiblePayments.map((pm) => (
              <AcctCard
                key={pm.id}
                className={`p-4 ${pm.isDefault ? "ring-2 ring-foreground" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-xs"
                    style={{ background: pm.color }}
                  >
                    {pm.methodType === "NEQUI"
                      ? pm.label?.[0] ?? "N"
                      : pm.brand?.[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-foreground">
                        {pm.label}
                      </p>
                      {pm.isDefault && (
                        <span
                          className="text-[10px] font-black px-2 py-0.5 rounded-full"
                          style={{ background: "#FFF200", color: "#1A1A2E" }}
                        >
                          PREDETERMINADA
                        </span>
                      )}
                    </div>
                    {pm.last4 && (
                      <p className="text-xs text-muted-foreground">
                        •••• •••• •••• {pm.last4}
                      </p>
                    )}
                    {pm.phone && (
                      <p className="text-xs text-muted-foreground">
                        {pm.phone}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground capitalize">
                      {pm.methodType === "NEQUI"
                        ? "Billetera digital"
                        : "Tarjeta"}
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {!pm.isDefault && (
                      <button
                        onClick={() => setDefault(pm.id)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors font-semibold"
                      >
                        Predeterminar
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(pm)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-colors"
                    >
                      <Pencil className="w-3 h-3 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => del(pm.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </AcctCard>
            ))}

            {showForm && (
              <AcctCard className="p-4 ring-2 ring-foreground">
                <p className="font-bold text-sm mb-3">
                  {editingId
                    ? "Editar método de pago"
                    : "Nuevo método de pago"}
                </p>

                {!editingId && (
                  <div className="flex flex-col gap-2 mb-3">
                    {availableTypes.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        La tienda no tiene métodos de pago habilitados para
                        guardar.
                      </p>
                    ) : (
                      availableTypes.map((t) => (
                        <label
                          key={t.key}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer ${formType === t.key ? "border-yellow-400 bg-yellow-50" : "border-border"}`}
                        >
                          <input
                            type="radio"
                            name="pm-type"
                            checked={formType === t.key}
                            onChange={() => setFormType(t.key)}
                            className="sr-only"
                          />
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${formType === t.key ? "border-yellow-500" : "border-muted-foreground"}`}
                          >
                            {formType === t.key && (
                              <div className="w-2 h-2 rounded-full bg-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{t.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {t.desc}
                            </p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                )}

                {formType === "CARD" && (
                  <div className="flex flex-col gap-2">
                    <input
                      placeholder="Nombre del titular"
                      value={form.cardholderName ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          cardholderName: e.target.value,
                        }))
                      }
                      className="w-full text-xs border border-border rounded-lg px-3 py-2 focus:outline-none"
                    />
                    <input
                      placeholder="Número de tarjeta"
                      inputMode="numeric"
                      maxLength={19}
                      value={form.cardNumber ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          cardNumber: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 16)
                            .replace(/(.{4})/g, "$1 ")
                            .trim(),
                        }))
                      }
                      className="w-full text-xs border border-border rounded-lg px-3 py-2 focus:outline-none"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        placeholder="MM"
                        inputMode="numeric"
                        maxLength={2}
                        value={form.expiryMonth ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            expiryMonth: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 2),
                          }))
                        }
                        className="w-full text-xs border border-border rounded-lg px-3 py-2 focus:outline-none"
                      />
                      <input
                        placeholder="AA"
                        inputMode="numeric"
                        maxLength={2}
                        value={form.expiryYear ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            expiryYear: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 2),
                          }))
                        }
                        className="w-full text-xs border border-border rounded-lg px-3 py-2 focus:outline-none"
                      />
                      <input
                        placeholder="CVV"
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={form.cvv ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                          }))
                        }
                        className="w-full text-xs border border-border rounded-lg px-3 py-2 focus:outline-none"
                      />
                    </div>
                    <input
                      placeholder="Nombre o alias (opcional)"
                      value={form.label ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, label: e.target.value }))
                      }
                      className="w-full text-xs border border-border rounded-lg px-3 py-2 focus:outline-none"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      La tarjeta se tokeniza de forma segura con Wompi. Solo se
                      guarda la marca y los últimos 4 dígitos.
                    </p>
                  </div>
                )}

                {formType === "NEQUI" && (
                  <div className="flex flex-col gap-2">
                    <input
                      placeholder="Número de Nequi"
                      inputMode="numeric"
                      maxLength={10}
                      value={form.phone ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          phone: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10),
                        }))
                      }
                      className="w-full text-xs border border-border rounded-lg px-3 py-2 focus:outline-none"
                    />
                    <input
                      placeholder="Nombre o alias (opcional)"
                      value={form.label ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, label: e.target.value }))
                      }
                      className="w-full text-xs border border-border rounded-lg px-3 py-2 focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={saveMethod}
                    disabled={saving || availableTypes.length === 0}
                    className="flex-1 py-2 rounded-lg text-xs font-bold transition-all hover:brightness-95 disabled:opacity-50"
                    style={{ background: "#FFF200", color: "#1A1A2E" }}
                  >
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setForm({});
                    }}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold border border-border hover:bg-muted transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </AcctCard>
            )}

            {/* Accepted logos */}
            {acceptedLogos.length > 0 && (
              <AcctCard className="p-4 mt-1">
                <p className="text-xs font-black uppercase tracking-wide text-muted-foreground mb-3">
                  Métodos aceptados
                </p>
                <div className="flex flex-wrap gap-2">
                  {acceptedLogos.map((m) => (
                    <span
                      key={m}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border border-border text-muted-foreground"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </AcctCard>
            )}
          </div>
        )}
      </div>
    );
  };

  /* ── Coupons & Rewards ── */
  const CouponsSection = () => {
    const [tab, setTab] = useState<"active" | "used" | "points">("active");
    const active = coupons.filter((c) => !c.used);
    const used = coupons.filter((c) => c.used);
    const ptsNeeded = 1000;
    const ptsProgress = (LOYALTY_PTS % ptsNeeded) / ptsNeeded;

    return (
      <div>
        <h2
          className="font-black text-xl text-foreground mb-5"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          Cupones y Recompensas
        </h2>

        {/* Points highlight */}
        <AcctCard
          className="p-5 mb-5"
          style={
            {
              background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)",
            } as React.CSSProperties
          }
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wide mb-1"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Tus puntos Mercaldas
              </p>
              <p
                className="text-4xl font-black text-white"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                {LOYALTY_PTS.toLocaleString()}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                = {fmtCOP(Math.floor(LOYALTY_PTS / 1000) * 5000)} en descuentos
              </p>
            </div>
            <Award className="w-14 h-14" style={{ color: "#FFF200" }} />
          </div>
          <div className="mb-1">
            <div
              className="flex justify-between text-xs mb-1"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              <span>
                {LOYALTY_PTS % ptsNeeded} / {ptsNeeded} pts para próximo premio
              </span>
              <span>{Math.round(ptsProgress * 100)}%</span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${ptsProgress * 100}%`,
                  background: "#FFF200",
                }}
              />
            </div>
          </div>
        </AcctCard>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[
            { id: "active", label: `Activos (${active.length})` },
            { id: "used", label: `Usados (${used.length})` },
            { id: "points", label: "Historial de puntos" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={
                tab === t.id
                  ? { background: "#1A1A2E", color: "#FFF200" }
                  : { background: "#F4F4F6", color: "#6B7280" }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "active" &&
          (active.length === 0 ? (
            <EmptyState
              icon={<Gift className="w-9 h-9 text-muted-foreground" />}
              title="Sin cupones activos"
              subtitle="Tus cupones y promociones exclusivas aparecerán aquí."
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {active.map((c) => (
                <AcctCard key={c.id} className="overflow-hidden">
                  <div className="flex">
                    <div
                      className="w-2 flex-shrink-0"
                      style={{ background: c.color }}
                    />
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p
                            className="font-black text-lg"
                            style={{
                              fontFamily: "'Bricolage Grotesque', sans-serif",
                            }}
                          >
                            {c.discount}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {c.description}
                          </p>
                        </div>
                        {c.category && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-border text-muted-foreground flex-shrink-0">
                            {c.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        <div>
                          <p className="text-[11px] font-mono font-bold px-2 py-1 rounded-lg border-2 border-dashed border-border text-foreground tracking-widest">
                            {c.code}
                          </p>
                          {c.minPurchase > 0 && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Mín. {fmtCOP(c.minPurchase)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3" />
                            Vence: {c.expiresAt}
                          </p>
                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText(c.code);
                            }}
                            className="mt-1 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition-all hover:brightness-95"
                            style={{ background: "#FFF200", color: "#1A1A2E" }}
                          >
                            <Copy className="w-3 h-3" />
                            Copiar código
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </AcctCard>
              ))}
            </div>
          ))}

        {tab === "used" &&
          (used.length === 0 ? (
            <EmptyState
              icon={<Tag className="w-9 h-9 text-muted-foreground" />}
              title="Sin cupones usados"
              subtitle="Los cupones que hayas canjeado aparecerán aquí."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {used.map((c) => (
                <AcctCard key={c.id} className="overflow-hidden opacity-60">
                  <div className="flex">
                    <div className="w-2 flex-shrink-0 bg-muted" />
                    <div className="p-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm text-muted-foreground line-through">
                            {c.discount}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {c.description}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          USADO
                        </span>
                      </div>
                    </div>
                  </div>
                </AcctCard>
              ))}
            </div>
          ))}

        {tab === "points" && (
          <AcctCard className="overflow-hidden">
            <div className="divide-y divide-border">
              {LOYALTY_HISTORY.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {entry.desc}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.date}
                    </p>
                  </div>
                  <span
                    className="font-black text-base"
                    style={{
                      color: entry.pts > 0 ? "#155724" : "#721C24",
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                    }}
                  >
                    {entry.pts > 0 ? "+" : ""}
                    {entry.pts} pts
                  </span>
                </div>
              ))}
            </div>
          </AcctCard>
        )}
      </div>
    );
  };

  /* ── Purchase History ── */
  const HistorySection = () => {
    const [histSearch, setHistSearch] = useState("");
    const [histDate, setHistDate] = useState("Todos");

    const parseOrderDate = (dateStr: string): Date => {
      const meses: Record<string, number> = {
        enero: 0,
        febrero: 1,
        marzo: 2,
        abril: 3,
        mayo: 4,
        junio: 5,
        julio: 6,
        agosto: 7,
        septiembre: 8,
        octubre: 9,
        noviembre: 10,
        diciembre: 11,
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        may: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        oct: 9,
        nov: 10,
        dec: 11,
      };
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) return d;
      const m = dateStr.match(/(\d+)\s+de\s+(\S+)\s+de\s+(\d+)/);
      if (m) return new Date(+m[3], meses[m[2].toLowerCase()] ?? 0, +m[1]);
      const m2 = dateStr.match(/(\d+)\s+(\S+)\s+(\d+)/);
      if (m2) return new Date(+m2[3], meses[m2[2].toLowerCase()] ?? 0, +m2[1]);
      return new Date(0);
    };

    const isInRange = (dateStr: string): boolean => {
      if (histDate === "Todos") return true;
      const d = parseOrderDate(dateStr);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const orderDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

      if (histDate === "Hoy") return orderDay.getTime() === today.getTime();
      if (histDate === "Ayer")
        return orderDay.getTime() === yesterday.getTime();

      const diffMs = now.getTime() - d.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (histDate === "Último mes") return diffDays <= 30;
      if (histDate === "Últimos 3 meses") return diffDays <= 90;
      if (histDate === "Este año") return d.getFullYear() === now.getFullYear();
      return true;
    };

    const allProducts = allOrders.flatMap((o) =>
      o.items.map((i) => ({
        ...(i as unknown as CartItem),
        orderId: o.id,
        orderDate: o.date,
        status: o.status,
      })),
    );
    const dates = [
      "Todos",
      "Hoy",
      "Ayer",
      "Último mes",
      "Últimos 3 meses",
      "Este año",
    ];

    const filtered = allProducts.filter((p) => {
      const ms =
        histSearch.trim() === "" ||
        p.name.toLowerCase().includes(histSearch.toLowerCase());
      return ms && isInRange(p.orderDate);
    });

    return (
      <div>
        <h2
          className="font-black text-xl text-foreground mb-5"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          Historial de Compras
        </h2>

        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              value={histSearch}
              onChange={(e) => setHistSearch(e.target.value)}
              placeholder="Buscar productos comprados..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-border bg-white focus:outline-none"
              onFocus={(e) => {
                e.target.style.boxShadow = "0 0 0 2px #FFF200";
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
          <select
            value={histDate}
            onChange={(e) => setHistDate(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none font-medium"
          >
            {dates.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<RotateCcw className="w-9 h-9 text-muted-foreground" />}
            title="Sin resultados"
            subtitle="Intenta con otros términos de búsqueda o cambia los filtros."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((item, idx) => (
              <AcctCard
                key={idx}
                className="p-3 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(item as typeof item & { orderDate: string }).orderDate}{" "}
                      · Pedido{" "}
                      {(item as typeof item & { orderId: string }).orderId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.category} · x{item.quantity}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className="font-bold text-sm"
                      style={{
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                      }}
                    >
                      {fmtCOP(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => {
                        for (let i = 0; i < item.quantity; i++)
                          onAdd(item as unknown as Product);
                      }}
                      className="mt-1 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition-all hover:brightness-95 whitespace-nowrap"
                      style={{ background: "#FFF200", color: "#1A1A2E" }}
                    >
                      <RefreshCcw className="w-2.5 h-2.5" />
                      Comprar de nuevo
                    </button>
                  </div>
                </div>
              </AcctCard>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ── Notifications ── */
  const NotificationsSection = () => {
    const [prefOpen, setPrefOpen] = useState(false);
    const [prefs, setPrefs] = useState({
      orders: true,
      promos: true,
      coupons: true,
      newProducts: false,
      recommendations: false,
    });
    const unread = notifs.filter((n) => !n.read);

    const typeIcon: Record<AcctNotif["type"], React.ReactNode> = {
      order: <Package className="w-4 h-4" style={{ color: "#004085" }} />,
      promo: <Tag className="w-4 h-4" style={{ color: "#856404" }} />,
      coupon: <Gift className="w-4 h-4" style={{ color: "#155724" }} />,
      new: <Sparkles className="w-4 h-4" style={{ color: "#6B7280" }} />,
      reco: <Star className="w-4 h-4" style={{ color: "#F5C518" }} />,
    };
    const typeBg: Record<AcctNotif["type"], string> = {
      order: "#CCE5FF",
      promo: "#FFF3CD",
      coupon: "#D4EDDA",
      new: "#F4F4F6",
      reco: "#FFFDE7",
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2
              className="font-black text-xl text-foreground"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Notificaciones
            </h2>
            {unread.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {unread.length} sin leer
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {unread.length > 0 && (
              <button
                onClick={() =>
                  setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
                }
                className="text-xs font-semibold text-muted-foreground underline hover:text-foreground transition-colors"
              >
                Marcar todas como leídas
              </button>
            )}
            <button
              onClick={() => setPrefOpen((v) => !v)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              Preferencias
            </button>
          </div>
        </div>

        {prefOpen && (
          <AcctCard className="p-4 mb-4">
            <p className="font-bold text-sm mb-3">
              Preferencias de notificación
            </p>
            <div className="flex flex-col gap-3">
              {Object.entries({
                orders: "Actualizaciones de pedidos",
                promos: "Promociones y ofertas",
                coupons: "Cupones disponibles",
                newProducts: "Nuevos productos",
                recommendations: "Recomendaciones personalizadas",
              }).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span className="text-sm text-foreground">{label}</span>
                  <div
                    className="relative w-10 h-5 rounded-full transition-all flex-shrink-0"
                    style={{
                      background: prefs[key as keyof typeof prefs]
                        ? "#FFF200"
                        : "#E5E7EB",
                    }}
                    onClick={() =>
                      setPrefs((p) => ({
                        ...p,
                        [key]: !p[key as keyof typeof prefs],
                      }))
                    }
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-foreground shadow transition-all"
                      style={{
                        left: prefs[key as keyof typeof prefs]
                          ? "calc(100% - 18px)"
                          : "2px",
                      }}
                    />
                  </div>
                </label>
              ))}
            </div>
          </AcctCard>
        )}

        {notifs.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-9 h-9 text-muted-foreground" />}
            title="Sin notificaciones"
            subtitle="Aquí aparecerán las actualizaciones de tus pedidos, promociones y más."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {notifs.map((n) => (
              <AcctCard
                key={n.id}
                className={`p-4 transition-all ${!n.read ? "ring-1 ring-foreground/20" : ""}`}
                style={!n.read ? { background: "#FFFEF0" } : {}}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: typeBg[n.type] }}
                  >
                    {typeIcon[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm ${!n.read ? "font-bold" : "font-semibold"} text-foreground`}
                      >
                        {n.title}
                      </p>
                      {!n.read && (
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                          style={{ background: "#1A1A2E" }}
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {n.body}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {n.time}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {!n.read && (
                      <button
                        onClick={() => {
                          setNotifs((prev) =>
                            prev.map((x) =>
                              x.id === n.id ? { ...x, read: true } : x,
                            ),
                          );
                          onMarkNotifRead?.(Number(n.id));
                        }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-colors"
                      >
                        <Check className="w-3 h-3 text-muted-foreground" />
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setNotifs((prev) => prev.filter((x) => x.id !== n.id))
                      }
                      className="w-7 h-7 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-colors"
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </AcctCard>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ── Reviews ── */
  const ReviewsSection = () => {
    const [showForm, setShowForm] = useState(false);
    const [newRating, setNewRating] = useState(0);
    const [newText, setNewText] = useState("");
    const [editId, setEditId] = useState<string | null>(null);

    const submitReview = () => {
      if (newRating === 0 || !newText.trim()) return;
      if (editId) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === editId ? { ...r, rating: newRating, text: newText } : r,
          ),
        );
        setEditId(null);
      }
      setShowForm(false);
      setNewRating(0);
      setNewText("");
    };

    return (
      <div>
        <h2
          className="font-black text-xl text-foreground mb-5"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          Mis Reseñas
        </h2>

        {reviews.length === 0 ? (
          <EmptyState
            icon={<Star className="w-9 h-9 text-muted-foreground" />}
            title="Sin reseñas aún"
            subtitle="Comparte tu experiencia con los productos que has comprado."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.map((rev) => (
              <AcctCard key={rev.id} className="p-4">
                {editId === rev.id ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                        <img
                          src={rev.product.image}
                          alt={rev.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm font-semibold text-foreground line-clamp-1">
                        {rev.product.name}
                      </p>
                    </div>
                    <StarRating value={newRating} onChange={setNewRating} />
                    <textarea
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      rows={3}
                      placeholder="Escribe tu reseña..."
                      className="w-full text-sm border border-border rounded-xl px-3 py-2 focus:outline-none resize-none"
                      onFocus={(e) => {
                        e.target.style.boxShadow = "0 0 0 2px #FFF200";
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={submitReview}
                        className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-95"
                        style={{ background: "#FFF200", color: "#1A1A2E" }}
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold border border-border hover:bg-muted transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                      <img
                        src={rev.product.image}
                        alt={rev.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground">
                        {rev.product.category}
                      </p>
                      <p className="text-sm font-bold text-foreground line-clamp-1">
                        {rev.product.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating value={rev.rating} />
                        <span className="text-xs text-muted-foreground">
                          {rev.date}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mt-2 leading-relaxed">
                        {rev.text}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <ThumbsUp className="w-3 h-3" />
                          Útil ({rev.helpful})
                        </button>
                        <button
                          onClick={() => {
                            setEditId(rev.id);
                            setNewRating(rev.rating);
                            setNewText(rev.text);
                          }}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                          Editar
                        </button>
                        <button
                          onClick={() =>
                            setReviews((prev) =>
                              prev.filter((r) => r.id !== rev.id),
                            )
                          }
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </AcctCard>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ── Support ── */
  const SupportSection = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMsg, setChatMsg] = useState("");
    const [chatHistory, setChatHistory] = useState<
      Array<{ from: "user" | "bot"; text: string }>
    >([
      {
        from: "bot",
        text: "¡Hola! Soy el asistente de Mercaldas. ¿En qué te puedo ayudar hoy?",
      },
    ]);

    const sendChat = () => {
      if (!chatMsg.trim()) return;
      const msg = chatMsg.trim();
      setChatHistory((prev) => [
        ...prev,
        { from: "user", text: msg },
        {
          from: "bot",
          text: "Gracias por tu mensaje. Un agente se comunicará contigo pronto. Tiempo estimado: 2 minutos.",
        },
      ]);
      setChatMsg("");
    };

    return (
      <div>
        <h2
          className="font-black text-xl text-foreground mb-5"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          Centro de Ayuda
        </h2>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {
              icon: MessageCircle,
              label: "Chat en vivo",
              color: "#1A1A2E",
              accent: "#FFF200",
              onClick: () => setChatOpen(true),
            },
            {
              icon: Phone,
              label: "Llamar soporte",
              color: "#F4F4F6",
              accent: "#374151",
              onClick: () => {},
            },
            {
              icon: RotateCcw,
              label: "Devoluciones",
              color: "#F4F4F6",
              accent: "#374151",
              onClick: () => {},
            },
            {
              icon: AlertCircle,
              label: "Reportar problema",
              color: "#F4F4F6",
              accent: "#374151",
              onClick: () => {},
            },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                onClick={a.onClick}
                className="flex flex-col items-center gap-2 py-5 px-3 rounded-xl border border-border hover:shadow-sm transition-all text-center"
                style={{ background: a.color }}
              >
                <Icon className="w-5 h-5" style={{ color: a.accent }} />
                <span
                  className="text-xs font-semibold"
                  style={{ color: a.accent }}
                >
                  {a.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Chat widget */}
        {chatOpen && (
          <AcctCard className="mb-5 overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3 border-b border-border"
              style={{ background: "#1A1A2E" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-bold text-white">
                  Soporte Mercaldas
                </span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="h-48 overflow-y-auto p-4 flex flex-col gap-2 bg-muted/30">
              {chatHistory.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-xs px-3 py-2 rounded-xl text-xs"
                    style={{
                      background: m.from === "user" ? "#1A1A2E" : "white",
                      color: m.from === "user" ? "white" : "#374151",
                      border: m.from === "bot" ? "1px solid #E5E7EB" : "none",
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 px-3 py-2 border-t border-border">
              <input
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Escribe tu mensaje..."
                className="flex-1 text-xs border border-border rounded-xl px-3 py-2 focus:outline-none"
                onFocus={(e) => {
                  e.target.style.boxShadow = "0 0 0 2px #FFF200";
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                onClick={sendChat}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#FFF200" }}
              >
                <Send className="w-3.5 h-3.5" style={{ color: "#1A1A2E" }} />
              </button>
            </div>
          </AcctCard>
        )}

        {/* FAQ */}
        <AcctCard className="overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="font-bold text-sm">Preguntas frecuentes</p>
          </div>
          <div className="divide-y divide-border">
            {FAQ_ITEMS.map((item, idx) => (
              <div key={idx}>
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-semibold text-foreground pr-4">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${openFaq === idx ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </AcctCard>
      </div>
    );
  };

  /* ── Profile Settings ── */
  const ProfileSection = () => {
    const [showPwd, setShowPwd] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [profile, setProfile] = useState({
      name: customer?.fullName || customer?.firstName || "Cliente",
      phone: "",
      email: customer?.email || "",
      password: "",
    });
    const [privacyPromo, setPrivacyPromo] = useState(
      customer?.acceptsMarketing ?? true,
    );
    const [privacyData, setPrivacyData] = useState(true);

    // Reflejar el valor del perfil cuando cambia (login o recarga)
    useEffect(() => {
      setPrivacyPromo(customer?.acceptsMarketing ?? true);
    }, [customer?.acceptsMarketing]);

    // Confirm modals
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
    const [deleting, setDeleting] = useState(false);

    const accountNameForDelete = customer?.firstName || customer?.email || "";

    const saveProfile = async () => {
      setError("");
      setSaving(true);
      try {
        const nameParts = profile.name.trim().split(/\s+/);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const body: Record<string, string | boolean> = {
          firstName,
          lastName,
          phone: profile.phone,
          email: profile.email,
          acceptsMarketing: privacyPromo,
        };
        if (profile.password.trim()) {
          body.password = profile.password;
        }

        const updated = onProfileUpdated
          ? await onProfileUpdated(body)
          : await customerAuthService.updateProfile(body);
        // Update local state with response
        setProfile((p) => ({
          ...p,
          name: updated.fullName || updated.firstName || p.name,
          phone: updated.phone || p.phone,
          email: updated.email || p.email,
          password: "",
        }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch (err: any) {
        setError(err.message || "Error al guardar");
      } finally {
        setSaving(false);
      }
    };

    const handleLogout = async () => {
      try {
        await customerAuthService.logout();
      } catch {}
      setShowLogoutConfirm(false);
      onBack();
    };

    const handleDeleteAccount = async () => {
      if (deleteConfirmInput.trim() !== accountNameForDelete) return;
      setDeleting(true);
      try {
        await customerAuthService.deleteAccount();
        setShowDeleteConfirm(false);
        onBack();
      } catch (err: any) {
        setError(err.message || "Error al eliminar cuenta");
      } finally {
        setDeleting(false);
      }
    };

    return (
      <div>
        <h2
          className="font-black text-xl text-foreground mb-5"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          Configuración de cuenta
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
            <button
              className="ml-2 underline"
              onClick={() => setError("")}
            >
              Cerrar
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Personal info */}
          <AcctCard className="p-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl"
                  style={{
                    background: "#FFF200",
                    color: "#1A1A2E",
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                  }}
                >
                  C
                </div>
                <button
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white"
                  style={{ background: "#1A1A2E" }}
                >
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>
              <div>
                <p className="font-bold text-foreground">{profile.name}</p>
                <p className="text-xs text-muted-foreground">{profile.email}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              {[
                {
                  label: "Nombre completo",
                  key: "name",
                  type: "text",
                  icon: User,
                },
                { label: "Teléfono", key: "phone", type: "tel", icon: Phone },
                {
                  label: "Correo electrónico",
                  key: "email",
                  type: "email",
                  icon: Mail,
                },
              ].map(({ label, key, type, icon: Icon }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    {label}
                  </label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      type={type}
                      value={(profile as Record<string, string>)[key]}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, [key]: e.target.value }))
                      }
                      className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-xl focus:outline-none"
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
              ))}

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={profile.password}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, password: e.target.value }))
                    }
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 text-sm border border-border rounded-xl focus:outline-none"
                    onFocus={(e) => {
                      e.target.style.boxShadow = "0 0 0 2px #FFF200";
                      e.target.style.borderColor = "#FFF200";
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPwd ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

          </AcctCard>

          {/* Privacy */}
          <AcctCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <p className="font-bold text-sm">Privacidad y comunicaciones</p>
            </div>
            <div className="flex flex-col gap-4">
              {[
                {
                  key: "privacyPromo",
                  label: "Recibir emails de promociones",
                  desc: "Ofertas, cupones y descuentos exclusivos",
                  value: privacyPromo,
                  set: setPrivacyPromo,
                },
                {
                  key: "privacyData",
                  label: "Autorización de tratamiento de datos",
                  desc: "Mejoramos tu experiencia con base en tus compras",
                  value: privacyData,
                  set: setPrivacyData,
                },
              ].map(({ key, label, desc, value, set }) => (
                <label
                  key={key}
                  className="flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <div
                    className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
                    style={{ background: value ? "#FFF200" : "#E5E7EB" }}
                    onClick={() => set((v: boolean) => !v)}
                  >
                    <div
                      className="absolute top-1 w-4 h-4 rounded-full bg-foreground shadow transition-all"
                      style={{ left: value ? "calc(100% - 20px)" : "4px" }}
                    />
                  </div>
                </label>
              ))}
            </div>
          </AcctCard>

          {/* Guardar cambios */}
          <button
            onClick={saveProfile}
            disabled={saving}
            className="w-full py-3.5 rounded-xl font-black text-sm transition-all hover:brightness-95 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            style={{
              background: saved ? "#D4EDDA" : "#FFF200",
              color: saved ? "#155724" : "#1A1A2E",
            }}
          >
            {saving ? (
              "Guardando..."
            ) : saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 inline-block mr-1" /> ¡Guardado!
              </>
            ) : (
              "Guardar cambios"
            )}
          </button>

          {/* Danger zone */}
          <AcctCard className="p-5 border-red-200">
            <p className="font-bold text-sm text-red-600 mb-3">
              Zona de peligro
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
              >
                Cerrar sesión
              </button>
              <button
                onClick={() => {
                  setDeleteConfirmInput("");
                  setShowDeleteConfirm(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
              >
                Eliminar cuenta
              </button>
            </div>
          </AcctCard>

        </div>

        {/* Logout Confirm Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowLogoutConfirm(false)}>
            <div
              className="bg-background rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-bold text-lg mb-2">Cerrar sesión</p>
              <p className="text-sm text-muted-foreground mb-5">
                ¿Estás seguro de que deseas cerrar sesión?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Confirm Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDeleteConfirm(false)}>
            <div
              className="bg-background rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-bold text-lg mb-2 text-red-600">Eliminar cuenta</p>
              <p className="text-sm text-muted-foreground mb-3">
                Esta acción es irreversible. Todos tus datos serán eliminados.
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                Para confirmar, escribe{" "}
                <strong className="text-foreground">{accountNameForDelete}</strong>{" "}
                a continuación:
              </p>
              <input
                type="text"
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                placeholder={accountNameForDelete}
                className="w-full px-3 py-2 text-sm border border-border rounded-xl focus:outline-none mb-5"
                onFocus={(e) => {
                  e.target.style.boxShadow = "0 0 0 2px #EF4444";
                  e.target.style.borderColor = "#EF4444";
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = "none";
                  e.target.style.borderColor = "";
                }}
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={
                    deleting ||
                    deleteConfirmInput.trim() !== accountNameForDelete
                  }
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 transition-colors"
                >
                  {deleting ? "Eliminando..." : "Eliminar cuenta"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ── Section Router ── */
  const renderSection = () => {
    switch (section) {
      case "orders":
        return <OrdersSection />;
      case "order-detail":
        return <OrderDetailSection />;
      case "tracking":
        return <TrackingSection />;
      case "favorites":
        return <FavoritesSection />;
      case "lists":
        return <ListsSection />;
      case "addresses":
        return <AddressesSection />;
      case "payments":
        return paymentsSectionEnabled === true ? (
          <PaymentsSection />
        ) : (
          <OrdersSection />
        );
      case "coupons":
        return (
          <div className="relative">
            <div className="absolute inset-0 z-10 bg-gray-300/40 backdrop-blur-[3px] flex items-start justify-center pointer-events-none" style={{ minHeight: "40vh" }}>
              <div className="mt-20 flex flex-col items-center gap-3 bg-white/80 rounded-3xl px-10 py-7 shadow-lg">
                <span className="text-4xl select-none">🚧</span>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">En Construcción</p>
                <p className="text-xs text-gray-400">Próximamente disponible</p>
              </div>
            </div>
            <div className="pointer-events-none opacity-35 select-none">
              <CouponsSection />
            </div>
          </div>
        );
      case "history":
        return <HistorySection />;
      case "notifications":
        return <NotificationsSection />;
      case "reviews":
        return (
          <div className="relative">
            <div className="absolute inset-0 z-10 bg-gray-300/40 backdrop-blur-[3px] flex items-start justify-center pointer-events-none" style={{ minHeight: "40vh" }}>
              <div className="mt-20 flex flex-col items-center gap-3 bg-white/80 rounded-3xl px-10 py-7 shadow-lg">
                <span className="text-4xl select-none">🚧</span>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">En Construcción</p>
                <p className="text-xs text-gray-400">Próximamente disponible</p>
              </div>
            </div>
            <div className="pointer-events-none opacity-35 select-none">
              <ReviewsSection />
            </div>
          </div>
        );
      case "support":
        return (
          <div className="relative">
            <div className="absolute inset-0 z-10 bg-gray-300/40 backdrop-blur-[3px] flex items-start justify-center pointer-events-none" style={{ minHeight: "40vh" }}>
              <div className="mt-20 flex flex-col items-center gap-3 bg-white/80 rounded-3xl px-10 py-7 shadow-lg">
                <span className="text-4xl select-none">🚧</span>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">En Construcción</p>
                <p className="text-xs text-gray-400">Próximamente disponible</p>
              </div>
            </div>
            <div className="pointer-events-none opacity-35 select-none">
              <SupportSection />
            </div>
          </div>
        );
      case "profile":
        return <ProfileSection />;
      default:
        return <OrdersSection />;
    }
  };

  return (
    <div className="bg-muted/40 min-h-screen">
      {/* Account Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-sm text-foreground">Mi Cuenta</span>
          <span className="text-muted-foreground text-sm">/</span>
          <span className="text-sm text-muted-foreground">
            {currentNav?.label ?? "Mi cuenta"}
          </span>

          {/* Mobile nav trigger */}
          <button
            onClick={() => setMobileNavOpen((v) => !v)}
            className="ml-auto md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-colors"
          >
            <Menu className="w-3.5 h-3.5" />
            Menú
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <p className="font-bold text-sm">Mi Cuenta</p>
              <button onClick={() => setMobileNavOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl"
                  style={{ background: "#FFF200", color: "#1A1A2E" }}
                >
                  C
                </div>
                <div>
                  <p className="font-bold text-sm">
                    {customer?.fullName || customer?.firstName || "Cliente"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {customer?.email || ""}
                  </p>
                </div>
              </div>
              <nav className="flex flex-col gap-0.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active =
                    section === item.id ||
                    (item.id === "orders" &&
                      (section === "order-detail" || section === "tracking"));
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.id)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors relative"
                      style={{ background: active ? "#1A1A2E" : "transparent" }}
                    >
                      <Icon
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: active ? "#FFF200" : "#6B7280" }}
                      />
                      <span
                        className="text-sm font-medium flex-1"
                        style={{ color: active ? "#FFF200" : "#374151" }}
                      >
                        {item.label}
                      </span>
                      {item.badge !== undefined && (
                        <span
                          className="text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1"
                          style={{ background: "#FFF200", color: "#1A1A2E" }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      <div
        className="max-w-7xl mx-auto px-4 py-6 flex gap-6"
        style={{ minHeight: "calc(100vh - 12rem)" }}
      >
        {/* Desktop sidebar */}
        <div
          className="hidden md:block sticky top-24 self-start"
          style={{
            maxHeight: "calc(100vh - 8rem)",
            overflowY: "auto",
            scrollbarWidth: "thin",
          }}
        >
          <Sidebar />
        </div>

        {/* Content */}
        <main
          ref={contentRef}
          className="flex-1 min-w-0"
          style={{
            maxHeight: "calc(100vh - 8rem)",
            overflowY: "auto",
            scrollbarWidth: "thin",
            padding: "1rem",
          }}
        >
          <div style={{ minHeight: "min-content" }}>{renderSection()}</div>
        </main>
      </div>
    </div>
  );
}

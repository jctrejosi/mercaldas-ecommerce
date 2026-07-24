import { useState, useRef, useEffect } from "react";
import {
  Package, Heart, ClipboardList, MapPin, CreditCard, Gift, Star, Bell, HelpCircle,
  Settings, ArrowLeft, Award, Search, ChevronLeft, ChevronRight, ChevronDown,
  ShoppingCart, Minus, Plus, Clock, RefreshCcw, Download, MessageCircle, AlertCircle,
  Check, RotateCcw, Truck, Phone, Pencil, Copy, Trash2, X, Tag, Sparkles,
  ThumbsUp, Camera, Mail, User, Lock, Eye, EyeOff, CheckCircle2, Shield, Send, Menu,
} from "lucide-react";
import type { CartItem, Order, Product } from "../../types";
import { ordersService } from "../../../services/orders.service";

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1, name: "Pechuga de Pollo Fresca x kg", price: 12900, originalPrice: 15900,
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=400&fit=crop&auto=format",
    category: "Carnes y Pollo", badge: "19% OFF", tabs: ["vendidos", "promociones"], unit: "x kg",
  },
  {
    id: 2, name: "Leche Entera Alquería 1.1 L", price: 4350,
    image: "https://images.unsplash.com/photo-1604095853918-1a1823a63dd5?w=400&h=400&fit=crop&auto=format",
    category: "Lácteos", tabs: ["vendidos", "recomendados"], unit: "x 1.1 L",
  },
  {
    id: 3, name: "Arroz Diana Extra Premium 5 kg", price: 22500, originalPrice: 26000,
    image: "https://images.unsplash.com/photo-1557844352-761f2565b576?w=400&h=400&fit=crop&auto=format",
    category: "Despensa", badge: "13% OFF", tabs: ["vendidos", "promociones"], unit: "x 5 kg",
  },
  {
    id: 4, name: "Huevos AA Blancos x30", price: 18900,
    image: "https://images.unsplash.com/photo-1729622493745-03ca9590c64a?w=400&h=400&fit=crop&auto=format",
    category: "Lácteos", tabs: ["vendidos", "recomendados"], unit: "x 30 und",
  },
  {
    id: 5, name: "Tomates Chonto Frescos x 500 g", price: 3200, originalPrice: 4500,
    image: "https://images.unsplash.com/photo-1485637701894-09ad422f6de6?w=400&h=400&fit=crop&auto=format",
    category: "Frutas y Verduras", badge: "29% OFF", tabs: ["promociones", "recomendados"], unit: "x 500 g",
  },
  {
    id: 6, name: "Aguacate Hass Mediano x und", price: 2800,
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=400&fit=crop&auto=format",
    category: "Frutas y Verduras", tabs: ["vendidos", "recomendados"], unit: "x und",
  },
  {
    id: 7, name: "Detergente Ariel Líquido 3 L", price: 28900, originalPrice: 35900,
    image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=400&fit=crop&auto=format",
    category: "Limpieza", badge: "20% OFF", tabs: ["promociones", "vendidos"], unit: "x 3 L",
  },
  {
    id: 8, name: "Jabón Protex Original x3", price: 14500, originalPrice: 17000,
    image: "https://images.unsplash.com/photo-1624372635277-283042097f31?w=400&h=400&fit=crop&auto=format",
    category: "Cuidado Personal", badge: "15% OFF", tabs: ["novedades", "promociones"], unit: "x 3 und",
  },
  {
    id: 9, name: "Pañales Huggies Talla M x40", price: 69900, originalPrice: 79900,
    image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400&h=400&fit=crop&auto=format",
    category: "Cuidado del Bebé", badge: "13% OFF", tabs: ["vendidos", "promociones"], unit: "x 40 und",
  },
  {
    id: 10, name: "Queso Campesino Fresco x500 g", price: 12500,
    image: "https://images.unsplash.com/photo-1566454825481-4e48f80aa4d7?w=400&h=400&fit=crop&auto=format",
    category: "Lácteos", badge: "Nuevo", tabs: ["novedades", "recomendados"], unit: "x 500 g",
  },
  {
    id: 11, name: "Aceite Palmera Vegetal 3 L", price: 19900, originalPrice: 24500,
    image: "https://images.unsplash.com/photo-1609780447631-05b93e5a88ea?w=400&h=400&fit=crop&auto=format",
    category: "Despensa", badge: "19% OFF", tabs: ["vendidos", "promociones"], unit: "x 3 L",
  },
  {
    id: 12, name: "Vino Casillero Cabernet 750 mL", price: 38900, originalPrice: 46000,
    image: "https://images.unsplash.com/photo-1527264935190-1401c51b5bbc?w=400&h=400&fit=crop&auto=format",
    category: "Vinos y Licores", badge: "16% OFF", tabs: ["novedades", "promociones"], unit: "x 750 mL",
  },
  {
    id: 13, name: "Café Juan Valdez Molido 500 g", price: 32500,
    image: "https://images.unsplash.com/photo-1512106374988-c95f566d39ef?w=400&h=400&fit=crop&auto=format",
    category: "Despensa", tabs: ["recomendados", "vendidos"], unit: "x 500 g",
  },
  {
    id: 14, name: "Shampoo Head & Shoulders 700 mL", price: 22900, originalPrice: 27500,
    image: "https://images.unsplash.com/photo-1649005011845-ef225c89da86?w=400&h=400&fit=crop&auto=format",
    category: "Cuidado Personal", badge: "17% OFF", tabs: ["promociones", "recomendados"], unit: "x 700 mL",
  },
  {
    id: 15, name: "Pasta Doria Espagueti x500 g", price: 3800,
    image: "https://images.unsplash.com/photo-1685564060600-53036354762b?w=400&h=400&fit=crop&auto=format",
    category: "Despensa", badge: "Nuevo", tabs: ["novedades", "recomendados"], unit: "x 500 g",
  },
  {
    id: 16, name: "Limpiapisos Fabuloso Lavanda 1.8 L", price: 9900, originalPrice: 12500,
    image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=400&fit=crop&auto=format",
    category: "Limpieza", badge: "21% OFF", tabs: ["novedades", "promociones"], unit: "x 1.8 L",
  },
  {
    id: 17, name: "Plátano Maduro x kg", price: 2500,
    image: "https://images.unsplash.com/photo-1560960378-8435837546b7?w=400&h=400&fit=crop&auto=format",
    category: "Frutas y Verduras", tabs: ["vendidos", "recomendados"], unit: "x kg",
  },
  {
    id: 18, name: "Papa Criolla Limpia x kg", price: 3800, originalPrice: 4800,
    image: "https://images.unsplash.com/photo-1589894308598-8ddba0593e91?w=400&h=400&fit=crop&auto=format",
    category: "Frutas y Verduras", badge: "21% OFF", tabs: ["promociones", "vendidos"], unit: "x kg",
  },
  {
    id: 19, name: "Carne Molida de Res x kg", price: 18500,
    image: "https://images.unsplash.com/photo-1690983323238-0b91789e1b5a?w=400&h=400&fit=crop&auto=format",
    category: "Carnes y Pollo", tabs: ["vendidos", "recomendados"], unit: "x kg",
  },
  {
    id: 20, name: "Yogurt Alpina Trozos Fresa 200 g", price: 2900,
    image: "https://images.unsplash.com/photo-1604095853918-1a1823a63dd5?w=400&h=400&fit=crop&auto=format",
    category: "Lácteos", badge: "Nuevo", tabs: ["novedades", "recomendados"], unit: "x 200 g",
  },
  {
    id: 21, name: "Mantequilla Anchor Sin Sal 200 g", price: 11900, originalPrice: 14200,
    image: "https://images.unsplash.com/photo-1566454825481-4e48f80aa4d7?w=400&h=400&fit=crop&auto=format",
    category: "Lácteos", badge: "16% OFF", tabs: ["promociones", "recomendados"], unit: "x 200 g",
  },
  {
    id: 22, name: "Frijoles Cargamanto x kg", price: 7200,
    image: "https://images.unsplash.com/photo-1557844352-761f2565b576?w=400&h=400&fit=crop&auto=format",
    category: "Despensa", tabs: ["vendidos", "recomendados"], unit: "x kg",
  },
  {
    id: 23, name: "Atún Van Camps en Agua x3", price: 14500, originalPrice: 17000,
    image: "https://images.unsplash.com/photo-1685564060600-53036354762b?w=400&h=400&fit=crop&auto=format",
    category: "Despensa", badge: "15% OFF", tabs: ["promociones", "vendidos"], unit: "x 3 und",
  },
  {
    id: 24, name: "Papel Higiénico Scott Doble Hoja x12", price: 22900, originalPrice: 27000,
    image: "https://images.unsplash.com/photo-1649005011845-ef225c89da86?w=400&h=400&fit=crop&auto=format",
    category: "Limpieza", badge: "15% OFF", tabs: ["vendidos", "promociones"], unit: "x 12 und",
  },
  {
    id: 25, name: "Crema Dental Colgate Triple Acción x2", price: 12800,
    image: "https://images.unsplash.com/photo-1624372635277-283042097f31?w=400&h=400&fit=crop&auto=format",
    category: "Cuidado Personal", tabs: ["vendidos", "recomendados"], unit: "x 2 und",
  },
  {
    id: 26, name: "Pañales Pampers Baby-Dry Talla G x36", price: 74900, originalPrice: 89000,
    image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400&h=400&fit=crop&auto=format",
    category: "Cuidado del Bebé", badge: "16% OFF", tabs: ["promociones", "vendidos"], unit: "x 36 und",
  },
  {
    id: 27, name: "Comida Whiskas Gato Adulto 500 g", price: 9500, originalPrice: 11200,
    image: "https://images.unsplash.com/photo-1729622493745-03ca9590c64a?w=400&h=400&fit=crop&auto=format",
    category: "Mascotas", badge: "15% OFF", tabs: ["promociones", "recomendados"], unit: "x 500 g",
  },
  {
    id: 28, name: "Cerveza Águila Lata x6", price: 18500,
    image: "https://images.unsplash.com/photo-1527264935190-1401c51b5bbc?w=400&h=400&fit=crop&auto=format",
    category: "Vinos y Licores", tabs: ["vendidos", "recomendados"], unit: "x 6 und",
  },
  {
    id: 29, name: "Aceite de Oliva Dante Extra Virgen 500 mL", price: 29900, originalPrice: 35000,
    image: "https://images.unsplash.com/photo-1609780447631-05b93e5a88ea?w=400&h=400&fit=crop&auto=format",
    category: "Despensa", badge: "15% OFF", tabs: ["novedades", "promociones"], unit: "x 500 mL",
  },
  {
    id: 30, name: "Shampoo Pantene Pro-V 400 mL", price: 19900, originalPrice: 24500,
    image: "https://images.unsplash.com/photo-1649005011845-ef225c89da86?w=400&h=400&fit=crop&auto=format",
    category: "Cuidado Personal", badge: "19% OFF", tabs: ["promociones", "vendidos"], unit: "x 400 mL",
  },
  {
    id: 31, name: "Lentejas Verdes x500 g", price: 4800,
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=400&fit=crop&auto=format",
    category: "Despensa", badge: "Nuevo", tabs: ["novedades", "recomendados"], unit: "x 500 g",
  },
  {
    id: 32, name: "Jabón de Manos Protex Líquido 221 mL", price: 8900, originalPrice: 10500,
    image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=400&fit=crop&auto=format",
    category: "Cuidado Personal", badge: "15% OFF", tabs: ["promociones", "novedades"], unit: "x 221 mL",
  },
];

/* ─── Account Module Types ───────────────────────────────── */
type AccountSection =
  | "orders" | "order-detail" | "tracking"
  | "favorites" | "lists" | "addresses"
  | "payments" | "coupons" | "history"
  | "notifications" | "reviews" | "support" | "profile";

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
  type: "credit" | "debit" | "digital";
  label: string;
  last4?: string;
  brand?: string;
  wallet?: string;
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
    id: "MER-241901", date: "18 de julio de 2025",
    items: [MOCK_PRODUCTS[0], MOCK_PRODUCTS[2], MOCK_PRODUCTS[6]].map((p) => ({ ...p, quantity: 2 })),
    total: 126200, shipping: 4900,
    address: "Cra 23 # 64-60, Apt 301, Barrio Milán, Manizales",
    paymentMethod: "tarjeta", status: "entregado" as const,
    estimatedDelivery: "18 jul · 3:45 pm", deliveredAt: "18 jul 2025 · 3:32 pm",
  },
  {
    id: "MER-241745", date: "12 de julio de 2025",
    items: [MOCK_PRODUCTS[1], MOCK_PRODUCTS[3], MOCK_PRODUCTS[8]].map((p) => ({ ...p, quantity: 1 })),
    total: 93150, shipping: 4900,
    address: "Cll 65 # 23B-10, Barrio El Cable, Manizales",
    paymentMethod: "nequi", status: "en camino" as const,
    estimatedDelivery: "12 jul · 5:00 pm", deliveredAt: "",
  },
  {
    id: "MER-241502", date: "5 de julio de 2025",
    items: [MOCK_PRODUCTS[4], MOCK_PRODUCTS[5], MOCK_PRODUCTS[9], MOCK_PRODUCTS[11]].map((p) => ({ ...p, quantity: 1 })),
    total: 96100, shipping: 9900,
    address: "Av. 12 de Octubre # 41-55, Chipre, Manizales",
    paymentMethod: "efectivo", status: "preparando" as const,
    estimatedDelivery: "5 jul · 2:00 pm", deliveredAt: "",
  },
  {
    id: "MER-241298", date: "28 de junio de 2025",
    items: [MOCK_PRODUCTS[12], MOCK_PRODUCTS[13]].map((p) => ({ ...p, quantity: 3 })),
    total: 166200, shipping: 4900,
    address: "Cra 18 # 70-24, Barrio Palermo, Manizales",
    paymentMethod: "tarjeta", status: "entregado" as const,
    estimatedDelivery: "28 jun · 11:30 am", deliveredAt: "28 jun 2025 · 11:18 am",
  },
  {
    id: "MER-240987", date: "15 de junio de 2025",
    items: [MOCK_PRODUCTS[7], MOCK_PRODUCTS[10]].map((p) => ({ ...p, quantity: 2 })),
    total: 97600, shipping: 0,
    address: "Cll 50 # 36-80, Barrio La Enea, Manizales",
    paymentMethod: "pse", status: "cancelado" as const,
    estimatedDelivery: "15 jun · 4:00 pm", deliveredAt: "",
  },
];
type AcctOrder = typeof MOCK_ACCT_ORDERS[number];

const INIT_FAVORITES = MOCK_PRODUCTS.filter((p) => [1, 5, 9, 12, 14, 18].includes(p.id));

const INIT_LISTS: ShoppingList[] = [
  {
    id: "list-1", name: "Mercado Semanal",
    items: [
      { product: MOCK_PRODUCTS[0], quantity: 2 },
      { product: MOCK_PRODUCTS[1], quantity: 3 },
      { product: MOCK_PRODUCTS[3], quantity: 1 },
      { product: MOCK_PRODUCTS[6], quantity: 1 },
    ],
  },
  {
    id: "list-2", name: "BBQ del Fin de Semana",
    items: [
      { product: MOCK_PRODUCTS[0], quantity: 3 },
      { product: MOCK_PRODUCTS[18], quantity: 2 },
      { product: MOCK_PRODUCTS[11], quantity: 4 },
    ],
  },
  {
    id: "list-3", name: "Esenciales del Mes",
    items: [
      { product: MOCK_PRODUCTS[2], quantity: 2 },
      { product: MOCK_PRODUCTS[10], quantity: 2 },
      { product: MOCK_PRODUCTS[6], quantity: 1 },
      { product: MOCK_PRODUCTS[23], quantity: 3 },
    ],
  },
];

const INIT_ADDRESSES: SavedAddress[] = [
  { id: "a1", label: "Casa", icon: "🏠", name: "Carlos Gómez", phone: "310 456 7890", address: "Cra 23 # 64-60, Apt 301", city: "Manizales", notes: "Timbre 301 — Edificio Las Palmas", isDefault: true },
  { id: "a2", label: "Trabajo", icon: "🏢", name: "Carlos Gómez", phone: "310 456 7890", address: "Cll 65 # 23B-10, Of. 405", city: "Manizales", notes: "Recepción piso 4", isDefault: false },
  { id: "a3", label: "Padres", icon: "👨‍👩‍👦", name: "Luis Gómez", phone: "312 987 6543", address: "Av. 12 de Octubre # 41-55", city: "Manizales", notes: "Casa blanca — portón negro", isDefault: false },
];

const INIT_PAYMENTS: SavedPayment[] = [
  { id: "p1", type: "credit", label: "Visa Clásica", last4: "4521", brand: "Visa", color: "#1A1F71", isDefault: true },
  { id: "p2", type: "debit", label: "Mastercard Débito", last4: "8834", brand: "Mastercard", color: "#EB001B", isDefault: false },
  { id: "p3", type: "digital", wallet: "Nequi", label: "Nequi", color: "#430050", isDefault: false },
];

const INIT_COUPONS: _Coupon[] = [
  { id: "c1", code: "MERC20", description: "20% de descuento en tu próxima compra", discount: "20% OFF", minPurchase: 50000, expiresAt: "31 ago 2025", used: false, category: "General", color: "#FFF200" },
  { id: "c2", code: "ENVIOGRATIS", description: "Envío gratis en cualquier pedido", discount: "Envío gratis", minPurchase: 0, expiresAt: "15 ago 2025", used: false, category: "Domicilio", color: "#1A1A2E" },
  { id: "c3", code: "FRUTA10", description: "10% OFF en Frutas y Verduras", discount: "10% OFF", minPurchase: 20000, expiresAt: "1 ago 2025", used: false, category: "Frutas", color: "#66BB6A" },
  { id: "c4", code: "BIENVENIDA", description: "Cupón de bienvenida — ya utilizado", discount: "15% OFF", minPurchase: 30000, expiresAt: "1 jun 2025", used: true, category: "General", color: "#6B7280" },
];

const INIT_NOTIFS: AcctNotif[] = [
  { id: "n1", type: "order", title: "Tu pedido está en camino", body: "El pedido MER-241745 fue despachado y llegará en aprox. 45 minutos.", time: "Hace 20 min", read: false },
  { id: "n2", type: "promo", title: "Semana del Ahorro activa", body: "Hasta 40% de descuento en productos seleccionados. Oferta válida solo hoy.", time: "Hace 2 h", read: false },
  { id: "n3", type: "coupon", title: "Nuevo cupón disponible", body: "Tienes un cupón de 20% OFF esperándote. Vence el 31 de agosto.", time: "Ayer", read: false },
  { id: "n4", type: "new", title: "Nuevos productos en Despensa", body: "Lentejas verdes, pasta integral y más productos nuevos ya están disponibles.", time: "Ayer", read: true },
  { id: "n5", type: "order", title: "Pedido MER-241901 entregado", body: "Tu pedido fue entregado exitosamente el 18 de julio a las 3:32 pm.", time: "18 jul", read: true },
  { id: "n6", type: "reco", title: "Recomendado para ti", body: "Descubre los productos más vendidos de la semana en tus categorías favoritas.", time: "17 jul", read: true },
];

const INIT_REVIEWS: _ProductReview[] = [
  { id: "r1", product: MOCK_PRODUCTS[0], rating: 5, text: "Excelente calidad, la pechuga llegó muy fresca y bien empacada. Definitivamente volveré a pedir.", date: "19 jul 2025", helpful: 8 },
  { id: "r2", product: MOCK_PRODUCTS[2], rating: 4, text: "El arroz Diana es siempre una garantía. El precio es competitivo y el domicilio fue puntual.", date: "6 jul 2025", helpful: 3 },
  { id: "r3", product: MOCK_PRODUCTS[6], rating: 5, text: "El mejor detergente del mercado, rinde muchísimo y deja la ropa impecable.", date: "29 jun 2025", helpful: 12 },
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
  { q: "¿Cuánto tiempo tarda el domicilio?", a: "Generalmente entre 1 y 2 horas dependiendo de tu zona. Para pedidos express garantizamos entrega en 60 minutos." },
  { q: "¿Cómo puedo cancelar mi pedido?", a: "Puedes cancelar dentro de los 5 minutos de haberlo realizado desde Mis Pedidos. Pasado ese tiempo, contacta soporte." },
  { q: "¿Qué hago si falta un producto?", a: "Repórtalo en el detalle del pedido usando el botón 'Reportar problema'. Te reembolsaremos o haremos el reenvío." },
  { q: "¿Puedo cambiar la dirección de entrega?", a: "Sí, siempre que el pedido no haya sido despachado. Escríbenos por WhatsApp al (606) 890-1234 lo antes posible." },
  { q: "¿Cómo funciona el programa de puntos?", a: "Acumulas 1 punto por cada $100 pesos en compras. Con 1,000 puntos obtienes $5,000 de descuento." },
  { q: "¿Qué métodos de pago aceptan?", a: "Aceptamos tarjeta crédito/débito (Visa, Mastercard), Nequi, Daviplata, PSE y efectivo contra entrega." },
];

/* ─── Account Helpers ────────────────────────────────────── */
function StarRating({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
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
    "preparando": { label: "Preparando", bg: "#FFF3CD", color: "#856404" },
    "en camino":  { label: "En camino",  bg: "#CCE5FF", color: "#004085" },
    "entregado":  { label: "Entregado",  bg: "#D4EDDA", color: "#155724" },
    "cancelado":  { label: "Cancelado",  bg: "#F8D7DA", color: "#721C24" },
  };
  const s = map[status] ?? { label: status, bg: "#F4F4F6", color: "#6B7280" };
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function EmptyState({ icon, title, subtitle, cta, onCta }: { icon: React.ReactNode; title: string; subtitle: string; cta?: string; onCta?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5" style={{ background: "#F4F4F6" }}>
        {icon}
      </div>
      <p className="font-black text-lg text-foreground mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{title}</p>
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

function AcctCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-border rounded-xl ${className}`}>{children}</div>
  );
}

function PaymentMethodIcon({ method }: { method: string }) {
  const labels: Record<string, string> = { tarjeta: "💳", nequi: "📱", efectivo: "💵", pse: "🏦", daviplata: "📲" };
  return <span>{labels[method] ?? "💳"}</span>;
}

/* ─── Account Page ───────────────────────────────────────── */
export interface UserAdminViewProps {
  appOrders: Order[];
  cartItems: CartItem[];
  onAdd: (p: Product, quantity?: number) => void;
  onRemove: (id: number) => void;
  onProductClick: (p: Product) => void;
  onBack: () => void;
  initialSection?: AccountSection;
}

export function UserAdminView({ appOrders, cartItems, onAdd, onRemove, onProductClick, onBack, initialSection = "orders" }: AccountPageProps) {
  const [section, setSection] = useState<AccountSection>(initialSection);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string>("");
  const [favorites, setFavorites] = useState<Product[]>(INIT_FAVORITES);
  const [lists, setLists] = useState<ShoppingList[]>(INIT_LISTS);
  const [selectedListId, setSelectedListId] = useState<string>(INIT_LISTS[0].id);
  const [addresses, setAddresses] = useState<SavedAddress[]>(INIT_ADDRESSES);
  const [payments, setPayments] = useState<SavedPayment[]>(INIT_PAYMENTS);
  const [coupons, setCoupons] = useState<Coupon[]>(INIT_COUPONS);
  const [notifs, setNotifs] = useState<AcctNotif[]>(INIT_NOTIFS);
  const [reviews, setReviews] = useState<ProductReview[]>(INIT_REVIEWS);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [apiOrders, setApiOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    ordersService.getOrders().then(setApiOrders).catch(() => {}).finally(() => setOrdersLoading(false));
  }, []);

  const allOrders: AcctOrder[] = [
    ...apiOrders.map((o) => ({
      ...o,
      estimatedDelivery: "",
      deliveredAt: o.status === "entregado" ? o.date : "",
    })),
    ...appOrders.map((o) => ({
      ...o,
      status: (o.status === "en camino" ? "en camino" : o.status === "preparando" ? "preparando" : "entregado") as AcctOrder["status"],
      estimatedDelivery: "",
      deliveredAt: o.status === "entregado" ? o.date : "",
    })),
  ];

  // Initialize selected order from API data once loaded
  useEffect(() => {
    if (apiOrders.length > 0) {
      setSelectedOrderId((prev) => prev ?? apiOrders[0].id);
      setTrackingOrderId((prev) => prev || apiOrders[0].id);
    }
  }, [apiOrders]);

  const unreadNotifs = notifs.filter((n) => !n.read).length;

  const navItems: Array<{ id: AccountSection; label: string; icon: React.FC<{ className?: string }>; badge?: number }> = [
    { id: "orders", label: "Mis Pedidos", icon: Package, badge: allOrders.filter((o) => o.status !== "entregado" && o.status !== "cancelado").length || undefined },
    { id: "favorites", label: "Favoritos", icon: Heart, badge: favorites.length || undefined },
    { id: "lists", label: "Listas de Compras", icon: ClipboardList },
    { id: "history", label: "Historial de Compras", icon: RotateCcw },
    { id: "addresses", label: "Direcciones", icon: MapPin },
    { id: "payments", label: "Métodos de Pago", icon: CreditCard },
    { id: "coupons", label: "Cupones y Recompensas", icon: Gift },
    { id: "notifications", label: "Notificaciones", icon: Bell, badge: unreadNotifs || undefined },
    { id: "reviews", label: "Mis Reseñas", icon: Star },
    { id: "support", label: "Centro de Ayuda", icon: HelpCircle },
    { id: "profile", label: "Configuración", icon: Settings },
  ];

  const currentNav = navItems.find((n) => n.id === section || (section === "order-detail" && n.id === "orders") || (section === "tracking" && n.id === "orders"));
  const contentRef = useRef<HTMLElement>(null);

  const navigate = (s: AccountSection) => {
    setSection(s);
    setMobileNavOpen(false);
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fmtCOP = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

  /* ── Sidebar ── */
  const Sidebar = () => (
    <aside className="w-64 flex-shrink-0">
      {/* Profile card */}
      <AcctCard className="p-4 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0"
            style={{ background: "#FFF200", color: "#1A1A2E", fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            C
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-foreground truncate">Carlos Gómez</p>
            <p className="text-xs text-muted-foreground truncate">carlos@gmail.com</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Award className="w-3 h-3" style={{ color: "#F5C518" }} />
              <span className="text-xs font-semibold" style={{ color: "#F5C518" }}>{LOYALTY_PTS.toLocaleString()} puntos</span>
            </div>
          </div>
        </div>
      </AcctCard>

      {/* Nav */}
      <AcctCard className="overflow-hidden">
        <nav>
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const active = section === item.id || (item.id === "orders" && (section === "order-detail" || section === "tracking"));
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors relative ${idx < navItems.length - 1 ? "border-b border-border" : ""}`}
                style={{ background: active ? "#1A1A2E" : "transparent" }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: active ? "#FFF200" : "#6B7280" }} />
                <span className="text-sm font-medium flex-1 truncate" style={{ color: active ? "#FFF200" : "#374151" }}>
                  {item.label}
                </span>
                {item.badge !== undefined && (
                  <span
                    className="text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1"
                    style={{ background: active ? "#FFF200" : "#1A1A2E", color: active ? "#1A1A2E" : "#FFF200" }}
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
      const matchSearch = search.trim() === "" || o.id.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });

    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-xl text-foreground" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Mis Pedidos</h2>
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
            onFocus={(e) => { e.target.style.boxShadow = "0 0 0 2px #FFF200"; e.target.style.borderColor = "#FFF200"; }}
            onBlur={(e) => { e.target.style.boxShadow = "none"; e.target.style.borderColor = ""; }}
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={filter === f.id ? { background: "#1A1A2E", color: "#FFF200" } : { background: "#F4F4F6", color: "#6B7280" }}
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
              <AcctCard key={order.id} className="p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm text-foreground" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{order.id}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{order.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-base" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{fmtCOP(order.total)}</p>
                    <p className="text-xs text-muted-foreground">{order.items.length} {order.items.length === 1 ? "producto" : "productos"}</p>
                  </div>
                </div>

                {/* Product thumbs */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 4).map((item, i) => (
                      <div key={i} className="w-10 h-10 rounded-lg border-2 border-white overflow-hidden bg-muted flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
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
                    onClick={() => { setSelectedOrderId(order.id); navigate("order-detail"); }}
                    className="flex-1 py-2 rounded-lg text-xs font-bold border border-border hover:bg-muted transition-colors text-foreground text-center"
                  >
                    Ver detalle
                  </button>
                  {order.status === "en camino" && (
                    <button
                      onClick={() => { setTrackingOrderId(order.id); navigate("tracking"); }}
                      className="flex-1 py-2 rounded-lg text-xs font-bold transition-all hover:brightness-95 text-center"
                      style={{ background: "#FFF200", color: "#1A1A2E" }}
                    >
                      Rastrear pedido
                    </button>
                  )}
                  {(order.status === "entregado" || order.status === "cancelado") && (
                    <button
                      onClick={() => order.items.forEach((i) => onAdd(i as unknown as Product))}
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
    const order = allOrders.find((o) => o.id === selectedOrderId) ?? allOrders[0];
    if (!order) return null;
    const subtotal = order.total - order.shipping;
    const tax = Math.round(subtotal * 0.19);

    const actions = [
      { icon: RefreshCcw, label: "Comprar de nuevo", primary: true, onClick: () => order.items.forEach((i) => onAdd(i as unknown as Product)) },
      { icon: Download, label: "Descargar factura", primary: false, onClick: () => {} },
      { icon: MessageCircle, label: "Contactar soporte", primary: false, onClick: () => navigate("support") },
      { icon: AlertCircle, label: "Reportar problema", primary: false, onClick: () => {} },
    ];

    const timelineSteps = [
      { label: "Pedido recibido", done: true },
      { label: "Pago confirmado", done: true },
      { label: "Preparando pedido", done: order.status !== "preparando" || order.status === "entregado" },
      { label: "En camino", done: order.status === "entregado" || order.status === "en camino" },
      { label: "Entregado", done: order.status === "entregado" },
    ];

    return (
      <div>
        <button onClick={() => navigate("orders")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5">
          <ChevronLeft className="w-4 h-4" />
          Mis pedidos
        </button>

        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="font-black text-xl text-foreground" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{order.id}</h2>
            <p className="text-sm text-muted-foreground">{order.date}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Timeline */}
        <AcctCard className="p-5 mb-4">
          <p className="text-xs font-black uppercase tracking-wide text-muted-foreground mb-4">Estado del pedido</p>
          <div className="flex items-start gap-0">
            {timelineSteps.filter((_, i) => !(order.status === "cancelado" && i > 0)).map((step, idx, arr) => (
              <div key={step.label} className="flex-1 flex flex-col items-center">
                <div className="flex items-center w-full">
                  <div
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center z-10 ${idx === 0 ? "ml-auto mr-0" : idx === arr.length - 1 ? "ml-0 mr-auto" : "mx-auto"}`}
                    style={{ background: step.done ? "#1A1A2E" : "#E5E7EB" }}
                  >
                    {step.done ? <Check className="w-3.5 h-3.5 text-white" /> : <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="flex-1 h-0.5 mx-0" style={{ background: step.done ? "#FFF200" : "#E5E7EB" }} />
                  )}
                </div>
                <p className="text-[10px] font-semibold text-center mt-1.5 px-0.5 leading-snug" style={{ color: step.done ? "#1A1A2E" : "#9CA3AF" }}>
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </AcctCard>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Products */}
          <AcctCard className="p-4">
            <p className="text-xs font-black uppercase tracking-wide text-muted-foreground mb-3">Productos ({order.items.length})</p>
            <div className="flex flex-col gap-3">
              {order.items.map((item, i) => {
                const prod = item as unknown as CartItem;
                const disc = prod.originalPrice ? prod.originalPrice - prod.price : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">{prod.name}</p>
                      <p className="text-xs text-muted-foreground">x{prod.quantity} · {fmtCOP(prod.price)} c/u</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-foreground">{fmtCOP(prod.price * prod.quantity)}</p>
                      {disc > 0 && <p className="text-[10px] text-green-600">-{fmtCOP(disc * prod.quantity)}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </AcctCard>

          {/* Summary + address */}
          <div className="flex flex-col gap-4">
            <AcctCard className="p-4">
              <p className="text-xs font-black uppercase tracking-wide text-muted-foreground mb-3">Resumen de pago</p>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{fmtCOP(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Domicilio</span><span>{order.shipping === 0 ? "Gratis" : fmtCOP(order.shipping)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">IVA incluido</span><span className="text-xs text-muted-foreground">{fmtCOP(tax)}</span></div>
                <div className="flex justify-between border-t border-border pt-2 mt-1 font-black text-base">
                  <span>Total</span>
                  <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{fmtCOP(order.total)}</span>
                </div>
              </div>
            </AcctCard>
            <AcctCard className="p-4">
              <p className="text-xs font-black uppercase tracking-wide text-muted-foreground mb-2">Entrega</p>
              <p className="text-xs text-foreground flex items-start gap-1.5"><MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-muted-foreground" />{order.address}</p>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5"><PaymentMethodIcon method={order.paymentMethod} /><span className="capitalize">{order.paymentMethod}</span></p>
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
                style={a.primary ? { background: "#FFF200", borderColor: "#FFF200" } : {}}
              >
                <Icon className="w-5 h-5" style={{ color: a.primary ? "#1A1A2E" : "#6B7280" }} />
                <span className="text-xs font-semibold leading-tight" style={{ color: a.primary ? "#1A1A2E" : "#374151" }}>{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  /* ── Tracking Section ── */
  const TrackingSection = () => {
    const order = allOrders.find((o) => o.id === trackingOrderId) ?? allOrders[1];
    return (
      <div>
        <button onClick={() => navigate("orders")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5">
          <ChevronLeft className="w-4 h-4" />
          Mis pedidos
        </button>

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-black text-xl text-foreground" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Rastreo de pedido</h2>
            <p className="text-sm text-muted-foreground">{order.id}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Map placeholder */}
        <AcctCard className="mb-4 overflow-hidden">
          <div className="relative h-48 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #E8F4F8 0%, #D1E8F0 100%)" }}>
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full" style={{
                backgroundImage: "repeating-linear-gradient(0deg, #4A90A4 0px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #4A90A4 0px, transparent 1px, transparent 40px)",
              }} />
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
              style={{ background: "#FFF200", color: "#1A1A2E", fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              D
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-foreground">Diego Martínez</p>
              <p className="text-xs text-muted-foreground">Domiciliario · Mercaldas Milán</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3" fill="#F5C518" stroke="#F5C518" />
                <span className="text-xs font-semibold">4.9</span>
                <span className="text-xs text-muted-foreground">· 1,247 entregas</span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-border hover:bg-muted transition-colors"
              >
                <Phone className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-border hover:bg-muted transition-colors"
              >
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
          <p className="text-xs font-black uppercase tracking-wide text-muted-foreground mb-4">Historial del pedido</p>
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
                    {step.done ? <Check className="w-3.5 h-3.5 text-white" /> : <div className="w-2 h-2 rounded-full" style={{ background: "#E5E7EB" }} />}
                  </div>
                  {idx < TRACKING_STEPS.length - 1 && (
                    <div className="w-0.5 h-6 mt-0.5" style={{ background: step.done ? "#FFF200" : "#E5E7EB" }} />
                  )}
                </div>
                <div className="pb-5">
                  <p className="text-sm font-semibold" style={{ color: step.done ? "#1A1A2E" : "#9CA3AF" }}>{step.label}</p>
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
    const cats = ["Todas", ...Array.from(new Set(favorites.map((p) => p.category)))];
    const filtered = favorites.filter((p) => {
      const ms = favSearch.trim() === "" || p.name.toLowerCase().includes(favSearch.toLowerCase());
      const mc = favCategory === "Todas" || p.category === favCategory;
      return ms && mc;
    });

    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-xl text-foreground" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Favoritos <span className="text-muted-foreground font-normal text-base">({favorites.length})</span></h2>
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
            onCta={onBack}
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
                  onFocus={(e) => { e.target.style.boxShadow = "0 0 0 2px #FFF200"; e.target.style.borderColor = "#FFF200"; }}
                  onBlur={(e) => { e.target.style.boxShadow = "none"; e.target.style.borderColor = ""; }}
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                {cats.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFavCategory(c)}
                    className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={favCategory === c ? { background: "#1A1A2E", color: "#FFF200" } : { background: "#F4F4F6", color: "#6B7280" }}
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
                  <div key={p.id} className="bg-white border border-border rounded-xl overflow-hidden group hover:shadow-md transition-shadow flex flex-col">
                    <div className="relative aspect-square bg-muted overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <button
                        onClick={() => setFavorites((prev) => prev.filter((f) => f.id !== p.id))}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5" fill="#FF4444" stroke="#FF4444" />
                      </button>
                      {p.badge && (
                        <span className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: p.badge === "Nuevo" ? "#1A1A2E" : "#FF4444" }}>
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <div className="p-3 flex flex-col gap-1 flex-1">
                      <p className="text-xs text-muted-foreground">{p.category}</p>
                      <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">{p.name}</p>
                      <div className="flex items-end gap-1.5 mt-auto pt-1">
                        <span className="font-bold text-base" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{fmtCOP(p.price)}</span>
                        {p.originalPrice && <span className="text-xs text-muted-foreground line-through">{fmtCOP(p.originalPrice)}</span>}
                      </div>
                      <div className="flex items-center border border-border rounded-lg overflow-hidden mt-2">
                        <button onClick={() => onRemove(p.id)} disabled={qty === 0} className="flex-1 flex items-center justify-center py-1.5 disabled:opacity-25 hover:bg-muted transition-colors">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-sm w-8 text-center tabular-nums">{qty}</span>
                        <button onClick={() => onAdd(p)} className="flex-1 flex items-center justify-center py-1.5 hover:bg-muted transition-colors">
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
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [newListName, setNewListName] = useState("");
    const selectedList = lists.find((l) => l.id === selectedListId);

    const createList = () => {
      if (!newListName.trim()) return;
      const nl: ShoppingList = { id: `list-${Date.now()}`, name: newListName.trim(), items: [] };
      setLists((prev) => [...prev, nl]);
      setSelectedListId(nl.id);
      setNewListName("");
    };

    const deleteList = (id: string) => {
      setLists((prev) => prev.filter((l) => l.id !== id));
      if (selectedListId === id) setSelectedListId(lists[0]?.id ?? "");
    };

    const duplicateList = (list: ShoppingList) => {
      const dup: ShoppingList = { ...list, id: `list-${Date.now()}`, name: `${list.name} (copia)` };
      setLists((prev) => [...prev, dup]);
    };

    const updateQty = (listId: string, productId: number, delta: number) => {
      setLists((prev) => prev.map((l) => {
        if (l.id !== listId) return l;
        return {
          ...l,
          items: l.items.map((item) =>
            item.product.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
          ),
        };
      }));
    };

    const removeItem = (listId: string, productId: number) => {
      setLists((prev) => prev.map((l) =>
        l.id !== listId ? l : { ...l, items: l.items.filter((i) => i.product.id !== productId) }
      ));
    };

    const addListToCart = (list: ShoppingList) => {
      list.items.forEach(({ product, quantity }) => {
        for (let i = 0; i < quantity; i++) onAdd(product);
      });
    };

    return (
      <div>
        <h2 className="font-black text-xl text-foreground mb-5" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Listas de Compras</h2>

        {lists.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="w-9 h-9 text-muted-foreground" />}
            title="Sin listas aún"
            subtitle="Crea listas para organizar tus compras recurrentes y agilizar tu mercado."
          />
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
                    <form onSubmit={(e) => { e.preventDefault(); setLists((prev) => prev.map((l) => l.id === list.id ? { ...l, name: editName } : l)); setEditingId(null); }} className="flex-1 flex gap-1">
                      <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 text-xs border border-border rounded px-1.5 py-1 focus:outline-none" />
                      <button type="submit" className="text-xs font-bold px-2 rounded" style={{ background: "#FFF200", color: "#1A1A2E" }}>✓</button>
                    </form>
                  ) : (
                    <>
                      <ClipboardList className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                      <span className="text-xs font-semibold flex-1 truncate">{list.name}</span>
                      <span className="text-xs text-muted-foreground">{list.items.length}</span>
                    </>
                  )}
                </div>
              ))}

              {/* Create new */}
              <form onSubmit={(e) => { e.preventDefault(); createList(); }} className="flex gap-1 mt-1">
                <input
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Nueva lista..."
                  className="flex-1 text-xs border border-border rounded-xl px-3 py-2 focus:outline-none bg-white"
                  onFocus={(e) => { e.target.style.boxShadow = "0 0 0 2px #FFF200"; }}
                  onBlur={(e) => { e.target.style.boxShadow = "none"; }}
                />
                <button type="submit" className="px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0" style={{ background: "#FFF200", color: "#1A1A2E" }}>+</button>
              </form>
            </div>

            {/* Selected list content */}
            {selectedList && (
              <div className="flex-1">
                <AcctCard className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-base text-foreground">{selectedList.name}</h3>
                    <div className="flex gap-1.5">
                      <button onClick={() => { setEditingId(selectedList.id); setEditName(selectedList.name); }} className="w-7 h-7 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-colors">
                        <Pencil className="w-3 h-3 text-muted-foreground" />
                      </button>
                      <button onClick={() => duplicateList(selectedList)} className="w-7 h-7 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-colors">
                        <Copy className="w-3 h-3 text-muted-foreground" />
                      </button>
                      <button onClick={() => deleteList(selectedList.id)} className="w-7 h-7 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-colors">
                        <Trash2 className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {selectedList.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Lista vacía. Agrega productos desde el catálogo.</p>
                  ) : (
                    <div className="flex flex-col gap-3 mb-4">
                      {selectedList.items.map(({ product, quantity }) => (
                        <div key={product.id} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground line-clamp-1">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{fmtCOP(product.price)} · {product.unit}</p>
                          </div>
                          <div className="flex items-center border border-border rounded-lg overflow-hidden flex-shrink-0">
                            <button onClick={() => updateQty(selectedList.id, product.id, -1)} className="px-2 py-1.5 hover:bg-muted transition-colors">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold">{quantity}</span>
                            <button onClick={() => updateQty(selectedList.id, product.id, 1)} className="px-2 py-1.5 hover:bg-muted transition-colors">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button onClick={() => removeItem(selectedList.id, product.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0">
                            <X className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedList.items.length > 0 && (
                    <button
                      onClick={() => addListToCart(selectedList)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all hover:brightness-95"
                      style={{ background: "#FFF200", color: "#1A1A2E" }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Agregar lista al carrito ({selectedList.items.length} productos)
                    </button>
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

    const setDefault = (id: string) => setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    const deleteAddr = (id: string) => setAddresses((prev) => prev.filter((a) => a.id !== id));
    const saveAddr = () => {
      if (!form.label || !form.address) return;
      const na: SavedAddress = { id: `a${Date.now()}`, label: form.label ?? "", icon: "📍", name: form.name ?? "", phone: form.phone ?? "", address: form.address ?? "", city: form.city ?? "Manizales", notes: form.notes ?? "", isDefault: false };
      setAddresses((prev) => [...prev, na]);
      setShowForm(false);
      setForm({});
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-xl text-foreground" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Direcciones</h2>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-95" style={{ background: "#FFF200", color: "#1A1A2E" }}>
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
              <AcctCard key={addr.id} className={`p-4 ${addr.isDefault ? "ring-2 ring-foreground" : ""}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{addr.icon}</span>
                    <div>
                      <p className="font-bold text-sm text-foreground">{addr.label}</p>
                      {addr.isDefault && <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: "#FFF200", color: "#1A1A2E" }}>PREDETERMINADA</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="w-7 h-7 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-colors">
                      <Pencil className="w-3 h-3 text-muted-foreground" />
                    </button>
                    <button onClick={() => deleteAddr(addr.id)} className="w-7 h-7 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-colors">
                      <Trash2 className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <p className="text-xs font-semibold text-foreground">{addr.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{addr.address}, {addr.city}</p>
                {addr.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">{addr.notes}</p>}
                <p className="text-xs text-muted-foreground mt-0.5">{addr.phone}</p>
                {!addr.isDefault && (
                  <button onClick={() => setDefault(addr.id)} className="mt-3 text-xs font-semibold text-muted-foreground underline hover:text-foreground transition-colors">
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
                    { key: "label", placeholder: "Etiqueta (Ej: Casa, Oficina)" },
                    { key: "name", placeholder: "Nombre del receptor" },
                    { key: "phone", placeholder: "Teléfono" },
                    { key: "address", placeholder: "Dirección completa" },
                    { key: "city", placeholder: "Ciudad" },
                    { key: "notes", placeholder: "Notas adicionales (opcional)" },
                  ].map(({ key, placeholder }) => (
                    <input
                      key={key}
                      placeholder={placeholder}
                      value={(form as Record<string, string>)[key] ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full text-xs border border-border rounded-lg px-3 py-2 focus:outline-none"
                      onFocus={(e) => { e.target.style.boxShadow = "0 0 0 2px #FFF200"; }}
                      onBlur={(e) => { e.target.style.boxShadow = "none"; }}
                    />
                  ))}
                  <div className="flex gap-2 mt-1">
                    <button onClick={saveAddr} className="flex-1 py-2 rounded-lg text-xs font-bold transition-all hover:brightness-95" style={{ background: "#FFF200", color: "#1A1A2E" }}>Guardar</button>
                    <button onClick={() => { setShowForm(false); setForm({}); }} className="flex-1 py-2 rounded-lg text-xs font-semibold border border-border hover:bg-muted transition-colors">Cancelar</button>
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
    const setDefault = (id: string) => setPayments((prev) => prev.map((p) => ({ ...p, isDefault: p.id === id })));
    const del = (id: string) => setPayments((prev) => prev.filter((p) => p.id !== id));

    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-xl text-foreground" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Métodos de Pago</h2>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-95" style={{ background: "#FFF200", color: "#1A1A2E" }}>
            <Plus className="w-3.5 h-3.5" />
            Agregar método
          </button>
        </div>

        {payments.length === 0 ? (
          <EmptyState icon={<CreditCard className="w-9 h-9 text-muted-foreground" />} title="Sin métodos de pago" subtitle="Agrega una tarjeta o billetera digital para pagar más rápido." cta="Agregar método" />
        ) : (
          <div className="flex flex-col gap-3">
            {payments.map((pm) => (
              <AcctCard key={pm.id} className={`p-4 ${pm.isDefault ? "ring-2 ring-foreground" : ""}`}>
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-xs"
                    style={{ background: pm.color }}
                  >
                    {pm.type === "digital" ? pm.wallet?.[0] : pm.brand?.[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-foreground">{pm.label}</p>
                      {pm.isDefault && <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: "#FFF200", color: "#1A1A2E" }}>PREDETERMINADA</span>}
                    </div>
                    {pm.last4 && <p className="text-xs text-muted-foreground">•••• •••• •••• {pm.last4}</p>}
                    <p className="text-xs text-muted-foreground capitalize">{pm.type === "digital" ? "Billetera digital" : pm.type === "credit" ? "Tarjeta de crédito" : "Tarjeta débito"}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {!pm.isDefault && (
                      <button onClick={() => setDefault(pm.id)} className="text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors font-semibold">
                        Predeterminar
                      </button>
                    )}
                    <button onClick={() => del(pm.id)} className="w-7 h-7 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-colors">
                      <Trash2 className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </AcctCard>
            ))}

            {/* Accepted logos */}
            <AcctCard className="p-4 mt-1">
              <p className="text-xs font-black uppercase tracking-wide text-muted-foreground mb-3">Métodos aceptados</p>
              <div className="flex flex-wrap gap-2">
                {["Visa", "Mastercard", "PSE", "Nequi", "Daviplata", "Efecty"].map((m) => (
                  <span key={m} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-border text-muted-foreground">{m}</span>
                ))}
              </div>
            </AcctCard>
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
        <h2 className="font-black text-xl text-foreground mb-5" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Cupones y Recompensas</h2>

        {/* Points highlight */}
        <AcctCard className="p-5 mb-5" style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)" } as React.CSSProperties}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>Tus puntos Mercaldas</p>
              <p className="text-4xl font-black text-white" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{LOYALTY_PTS.toLocaleString()}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>= {fmtCOP(Math.floor(LOYALTY_PTS / 1000) * 5000)} en descuentos</p>
            </div>
            <Award className="w-14 h-14" style={{ color: "#FFF200" }} />
          </div>
          <div className="mb-1">
            <div className="flex justify-between text-xs mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
              <span>{LOYALTY_PTS % ptsNeeded} / {ptsNeeded} pts para próximo premio</span>
              <span>{Math.round(ptsProgress * 100)}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${ptsProgress * 100}%`, background: "#FFF200" }} />
            </div>
          </div>
        </AcctCard>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[{ id: "active", label: `Activos (${active.length})` }, { id: "used", label: `Usados (${used.length})` }, { id: "points", label: "Historial de puntos" }].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={tab === t.id ? { background: "#1A1A2E", color: "#FFF200" } : { background: "#F4F4F6", color: "#6B7280" }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "active" && (
          active.length === 0 ? (
            <EmptyState icon={<Gift className="w-9 h-9 text-muted-foreground" />} title="Sin cupones activos" subtitle="Tus cupones y promociones exclusivas aparecerán aquí." />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {active.map((c) => (
                <AcctCard key={c.id} className="overflow-hidden">
                  <div className="flex">
                    <div className="w-2 flex-shrink-0" style={{ background: c.color }} />
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-black text-lg" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{c.discount}</p>
                          <p className="text-xs text-muted-foreground">{c.description}</p>
                        </div>
                        {c.category && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-border text-muted-foreground flex-shrink-0">{c.category}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        <div>
                          <p className="text-[11px] font-mono font-bold px-2 py-1 rounded-lg border-2 border-dashed border-border text-foreground tracking-widest">{c.code}</p>
                          {c.minPurchase > 0 && <p className="text-[10px] text-muted-foreground mt-1">Mín. {fmtCOP(c.minPurchase)}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end"><Clock className="w-3 h-3" />Vence: {c.expiresAt}</p>
                          <button
                            onClick={() => { navigator.clipboard?.writeText(c.code); }}
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
          )
        )}

        {tab === "used" && (
          used.length === 0 ? (
            <EmptyState icon={<Tag className="w-9 h-9 text-muted-foreground" />} title="Sin cupones usados" subtitle="Los cupones que hayas canjeado aparecerán aquí." />
          ) : (
            <div className="flex flex-col gap-3">
              {used.map((c) => (
                <AcctCard key={c.id} className="overflow-hidden opacity-60">
                  <div className="flex">
                    <div className="w-2 flex-shrink-0 bg-muted" />
                    <div className="p-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm text-muted-foreground line-through">{c.discount}</p>
                          <p className="text-xs text-muted-foreground">{c.description}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">USADO</span>
                      </div>
                    </div>
                  </div>
                </AcctCard>
              ))}
            </div>
          )
        )}

        {tab === "points" && (
          <AcctCard className="overflow-hidden">
            <div className="divide-y divide-border">
              {LOYALTY_HISTORY.map((entry, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{entry.desc}</p>
                    <p className="text-xs text-muted-foreground">{entry.date}</p>
                  </div>
                  <span
                    className="font-black text-base"
                    style={{ color: entry.pts > 0 ? "#155724" : "#721C24", fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    {entry.pts > 0 ? "+" : ""}{entry.pts} pts
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
    const [histCategory, setHistCategory] = useState("Todos");
    const [histDate, setHistDate] = useState("Todos");

    const allProducts = allOrders.flatMap((o) => o.items.map((i) => ({ ...i as unknown as CartItem, orderId: o.id, orderDate: o.date, status: o.status })));
    const cats = ["Todos", ...Array.from(new Set(allProducts.map((p) => p.category)))];
    const dates = ["Todos", "Último mes", "Últimos 3 meses", "Este año"];

    const filtered = allProducts.filter((p) => {
      const ms = histSearch.trim() === "" || p.name.toLowerCase().includes(histSearch.toLowerCase());
      const mc = histCategory === "Todos" || p.category === histCategory;
      return ms && mc;
    });

    return (
      <div>
        <h2 className="font-black text-xl text-foreground mb-5" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Historial de Compras</h2>

        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input value={histSearch} onChange={(e) => setHistSearch(e.target.value)} placeholder="Buscar productos comprados..." className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-border bg-white focus:outline-none"
              onFocus={(e) => { e.target.style.boxShadow = "0 0 0 2px #FFF200"; }} onBlur={(e) => { e.target.style.boxShadow = "none"; }} />
          </div>
          <select value={histCategory} onChange={(e) => setHistCategory(e.target.value)} className="px-3 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none font-medium">
            {cats.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={histDate} onChange={(e) => setHistDate(e.target.value)} className="px-3 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none font-medium">
            {dates.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<RotateCcw className="w-9 h-9 text-muted-foreground" />} title="Sin resultados" subtitle="Intenta con otros términos de búsqueda o cambia los filtros." />
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((item, idx) => (
              <AcctCard key={idx} className="p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{(item as typeof item & { orderDate: string }).orderDate} · Pedido {(item as typeof item & { orderId: string }).orderId}</p>
                    <p className="text-xs text-muted-foreground">{item.category} · x{item.quantity}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{fmtCOP(item.price * item.quantity)}</p>
                    <button
                      onClick={() => { for (let i = 0; i < item.quantity; i++) onAdd(item as unknown as Product); }}
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
    const [prefs, setPrefs] = useState({ orders: true, promos: true, coupons: true, newProducts: false, recommendations: false });
    const unread = notifs.filter((n) => !n.read);

    const typeIcon: Record<AcctNotif["type"], React.ReactNode> = {
      order: <Package className="w-4 h-4" style={{ color: "#004085" }} />,
      promo: <Tag className="w-4 h-4" style={{ color: "#856404" }} />,
      coupon: <Gift className="w-4 h-4" style={{ color: "#155724" }} />,
      new: <Sparkles className="w-4 h-4" style={{ color: "#6B7280" }} />,
      reco: <Star className="w-4 h-4" style={{ color: "#F5C518" }} />,
    };
    const typeBg: Record<AcctNotif["type"], string> = {
      order: "#CCE5FF", promo: "#FFF3CD", coupon: "#D4EDDA", new: "#F4F4F6", reco: "#FFFDE7",
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-black text-xl text-foreground" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Notificaciones</h2>
            {unread.length > 0 && <p className="text-xs text-muted-foreground">{unread.length} sin leer</p>}
          </div>
          <div className="flex gap-2">
            {unread.length > 0 && (
              <button onClick={() => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))} className="text-xs font-semibold text-muted-foreground underline hover:text-foreground transition-colors">
                Marcar todas como leídas
              </button>
            )}
            <button onClick={() => setPrefOpen((v) => !v)} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors">
              <Settings className="w-3.5 h-3.5" />
              Preferencias
            </button>
          </div>
        </div>

        {prefOpen && (
          <AcctCard className="p-4 mb-4">
            <p className="font-bold text-sm mb-3">Preferencias de notificación</p>
            <div className="flex flex-col gap-3">
              {Object.entries({ orders: "Actualizaciones de pedidos", promos: "Promociones y ofertas", coupons: "Cupones disponibles", newProducts: "Nuevos productos", recommendations: "Recomendaciones personalizadas" }).map(([key, label]) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-foreground">{label}</span>
                  <div
                    className="relative w-10 h-5 rounded-full transition-all flex-shrink-0"
                    style={{ background: prefs[key as keyof typeof prefs] ? "#FFF200" : "#E5E7EB" }}
                    onClick={() => setPrefs((p) => ({ ...p, [key]: !p[key as keyof typeof prefs] }))}
                  >
                    <div className="absolute top-0.5 w-4 h-4 rounded-full bg-foreground shadow transition-all" style={{ left: prefs[key as keyof typeof prefs] ? "calc(100% - 18px)" : "2px" }} />
                  </div>
                </label>
              ))}
            </div>
          </AcctCard>
        )}

        {notifs.length === 0 ? (
          <EmptyState icon={<Bell className="w-9 h-9 text-muted-foreground" />} title="Sin notificaciones" subtitle="Aquí aparecerán las actualizaciones de tus pedidos, promociones y más." />
        ) : (
          <div className="flex flex-col gap-2">
            {notifs.map((n) => (
              <AcctCard key={n.id} className={`p-4 transition-all ${!n.read ? "ring-1 ring-foreground/20" : ""}`} style={!n.read ? { background: "#FFFEF0" } : {}}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: typeBg[n.type] }}>
                    {typeIcon[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!n.read ? "font-bold" : "font-semibold"} text-foreground`}>{n.title}</p>
                      {!n.read && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: "#1A1A2E" }} />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {!n.read && (
                      <button onClick={() => setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))} className="w-7 h-7 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-colors">
                        <Check className="w-3 h-3 text-muted-foreground" />
                      </button>
                    )}
                    <button onClick={() => setNotifs((prev) => prev.filter((x) => x.id !== n.id))} className="w-7 h-7 rounded-lg flex items-center justify-center border border-border hover:bg-muted transition-colors">
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
        setReviews((prev) => prev.map((r) => r.id === editId ? { ...r, rating: newRating, text: newText } : r));
        setEditId(null);
      }
      setShowForm(false);
      setNewRating(0);
      setNewText("");
    };

    return (
      <div>
        <h2 className="font-black text-xl text-foreground mb-5" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Mis Reseñas</h2>

        {reviews.length === 0 ? (
          <EmptyState icon={<Star className="w-9 h-9 text-muted-foreground" />} title="Sin reseñas aún" subtitle="Comparte tu experiencia con los productos que has comprado." />
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.map((rev) => (
              <AcctCard key={rev.id} className="p-4">
                {editId === rev.id ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                        <img src={rev.product.image} alt={rev.product.name} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{rev.product.name}</p>
                    </div>
                    <StarRating value={newRating} onChange={setNewRating} />
                    <textarea
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      rows={3}
                      placeholder="Escribe tu reseña..."
                      className="w-full text-sm border border-border rounded-xl px-3 py-2 focus:outline-none resize-none"
                      onFocus={(e) => { e.target.style.boxShadow = "0 0 0 2px #FFF200"; }}
                      onBlur={(e) => { e.target.style.boxShadow = "none"; }}
                    />
                    <div className="flex gap-2">
                      <button onClick={submitReview} className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-95" style={{ background: "#FFF200", color: "#1A1A2E" }}>Guardar</button>
                      <button onClick={() => setEditId(null)} className="px-4 py-2 rounded-xl text-xs font-semibold border border-border hover:bg-muted transition-colors">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                      <img src={rev.product.image} alt={rev.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground">{rev.product.category}</p>
                      <p className="text-sm font-bold text-foreground line-clamp-1">{rev.product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating value={rev.rating} />
                        <span className="text-xs text-muted-foreground">{rev.date}</span>
                      </div>
                      <p className="text-sm text-foreground mt-2 leading-relaxed">{rev.text}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <ThumbsUp className="w-3 h-3" />
                          Útil ({rev.helpful})
                        </button>
                        <button
                          onClick={() => { setEditId(rev.id); setNewRating(rev.rating); setNewText(rev.text); }}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                          Editar
                        </button>
                        <button
                          onClick={() => setReviews((prev) => prev.filter((r) => r.id !== rev.id))}
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
    const [chatHistory, setChatHistory] = useState<Array<{ from: "user" | "bot"; text: string }>>([
      { from: "bot", text: "¡Hola! Soy el asistente de Mercaldas. ¿En qué te puedo ayudar hoy?" },
    ]);

    const sendChat = () => {
      if (!chatMsg.trim()) return;
      const msg = chatMsg.trim();
      setChatHistory((prev) => [...prev, { from: "user", text: msg }, { from: "bot", text: "Gracias por tu mensaje. Un agente se comunicará contigo pronto. Tiempo estimado: 2 minutos." }]);
      setChatMsg("");
    };

    return (
      <div>
        <h2 className="font-black text-xl text-foreground mb-5" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Centro de Ayuda</h2>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: MessageCircle, label: "Chat en vivo", color: "#1A1A2E", accent: "#FFF200", onClick: () => setChatOpen(true) },
            { icon: Phone, label: "Llamar soporte", color: "#F4F4F6", accent: "#374151", onClick: () => {} },
            { icon: RotateCcw, label: "Devoluciones", color: "#F4F4F6", accent: "#374151", onClick: () => {} },
            { icon: AlertCircle, label: "Reportar problema", color: "#F4F4F6", accent: "#374151", onClick: () => {} },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <button key={a.label} onClick={a.onClick} className="flex flex-col items-center gap-2 py-5 px-3 rounded-xl border border-border hover:shadow-sm transition-all text-center" style={{ background: a.color }}>
                <Icon className="w-5 h-5" style={{ color: a.accent }} />
                <span className="text-xs font-semibold" style={{ color: a.accent }}>{a.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chat widget */}
        {chatOpen && (
          <AcctCard className="mb-5 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border" style={{ background: "#1A1A2E" }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-bold text-white">Soporte Mercaldas</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/60 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="h-48 overflow-y-auto p-4 flex flex-col gap-2 bg-muted/30">
              {chatHistory.map((m, i) => (
                <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
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
                onFocus={(e) => { e.target.style.boxShadow = "0 0 0 2px #FFF200"; }}
                onBlur={(e) => { e.target.style.boxShadow = "none"; }}
              />
              <button onClick={sendChat} className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#FFF200" }}>
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
                  <span className="text-sm font-semibold text-foreground pr-4">{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${openFaq === idx ? "rotate-180" : ""}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
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
    const [profile, setProfile] = useState({ name: "Carlos Gómez", phone: "310 456 7890", email: "carlos@gmail.com", password: "" });
    const [privacyPromo, setPrivacyPromo] = useState(true);
    const [privacyData, setPrivacyData] = useState(false);

    const saveProfile = () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    };

    return (
      <div>
        <h2 className="font-black text-xl text-foreground mb-5" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Configuración de cuenta</h2>

        <div className="flex flex-col gap-4">
          {/* Personal info */}
          <AcctCard className="p-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl"
                  style={{ background: "#FFF200", color: "#1A1A2E", fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  C
                </div>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white" style={{ background: "#1A1A2E" }}>
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>
              <div>
                <p className="font-bold text-foreground">{profile.name}</p>
                <p className="text-xs text-muted-foreground">{profile.email}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Award className="w-3 h-3" style={{ color: "#F5C518" }} />
                  <span className="text-xs font-semibold" style={{ color: "#F5C518" }}>{LOYALTY_PTS.toLocaleString()} puntos</span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              {[
                { label: "Nombre completo", key: "name", type: "text", icon: User },
                { label: "Teléfono", key: "phone", type: "tel", icon: Phone },
                { label: "Correo electrónico", key: "email", type: "email", icon: Mail },
              ].map(({ label, key, type, icon: Icon }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      type={type}
                      value={(profile as Record<string, string>)[key]}
                      onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-xl focus:outline-none"
                      onFocus={(e) => { e.target.style.boxShadow = "0 0 0 2px #FFF200"; e.target.style.borderColor = "#FFF200"; }}
                      onBlur={(e) => { e.target.style.boxShadow = "none"; e.target.style.borderColor = ""; }}
                    />
                  </div>
                </div>
              ))}

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Nueva contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={profile.password}
                    onChange={(e) => setProfile((p) => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 text-sm border border-border rounded-xl focus:outline-none"
                    onFocus={(e) => { e.target.style.boxShadow = "0 0 0 2px #FFF200"; e.target.style.borderColor = "#FFF200"; }}
                    onBlur={(e) => { e.target.style.boxShadow = "none"; e.target.style.borderColor = ""; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={saveProfile}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:brightness-95"
              style={{ background: saved ? "#D4EDDA" : "#FFF200", color: saved ? "#155724" : "#1A1A2E" }}
            >
              {saved ? <><CheckCircle2 className="w-4 h-4" /> ¡Guardado!</> : "Guardar cambios"}
            </button>
          </AcctCard>

          {/* Privacy */}
          <AcctCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <p className="font-bold text-sm">Privacidad y comunicaciones</p>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { key: "privacyPromo", label: "Recibir emails de promociones", desc: "Ofertas, cupones y descuentos exclusivos", value: privacyPromo, set: setPrivacyPromo },
                { key: "privacyData", label: "Datos para recomendaciones personalizadas", desc: "Mejoramos tu experiencia con base en tus compras", value: privacyData, set: setPrivacyData },
              ].map(({ key, label, desc, value, set }) => (
                <label key={key} className="flex items-center justify-between gap-4 cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <div
                    className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
                    style={{ background: value ? "#FFF200" : "#E5E7EB" }}
                    onClick={() => set((v) => !v)}
                  >
                    <div className="absolute top-1 w-4 h-4 rounded-full bg-foreground shadow transition-all" style={{ left: value ? "calc(100% - 20px)" : "4px" }} />
                  </div>
                </label>
              ))}
            </div>
          </AcctCard>

          {/* Danger zone */}
          <AcctCard className="p-5 border-red-200">
            <p className="font-bold text-sm text-red-600 mb-3">Zona de peligro</p>
            <div className="flex gap-3 flex-wrap">
              <button className="px-4 py-2 rounded-xl text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                Cerrar sesión
              </button>
              <button className="px-4 py-2 rounded-xl text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                Eliminar cuenta
              </button>
            </div>
          </AcctCard>
        </div>
      </div>
    );
  };

  /* ── Section Router ── */
  const renderSection = () => {
    switch (section) {
      case "orders": return <OrdersSection />;
      case "order-detail": return <OrderDetailSection />;
      case "tracking": return <TrackingSection />;
      case "favorites": return <FavoritesSection />;
      case "lists": return <ListsSection />;
      case "addresses": return <AddressesSection />;
      case "payments": return <PaymentsSection />;
      case "coupons": return <CouponsSection />;
      case "history": return <HistorySection />;
      case "notifications": return <NotificationsSection />;
      case "reviews": return <ReviewsSection />;
      case "support": return <SupportSection />;
      case "profile": return <ProfileSection />;
      default: return <OrdersSection />;
    }
  };

  return (
    <div className="bg-muted/40 min-h-screen">
      {/* Account Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-sm text-foreground">Mi Cuenta</span>
          <span className="text-muted-foreground text-sm">/</span>
          <span className="text-sm text-muted-foreground">{currentNav?.label ?? "Mi cuenta"}</span>

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
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <p className="font-bold text-sm">Mi Cuenta</p>
              <button onClick={() => setMobileNavOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl" style={{ background: "#FFF200", color: "#1A1A2E" }}>C</div>
                <div>
                  <p className="font-bold text-sm">Carlos Gómez</p>
                  <p className="text-xs text-muted-foreground">{LOYALTY_PTS.toLocaleString()} puntos</p>
                </div>
              </div>
              <nav className="flex flex-col gap-0.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = section === item.id || (item.id === "orders" && (section === "order-detail" || section === "tracking"));
                  return (
                    <button key={item.id} onClick={() => navigate(item.id)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors relative" style={{ background: active ? "#1A1A2E" : "transparent" }}>
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: active ? "#FFF200" : "#6B7280" }} />
                      <span className="text-sm font-medium flex-1" style={{ color: active ? "#FFF200" : "#374151" }}>{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1" style={{ background: "#FFF200", color: "#1A1A2E" }}>{item.badge}</span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6" style={{ minHeight: "calc(100vh - 12rem)" }}>
        {/* Desktop sidebar */}
        <div className="hidden md:block sticky top-24 self-start" style={{ maxHeight: "calc(100vh - 8rem)", overflowY: "auto", scrollbarWidth: "thin" }}>
          <Sidebar />
        </div>

        {/* Content */}
        <main ref={contentRef} className="flex-1 min-w-0" style={{ maxHeight: "calc(100vh - 8rem)", overflowY: "auto", scrollbarWidth: "thin" }}>
          <div style={{ minHeight: "min-content" }}>
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}

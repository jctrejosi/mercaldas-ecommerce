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
import { useCustomerAuth } from "../hooks/useCustomerAuth";
import { useCatalog } from "../hooks/useCatalog";
import { CartItem, CatalogCategory, Order, Product, Slide } from "./types";
import { ProductDetailModal } from "./ProductDetailModal";
import { Logo } from "./Logo";
import { CatalogPage } from "./Views/CatalogView";
import { ProductCard } from "./Views/CatalogView/ProductCard";
import { SocialAuthButtons } from "./SocialAuthButtons";

/* ─── Data ───────────────────────────────────────────────── */


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

/* ─── ProductCard ────────────────────────────────────────── */

/* ─── Product Detail Modal ───────────────────────────────── */

/* ─── Logo ───────────────────────────────────────────────── */

/* ─── Infinite scroll trigger ────────────────────────────── */

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

  const { login, register } = useCustomerAuth();
  const { categories, products, loading: catalogLoading } = useCatalog();

  // Estado local para errores en el modal
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // 3. Crear handlers para login y registro
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login(email, password);
      setLoginModal(false);
      if (cartItems.length > 0) {
        setCheckoutStep(1);
        setCheckoutOpen(true);
      }
    } catch (error: any) {
      setAuthError(error.message || "Error al iniciar sesión");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handler para registro
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phone: formData.get("phone") as string,
      acceptsTerms: true,
    };

    try {
      await register(data);
      setLoginModal(false);
      setAuthLoading(false);
    } catch (error: any) {
      setAuthError(error.message || "Error al registrarse");
      setAuthLoading(false);
    }
  };

  // 4. Google Login usando useGoogleLogin

  // 5. Facebook Login callback

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
  const suggestedCategoriesForSearch = categories.slice(0, 6);

  const searchResults =
    searchQuery.trim().length >= 2
      ? products
          .filter(
            (p) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.category.toLowerCase().includes(searchQuery.toLowerCase()),
          )
          .slice(0, 5)
      : [];

  const suggestedCategories =
    searchQuery.trim().length >= 2
      ? categories
          .filter((c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()),
          )
          .slice(0, 3)
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

  const filteredProducts = products.filter((p) =>
    (p.tabs ?? []).includes(activeTab),
  );

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
                          {suggestedCategoriesForSearch.map((cat) => {
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
                                  style={{ background: cat.bg ?? "#F3F4F6" }}
                                >
                                  {Icon ? (
                                    <Icon
                                      className="w-3.5 h-3.5"
                                      style={{ color: cat.color ?? "currentColor" }}
                                    />
                                  ) : null}
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
                                  {Icon ? (
                                    <Icon
                                      className="w-3 h-3"
                                      style={{ color: cat.color ?? "currentColor" }}
                                    />
                                  ) : null}
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
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => openCatalog(cat.name)}
                    className="flex-shrink-0 flex flex-col items-center gap-2 group"
                  >
                    <div
                      className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                      style={{ background: cat.bg ?? "#F3F4F6" }}
                    >
                      {Icon ? (
                        <Icon
                          className="w-6 h-6 md:w-7 md:h-7"
                          style={{ color: cat.color ?? "currentColor" }}
                        />
                      ) : null}
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
                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  <SocialAuthButtons
                    label="Iniciar sesión"
                    onSuccess={() => {
                      setLoginModal(false);
                      if (cartItems.length > 0) {
                        setCheckoutStep(1);
                        setCheckoutOpen(true);
                      }
                    }}
                    onError={(error: unknown) =>
                      setAuthError(
                        error instanceof Error
                          ? error.message
                          : "Error en autenticación",
                      )
                    }
                  />

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
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
                      disabled={authLoading}
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
                      name="password"
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
                      disabled={authLoading}
                    />
                  </div>

                  {/* Mostrar errores */}
                  {authError && (
                    <div className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 text-center">
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:brightness-95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "#1A1A2E", color: "#FFF200" }}
                  >
                    {authLoading ? "Iniciando sesión..." : "Iniciar sesión"}
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
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <SocialAuthButtons
                    label="Registrarse"
                    onSuccess={() => {
                      setLoginModal(false);
                    }}
                    onError={(error: unknown) =>
                      setAuthError(
                        error instanceof Error
                          ? error.message
                          : "Error en autenticación",
                      )
                    }
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        name="firstName"
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
                        disabled={authLoading}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Apellido
                      </label>
                      <input
                        type="text"
                        name="lastName"
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
                        disabled={authLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
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
                      disabled={authLoading}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Celular
                    </label>
                    <input
                      type="tel"
                      name="phone"
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
                      disabled={authLoading}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none transition-all"
                      onFocus={(e) => {
                        e.target.style.boxShadow = "0 0 0 2px #FFF200";
                        e.target.style.borderColor = "#FFF200";
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow = "none";
                        e.target.style.borderColor = "";
                      }}
                      disabled={authLoading}
                    />
                  </div>

                  {/* Mostrar errores */}
                  {authError && (
                    <div className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 text-center">
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:brightness-95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "#1A1A2E", color: "#FFF200" }}
                  >
                    {authLoading ? "Creando cuenta..." : "Crear mi cuenta"}
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

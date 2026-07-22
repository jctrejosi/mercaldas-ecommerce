import { useState, useEffect } from "react";
import {
  useNavigate,
  useLocation,
} from "react-router";
import {
  ChevronRight,
} from "lucide-react";
import { useCustomerAuth } from "../hooks/useCustomerAuth";
import { ordersService } from "../services/orders.service";
import { cartService } from "../services/cart.service";
import type { CartItem, Order, Product } from "./types";
import type {
  EpaycoConfigResponse,
  WompiConfigResponse,
} from "../services/orders.service";
import { ProductDetailModal } from "./ProductDetailModal";
import { CatalogPage } from "./Views/CatalogView";

import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { PromoBanner } from "./components/PromoBanner";
import { BenefitsSection } from "./components/BenefitsSection";
import { NewsletterSection } from "./components/NewsletterSection";
import { SucursalesSection } from "./components/SucursalesSection";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { AuthModal } from "./components/AuthModal";
import { CheckoutModal } from "./components/CheckoutModal";
import { OrdersPanel } from "./components/OrdersPanel";

/* ─── Helpers ────────────────────────────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);

const PRODUCT_TABS = [
  { id: "vendidos", label: "Más Vendidos" },
  { id: "promociones", label: "Promociones" },
  { id: "recomendados", label: "Recomendados" },
  { id: "novedades", label: "Novedades" },
];

/* ─── Main App ───────────────────────────────────────────── */
export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isCatalogRoute = location.pathname === "/catalog";
  const [currentView, setCurrentView] = useState<"home" | "catalog">(
    isCatalogRoute ? "catalog" : "home",
  );
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("vendidos");
  // catalog filters
  const [catalogCategory, setCatalogCategory] = useState<number[]>([]);
  const [catalogOnSale, setCatalogOnSale] = useState(false);
  const [catalogPriceRange, setCatalogPriceRange] = useState<string>("all");
  const [catalogSort, setCatalogSort] = useState("relevancia");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [loginModal, setLoginModal] = useState(false);
  const [modalView, setModalView] = useState<"choice" | "login" | "register">(
    "choice",
  );
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
  const [cardPayment, setCardPayment] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    installments: "1",
  });
  const [psePayment, setPsePayment] = useState({
    bank: "",
    personType: "natural" as "natural" | "juridica",
  });
  const [nequiPayment, setNequiPayment] = useState({
    phone: "",
  });
  const [lastOrderId, setLastOrderId] = useState("");
  const [cardGateway, setCardGateway] = useState<"epayco" | "wompi">("epayco");
  const [epaycoConfig, setEpaycoConfig] = useState<EpaycoConfigResponse | null>(
    null,
  );
  const [wompiConfig, setWompiConfig] = useState<WompiConfigResponse | null>(
    null,
  );
  const [wompiAcceptance, setWompiAcceptance] = useState({
    terms: false,
    personalData: false,
  });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const {
    customer,
    loading: customerLoading,
    login,
    register,
    socialLogin,
  } = useCustomerAuth();

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

  useEffect(() => {
    if (customerLoading) return;

    if (!customer) {
      setCartHydrated(true);
      return;
    }

    void cartService
      .getCart()
      .then((response) => {
        setCartItems((prev) => {
          const merged = new Map<number, CartItem>();

          for (const item of response.items) {
            merged.set(item.id, {
              ...item,
            });
          }

          for (const item of prev) {
            const existing = merged.get(item.id);
            if (existing) {
              merged.set(item.id, {
                ...existing,
                quantity: existing.quantity + item.quantity,
              });
            } else {
              merged.set(item.id, item);
            }
          }

          return Array.from(merged.values());
        });
        setCartHydrated(true);
      })
      .catch(() => {
        setCartHydrated(true);
      });
  }, [customer, customerLoading]);

  useEffect(() => {
    if (!customer || !cartHydrated) return;

    void cartService.updateCart(
      cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    );
  }, [cartHydrated, cartItems, customer]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems((prev) => {
      const ex = prev.find((c) => c.id === product.id);
      if (ex)
        return prev.map((c) =>
          c.id === product.id ? { ...c, quantity: c.quantity + quantity } : c,
        );
      return [...prev, { ...product, quantity }];
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

  const openCatalog = (categoryId?: number) => {
    if (categoryId) {
      setCatalogCategory([categoryId]);
    } else {
      setCatalogCategory([]);
    }
    setCurrentView("catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openModal = (view: "choice" | "login" | "register") => {
    if (customer) {
      setLoginModal(false);
      return;
    }

    setModalView(view);
    setLoginModal(true);
  };

  const closeModal = () => setLoginModal(false);

  const cartTotal = cartItems.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cartItems.reduce((s, c) => s + c.quantity, 0);

  const placeOrder = async () => {
    if (!customer) {
      setCheckoutError("Debes iniciar sesión para completar el pedido");
      return;
    }

    try {
      setCheckoutLoading(true);
      setCheckoutError(null);

      const cardDetails =
        checkoutPayment === "tarjeta"
          ? await (async () => {
              if (cardGateway === "wompi") {
                if (!wompiConfig?.publicKey) {
                  throw new Error("Wompi no está configurado correctamente");
                }

                if (
                  !wompiAcceptance.terms ||
                  !wompiAcceptance.personalData ||
                  !wompiConfig.acceptanceToken ||
                  !wompiConfig.personalDataAuthToken
                ) {
                  throw new Error(
                    "Debes aceptar los términos y el tratamiento de datos para pagar con tarjeta",
                  );
                }

                const tokenizedCard = await ordersService.tokenizeWompiCard({
                  publicKey: wompiConfig.publicKey,
                  number: cardPayment.cardNumber.replace(/\s+/g, ""),
                  cvc: cardPayment.cvv,
                  expMonth: cardPayment.expiryMonth,
                  expYear: cardPayment.expiryYear,
                  cardHolder: cardPayment.cardholderName,
                });

                return {
                  provider: "wompi" as const,
                  cardholderName: cardPayment.cardholderName,
                  cardToken: tokenizedCard.id,
                  acceptanceToken: wompiConfig.acceptanceToken,
                  acceptPersonalAuth: wompiConfig.personalDataAuthToken,
                  last4: tokenizedCard.last_four,
                  brand: tokenizedCard.brand,
                  installments: Number(cardPayment.installments || "1"),
                };
              }

              if (!epaycoConfig?.publicKey) {
                throw new Error("ePayco no está configurado correctamente");
              }

              const tokenizedCard = await ordersService.tokenizeEpaycoCard({
                cardNumber: cardPayment.cardNumber.replace(/\s+/g, ""),
                cvc: cardPayment.cvv,
                expMonth: cardPayment.expiryMonth,
                expYear: cardPayment.expiryYear,
                cardHolder: cardPayment.cardholderName,
              });

              return {
                provider: "epayco" as const,
                cardholderName: cardPayment.cardholderName,
                cardToken: tokenizedCard.id,
                last4: tokenizedCard.last4,
                brand: tokenizedCard.brand,
                installments: Number(cardPayment.installments || "1"),
              };
            })()
          : undefined;

      const response = await ordersService.checkout({
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        address: {
          name: checkoutAddress.name,
          phone: checkoutAddress.phone,
          address: checkoutAddress.address,
          city: checkoutAddress.city,
          notes: checkoutAddress.notes,
        },
        shippingType: checkoutShipping,
        paymentMethod: checkoutPayment,
        paymentDetails:
          checkoutPayment === "tarjeta"
            ? {
                card: cardDetails,
              }
            : checkoutPayment === "pse"
              ? { pse: psePayment }
              : checkoutPayment === "nequi"
                ? { nequi: nequiPayment }
                : undefined,
      });

      const newOrder: Order = {
        id: response.referenceCode,
        date: new Date().toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        items: [...cartItems],
        total: response.grandTotal,
        shipping: response.shippingCost,
        address: `${response.address.address}, ${response.address.city}`,
        paymentMethod: response.paymentMethod,
        status: "preparando",
      };

      setOrders((prev) => [newOrder, ...prev]);
      setLastOrderId(response.referenceCode);
      setCartItems([]);
      setCheckoutStep(4);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "No se pudo procesar el pedido",
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  useEffect(() => {
    void ordersService
      .getEpaycoConfig()
      .then(setEpaycoConfig)
      .catch(() => null);

    void ordersService
      .getWompiConfig()
      .then(setWompiConfig)
      .catch(() => null);
  }, []);

  const handleSocialSuccess = () => {
    setLoginModal(false);
    if (cartItems.length > 0) {
      setCheckoutStep(1);
      setCheckoutOpen(true);
    }
  };

  const handleSocialError = (error: unknown) => {
    setAuthError(
      error instanceof Error ? error.message : "Error en autenticación",
    );
  };

  return (
    <div
      className="min-h-screen bg-background"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Header
        cartCount={cartCount}
        customer={customer}
        customerLoading={customerLoading}
        ordersCount={orders.length}
        cartItems={cartItems}
        onCartOpen={() => setCartOpen(true)}
        onOrdersOpen={() => {
          setSelectedOrder(null);
          setOrdersOpen(true);
        }}
        onLoginModal={openModal}
        onCatalogSearch={setCatalogSearch}
        onOpenCatalog={openCatalog}
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
        fmt={fmt}
      />

      {currentView === "catalog" && (
        <CatalogPage
          cartItems={cartItems}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onBack={() => navigate("/")}
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
        <HeroSection />

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
              {/* Las categorías se muestran en CatalogView */}
            </div>
          </div>
        </section>

        <PromoBanner />

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
              {/* Los productos se muestran en CatalogView */}
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

        <SucursalesSection />
        <BenefitsSection />
        <NewsletterSection />
      </main>

      <Footer />

      <CartDrawer
        cartOpen={cartOpen}
        cartItems={cartItems}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onClose={() => setCartOpen(false)}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onDelete={deleteFromCart}
        onCheckout={() => {
          setCartOpen(false);
          if (customer) {
            setCheckoutStep(1);
            setCheckoutOpen(true);
            return;
          }
          openModal("choice");
        }}
        fmt={fmt}
      />

      <ProductDetailModal
        product={selectedProduct}
        cartItems={cartItems}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onClose={() => setSelectedProduct(null)}
      />

      <AuthModal
        loginModal={loginModal}
        modalView={modalView}
        authError={authError}
        authLoading={authLoading}
        cartItems={cartItems}
        socialLogin={socialLogin}
        onClose={closeModal}
        onSetModalView={setModalView}
        onLoginSubmit={handleLoginSubmit}
        onRegisterSubmit={handleRegisterSubmit}
        onSocialSuccess={handleSocialSuccess}
        onSocialError={handleSocialError}
      />

      <CheckoutModal
        checkoutOpen={checkoutOpen}
        checkoutStep={checkoutStep}
        cartItems={cartItems}
        cartTotal={cartTotal}
        checkoutAddress={checkoutAddress}
        checkoutShipping={checkoutShipping}
        checkoutPayment={checkoutPayment}
        checkoutLoading={checkoutLoading}
        checkoutError={checkoutError}
        cardPayment={cardPayment}
        cardGateway={cardGateway}
        wompiAcceptance={wompiAcceptance}
        wompiConfig={wompiConfig}
        psePayment={psePayment}
        nequiPayment={nequiPayment}
        lastOrderId={lastOrderId}
        onClose={() => setCheckoutOpen(false)}
        onSetCheckoutStep={setCheckoutStep}
        onSetCheckoutAddress={setCheckoutAddress}
        onSetCheckoutShipping={setCheckoutShipping}
        onSetCheckoutPayment={setCheckoutPayment}
        onSetCardPayment={setCardPayment}
        onSetCardGateway={setCardGateway}
        onSetWompiAcceptance={setWompiAcceptance}
        onSetPsePayment={setPsePayment}
        onSetNequiPayment={setNequiPayment}
        onPlaceOrder={placeOrder}
        fmt={fmt}
      />

      <OrdersPanel
        ordersOpen={ordersOpen}
        orders={orders}
        selectedOrder={selectedOrder}
        onClose={() => {
          setOrdersOpen(false);
          setSelectedOrder(null);
        }}
        onSelectOrder={setSelectedOrder}
        fmt={fmt}
      />
    </div>
  );
}

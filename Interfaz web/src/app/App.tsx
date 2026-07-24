import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { useCustomerAuth } from "../hooks/useCustomerAuth";
import { catalogService } from "../services/catalog.service";
import { ordersService } from "../services/orders.service";
import { cartService } from "../services/cart.service";
import type { Brand, Branch, CartItem, CatalogCategory, Order, Product } from "./types";
import type { EpaycoConfigResponse, WompiConfigResponse } from "../services/orders.service";
import { ProductDetailModal } from "./ProductDetailModal";
import { CatalogPage } from "./Views/CatalogView";
import { UserAdminView } from "./Views/AccountView";
import { LandingView } from "./Views/LandingView";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { AuthModal } from "./components/AuthModal";
import { CheckoutModal } from "./components/CheckoutModal";
import { ErrorPage } from "./components/ErrorPage";
import { OrdersPanel } from "./components/OrdersPanel";

const fmt = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);

type CatalogProductsQuery = {
  categories?: number[]; categoryIds?: number[]; productTypeCode?: string;
  onSale?: boolean; priceRange?: string; sort?: string; search?: string; limit?: number; offset?: number;
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"home" | "catalog" | "account">(
    location.pathname === "/catalog" ? "catalog" : "home",
  );

  useEffect(() => {
    if (location.pathname === "/catalog") setCurrentView("catalog");
    else if (location.pathname === "/") setCurrentView("home");
  }, [location.pathname]);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("vendidos");
  const [catalogCategory, setCatalogCategory] = useState<number[]>([]);
  const [catalogOnSale, setCatalogOnSale] = useState(false);
  const [catalogPriceRange, setCatalogPriceRange] = useState<string>("all");
  const [catalogSort, setCatalogSort] = useState("relevancia");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [loginModal, setLoginModal] = useState(false);
  const [modalView, setModalView] = useState<"choice" | "login" | "register">("choice");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [checkoutAddress, setCheckoutAddress] = useState({ name: "", phone: "", address: "", city: "Manizales", notes: "" });
  const [checkoutShipping, setCheckoutShipping] = useState<"standard" | "express">("standard");
  const [checkoutPayment, setCheckoutPayment] = useState<"efectivo" | "tarjeta" | "nequi" | "pse">("efectivo");
  const [cardPayment, setCardPayment] = useState({ cardholderName: "", cardNumber: "", expiryMonth: "", expiryYear: "", cvv: "", installments: "1" });
  const [psePayment, setPsePayment] = useState({ bank: "", personType: "natural" as "natural" | "juridica" });
  const [nequiPayment, setNequiPayment] = useState({ phone: "" });
  const [lastOrderId, setLastOrderId] = useState("");
  const [cardGateway, setCardGateway] = useState<"epayco" | "wompi">("epayco");
  const [epaycoConfig, setEpaycoConfig] = useState<EpaycoConfigResponse | null>(null);
  const [wompiConfig, setWompiConfig] = useState<WompiConfigResponse | null>(null);
  const [wompiAcceptance, setWompiAcceptance] = useState({ terms: false, personalData: false });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [landingCategories, setLandingCategories] = useState<CatalogCategory[]>([]);
  const [landingProducts, setLandingProducts] = useState<Product[]>([]);
  const [landingLoading, setLandingLoading] = useState(true);
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [featuredBrands, setFeaturedBrands] = useState<Brand[]>([]);
  const [landingBranches, setLandingBranches] = useState<Branch[]>([]);
  const [apiError, setApiError] = useState<number | null>(null);
  const [healthChecked, setHealthChecked] = useState(false);

  // Detectar si el backend está disponible antes de renderizar la app
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/catalog/categories`, {
      signal: controller.signal,
    })
      .then((res) => {
        clearTimeout(timeout);
        if (!res.ok) setApiError(res.status);
      })
      .catch(() => {
        clearTimeout(timeout);
        setApiError(502);
      })
      .finally(() => setHealthChecked(true));
    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);

  const { customer, loading: customerLoading, login, register, socialLogin } = useCustomerAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    void catalogService.getCategories().then(setLandingCategories).catch(() => {});
    void catalogService.getProducts({ onSale: true, sort: "descuento", limit: 8 }).then(setDealProducts).catch(() => {});
    void catalogService.getFeaturedBrands().then(setFeaturedBrands).catch(() => {});
    void catalogService.getBranches().then(setLandingBranches).catch(() => {});
  }, []);

  const fetchLandingProducts = useCallback(async (tab: string) => {
    setLandingLoading(true);
    try {
      let params: CatalogProductsQuery = { limit: 8 };
      if (tab === "promociones") { params.onSale = true; params.sort = "descuento"; }
      else if (tab === "recomendados") params.sort = "relevancia";
      setLandingProducts(await catalogService.getProducts(params));
    } catch { setLandingProducts([]); }
    finally { setLandingLoading(false); }
  }, []);

  useEffect(() => { void fetchLandingProducts(activeTab); }, [activeTab, fetchLandingProducts]);

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setAuthError(null); setAuthLoading(true);
    const fd = new FormData(e.currentTarget);
    try { await login(fd.get("email") as string, fd.get("password") as string); setLoginModal(false); if (cartItems.length > 0) { setCheckoutStep(1); setCheckoutOpen(true); } }
    catch (err: any) { setAuthError(err.message || "Error"); }
    finally { setAuthLoading(false); }
  };
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthError(null); setAuthLoading(true);
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    try {
      await register({ email: fd.get("email") as string, password: fd.get("password") as string, firstName: fd.get("firstName") as string, lastName: fd.get("lastName") as string, phone: fd.get("phone") as string, acceptsTerms: true });
      setLoginModal(false); setAuthLoading(false);
    } catch (err: any) { setAuthError(err.message || "Error"); setAuthLoading(false); }
  };

  useEffect(() => {
    if (customerLoading) return;
    if (!customer) { setCartHydrated(true); return; }
    void cartService.getCart().then(r => {
      setCartItems(prev => { const m = new Map<number, CartItem>(); r.items.forEach(i => m.set(i.id, { ...i })); prev.forEach(i => { const e = m.get(i.id); if (e) m.set(i.id, { ...e, quantity: e.quantity + i.quantity }); else m.set(i.id, i); }); return [...m.values()]; });
      setCartHydrated(true);
    }).catch(() => setCartHydrated(true));
  }, [customer, customerLoading]);
  useEffect(() => { if (customer && cartHydrated) void cartService.updateCart(cartItems.map(i => ({ productId: i.id, quantity: i.quantity }))); }, [cartHydrated, cartItems, customer]);

  const addToCart = (p: Product, q: number = 1) => setCartItems(prev => { const e = prev.find(c => c.id === p.id); return e ? prev.map(c => c.id === p.id ? { ...c, quantity: c.quantity + q } : c) : [...prev, { ...p, quantity: q }]; });
  const removeFromCart = (id: number) => setCartItems(prev => { const e = prev.find(c => c.id === id); return !e ? prev : e.quantity === 1 ? prev.filter(c => c.id !== id) : prev.map(c => c.id === id ? { ...c, quantity: c.quantity - 1 } : c); });
  const deleteFromCart = (id: number) => setCartItems(prev => prev.filter(c => c.id !== id));

  const openCatalog = (categoryId?: number) => { if (categoryId) { setCatalogCategory([categoryId]); setCatalogSearch(""); } else setCatalogCategory([]); setCurrentView("catalog"); navigate("/catalog"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openModal = (v: "choice" | "login" | "register") => { if (customer) { setLoginModal(false); return; } setModalView(v); setLoginModal(true); };
  const closeModal = () => setLoginModal(false);
  const cartTotal = cartItems.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cartItems.reduce((s, c) => s + c.quantity, 0);
  const handleCategoryClick = (n: string) => { setCatalogSearch(n); setCurrentView("catalog"); navigate("/catalog"); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const placeOrder = async () => {
    if (!customer) { setCheckoutError("Debes iniciar sesión"); return; }
    try { setCheckoutLoading(true); setCheckoutError(null); const response = await ordersService.checkout({ items: cartItems.map(i => ({ productId: i.id, quantity: i.quantity })), address: { name: checkoutAddress.name, phone: checkoutAddress.phone, address: checkoutAddress.address, city: checkoutAddress.city, notes: checkoutAddress.notes }, shippingType: checkoutShipping, paymentMethod: checkoutPayment }); const o: Order = { id: response.referenceCode, date: new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" }), items: [...cartItems], total: response.grandTotal, shipping: response.shippingCost, address: `${response.address.address}, ${response.address.city}`, paymentMethod: response.paymentMethod, status: "preparando" }; setOrders(prev => [o, ...prev]); setLastOrderId(response.referenceCode); setCartItems([]); setCheckoutStep(4); }
    catch (err) { setCheckoutError(err instanceof Error ? err.message : "Error"); }
    finally { setCheckoutLoading(false); }
  };

  useEffect(() => { void ordersService.getEpaycoConfig().then(setEpaycoConfig).catch(() => null); void ordersService.getWompiConfig().then(setWompiConfig).catch(() => null); }, []);
  const handleSocialSuccess = () => { setLoginModal(false); if (cartItems.length > 0) { setCheckoutStep(1); setCheckoutOpen(true); } };
  const handleSocialError = (e: unknown) => setAuthError(e instanceof Error ? e.message : "Error");

  const headerProps: any = {
    cartCount, categories: landingCategories, customer, customerLoading,
    ordersCount: orders.length, cartItems,
    onCartOpen: () => setCartOpen(true),
    onOrdersOpen: () => { setSelectedOrder(null); setOrdersOpen(true); },
    onLoginModal: openModal, onCatalogSearch: setCatalogSearch, onOpenCatalog: openCatalog,
    onAddToCart: addToCart, onRemoveFromCart: removeFromCart,
    onHome: () => { setCurrentView("home"); navigate("/"); },
    onAccount: customer ? () => { setCurrentView("account"); navigate("/account"); } : undefined,
    fmt,
  };

  // Health check — must be AFTER all hooks
  if (!healthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Conectando...</p>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <ErrorPage
        statusCode={apiError >= 500 ? (apiError as 500 | 502 | 503) : 502}
        onRetry={() => { setApiError(null); setHealthChecked(false); window.location.reload(); }}
        onGoHome={() => { window.location.href = "/"; }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header {...headerProps} />

      {currentView === "catalog" && (<CatalogPage cartItems={cartItems} onAdd={addToCart} onRemove={removeFromCart} onBack={() => { navigate("/"); setCurrentView("home"); }} onProductClick={setSelectedProduct} onOpenCategory={openCatalog} catalogCategory={catalogCategory} setCatalogCategory={setCatalogCategory} catalogOnSale={catalogOnSale} setCatalogOnSale={setCatalogOnSale} catalogPriceRange={catalogPriceRange} setCatalogPriceRange={setCatalogPriceRange} catalogSort={catalogSort} setCatalogSort={setCatalogSort} catalogSearch={catalogSearch} setCatalogSearch={setCatalogSearch} mobileFiltersOpen={mobileFiltersOpen} setMobileFiltersOpen={setMobileFiltersOpen} />)}

      {currentView === "account" && (
        <UserAdminView appOrders={orders} cartItems={cartItems} onAdd={addToCart} onRemove={removeFromCart} onProductClick={setSelectedProduct} onBack={() => { setCurrentView("home"); navigate("/"); }} onViewCatalog={openCatalog} />
      )}

      <main className={currentView !== "home" ? "hidden" : ""}>
        <LandingView
          categories={landingCategories} products={landingProducts} loading={landingLoading}
          activeTab={activeTab} dealProducts={dealProducts} cartItems={cartItems}
          onTabChange={setActiveTab} onAdd={addToCart} onRemove={removeFromCart}
          onProductClick={setSelectedProduct} onCategoryClick={openCatalog} onViewCatalog={openCatalog}
          featuredBrands={featuredBrands}
          branches={landingBranches}
        />
      </main>

      <Footer categories={landingCategories} onCategoryClick={handleCategoryClick} />
      <CartDrawer cartOpen={cartOpen} cartItems={cartItems} cartCount={cartCount} cartTotal={cartTotal} onClose={() => setCartOpen(false)} onAdd={addToCart} onRemove={removeFromCart} onDelete={deleteFromCart} onCheckout={() => { setCartOpen(false); if (customer) { setCheckoutStep(1); setCheckoutOpen(true); return; } openModal("choice"); }} fmt={fmt} />
      <ProductDetailModal product={selectedProduct} cartItems={cartItems} onAdd={addToCart} onRemove={removeFromCart} onClose={() => setSelectedProduct(null)} />
      <AuthModal loginModal={loginModal} modalView={modalView} authError={authError} authLoading={authLoading} cartItems={cartItems} socialLogin={socialLogin} onClose={closeModal} onSetModalView={setModalView} onLoginSubmit={handleLoginSubmit} onRegisterSubmit={handleRegisterSubmit} onSocialSuccess={handleSocialSuccess} onSocialError={handleSocialError} />
      <CheckoutModal checkoutOpen={checkoutOpen} checkoutStep={checkoutStep} cartItems={cartItems} cartTotal={cartTotal} checkoutAddress={checkoutAddress} checkoutShipping={checkoutShipping} checkoutPayment={checkoutPayment} checkoutLoading={checkoutLoading} checkoutError={checkoutError} cardPayment={cardPayment} cardGateway={cardGateway} wompiAcceptance={wompiAcceptance} wompiConfig={wompiConfig} psePayment={psePayment} nequiPayment={nequiPayment} lastOrderId={lastOrderId} onClose={() => setCheckoutOpen(false)} onSetCheckoutStep={setCheckoutStep} onSetCheckoutAddress={setCheckoutAddress} onSetCheckoutShipping={setCheckoutShipping} onSetCheckoutPayment={setCheckoutPayment} onSetCardPayment={setCardPayment} onSetCardGateway={setCardGateway} onSetWompiAcceptance={setWompiAcceptance} onSetPsePayment={setPsePayment} onSetNequiPayment={setNequiPayment} onPlaceOrder={placeOrder} fmt={fmt} />
      <OrdersPanel ordersOpen={ordersOpen} orders={orders} selectedOrder={selectedOrder} onClose={() => { setOrdersOpen(false); setSelectedOrder(null); }} onSelectOrder={setSelectedOrder} onGoToCatalog={openCatalog} fmt={fmt} />
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { useCustomerAuth } from "../hooks/useCustomerAuth";
import { catalogService } from "../services/catalog.service";
import { ordersService } from "../services/orders.service";
import { cartService } from "../services/cart.service";
import type { CartItem, CatalogCategory, Order, Product } from "./types";
import type { EpaycoConfigResponse, WompiConfigResponse } from "../services/orders.service";
import { ProductDetailModal } from "./ProductDetailModal";
import { CatalogPage } from "./Views/CatalogView";
import { LandingView } from "./Views/LandingView";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { AuthModal } from "./components/AuthModal";
import { CheckoutModal } from "./components/CheckoutModal";
import { OrdersPanel } from "./components/OrdersPanel";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);

type CatalogProductsQuery = {
  categories?: number[];
  categoryIds?: number[];
  productTypeCode?: string;
  onSale?: boolean;
  priceRange?: string;
  sort?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"home" | "catalog">(
    location.pathname === "/catalog" ? "catalog" : "home",
  );

  useEffect(() => {
    if (location.pathname === "/catalog") setCurrentView("catalog");
    else setCurrentView("home");
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
  const [checkoutAddress, setCheckoutAddress] = useState({
    name: "", phone: "", address: "", city: "Manizales", notes: "",
  });
  const [checkoutShipping, setCheckoutShipping] = useState<"standard" | "express">("standard");
  const [checkoutPayment, setCheckoutPayment] = useState<"efectivo" | "tarjeta" | "nequi" | "pse">("efectivo");
  const [cardPayment, setCardPayment] = useState({
    cardholderName: "", cardNumber: "", expiryMonth: "", expiryYear: "", cvv: "", installments: "1",
  });
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

  const { customer, loading: customerLoading, login, register, socialLogin } = useCustomerAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    void catalogService.getCategories().then(setLandingCategories).catch(() => {});
    void catalogService.getProducts({ onSale: true, sort: "descuento", limit: 8 }).then(setDealProducts).catch(() => {});
  }, []);

  const fetchLandingProducts = useCallback(async (tab: string) => {
    setLandingLoading(true);
    try {
      let params: CatalogProductsQuery = { limit: 8 };
      switch (tab) {
        case "promociones": params.onSale = true; params.sort = "descuento"; break;
        case "recomendados": params.sort = "relevancia"; break;
        default: break;
      }
      const products = await catalogService.getProducts(params);
      setLandingProducts(products);
    } catch { setLandingProducts([]); }
    finally { setLandingLoading(false); }
  }, []);

  useEffect(() => { void fetchLandingProducts(activeTab); }, [activeTab, fetchLandingProducts]);

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null); setAuthLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await login(formData.get("email") as string, formData.get("password") as string);
      setLoginModal(false);
      if (cartItems.length > 0) { setCheckoutStep(1); setCheckoutOpen(true); }
    } catch (error: any) { setAuthError(error.message || "Error al iniciar sesión"); }
    finally { setAuthLoading(false); }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null); setAuthLoading(true);
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    try {
      await register({
        email: formData.get("email") as string, password: formData.get("password") as string,
        firstName: formData.get("firstName") as string, lastName: formData.get("lastName") as string,
        phone: formData.get("phone") as string, acceptsTerms: true,
      });
      setLoginModal(false); setAuthLoading(false);
    } catch (error: any) { setAuthError(error.message || "Error al registrarse"); setAuthLoading(false); }
  };

  useEffect(() => {
    if (customerLoading) return;
    if (!customer) { setCartHydrated(true); return; }
    void cartService.getCart()
      .then((response) => {
        setCartItems((prev) => {
          const merged = new Map<number, CartItem>();
          for (const item of response.items) merged.set(item.id, { ...item });
          for (const item of prev) {
            const ex = merged.get(item.id);
            if (ex) merged.set(item.id, { ...ex, quantity: ex.quantity + item.quantity });
            else merged.set(item.id, item);
          }
          return Array.from(merged.values());
        });
        setCartHydrated(true);
      })
      .catch(() => setCartHydrated(true));
  }, [customer, customerLoading]);

  useEffect(() => {
    if (!customer || !cartHydrated) return;
    void cartService.updateCart(cartItems.map((item) => ({ productId: item.id, quantity: item.quantity })));
  }, [cartHydrated, cartItems, customer]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems((prev) => {
      const ex = prev.find((c) => c.id === product.id);
      return ex
        ? prev.map((c) => (c.id === product.id ? { ...c, quantity: c.quantity + quantity } : c))
        : [...prev, { ...product, quantity }];
    });
  };
  const removeFromCart = (id: number) => {
    setCartItems((prev) => {
      const ex = prev.find((c) => c.id === id);
      if (!ex) return prev;
      return ex.quantity === 1 ? prev.filter((c) => c.id !== id) : prev.map((c) => (c.id === id ? { ...c, quantity: c.quantity - 1 } : c));
    });
  };
  const deleteFromCart = (id: number) => setCartItems((prev) => prev.filter((c) => c.id !== id));

  const openCatalog = (categoryId?: number) => {
    if (categoryId) { setCatalogCategory([categoryId]); setCatalogSearch(""); }
    else setCatalogCategory([]);
    setCurrentView("catalog");
    navigate("/catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openModal = (view: "choice" | "login" | "register") => {
    if (customer) { setLoginModal(false); return; }
    setModalView(view); setLoginModal(true);
  };
  const closeModal = () => setLoginModal(false);
  const cartTotal = cartItems.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cartItems.reduce((s, c) => s + c.quantity, 0);

  const handleCategoryClick = (categoryName: string) => {
    setCatalogSearch(categoryName);
    setCurrentView("catalog");
    navigate("/catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const placeOrder = async () => {
    if (!customer) { setCheckoutError("Debes iniciar sesión para completar el pedido"); return; }
    try {
      setCheckoutLoading(true); setCheckoutError(null);
      const cardDetails = checkoutPayment === "tarjeta" ? await (async () => {
        if (cardGateway === "wompi") {
          if (!wompiConfig?.publicKey) throw new Error("Wompi no configurado");
          if (!wompiAcceptance.terms || !wompiAcceptance.personalData || !wompiConfig.acceptanceToken || !wompiConfig.personalDataAuthToken)
            throw new Error("Debes aceptar términos y tratamiento de datos para pagar con tarjeta");
          const tok = await ordersService.tokenizeWompiCard({
            publicKey: wompiConfig.publicKey, number: cardPayment.cardNumber.replace(/\s+/g, ""),
            cvc: cardPayment.cvv, expMonth: cardPayment.expiryMonth, expYear: cardPayment.expiryYear, cardHolder: cardPayment.cardholderName,
          });
          return { provider: "wompi" as const, cardholderName: cardPayment.cardholderName, cardToken: tok.id, acceptanceToken: wompiConfig.acceptanceToken, acceptPersonalAuth: wompiConfig.personalDataAuthToken, last4: tok.last_four, brand: tok.brand, installments: Number(cardPayment.installments || "1") };
        }
        if (!epaycoConfig?.publicKey) throw new Error("ePayco no configurado");
        const tok = await ordersService.tokenizeEpaycoCard({
          cardNumber: cardPayment.cardNumber.replace(/\s+/g, ""), cvc: cardPayment.cvv,
          expMonth: cardPayment.expiryMonth, expYear: cardPayment.expiryYear, cardHolder: cardPayment.cardholderName,
        });
        return { provider: "epayco" as const, cardholderName: cardPayment.cardholderName, cardToken: tok.id, last4: tok.last4, brand: tok.brand, installments: Number(cardPayment.installments || "1") };
      })() : undefined;

      const response = await ordersService.checkout({
        items: cartItems.map((i) => ({ productId: i.id, quantity: i.quantity })),
        address: { name: checkoutAddress.name, phone: checkoutAddress.phone, address: checkoutAddress.address, city: checkoutAddress.city, notes: checkoutAddress.notes },
        shippingType: checkoutShipping, paymentMethod: checkoutPayment,
        paymentDetails: checkoutPayment === "tarjeta" ? { card: cardDetails } : checkoutPayment === "pse" ? { pse: psePayment } : checkoutPayment === "nequi" ? { nequi: nequiPayment } : undefined,
      });

      const newOrder: Order = {
        id: response.referenceCode, date: new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" }),
        items: [...cartItems], total: response.grandTotal, shipping: response.shippingCost,
        address: `${response.address.address}, ${response.address.city}`, paymentMethod: response.paymentMethod, status: "preparando",
      };
      setOrders((prev) => [newOrder, ...prev]); setLastOrderId(response.referenceCode); setCartItems([]); setCheckoutStep(4);
    } catch (error) { setCheckoutError(error instanceof Error ? error.message : "No se pudo procesar el pedido"); }
    finally { setCheckoutLoading(false); }
  };

  useEffect(() => {
    void ordersService.getEpaycoConfig().then(setEpaycoConfig).catch(() => null);
    void ordersService.getWompiConfig().then(setWompiConfig).catch(() => null);
  }, []);

  const handleSocialSuccess = () => { setLoginModal(false); if (cartItems.length > 0) { setCheckoutStep(1); setCheckoutOpen(true); } };
  const handleSocialError = (error: unknown) => setAuthError(error instanceof Error ? error.message : "Error en autenticación");

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header
        cartCount={cartCount} categories={landingCategories} customer={customer} customerLoading={customerLoading}
        ordersCount={orders.length} cartItems={cartItems}
        onCartOpen={() => setCartOpen(true)}
        onOrdersOpen={() => { setSelectedOrder(null); setOrdersOpen(true); }}
        onLoginModal={openModal} onCatalogSearch={setCatalogSearch} onOpenCatalog={openCatalog}
        onAddToCart={addToCart} onRemoveFromCart={removeFromCart}
        onHome={() => { setCurrentView("home"); navigate("/"); }} fmt={fmt}
      />

      {currentView === "catalog" && (
        <CatalogPage
          cartItems={cartItems} onAdd={addToCart} onRemove={removeFromCart}
          onBack={() => { navigate("/"); setCurrentView("home"); }}
          onProductClick={setSelectedProduct} onOpenCategory={openCatalog}
          catalogCategory={catalogCategory} setCatalogCategory={setCatalogCategory}
          catalogOnSale={catalogOnSale} setCatalogOnSale={setCatalogOnSale}
          catalogPriceRange={catalogPriceRange} setCatalogPriceRange={setCatalogPriceRange}
          catalogSort={catalogSort} setCatalogSort={setCatalogSort}
          catalogSearch={catalogSearch} setCatalogSearch={setCatalogSearch}
          mobileFiltersOpen={mobileFiltersOpen} setMobileFiltersOpen={setMobileFiltersOpen}
        />
      )}

      <main className={currentView === "catalog" ? "hidden" : ""}>
        <LandingView
          categories={landingCategories}
          products={landingProducts}
          loading={landingLoading}
          activeTab={activeTab}
          dealProducts={dealProducts}
          cartItems={cartItems}
          onTabChange={setActiveTab}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onProductClick={setSelectedProduct}
          onCategoryClick={openCatalog}
          onViewCatalog={openCatalog}
        />
      </main>

      <Footer categories={landingCategories} onCategoryClick={handleCategoryClick} />

      <CartDrawer
        cartOpen={cartOpen} cartItems={cartItems} cartCount={cartCount} cartTotal={cartTotal}
        onClose={() => setCartOpen(false)} onAdd={addToCart} onRemove={removeFromCart} onDelete={deleteFromCart}
        onCheckout={() => { setCartOpen(false); if (customer) { setCheckoutStep(1); setCheckoutOpen(true); return; } openModal("choice"); }}
        fmt={fmt}
      />

      <ProductDetailModal
        product={selectedProduct} cartItems={cartItems} onAdd={addToCart} onRemove={removeFromCart}
        onClose={() => setSelectedProduct(null)}
      />

      <AuthModal
        loginModal={loginModal} modalView={modalView} authError={authError} authLoading={authLoading}
        cartItems={cartItems} socialLogin={socialLogin} onClose={closeModal} onSetModalView={setModalView}
        onLoginSubmit={handleLoginSubmit} onRegisterSubmit={handleRegisterSubmit}
        onSocialSuccess={handleSocialSuccess} onSocialError={handleSocialError}
      />

      <CheckoutModal
        checkoutOpen={checkoutOpen} checkoutStep={checkoutStep} cartItems={cartItems} cartTotal={cartTotal}
        checkoutAddress={checkoutAddress} checkoutShipping={checkoutShipping} checkoutPayment={checkoutPayment}
        checkoutLoading={checkoutLoading} checkoutError={checkoutError}
        cardPayment={cardPayment} cardGateway={cardGateway} wompiAcceptance={wompiAcceptance} wompiConfig={wompiConfig}
        psePayment={psePayment} nequiPayment={nequiPayment} lastOrderId={lastOrderId}
        onClose={() => setCheckoutOpen(false)} onSetCheckoutStep={setCheckoutStep}
        onSetCheckoutAddress={setCheckoutAddress} onSetCheckoutShipping={setCheckoutShipping}
        onSetCheckoutPayment={setCheckoutPayment} onSetCardPayment={setCardPayment} onSetCardGateway={setCardGateway}
        onSetWompiAcceptance={setWompiAcceptance} onSetPsePayment={setPsePayment} onSetNequiPayment={setNequiPayment}
        onPlaceOrder={placeOrder} fmt={fmt}
      />

      <OrdersPanel
        ordersOpen={ordersOpen} orders={orders} selectedOrder={selectedOrder}
        onClose={() => { setOrdersOpen(false); setSelectedOrder(null); }} onSelectOrder={setSelectedOrder} fmt={fmt}
      />
    </div>
  );
}

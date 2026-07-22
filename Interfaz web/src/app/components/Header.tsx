import { useState, useEffect, useRef } from "react";
import {
  Search,
  ShoppingCart,
  MapPin,
  User,
  Package,
  Clock,
  Menu,
  TrendingUp,
  ArrowUpRight,
  ChevronDown,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { Logo } from "../Logo";
import type { CartItem, CatalogCategory, Product } from "../types";
import { catalogService } from "../../services/catalog.service";

interface HeaderProps {
  cartCount: number;
  customer: { firstName?: string; fullName?: string } | null;
  customerLoading: boolean;
  ordersCount: number;
  cartItems: CartItem[];
  onCartOpen: () => void;
  onOrdersOpen: () => void;
  onLoginModal: (view: "choice" | "login" | "register") => void;
  onCatalogSearch: (search: string) => void;
  onOpenCatalog: (categoryId?: number) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onRemoveFromCart: (id: number) => void;
  fmt: (n: number) => string;
}

const POPULAR_SEARCHES = [
  "Leche Alquería",
  "Aguacate",
  "Arroz Diana",
  "Pollo",
  "Huevos",
  "Café Juan Valdez",
];

export function Header({
  cartCount,
  customer,
  customerLoading,
  ordersCount,
  cartItems,
  onCartOpen,
  onOrdersOpen,
  onLoginModal,
  onCatalogSearch,
  onOpenCatalog,
  onAddToCart,
  onRemoveFromCart,
  fmt,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchCategories, setSearchCategories] = useState<CatalogCategory[]>(
    [],
  );
  const searchRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    void catalogService
      .getCategories()
      .then(setSearchCategories)
      .catch(() => null);
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    let cancelled = false;

    const timer = setTimeout(() => {
      void catalogService
        .getProducts({ search: query, limit: 8 })
        .then((products) => {
          if (!cancelled) setSearchResults(products);
        })
        .catch(() => {
          if (!cancelled) setSearchResults([]);
        })
        .finally(() => {
          if (!cancelled) setSearchLoading(false);
        });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const suggestedCategories =
    searchQuery.trim().length >= 2
      ? searchCategories
          .filter((cat) =>
            cat.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
          )
          .slice(0, 5)
      : [];

  const handleSearch = () => {
    const query = searchQuery.trim();
    if (query.length >= 2) {
      setSearchOpen(false);
      onCatalogSearch(query);
      onOpenCatalog();
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
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
              {/* Search button - now clickable! */}
              <button
                onClick={handleSearch}
                className="absolute left-3 z-10 p-0.5 rounded-full hover:bg-muted transition-colors"
                aria-label="Buscar"
              >
                <Search className="w-4 h-4 text-muted-foreground" />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={handleSearchKeyDown}
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
                                    style={{
                                      color: cat.color ?? "currentColor",
                                    }}
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
                    {searchLoading ? (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm text-muted-foreground">
                          Buscando productos...
                        </p>
                      </div>
                    ) : searchResults.length > 0 ? (
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
                                <div className="w-11 h-11 rounded-lg bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center">
                                  {p.image ? (
                                    <img
                                      src={p.image}
                                      alt={p.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Package className="w-5 h-5 text-muted-foreground" />
                                  )}
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
                                      onClick={() => onRemoveFromCart(p.id)}
                                      disabled={
                                        (inCart?.quantity ?? 0) === 0
                                      }
                                      className="px-2 py-1.5 hover:bg-muted transition-colors disabled:opacity-25"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-6 text-center text-xs font-bold tabular-nums">
                                      {inCart?.quantity ?? 0}
                                    </span>
                                    <button
                                      onClick={() => onAddToCart(p)}
                                      className="px-2 py-1.5 hover:bg-muted transition-colors"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => onAddToCart(p)}
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
                            onCatalogSearch(searchQuery);
                            onOpenCatalog();
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
            onClick={() => {
              if (customer) {
                onOrdersOpen();
                return;
              }
              onLoginModal("login");
            }}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium whitespace-nowrap"
          >
            <User className="w-4 h-4" />
            <span className="hidden lg:inline">
              {customerLoading
                ? "Cargando..."
                : customer?.firstName ||
                  customer?.fullName ||
                  "Iniciar sesión"}
            </span>
          </button>
          <button
            onClick={onOrdersOpen}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium whitespace-nowrap relative"
          >
            <Package className="w-4 h-4" />
            <span className="hidden lg:inline">Pedidos</span>
            {ordersCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ background: "#FF4444", color: "#fff" }}
              >
                {ordersCount}
              </span>
            )}
          </button>
          <button
            onClick={onCartOpen}
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
          {["Inicio", "Categorías", "Promociones", "Marketplace", "Ayuda"].map(
            (item) => (
              <a
                key={item}
                href="#"
                className="py-2.5 px-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors border-b border-border last:border-0"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ),
          )}
        </div>
      )}

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
              Entregar en{" "}
              <strong className="text-foreground">Manizales</strong>
            </span>
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>
      </nav>
    </header>
  );
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CatalogPageProps {
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

export interface Product {
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

export interface CatalogCategory {
  id: number;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  bg: string;
}

export interface Slide {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  bg: string;
  accent: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  shipping: number;
  address: string;
  paymentMethod: string;
  status: "preparando" | "en camino" | "entregado";
}

export interface ProductCardProps {
  product: Product;
  cartItems: CartItem[];
  onAdd: (p: Product) => void;
  onRemove: (id: number) => void;
  onProductClick: (p: Product) => void;
}

export interface ProductDetailModalProps {
  product: Product | null;
  cartItems: CartItem[];
  onAdd: (p: Product) => void;
  onRemove: (id: number) => void;
  onClose: () => void;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  website?: string | null;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CatalogPageProps {
  cartItems: CartItem[];
  onAdd: (p: Product, quantity?: number) => void;
  onRemove: (id: number) => void;
  onBack: () => void;
  onOpenCategory: (categoryId?: number) => void;
  onProductClick: (p: Product) => void;
  catalogCategory: number[];
  setCatalogCategory: (v: number[]) => void;
  catalogOnSale: boolean;
  setCatalogOnSale: (v: boolean) => void;
  catalogPriceRange: string;
  setCatalogPriceRange: (v: string) => void;
  catalogSort: string;
  setCatalogSort: (v: string) => void;
  catalogSearch: string;
  setCatalogSearch: (v: string) => void;
  catalogProductType: string;
  setCatalogProductType: (v: string) => void;
  mobileFiltersOpen: boolean;
  setMobileFiltersOpen: (v: boolean) => void;
}

export interface Product {
  id: number;
  externalId?: string | null;
  slug?: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  originalPrice?: number;
  image?: string;
  images?: string[];
  category: string;
  categoryId?: number;
  productTypeCode?: string | null;
  productTypeName?: string | null;
  badge?: string;
  tabs?: string[];
  unit?: string;
  stock?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  tags?: string[];
}

export interface CatalogCategory {
  id: number;
  parentId?: number | null;
  level?: number;
  slug?: string;
  name: string;
  description?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> | null;
  iconName?: string;
  color?: string;
  bg?: string;
  image?: string;
  productTypeCode?: string | null;
  isActive?: boolean;
  count?: number;
}

export interface CatalogDataResponse {
  categories: CatalogCategory[];
  products: Product[];
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

export interface Branch {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  email?: string;
  schedule?: Record<string, string> | null;
  location?: string;
  priority?: number;
  isActive?: boolean;
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
  onAdd: (p: Product, quantity?: number) => void;
  onRemove: (id: number) => void;
  onProductClick: (p: Product) => void;
}

export interface ProductDetailModalProps {
  product: Product | null;
  cartItems: CartItem[];
  onAdd: (p: Product, quantity?: number) => void;
  onRemove: (id: number) => void;
  onClose: () => void;
}

import type { Brand, Branch, CartItem, CatalogCategory, Product } from "../../types";
import { HeroSection } from "../../components/HeroSection";
import { AdvertisingBanner } from "../../components/AdvertisingBanner";
import { QuickCategoriesSection } from "../../components/QuickCategoriesSection";
import { PromoBanner } from "../../components/PromoBanner";
import { FeaturedProductsSection } from "../../components/FeaturedProductsSection";
import { DailyDealsSection } from "../../components/DailyDealsSection";
import { BrandsSection } from "../../components/BrandsSection";
import { SucursalesSection } from "../../components/SucursalesSection";
import { BenefitsSection } from "../../components/BenefitsSection";
import { NewsletterSection } from "../../components/NewsletterSection";

interface LandingViewProps {
  categories: CatalogCategory[];
  products: Product[];
  loading: boolean;
  activeTab: string;
  dealProducts: Product[];
  cartItems: CartItem[];
  branches: Branch[];
  productTypes: { id: number; code: string; name: string; count: number }[];
  onTabChange: (tab: string) => void;
  onAdd: (product: Product, quantity?: number) => void;
  onRemove: (id: number) => void;
  onProductClick: (product: Product) => void;
  onCategoryClick: (categoryId: number) => void;
  onViewCatalog: () => void;
  onBrandClick: (brandId: number) => void;
  onProductTypeClick: (code: string) => void;
  onApplyFilter: (f: { categoryIds?: number[]; brandId?: number | null; productTypeCode?: string; onSale?: boolean; search?: string; sort?: string; priceMin?: number; priceMax?: number }) => void;
  featuredBrands: Brand[];
}

export function LandingView({
  categories,
  products,
  loading,
  activeTab,
  dealProducts,
  cartItems,
  onTabChange,
  onAdd,
  onRemove,
  onProductClick,
  onCategoryClick,
  onViewCatalog,
  onApplyFilter,
  featuredBrands,
  branches,
  onBrandClick,
  productTypes,
  onProductTypeClick,
}: LandingViewProps) {
  return (
    <>
      <HeroSection onApplyFilter={onApplyFilter} />

      <QuickCategoriesSection
        productTypes={productTypes}
        onProductTypeClick={onProductTypeClick}
        onViewAll={onViewCatalog}
      />
      <PromoBanner />
      <FeaturedProductsSection
        products={products}
        loading={loading}
        activeTab={activeTab}
        cartItems={cartItems}
        onTabChange={onTabChange}
        onAdd={onAdd}
        onRemove={onRemove}
        onProductClick={onProductClick}
        onViewAll={onViewCatalog}
      />
      <AdvertisingBanner onShop={onViewCatalog} onApplyFilter={onApplyFilter} />
      <DailyDealsSection
        cartItems={cartItems}
        onAdd={onAdd}
        onRemove={onRemove}
        onProductClick={onProductClick}
        dealProducts={dealProducts}
      />
      <BrandsSection brands={featuredBrands} onBrandClick={onBrandClick} />
      <SucursalesSection branches={branches} />
      <BenefitsSection />
      <NewsletterSection />
    </>
  );
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type CatalogProduct = {
  id: number;
  externalId?: string | null;
  slug?: string | null;
  name: string;
  description?: string | null;
  price: number;
  originalPrice?: number | null;
  image?: string | null;
  images?: string[];
  category: string;
  categoryId?: number | null;
  productTypeCode?: string | null;
  productTypeName?: string | null;
  badge?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
  tags?: string[];
};

export type CatalogCategory = {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon?: any;
  color?: string;
  count: number;
  isActive: boolean;
};

export type Brand = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  website: string | null;
};

export type ProductType = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  count: number;
};

export type ProductsQuery = {
  search?: string;
  categoryIds?: number[];
  brandId?: number;
  productTypeCode?: string;
  onSale?: boolean;
  priceRange?: string;
  sort?: string;
  limit?: number;
  offset?: number;
};

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export const catalogService = {
  async getProducts(params?: ProductsQuery): Promise<CatalogProduct[]> {
    return fetchJson<CatalogProduct[]>(`${API_BASE_URL}/catalog/products`, {
      method: "POST",
      body: JSON.stringify(params ?? {}),
    });
  },

  async getProductsCount(): Promise<{ total: number }> {
    return fetchJson<{ total: number }>(`${API_BASE_URL}/catalog/products/count`);
  },

  async getCategories(): Promise<CatalogCategory[]> {
    return fetchJson<CatalogCategory[]>(`${API_BASE_URL}/catalog/categories`);
  },

  async getBrands(): Promise<Brand[]> {
    return fetchJson<Brand[]>(`${API_BASE_URL}/catalog/brands`);
  },

  async getProductTypes(): Promise<ProductType[]> {
    return fetchJson<ProductType[]>(`${API_BASE_URL}/catalog/product-types`);
  },
};

import type {
  Brand,
  Branch,
  CatalogCategory,
  CatalogDataResponse,
  Product,
} from "../app/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type CatalogProductsQuery = {
  categories?: number[];
  categoryIds?: number[];
  brandId?: number;
  productTypeCode?: string;
  onSale?: boolean;
  priceRange?: string;
  sort?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

function buildProductsPayload(params?: CatalogProductsQuery) {
  return {
    categories: params?.categories?.length ? params.categories : undefined,
    categoryIds: params?.categoryIds?.length ? params.categoryIds : undefined,
    brandId: params?.brandId || undefined,
    productTypeCode: params?.productTypeCode || undefined,
    onSale: params?.onSale || undefined,
    priceRange:
      params?.priceRange && params.priceRange !== "all"
        ? params.priceRange
        : undefined,
    sort: params?.sort || undefined,
    search: params?.search?.trim() ? params.search.trim() : undefined,
    limit: params?.limit || undefined,
    offset: params?.offset || undefined,
  };
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    ...init,
    headers: { ...init?.headers },
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar el catálogo");
  }

  return response.json();
}

export const catalogService = {
  async getBranches(): Promise<Branch[]> {
    return fetchJson<Branch[]>(`${API_BASE_URL}/catalog/branches`);
  },

  async getFeaturedBrands(): Promise<Brand[]> {
    const brands = await fetchJson<Brand[]>(
      `${API_BASE_URL}/catalog/brands/featured`,
    );
    return brands.map((brand) => ({ ...brand }));
  },

  async getCatalogBrands(): Promise<(Brand & { count: number })[]> {
    return fetchJson<(Brand & { count: number })[]>(
      `${API_BASE_URL}/catalog/brands`,
    );
  },

  async getProductTypes(): Promise<{ id: number; code: string; name: string; count: number }[]> {
    return fetchJson(`${API_BASE_URL}/catalog/product-types`);
  },

  async getFeaturedProductTypes(): Promise<{ id: number; code: string; name: string; count: number }[]> {
    return fetchJson(`${API_BASE_URL}/landing/product-types`);
  },

  async getCatalogData(
    params?: CatalogProductsQuery,
  ): Promise<CatalogDataResponse> {
    const [categories, products] = await Promise.all([
      this.getCategories(),
      this.getProducts(params),
    ]);

    return { categories, products };
  },

  async getCategories(): Promise<CatalogCategory[]> {
    const categories = await fetchJson<CatalogCategory[]>(
      `${API_BASE_URL}/catalog/categories`,
    );

    return categories.map((category) => ({ ...category }));
  },

  async getCategoryCounts(): Promise<Map<number, number>> {
    const counts = await fetchJson<{ categoryId: number; count: number }[]>(
      `${API_BASE_URL}/catalog/categories/counts`,
    );

    return new Map(counts.map((c) => [c.categoryId, c.count]));
  },

  async getProducts(params?: CatalogProductsQuery): Promise<Product[]> {
    const payload = buildProductsPayload(params);
    const products = await fetchJson<Product[]>(
      `${API_BASE_URL}/catalog/products`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    return products.map((product) => ({ ...product }));
  },

  async getProductById(id: number): Promise<Product | undefined> {
    const products = await this.getProducts({ limit: 20 });
    return products.find((product) => product.id === id);
  },

  async getRelatedProducts(product: Product): Promise<Product[]> {
    const products = await this.getProducts({
      categoryIds: product.categoryId ? [product.categoryId] : undefined,
      limit: 20,
    });

    return products.filter((item) => item.id !== product.id);
  },

  // ── Favorites ──

  async getFavorites(): Promise<Product[]> {
    return fetchJson<Product[]>(`${API_BASE_URL}/catalog/favorites`);
  },

  async addFavorite(productId: number): Promise<void> {
    await fetch(`${API_BASE_URL}/catalog/favorites/${productId}`, {
      method: "POST",
      credentials: "include",
    });
  },

  async removeFavorite(productId: number): Promise<void> {
    await fetch(`${API_BASE_URL}/catalog/favorites/${productId}`, {
      method: "DELETE",
      credentials: "include",
    });
  },

  // ── Shopping Lists ──

  async getShoppingLists(): Promise<
    Array<{
      id: number;
      name: string;
      createdAt: string;
      items: Array<{
        productId: number;
        productName: string;
        productPrice: number;
        productImage: string | null;
        quantity: number;
      }>;
    }>
  > {
    return fetchJson(`${API_BASE_URL}/catalog/shopping-lists`);
  },

  async createShoppingList(name: string): Promise<{ id: number }> {
    return fetchJson(`${API_BASE_URL}/catalog/shopping-lists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
  },

  async updateShoppingList(id: number, name: string): Promise<void> {
    await fetch(`${API_BASE_URL}/catalog/shopping-lists/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name }),
    });
  },

  async deleteShoppingList(id: number): Promise<void> {
    await fetch(`${API_BASE_URL}/catalog/shopping-lists/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
  },

  async addToShoppingList(listId: number, productId: number, quantity = 1): Promise<void> {
    await fetch(`${API_BASE_URL}/catalog/shopping-lists/${listId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ productId, quantity }),
    });
  },

  async updateShoppingListItem(listId: number, productId: number, quantity: number): Promise<void> {
    await fetch(`${API_BASE_URL}/catalog/shopping-lists/${listId}/items/${productId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ quantity }),
    });
  },

  async removeShoppingListItem(listId: number, productId: number): Promise<void> {
    await fetch(`${API_BASE_URL}/catalog/shopping-lists/${listId}/items/${productId}`, {
      method: "DELETE",
      credentials: "include",
    });
  },
};

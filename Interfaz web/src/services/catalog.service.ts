import type {
  CatalogCategory,
  CatalogDataResponse,
  Product,
} from "../app/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type CatalogProductsQuery = {
  categories?: number[];
  categoryIds?: number[];
  onSale?: boolean;
  priceRange?: string;
  sort?: string;
  search?: string;
  limit?: number;
};

function buildProductsPayload(params?: CatalogProductsQuery) {
  return {
    categories: params?.categories?.length ? params.categories : undefined,
    categoryIds: params?.categoryIds?.length ? params.categoryIds : undefined,
    onSale: params?.onSale || undefined,
    priceRange:
      params?.priceRange && params.priceRange !== "all"
        ? params.priceRange
        : undefined,
    sort: params?.sort || undefined,
    search: params?.search?.trim() ? params.search.trim() : undefined,
    limit: params?.limit || undefined,
  };
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    ...init,
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar el catálogo");
  }

  return response.json();
}

export const catalogService = {
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
      categories: product.category ? [product.category] : undefined,
      limit: 20,
    });

    return products.filter((item) => item.id !== product.id);
  },
};

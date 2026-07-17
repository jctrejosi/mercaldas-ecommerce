import type {
  CatalogCategory,
  CatalogDataResponse,
  Product,
} from "../app/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type CatalogProductsQuery = {
  categories?: string[];
  onSale?: boolean;
  priceRange?: string;
  sort?: string;
  search?: string;
  limit?: number;
};

function buildProductsQuery(params?: CatalogProductsQuery) {
  const searchParams = new URLSearchParams();

  if (params?.categories?.length) {
    searchParams.set("categories", params.categories.join(","));
  }
  if (params?.onSale) {
    searchParams.set("onSale", "true");
  }
  if (params?.priceRange && params.priceRange !== "all") {
    searchParams.set("priceRange", params.priceRange);
  }
  if (params?.sort) {
    searchParams.set("sort", params.sort);
  }
  if (params?.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }
  if (params?.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar el catálogo");
  }

  return response.json();
}

export const catalogService = {
  async getCatalogData(params?: CatalogProductsQuery): Promise<CatalogDataResponse> {
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
    const query = buildProductsQuery(params);
    const products = await fetchJson<Product[]>(
      `${API_BASE_URL}/catalog/products${query}`,
    );

    return products.map((product) => ({ ...product }));
  },

  async getProductById(id: number): Promise<Product | undefined> {
    const products = await this.getProducts({ limit: 200 });
    return products.find((product) => product.id === id);
  },

  async getRelatedProducts(product: Product): Promise<Product[]> {
    const products = await this.getProducts({
      categories: [product.category],
      limit: 20,
    });

    return products.filter((item) => item.id !== product.id);
  },
};

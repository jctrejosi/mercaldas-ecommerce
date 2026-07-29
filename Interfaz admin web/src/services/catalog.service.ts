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
  isActive?: boolean;
  priceMin?: number;
  priceMax?: number;
  onSale?: boolean;
  priceRange?: string;
  sort?: string;
  limit?: number;
  offset?: number;
  uncategorized?: boolean;
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
    return fetchJson<{ total: number }>(
      `${API_BASE_URL}/catalog/products/count`,
    );
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

  async getBranches(): Promise<
    { id: number; name: string; address: string }[]
  > {
    return fetchJson<{ id: number; name: string; address: string }[]>(
      `${API_BASE_URL}/catalog/branches`,
    );
  },

  // ── Admin Category CRUD ──

  async getCategoriesAdmin(): Promise<
    Array<{
      id: number;
      name: string;
      slug: string;
      parentId: number | null;
      displayOrder: number;
      description: string | null;
      metaTitle: string | null;
      metaDescription: string | null;
      isActive: boolean;
      level: number;
      createdAt: string;
      imagePath: string | null;
      productCount: number;
    }>
  > {
    return fetchJson(`${API_BASE_URL}/admin/catalog/categories`);
  },

  async createCategory(data: {
    name: string;
    parentId?: number;
  }): Promise<{ id: number }> {
    return fetchJson(`${API_BASE_URL}/admin/catalog/categories`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateCategory(
    id: number,
    data: {
      name?: string;
      parentId?: number | null;
      description?: string | null;
      displayOrder?: number;
      metaTitle?: string | null;
      metaDescription?: string | null;
      isActive?: boolean;
      imageUrl?: string;
    },
  ): Promise<{ id: number }> {
    return fetchJson(`${API_BASE_URL}/admin/catalog/categories/${id}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: number): Promise<void> {
    await fetch(`${API_BASE_URL}/admin/catalog/categories/${id}`, {
      method: "DELETE",
    });
  },

  async getUncategorizedProducts(
    offset = 0,
    limit = 20,
    search?: string,
  ): Promise<CatalogProduct[]> {
    return fetchJson<CatalogProduct[]>(
      `${API_BASE_URL}/admin/catalog/products`,
      {
        method: "POST",
        body: JSON.stringify({ uncategorized: true, limit, offset, search }),
      },
    );
  },

  async getCategoryProducts(categoryId: number): Promise<
    Array<{
      id: number;
      name: string;
      slug: string;
      price: number;
      image: string | null;
      productTypeCode: string | null;
    }>
  > {
    return fetchJson(
      `${API_BASE_URL}/admin/catalog/categories/${categoryId}/products`,
    );
  },

  async addProductToCategory(
    categoryId: number,
    productId: number,
  ): Promise<void> {
    await fetch(
      `${API_BASE_URL}/admin/catalog/categories/${categoryId}/products`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      },
    );
  },

  async removeProductFromCategory(
    categoryId: number,
    productId: number,
  ): Promise<void> {
    await fetch(
      `${API_BASE_URL}/admin/catalog/categories/${categoryId}/products/${productId}`,
      {
        method: "DELETE",
      },
    );
  },

  async replaceProductCategory(
    productId: number,
    categoryId: number,
  ): Promise<void> {
    await fetch(
      `${API_BASE_URL}/admin/catalog/products/${productId}/replace-category`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId }),
      },
    );
  },
};

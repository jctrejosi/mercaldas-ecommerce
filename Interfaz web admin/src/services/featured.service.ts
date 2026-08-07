const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type FeaturedTab = {
  id: number;
  name: string;
  slug: string;
  position: number;
  isActive: boolean;
  queryOnSale: boolean | null;
  querySort: string | null;
  isDefault: boolean;
  productCount: number;
};

export type FeaturedProduct = {
  id: number;
  externalId: string | null;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice?: number;
  image: string | null;
  plu: string | null;
  barcode: string | null;
  isActive: boolean;
};

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const featuredService = {
  getTabs: () =>
    jsonFetch<FeaturedTab[]>(`${API_BASE_URL}/admin/featured/tabs`),

  createTab: (data: { name: string; queryOnSale?: boolean; querySort?: string }) =>
    jsonFetch<FeaturedTab[]>(`${API_BASE_URL}/admin/featured/tabs`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateTab: (
    id: number,
    data: {
      name?: string;
      slug?: string;
      position?: number;
      isActive?: boolean;
      queryOnSale?: boolean | null;
      querySort?: string | null;
    },
  ) =>
    jsonFetch<FeaturedTab[]>(`${API_BASE_URL}/admin/featured/tabs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteTab: (id: number) =>
    jsonFetch<FeaturedTab[]>(`${API_BASE_URL}/admin/featured/tabs/${id}`, {
      method: "DELETE",
    }),

  getTabProducts: (tabId: number) =>
    jsonFetch<FeaturedProduct[]>(`${API_BASE_URL}/admin/featured/tabs/${tabId}/products`),

  assignProducts: (tabId: number, productIds: number[]) =>
    jsonFetch<FeaturedProduct[]>(`${API_BASE_URL}/admin/featured/tabs/${tabId}/products`, {
      method: "POST",
      body: JSON.stringify({ productIds }),
    }),

  removeProduct: (tabId: number, productId: number) =>
    jsonFetch<FeaturedProduct[]>(`${API_BASE_URL}/admin/featured/tabs/${tabId}/products/${productId}`, {
      method: "DELETE",
    }),

  reorderProducts: (tabId: number, productIds: number[]) =>
    jsonFetch<FeaturedProduct[]>(`${API_BASE_URL}/admin/featured/tabs/${tabId}/products/reorder`, {
      method: "PUT",
      body: JSON.stringify({ productIds }),
    }),

  searchProducts: (q: string) =>
    jsonFetch<FeaturedProduct[]>(
      `${API_BASE_URL}/admin/featured/products/search?q=${encodeURIComponent(q)}&limit=20`,
    ),
};

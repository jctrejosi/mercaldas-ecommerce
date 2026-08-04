const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type FilterConfig = {
  id: number;
  name: string;
  description: string | null;
  categoryIds: number[];
  brandId: number | null;
  productTypeCode: string | null;
  onSale: boolean;
  search: string | null;
  sort: string | null;
  priceMin: number | null;
  priceMax: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateFilterData = {
  name: string;
  description?: string;
  categoryIds?: number[];
  brandId?: number | null;
  productTypeCode?: string;
  onSale?: boolean;
  search?: string;
  sort?: string;
  priceMin?: number;
  priceMax?: number;
  isActive?: boolean;
};

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { message?: string })?.message ?? `API error: ${response.status}`);
  }
  return response.json();
}

export const filtersService = {
  async getAll(): Promise<FilterConfig[]> {
    return fetchJson(`${API_BASE_URL}/admin/filters`);
  },

  async getById(id: number): Promise<FilterConfig> {
    return fetchJson(`${API_BASE_URL}/admin/filters/${id}`);
  },

  async create(data: CreateFilterData): Promise<FilterConfig> {
    return fetchJson(`${API_BASE_URL}/admin/filters`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: Partial<CreateFilterData>): Promise<FilterConfig> {
    return fetchJson(`${API_BASE_URL}/admin/filters/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async remove(id: number): Promise<{ success: boolean }> {
    return fetchJson(`${API_BASE_URL}/admin/filters/${id}`, { method: "DELETE" });
  },
};

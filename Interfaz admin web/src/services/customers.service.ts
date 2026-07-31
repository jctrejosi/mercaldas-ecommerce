const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type LoyaltyTier = "bronce" | "plata" | "oro" | "platino";

export type Customer = {
  id: string;
  rawId: number;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  loyalty: LoyaltyTier;
  joined: string;
  lastOrder: string;
  avatar: string;
  isActive?: boolean;
};

export type CustomerDetail = Customer & {
  recentOrders: { id: string; date: string; total: number }[];
};

export type LoyaltyStats = Record<LoyaltyTier, number>;

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

export const customersService = {
  async getAll(params?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Customer[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.offset) searchParams.set("offset", String(params.offset));
    const qs = searchParams.toString();
    return fetchJson<Customer[]>(
      `${API_BASE_URL}/admin/customers${qs ? `?${qs}` : ""}`,
    );
  },

  async getById(id: string): Promise<CustomerDetail> {
    return fetchJson<CustomerDetail>(`${API_BASE_URL}/admin/customers/${id}`);
  },

  async getLoyaltyStats(): Promise<LoyaltyStats> {
    return fetchJson<LoyaltyStats>(
      `${API_BASE_URL}/admin/customers/loyalty-stats`,
    );
  },
};

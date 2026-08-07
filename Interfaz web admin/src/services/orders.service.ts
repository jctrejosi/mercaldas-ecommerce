const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type OrderItem = {
  name: string;
  qty: number;
  price: number;
};

export type OrderStatus =
  | "pendiente"
  | "confirmado"
  | "preparando"
  | "listo"
  | "en camino"
  | "entregado"
  | "cancelado";

export type Order = {
  id: string;
  orderId: number;
  customer: string;
  phone: string;
  address: string;
  total: number;
  payment: string;
  status: OrderStatus;
  itemsCount: number;
  date: string;
  time: string;
  note?: string;
};

export type OrderDetail = Order & {
  items: OrderItem[];
  statusHistory?: { status: string; note?: string; time: string }[];
};

type GetAllOrdersParams = {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
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
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export const ordersService = {
  async getAll(params?: GetAllOrdersParams): Promise<Order[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.offset) searchParams.set("offset", String(params.offset));

    const qs = searchParams.toString();
    return fetchJson<Order[]>(
      `${API_BASE_URL}/admin/orders${qs ? `?${qs}` : ""}`,
    );
  },

  async getById(id: string): Promise<OrderDetail> {
    return fetchJson<OrderDetail>(`${API_BASE_URL}/admin/orders/${id}`);
  },

  async updateStatus(
    id: string,
    status: OrderStatus,
  ): Promise<{ success: boolean; status: string; orderId: number }> {
    return fetchJson(`${API_BASE_URL}/admin/orders/${id}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
  },

  async getUnreviewedCount(): Promise<{ count: number }> {
    return fetchJson(`${API_BASE_URL}/admin/orders/unreviewed-count`);
  },

  async markAsReviewed(id: string): Promise<{ reviewed: boolean }> {
    return fetchJson(`${API_BASE_URL}/admin/orders/${id}/reviewed`, {
      method: "POST",
    });
  },
};

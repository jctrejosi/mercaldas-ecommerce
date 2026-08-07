const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type PromotionStatus = "activo" | "programado" | "expirado" | "inactivo";
export type DiscountType = "porcentaje" | "fijo" | "cupon";

export type Promotion = {
  id: number;
  name: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: string;
  couponCode: string | null;
  couponMaxUsesTotal: number | null;
  couponTimesUsed: number;
  couponMaxUsesPerCustomer: number;
  isAutoApply: boolean;
  requiresCode: boolean;
  priority: number;
  stackable: boolean;
  exclusive: boolean;
  usageLimit: number | null;
  timesUsed: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: PromotionStatus;
  usagesToday: number;
  createdAt: string;
  updatedAt: string;
};

export type PromotionStats = {
  activas: number;
  programadas: number;
  usosHoy: number;
  descuentoAplicado: number;
};

export type PromotionUsage = {
  redemptionId: number;
  discountAmount: string | null;
  usedAt: string;
  couponCode: string;
  order: {
    id: number;
    orderNumber: string;
    total: string;
    status: string;
    createdAt: string;
  } | null;
  customer: {
    id: number;
    name: string;
    email: string;
  } | null;
};

export type CreatePromotionData = {
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  couponCode?: string;
  maxUsesTotal?: number;
  maxUsesPerCustomer?: number;
  usageLimit?: number;
  startDate: string;
  endDate: string;
  isAutoApply?: boolean;
  priority?: number;
  stackable?: boolean;
  exclusive?: boolean;
  isActive?: boolean;
};

export type UpdatePromotionData = Partial<CreatePromotionData>;

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
    throw new Error(
      (err as { message?: string })?.message ?? `API error: ${response.status}`,
    );
  }
  return response.json();
}

export const promotionsService = {
  async getAll(params?: {
    status?: string;
    search?: string;
    usagesToday?: string;
    limit?: number;
    offset?: number;
  }): Promise<Promotion[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.usagesToday) searchParams.set("usagesToday", params.usagesToday);
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.offset) searchParams.set("offset", String(params.offset));
    const qs = searchParams.toString();
    return fetchJson<Promotion[]>(
      `${API_BASE_URL}/admin/promotions${qs ? `?${qs}` : ""}`,
    );
  },

  async getStats(): Promise<PromotionStats> {
    return fetchJson<PromotionStats>(`${API_BASE_URL}/admin/promotions/stats`);
  },

  async getById(id: number): Promise<Promotion> {
    return fetchJson<Promotion>(`${API_BASE_URL}/admin/promotions/${id}`);
  },

  async getUsages(
    id: number,
    dateFilter?: "today" | "all",
  ): Promise<PromotionUsage[]> {
    const qs = dateFilter ? `?dateFilter=${dateFilter}` : "";
    return fetchJson<PromotionUsage[]>(
      `${API_BASE_URL}/admin/promotions/${id}/usages${qs}`,
    );
  },

  async create(data: CreatePromotionData): Promise<Promotion> {
    return fetchJson<Promotion>(`${API_BASE_URL}/admin/promotions`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: UpdatePromotionData): Promise<Promotion> {
    return fetchJson<Promotion>(`${API_BASE_URL}/admin/promotions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async remove(id: number): Promise<{ success: boolean; message: string }> {
    return fetchJson(`${API_BASE_URL}/admin/promotions/${id}`, {
      method: "DELETE",
    });
  },
};

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type PopupPosition = "header" | "footer" | "left" | "right";
export type PopupStatus = "activo" | "programado" | "inactivo" | "expirado";

export type Popup = {
  id: number;
  title: string;
  image: string | null;
  position: PopupPosition;
  filterConfig: {
    categoryIds?: number[];
    brandId?: number | null;
    productTypeCode?: string;
    onSale?: boolean;
    search?: string;
    sort?: string;
  } | null;
  durationMs: number;
  delayMs: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  status: PopupStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreatePopupData = {
  title: string;
  imageMediaId: number;
  position?: PopupPosition;
  filterConfig?: Record<string, unknown>;
  durationMs?: number;
  delayMs?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
};

export type UpdatePopupData = Partial<CreatePopupData>;

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

export const popupsService = {
  async getAll(): Promise<Popup[]> {
    return fetchJson<Popup[]>(`${API_BASE_URL}/admin/popups`);
  },

  async getById(id: number): Promise<Popup> {
    return fetchJson<Popup>(`${API_BASE_URL}/admin/popups/${id}`);
  },

  async create(data: CreatePopupData): Promise<Popup> {
    return fetchJson<Popup>(`${API_BASE_URL}/admin/popups`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: UpdatePopupData): Promise<Popup> {
    return fetchJson<Popup>(`${API_BASE_URL}/admin/popups/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async remove(id: number): Promise<{ success: boolean }> {
    return fetchJson(`${API_BASE_URL}/admin/popups/${id}`, {
      method: "DELETE",
    });
  },
};

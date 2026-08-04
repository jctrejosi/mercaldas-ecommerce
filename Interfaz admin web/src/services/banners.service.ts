const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type BannerType = "hero" | "promo" | "sidebar" | "footer";
export type BannerStatus = "activo" | "programado" | "inactivo" | "expirado";

export type Banner = {
  id: number;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  mobileImage: string | null;
  linkUrl: string | null;
  linkTarget: string;
  ctaText: string | null;
  altText: string | null;
  bgColor: string | null;
  accentColor: string | null;
  bannerType: BannerType;
  position: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  clicks: number;
  views: number;
  status: BannerStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateBannerData = {
  title: string;
  subtitle?: string;
  description?: string;
  mediaId: number;
  mobileImageId?: number;
  linkUrl?: string;
  linkTarget?: string;
  altText?: string;
  ctaText?: string;
  bgColor?: string;
  accentColor?: string;
  bannerType?: BannerType;
  position?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
};

export type UpdateBannerData = Partial<CreateBannerData>;

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

export const bannersService = {
  async getAll(params?: {
    bannerType?: string;
    status?: string;
  }): Promise<Banner[]> {
    const searchParams = new URLSearchParams();
    if (params?.bannerType) searchParams.set("bannerType", params.bannerType);
    if (params?.status) searchParams.set("status", params.status);
    const qs = searchParams.toString();
    return fetchJson<Banner[]>(
      `${API_BASE_URL}/admin/banners${qs ? `?${qs}` : ""}`,
    );
  },

  async getById(id: number): Promise<Banner> {
    return fetchJson<Banner>(`${API_BASE_URL}/admin/banners/${id}`);
  },

  async create(data: CreateBannerData): Promise<Banner> {
    return fetchJson<Banner>(`${API_BASE_URL}/admin/banners`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: UpdateBannerData): Promise<Banner> {
    return fetchJson<Banner>(`${API_BASE_URL}/admin/banners/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async remove(id: number): Promise<{ success: boolean }> {
    return fetchJson(`${API_BASE_URL}/admin/banners/${id}`, {
      method: "DELETE",
    });
  },
};

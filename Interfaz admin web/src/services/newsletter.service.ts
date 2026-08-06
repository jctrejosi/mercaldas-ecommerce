const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type CampaignStatus =
  | "borrador"
  | "programada"
  | "enviando"
  | "enviada"
  | "fallida"
  | "cancelada";

export type NewsletterSubscriber = {
  id: number;
  email: string;
  name: string | null;
  acceptedTerms: boolean;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt: string | null;
};

export type NewsletterCampaign = {
  id: number;
  title: string;
  subject: string;
  content: string;
  imageUrl: string | null;
  status: CampaignStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  sentCount: number;
  failedCount: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCampaignData = {
  title: string;
  subject: string;
  content: string;
  imageUrl?: string;
  scheduledAt?: string;
};

export type UpdateCampaignData = Partial<CreateCampaignData> & {
  scheduledAt?: string | null;
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
    throw new Error(
      (err as { message?: string })?.message ?? `API error: ${response.status}`,
    );
  }
  return response.json();
}

export const newsletterService = {
  // ── Subscribers ──
  async getSubscribers(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: NewsletterSubscriber[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    const qs = searchParams.toString();
    return fetchJson(
      `${API_BASE_URL}/admin/newsletter/subscribers${qs ? `?${qs}` : ""}`,
    );
  },

  async getSubscriberCount(): Promise<{ total: number }> {
    return fetchJson(`${API_BASE_URL}/admin/newsletter/subscribers/count`);
  },

  async removeSubscriber(id: number): Promise<{ success: boolean }> {
    return fetchJson(`${API_BASE_URL}/admin/newsletter/subscribers/${id}`, {
      method: "DELETE",
    });
  },

  // ── Campaigns ──
  async getCampaigns(): Promise<NewsletterCampaign[]> {
    return fetchJson(`${API_BASE_URL}/admin/newsletter/campaigns`);
  },

  async getCampaign(id: number): Promise<NewsletterCampaign> {
    return fetchJson(`${API_BASE_URL}/admin/newsletter/campaigns/${id}`);
  },

  async createCampaign(data: CreateCampaignData): Promise<NewsletterCampaign> {
    return fetchJson(`${API_BASE_URL}/admin/newsletter/campaigns`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateCampaign(
    id: number,
    data: UpdateCampaignData,
  ): Promise<NewsletterCampaign> {
    return fetchJson(`${API_BASE_URL}/admin/newsletter/campaigns/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async sendCampaign(id: number): Promise<NewsletterCampaign> {
    return fetchJson(`${API_BASE_URL}/admin/newsletter/campaigns/${id}/send`, {
      method: "POST",
    });
  },

  async deleteCampaign(id: number): Promise<{ success: boolean }> {
    return fetchJson(`${API_BASE_URL}/admin/newsletter/campaigns/${id}`, {
      method: "DELETE",
    });
  },
};

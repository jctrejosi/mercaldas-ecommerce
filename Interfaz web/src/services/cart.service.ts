import { getAuthHeaders } from "./customer-auth.service";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type CartSyncItem = {
  productId: number;
  quantity: number;
};

export type CartResponseItem = {
  id: number;
  slug?: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  category: string;
  categoryId?: number;
  quantity: number;
  isFeatured?: boolean;
};

export type CartResponse = {
  items: CartResponseItem[];
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(json?.message)
      ? json.message.join(", ")
      : json?.message;
    throw new Error(message || "No se pudo sincronizar el carrito");
  }

  return json;
}

export const cartService = {
  async getCart(): Promise<CartResponse> {
    return fetchJson<CartResponse>(`${API_BASE_URL}/cart`);
  },

  async updateCart(items: CartSyncItem[]): Promise<CartResponse> {
    return fetchJson<CartResponse>(`${API_BASE_URL}/cart`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  },
};

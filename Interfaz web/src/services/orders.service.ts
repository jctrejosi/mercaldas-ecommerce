import { getAuthHeaders } from "./customer-auth.service";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type CheckoutItem = {
  productId: number;
  quantity: number;
};

export type CheckoutAddress = {
  name: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
};

export type CardPaymentDetails = {
  cardholderName: string;
  cardToken: string;
  acceptanceToken: string;
  acceptPersonalAuth: string;
  last4: string;
  brand: string;
  installments?: number;
};

export type PsePaymentDetails = {
  bank: string;
  personType: "natural" | "juridica";
};

export type NequiPaymentDetails = {
  phone: string;
};

export type CheckoutPayload = {
  items: CheckoutItem[];
  address: CheckoutAddress;
  shippingType: "standard" | "express";
  paymentMethod: "efectivo" | "tarjeta" | "nequi" | "pse";
  paymentDetails?: {
    card?: CardPaymentDetails;
    pse?: PsePaymentDetails;
    nequi?: NequiPaymentDetails;
  };
};

export type CheckoutResponse = {
  orderId: number;
  referenceCode: string;
  subtotal: number;
  shippingCost: number;
  grandTotal: number;
  paymentMethod: CheckoutPayload["paymentMethod"];
  shippingType: CheckoutPayload["shippingType"];
  address: CheckoutAddress;
  status: string;
  wompiTransaction?: {
    id?: string | number;
    status?: string;
    status_message?: string;
    payment_method_type?: string;
  };
};

export type WompiConfigResponse = {
  publicKey: string;
  redirectUrl: string | null;
  acceptanceToken: string | null;
  acceptancePermalink: string | null;
  personalDataAuthToken: string | null;
  personalDataAuthPermalink: string | null;
};

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
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
      : json?.message || json?.error?.reason;
    throw new Error(message || "Error en la solicitud");
  }

  return json;
}

export const ordersService = {
  async getWompiConfig(): Promise<WompiConfigResponse> {
    return fetchJson<WompiConfigResponse>(`${API_BASE_URL}/payments/wompi/config`, {
      credentials: "include",
    });
  },

  async tokenizeWompiCard(input: {
    publicKey: string;
    number: string;
    cvc: string;
    expMonth: string;
    expYear: string;
    cardHolder: string;
  }): Promise<{ id: string; brand: string; last_four: string }> {
    const response = await fetchJson<{ data: { id: string; brand: string; last_four: string } }>(
      "https://sandbox.wompi.co/v1/tokens/cards",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${input.publicKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: input.number,
          cvc: input.cvc,
          exp_month: input.expMonth,
          exp_year: input.expYear,
          card_holder: input.cardHolder,
        }),
      },
    );

    return response.data;
  },

  async checkout(payload: CheckoutPayload): Promise<CheckoutResponse> {
    return fetchJson<CheckoutResponse>(`${API_BASE_URL}/orders/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  },
};

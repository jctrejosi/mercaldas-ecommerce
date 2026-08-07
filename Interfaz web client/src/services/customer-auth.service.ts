const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const CUSTOMER_ACCESS_TOKEN_KEY = "customer_access_token_fallback";

export function getCustomerAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(CUSTOMER_ACCESS_TOKEN_KEY);
}

export function getAuthHeaders(): Record<string, string> {
  const token = getCustomerAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function persistAccessToken(accessToken?: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (accessToken) {
    window.localStorage.setItem(CUSTOMER_ACCESS_TOKEN_KEY, accessToken);
    return;
  }

  window.localStorage.removeItem(CUSTOMER_ACCESS_TOKEN_KEY);
}

export interface CustomerRegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  documentNumber?: string;
  documentType?: string;
  acceptsMarketing?: boolean;
  acceptsTerms: boolean;
}

export interface CustomerLoginData {
  email: string;
  password: string;
}

export interface CustomerSocialLoginData {
  provider: "google" | "facebook";
  accessToken: string;
  providerId?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

export interface CustomerAuthResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  customer: {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    fullName: string;
    phone: string | null;
    isVerified: boolean;
    isActive: boolean;
    provider: string | null;
    avatarUrl: string | null;
    acceptsMarketing: boolean;
  };
}

export const customerAuthService = {
  async register(data: CustomerRegisterData): Promise<CustomerAuthResponse> {
    const response = await fetch(`${API_BASE_URL}/customer-auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error en el registro");
    }

    const result = await response.json();
    persistAccessToken(result.accessToken);
    return result;
  },

  async login(data: CustomerLoginData): Promise<CustomerAuthResponse> {
    const response = await fetch(`${API_BASE_URL}/customer-auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Credenciales inválidas");
    }

    const result = await response.json();
    persistAccessToken(result.accessToken);
    return result;
  },

  async socialLogin(
    data: CustomerSocialLoginData,
  ): Promise<CustomerAuthResponse> {
    const response = await fetch(`${API_BASE_URL}/customer-auth/social-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error en el login social");
    }

    const result = await response.json();
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CUSTOMER_ACCESS_TOKEN_KEY, result.accessToken);
    }
    return result;
  },

  async getProfile(): Promise<CustomerAuthResponse["customer"]> {
    const response = await fetch(`${API_BASE_URL}/customer-auth/me`, {
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      persistAccessToken(null);
      throw new Error("No autenticado");
    }

    return response.json();
  },

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    password?: string;
    acceptsMarketing?: boolean;
  }): Promise<CustomerAuthResponse["customer"]> {
    const response = await fetch(`${API_BASE_URL}/customer-auth/me`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al actualizar perfil");
    }

    return response.json();
  },

  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/customer-auth/me`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al eliminar cuenta");
    }

    persistAccessToken(null);
    return response.json();
  },

  async logout(
    refreshToken?: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/customer-auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      credentials: "include",
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Error al cerrar sesión");
    }

    persistAccessToken(null);
    return response.json();
  },

  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const response = await fetch(`${API_BASE_URL}/customer-auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      persistAccessToken(null);
      throw new Error("No se pudo refrescar el token");
    }

    const result = await response.json();
    persistAccessToken(result.accessToken);
    return result;
  },
};

export interface CustomerAddress {
  id: number;
  alias: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  country: string;
  deliveryInstructions: string | null;
  reference: string | null;
  isDefault: boolean;
  createdAt: string;
}

export const customerAddressService = {
  async getAddresses(): Promise<CustomerAddress[]> {
    const response = await fetch(`${API_BASE_URL}/customer-auth/addresses`, {
      credentials: "include",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener direcciones");
    return response.json();
  },

  async createAddress(data: {
    alias?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    reference?: string;
    deliveryInstructions?: string;
    isDefault?: boolean;
  }): Promise<{ id: number }> {
    const response = await fetch(`${API_BASE_URL}/customer-auth/addresses`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al crear dirección");
    return response.json();
  },

  async updateAddress(id: number, data: Partial<{
    alias: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    reference: string;
    deliveryInstructions: string;
    isDefault: boolean;
  }>): Promise<{ id: number }> {
    const response = await fetch(`${API_BASE_URL}/customer-auth/addresses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error al actualizar dirección");
    return response.json();
  },

  async deleteAddress(id: number): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/customer-auth/addresses/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al eliminar dirección");
    return response.json();
  },

  async setDefault(id: number): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/customer-auth/addresses/${id}/default`, {
      method: "POST",
      credentials: "include",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al establecer dirección predeterminada");
    return response.json();
  },
};


export interface CustomerPaymentMethod {
  id: number;
  methodType: "CARD" | "NEQUI";
  label: string | null;
  brand: string | null;
  last4: string | null;
  cardholderName: string | null;
  phone: string | null;
  isDefault: boolean;
  createdAt: string;
}

export const customerPaymentService = {
  async getPaymentMethods(): Promise<CustomerPaymentMethod[]> {
    const response = await fetch(`${API_BASE_URL}/customer-auth/payment-methods`, {
      credentials: "include",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener métodos de pago");
    return response.json();
  },

  async createPaymentMethod(data: {
    methodType: "CARD" | "NEQUI";
    label?: string;
    brand?: string;
    last4?: string;
    cardholderName?: string;
    token?: string;
    phone?: string;
    isDefault?: boolean;
  }): Promise<{ id: number }> {
    const response = await fetch(`${API_BASE_URL}/customer-auth/payment-methods`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Error al guardar método de pago");
    }
    return response.json();
  },

  async updatePaymentMethod(
    id: number,
    data: Partial<{
      label: string;
      brand: string;
      last4: string;
      cardholderName: string;
      token: string;
      phone: string;
      isDefault: boolean;
    }>,
  ): Promise<{ id: number }> {
    const response = await fetch(`${API_BASE_URL}/customer-auth/payment-methods/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Error al actualizar método de pago");
    }
    return response.json();
  },

  async deletePaymentMethod(id: number): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/customer-auth/payment-methods/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al eliminar método de pago");
    return response.json();
  },

  async setDefault(id: number): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/customer-auth/payment-methods/${id}/default`, {
      method: "POST",
      credentials: "include",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al establecer método de pago predeterminado");
    return response.json();
  },
};

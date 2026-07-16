import { useState, useEffect, useCallback } from "react";
import {
  customerAuthService,
  CustomerAuthResponse,
} from "../services/customer-auth.service";

export function useCustomerAuth() {
  const [customer, setCustomer] = useState<
    CustomerAuthResponse["customer"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const profile = await customerAuthService.getProfile();
      setCustomer(profile);
    } catch (err) {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const response = await customerAuthService.login({ email, password });
      setCustomer(response.customer);
      return response;
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
      throw err;
    }
  }, []);

  const register = useCallback(async (data: any) => {
    setError(null);
    try {
      const response = await customerAuthService.register(data);
      setCustomer(response.customer);
      return response;
    } catch (err: any) {
      setError(err.message || "Error al registrarse");
      throw err;
    }
  }, []);

  const socialLogin = useCallback(
    async (
      provider: "google" | "facebook",
      accessToken: string,
      userData?: any,
    ) => {
      setError(null);
      try {
        const payload: any = { provider, accessToken };
        if (userData) {
          if (userData.email) payload.email = userData.email;
          if (userData.name) payload.name = userData.name;
          if (userData.picture) payload.avatarUrl = userData.picture;
          if (userData.id) payload.providerId = userData.id;
        }
        const response = await customerAuthService.socialLogin(payload);
        setCustomer(response.customer);
        return response;
      } catch (err: any) {
        setError(err.message || "Error en login social");
        throw err;
      }
    },
    [],
  );

  const logout = useCallback(async (refreshToken?: string) => {
    try {
      await customerAuthService.logout(refreshToken);
    } catch (err) {
      // ignorar errores en logout
    } finally {
      setCustomer(null);
    }
  }, []);

  return {
    customer,
    loading,
    error,
    login,
    register,
    socialLogin,
    logout,
    loadProfile,
  };
}

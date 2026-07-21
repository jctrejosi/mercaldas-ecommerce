const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const apiStatusService = {
  async waitUntilReady(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api-status`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Backend no disponible");
    }
  },
};

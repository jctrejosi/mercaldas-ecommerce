const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type Branch = {
  id: number;
  code: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  storeId: number;
  managerName: string;
  managerPhone: string;
  location: string;
  priority: number;
  branchType: string;
  deliveryRadiusKm: string;
  maxDailyOrders: number | null;
  schedule: any;
  isActive: boolean;
  productCount: number;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
};

export type BranchProduct = {
  inventoryId: number;
  stock: number;
  reservedStock: number;
  reorderPoint: number;
  productId: number;
  productName: string;
  productSlug: string;
  price: string;
  variantSku: string;
};

export type BranchCategory = {
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  productCount: number;
};

export type BranchBrand = {
  brandId: number;
  brandName: string;
  brandSlug: string;
  productCount: number;
};

export type DeliveryZone = {
  id: number;
  name: string;
  deliveryPrice: string;
  coverageArea: string;
  displayOrder: number;
  estimatedMinMinutes: number;
  estimatedMaxMinutes: number;
  deliveryType: string;
  minimumOrder: string;
  isActive: boolean;
};

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { ...init, credentials: "include", headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const branchesService = {
  getAll: () => fetchJson<Branch[]>(`${API_BASE_URL}/admin/branches`),
  getById: (id: number) => fetchJson<Branch>(`${API_BASE_URL}/admin/branches/${id}`),
  create: (d: any) => fetchJson<Branch>(`${API_BASE_URL}/admin/branches`, { method: "POST", body: JSON.stringify(d) }),
  update: (id: number, d: any) => fetchJson<Branch>(`${API_BASE_URL}/admin/branches/${id}`, { method: "PUT", body: JSON.stringify(d) }),
  remove: (id: number) => fetchJson(`${API_BASE_URL}/admin/branches/${id}`, { method: "DELETE" }),
  getProducts: (id: number) => fetchJson<BranchProduct[]>(`${API_BASE_URL}/admin/branches/${id}/products`),
  getCategories: (id: number) => fetchJson<BranchCategory[]>(`${API_BASE_URL}/admin/branches/${id}/categories`),
  getBrands: (id: number) => fetchJson<BranchBrand[]>(`${API_BASE_URL}/admin/branches/${id}/brands`),
  getDeliveryZones: (id: number) => fetchJson<DeliveryZone[]>(`${API_BASE_URL}/admin/branches/${id}/delivery-zones`),
  createDeliveryZone: (id: number, d: any) => fetchJson(`${API_BASE_URL}/admin/branches/${id}/delivery-zones`, { method: "POST", body: JSON.stringify(d) }),
  removeDeliveryZone: (id: number, zoneId: number) => fetchJson(`${API_BASE_URL}/admin/branches/${id}/delivery-zones/${zoneId}`, { method: "DELETE" }),
};

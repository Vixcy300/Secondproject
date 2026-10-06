// Base API URL — uses VITE_API_BASE_URL in production (e.g. Vercel) or defaults to local backend
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000") + "/api/v1";

// ─── Types matching the backend schemas ────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  parent_id: number | null;
  is_active: boolean;
  sort_order: number;
  product_count: number;
  children: Category[];
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface InventoryInfo {
  id: number;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  low_stock_threshold: number;
  reorder_quantity: number;
  stock_status: "in_stock" | "low_stock" | "out_of_stock";
  location: string | null;
  last_restocked_at: string | null;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  sku: string | null;
  price: number;
  compare_price: number | null;
  cost_price: number | null;
  discount_percent: number | null;
  brand: string | null;
  tags: string | null;
  weight: number | null;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  rating: number;
  review_count: number;
  sold_count: number;
  view_count: number;
  primary_image: string | null;
  images: ProductImage[];
  inventory: InventoryInfo | null;
  category: Category | null;
  category_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DashboardStats {
  total_products: number;
  active_products: number;
  out_of_stock: number;
  low_stock: number;
  total_categories: number;
  featured_products: number;
}

// ─── Query params for product listing ──────────────────────────────────────

export interface ProductFilters {
  page?: number;
  page_size?: number;
  category_id?: number;
  search?: string;
  min_price?: number;
  max_price?: number;
  brand?: string;
  is_featured?: boolean;
  is_new_arrival?: boolean;
  in_stock_only?: boolean;
  sort_by?: "name" | "price" | "rating" | "sold_count" | "created_at";
  sort_dir?: "asc" | "desc";
  active_only?: boolean;
}

export type ProductInput = Partial<Omit<Product, "inventory">> & {
  inventory?: Partial<InventoryInfo>;
};

// ─── API Functions ──────────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Categories
export const categoriesApi = {
  list: () => request<Category[]>("/categories/"),
  tree: () => request<Category[]>("/categories/tree"),
  get: (id: number) => request<Category>(`/categories/${id}`),
  getBySlug: (slug: string) => request<Category>(`/categories/slug/${slug}`),
  create: (data: Partial<Category>) =>
    request<Category>("/categories/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Category>) =>
    request<Category>(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/categories/${id}`, { method: "DELETE" }),
};

// Products
export const productsApi = {
  list: (filters: ProductFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
    });
    return request<PaginatedProducts>(`/products/?${params}`);
  },
  featured: (limit = 8) => request<Product[]>(`/products/featured?limit=${limit}`),
  newArrivals: (limit = 8) => request<Product[]>(`/products/new-arrivals?limit=${limit}`),
  get: (id: number) => request<Product>(`/products/${id}`),
  getBySlug: (slug: string) => request<Product>(`/products/slug/${slug}`),
  stats: () => request<DashboardStats>("/products/admin/stats"),
  create: (data: ProductInput) =>
    request<Product>("/products/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: ProductInput) =>
    request<Product>(`/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/products/${id}`, { method: "DELETE" }),
  updateInventory: (id: number, data: Partial<InventoryInfo>) =>
    request<InventoryInfo>(`/products/${id}/inventory`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  addImage: (id: number, url: string, altText?: string, isPrimary = false) =>
    request<ProductImage>(
      `/products/${id}/images?url=${encodeURIComponent(url)}&alt_text=${encodeURIComponent(altText ?? "")}&is_primary=${isPrimary}`,
      { method: "POST" }
    ),
};


import { mockCategories, mockProducts } from "./mock-data";
import type { Account, CartItem, Category, PaginatedProducts, Product, ProductQuery, Purchase, User } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

type RequestOptions = RequestInit & {
  token?: string;
  next?: NextFetchRequestConfig;
};

function endpoint(path: string) {
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);

  const response = await fetch(endpoint(path), {
    ...options,
    headers,
    cache: options.next ? undefined : options.cache ?? "no-store"
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `API error ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    oldPrice: product.oldPrice || Math.round(product.price * 1.28),
    reviews: product.reviews || Math.max(24, Math.round(product.rating * 21)),
    description: product.description || "Цифровой товар с мгновенным доступом и коммерческой лицензией."
  };
}

function applyClientQuery(products: Product[], query: ProductQuery): PaginatedProducts {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.max(1, Number(query.limit || 9));
  const min = Number(query.minPrice || 0);
  const max = Number(query.maxPrice || Number.MAX_SAFE_INTEGER);
  const rating = Number(query.rating || 0);
  const text = (query.q || "").trim().toLowerCase();

  let filtered = products.filter((product) => {
    const matchCategory = !query.category || query.category === "all" || product.category === query.category;
    const matchText = !text || `${product.name} ${product.label} ${product.seller}`.toLowerCase().includes(text);
    return matchCategory && matchText && product.price >= min && product.price <= max && product.rating >= rating;
  });

  if (query.sort === "price-asc") filtered = filtered.sort((a, b) => a.price - b.price);
  if (query.sort === "price-desc") filtered = filtered.sort((a, b) => b.price - a.price);
  if (query.sort === "rating") filtered = filtered.sort((a, b) => b.rating - a.rating);
  if (!query.sort || query.sort === "popular") filtered = filtered.sort((a, b) => b.reviews! - a.reviews!);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  return {
    products: filtered.slice((page - 1) * limit, page * limit),
    total,
    page,
    limit,
    pages
  };
}

export async function getProducts(query: ProductQuery = {}): Promise<PaginatedProducts> {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.q) params.set("q", query.q);

  try {
    const products = await request<Product[]>(`/api/products?${params.toString()}`, {
      next: { revalidate: 30 }
    });
    return applyClientQuery(products.map(normalizeProduct), query);
  } catch {
    return applyClientQuery(mockProducts.map(normalizeProduct), query);
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  const products = await getProducts({ limit: "200" });
  return products.products.find((product) => product.id === id) || null;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await request<Category[]>("/api/categories", { next: { revalidate: 60 } });
    return categories.map((category) => ({
      ...category,
      image: mockCategories.find((item) => item.id === category.id)?.image
    }));
  } catch {
    return mockCategories;
  }
}

export const api = {
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: User }>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  register: (body: { name: string; email: string; password: string }) =>
    request<{ token: string; user: User }>("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  me: (token: string) => request<User>("/api/me", { token }),
  cart: (token?: string) => request<CartItem[]>("/api/cart", { token }),
  addToCart: (productId: string, token?: string) =>
    request<CartItem>("/api/cart", { method: "POST", token, body: JSON.stringify({ productId }) }),
  removeFromCart: (id: string, token?: string) => request<void>(`/api/cart/${id}`, { method: "DELETE", token }),
  checkout: (token?: string) =>
    request<{ account: Account; purchases: Purchase[] }>("/api/checkout", { method: "POST", token, body: "{}" }),
  account: (token?: string) => request<Account>("/api/account", { token }),
  purchases: (token?: string) => request<Purchase[]>("/api/purchases", { token }),
  topUp: (amount: number, token?: string) =>
    request<Account>("/api/top-up", { method: "POST", token, body: JSON.stringify({ amount, method: "card" }) })
};

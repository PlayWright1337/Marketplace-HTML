export type Product = {
  id: string;
  name: string;
  category: string;
  label: string;
  price: number;
  image: string;
  rating: number;
  seller: string;
  oldPrice?: number;
  reviews?: number;
  description?: string;
};

export type Category = {
  id: string;
  label: string;
  count: number;
  image?: string;
};

export type CartItem = {
  id: string;
  ownerId?: string;
  productId: string;
  addedAt?: string;
  product?: Product;
  quantity?: number;
};

export type Account = {
  id: string;
  balance: number;
  updatedAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type Purchase = {
  id: string;
  ownerId: string;
  productId: string;
  price: number;
  createdAt: string;
  product?: Product;
};

export type ProductQuery = {
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  sort?: string;
  page?: string;
  limit?: string;
};

export type PaginatedProducts = {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

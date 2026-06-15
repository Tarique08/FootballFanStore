export type ProductCategory = "wc2026" | "club" | "retro";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  badge: string;
  price: number;
  originalPrice: number;
  image: string;
  description: string;
  sizes: string[];
  featured: boolean;
  searchTerms: string[];
}

export interface CartItemInput {
  productId: string;
  quantity: number;
  size: string;
}

export interface CartItemRecord {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  pincode: string;
  notes?: string;
}

export interface OrderRecord {
  id: string;
  items: CartItemRecord[];
  subtotal: number;
  shipping: number;
  total: number;
  customer: CustomerDetails;
  status: "confirmed";
  createdAt: string;
}

export interface NewsletterSignup {
  email: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

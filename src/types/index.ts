export interface User {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'admin';
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  condition_description?: string;
  image_url?: string;
  stock: number;
  created_at: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  name: string;
  price: number;
  image_url?: string;
}

export interface Order {
  id: number;
  user_id: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  user_name?: string;
  user_email?: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  name: string;
  image_url?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface CartResponse {
  items: CartItem[];
  removedItems: string[];
  message?: string;
}

import axios from 'axios';
import { Product, CartItem, Order } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para lidar com respostas de erro
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Serviços de produtos
export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (productData: FormData): Promise<any> => {
    const response = await api.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: number, productData: FormData): Promise<any> => {
    const response = await api.put(`/products/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: number): Promise<any> => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  updateStock: async (id: number, stock: number): Promise<any> => {
    const response = await api.put(`/products/${id}/stock`, { stock });
    return response.data;
  },
};

// Serviços do carrinho
export const cartService = {
  getCart: async (): Promise<CartItem[]> => {
    const response = await api.get('/cart');
    return response.data;
  },

  addToCart: async (productId: number, quantity: number): Promise<any> => {
    const response = await api.post('/cart/add', { productId, quantity });
    return response.data;
  },

  updateCartItem: async (productId: number, quantity: number): Promise<any> => {
    const response = await api.put('/cart/update', { productId, quantity });
    return response.data;
  },

  removeFromCart: async (productId: number): Promise<any> => {
    const response = await api.delete('/cart/remove', { data: { productId } });
    return response.data;
  },
};

// Serviços de pedidos
export const orderService = {
  getAll: async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data;
  },

  create: async (): Promise<any> => {
    const response = await api.post('/orders');
    return response.data;
  },

  updateStatus: async (orderId: number, status: string): Promise<any> => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },
};

export default api;

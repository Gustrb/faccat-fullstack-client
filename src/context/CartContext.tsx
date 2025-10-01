import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem, CartResponse } from '../types';
import { cartService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from './NotificationContext';

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  totalPrice: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartItem: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { showWarning } = useNotification();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    try {
      const response = await cartService.getCart();
      
      // Verificar se a resposta contém produtos removidos
      if (response && typeof response === 'object' && 'items' in response && 'removedItems' in response) {
        const cartResponse = response as unknown as CartResponse;
        setCartItems(cartResponse.items);
        // Mostrar notificação sobre produtos removidos
        if (cartResponse.removedItems && cartResponse.removedItems.length > 0) {
          showWarning(`Produtos removidos do carrinho (fora de estoque): ${cartResponse.removedItems.join(', ')}`);
        }
      } else {
        // Resposta normal (array de itens)
        setCartItems(response as CartItem[]);
      }
    } catch (err) {
      console.error('Erro ao carregar carrinho:', err);
    } finally {
      setLoading(false);
    }
  }, [user, showWarning]);

  const addToCart = async (productId: number, quantity: number) => {
    try {
      await cartService.addToCart(productId, quantity);
      await refreshCart();
    } catch (err) {
      throw err;
    }
  };

  const updateCartItem = async (productId: number, quantity: number) => {
    try {
      await cartService.updateCartItem(productId, quantity);
      await refreshCart();
    } catch (err) {
      throw err;
    }
  };

  const removeFromCart = async (productId: number) => {
    try {
      await cartService.removeFromCart(productId);
      await refreshCart();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user, refreshCart]);

  const value: CartContextType = {
    cartItems,
    cartCount,
    totalPrice,
    loading,
    refreshCart,
    addToCart,
    updateCartItem,
    removeFromCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

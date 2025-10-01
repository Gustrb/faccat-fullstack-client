import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

const Cart: React.FC = () => {
  const { user } = useAuth();
  const { cartItems, totalPrice, loading, updateCartItem, removeFromCart } = useCart();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState<number | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(productId);
      return;
    }

    setUpdating(productId);
    try {
      await updateCartItem(productId, newQuantity);
    } catch (err: any) {
      if (err.response?.data?.message) {
        showError(err.response.data.message);
      } else {
        showError('Erro ao atualizar quantidade');
      }
      console.error('Erro ao atualizar quantidade:', err);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId: number) => {
    setUpdating(productId);
    try {
      await removeFromCart(productId);
    } catch (err) {
      showError('Erro ao remover item');
      console.error('Erro ao remover item:', err);
    } finally {
      setUpdating(null);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      showError('Carrinho vazio');
      return;
    }

    setCheckingOut(true);
    try {
      await orderService.create();
      showSuccess('Pedido realizado com sucesso!');
      navigate('/orders');
    } catch (err) {
      showError('Erro ao finalizar pedido');
      console.error('Erro ao finalizar pedido:', err);
    } finally {
      setCheckingOut(false);
    }
  };


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Carrinho de Compras</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            Seu carrinho está vazio
          </h2>
          <p className="text-gray-500 mb-6">
            Adicione alguns produtos para começar suas compras!
          </p>
          <Link
            to="/"
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Ver Produtos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de itens */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center space-x-4">
                    {item.image_url ? (
                    <img
                      src={`http://localhost:5001${item.image_url.replace('/uploads/', '/')}`}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-sm">Sem imagem</span>
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-gray-600">
                        R$ {item.price.toFixed(2)} cada
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        disabled={updating === item.product_id}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">
                        {updating === item.product_id ? '...' : item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        disabled={updating === item.product_id}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        disabled={updating === item.product_id}
                        className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo do pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Resumo do Pedido
              </h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">R$ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frete:</span>
                  <span className="font-medium text-green-600">Grátis</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {checkingOut ? 'Finalizando...' : 'Finalizar Compra'}
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                * Frete grátis para todos os pedidos
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

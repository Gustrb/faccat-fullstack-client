import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { productService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showSuccess, showError } = useNotification();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const data = await productService.getById(parseInt(id));
        setProduct(data);
      } catch (err) {
        setError('Produto não encontrado');
        console.error('Erro ao carregar produto:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!product) return;

    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      showSuccess('Produto adicionado ao carrinho!');
    } catch (err: any) {
      if (err.response?.data?.message) {
        showError(err.response.data.message);
      } else {
        showError('Erro ao adicionar produto ao carrinho');
      }
      console.error('Erro ao adicionar ao carrinho:', err);
    } finally {
      setAddingToCart(false);
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

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro</h2>
          <p className="text-gray-600">{error || 'Produto não encontrado'}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded transition-colors"
          >
            Voltar para Produtos
          </button>
        </div>
      </div>
    );
  }

  const discountPercentage = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Imagem do produto */}
        <div>
          {product.image_url ? (
            <img
              src={`http://localhost:5001${product.image_url.replace('/uploads/', '/')}`}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg shadow-lg flex items-center justify-center">
              <span className="text-gray-500 text-xl">Sem imagem</span>
            </div>
          )}
        </div>

        {/* Informações do produto */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            
            {product.description && (
              <p className="text-gray-600 text-lg mb-4">
                {product.description}
              </p>
            )}
          </div>

          {product.condition_description && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-2">
                ⚠️ Condição do Produto:
              </h3>
              <p className="text-orange-700">
                {product.condition_description}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {product.stock > 0 ? (
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-primary-600">
                  R$ {product.price.toFixed(2)}
                </span>
                {product.original_price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      R$ {product.original_price.toFixed(2)}
                    </span>
                    <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                      -{discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div className="text-3xl font-bold text-red-600">
                Fora de Estoque
              </div>
            )}

            <div className="text-sm text-gray-600">
              <p className={`font-medium ${
                product.stock === 0 
                  ? 'text-red-600' 
                  : product.stock < 5 
                    ? 'text-orange-600' 
                    : 'text-gray-600'
              }`}>
                Estoque disponível: {product.stock} unidades
                {product.stock === 0 && ' (Fora de estoque)'}
                {product.stock > 0 && product.stock < 5 && ' (Últimas unidades!)'}
              </p>
            </div>
          </div>

          {user && product.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                  Quantidade:
                </label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="border border-gray-300 rounded px-3 py-1"
                >
                  {Array.from({ length: Math.min(10, product.stock) }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                {addingToCart ? 'Adicionando...' : 'Adicionar ao Carrinho'}
              </button>
            </div>
          )}

          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                Faça login para adicionar produtos ao carrinho
              </p>
            </div>
          )}

          {product.stock === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">
                Produto fora de estoque
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

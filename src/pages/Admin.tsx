import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { productService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingStock, setEditingStock] = useState<number | null>(null);
  const [newStock, setNewStock] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    condition_description: '',
    stock: '',
    image: null as File | null
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchProducts = async () => {
      try {
        const data = await productService.getAll();
        setProducts(data);
      } catch (err) {
        setError('Erro ao carregar produtos');
        console.error('Erro ao carregar produtos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('original_price', formData.original_price);
    formDataToSend.append('condition_description', formData.condition_description);
    formDataToSend.append('stock', formData.stock);
    
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, formDataToSend);
        alert('Produto atualizado com sucesso!');
      } else {
        await productService.create(formDataToSend);
        alert('Produto criado com sucesso!');
      }
      
      // Recarregar lista de produtos
      const data = await productService.getAll();
      setProducts(data);
      
      // Limpar formulário
      setFormData({
        name: '',
        description: '',
        price: '',
        original_price: '',
        condition_description: '',
        stock: '',
        image: null
      });
      setShowForm(false);
      setEditingProduct(null);
    } catch (err) {
      alert('Erro ao salvar produto');
      console.error('Erro ao salvar produto:', err);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      condition_description: product.condition_description || '',
      stock: product.stock.toString(),
      image: null
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja deletar este produto?')) {
      return;
    }

    try {
      await productService.delete(id);
      alert('Produto deletado com sucesso!');
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      alert('Erro ao deletar produto');
      console.error('Erro ao deletar produto:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      original_price: '',
      condition_description: '',
      stock: '',
      image: null
    });
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleStockUpdate = async (productId: number) => {
    const stockValue = parseInt(newStock);
    
    if (isNaN(stockValue) || stockValue < 0) {
      alert('Estoque deve ser um número positivo');
      return;
    }

    try {
      await productService.updateStock(productId, stockValue);
      alert('Estoque atualizado com sucesso!');
      
      // Recarregar lista de produtos
      const data = await productService.getAll();
      setProducts(data);
      
      // Limpar estado de edição
      setEditingStock(null);
      setNewStock('');
    } catch (err) {
      alert('Erro ao atualizar estoque');
      console.error('Erro ao atualizar estoque:', err);
    }
  };

  const startStockEditing = (productId: number, currentStock: number) => {
    setEditingStock(productId);
    setNewStock(currentStock.toString());
  };

  const cancelStockEditing = () => {
    setEditingStock(null);
    setNewStock('');
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Administração</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Adicionar Produto
        </button>
      </div>

      {/* Formulário de produto */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingProduct ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço Atual *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço Original
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="original_price"
                  value={formData.original_price}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estoque *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição da Condição
              </label>
              <textarea
                name="condition_description"
                value={formData.condition_description}
                onChange={handleInputChange}
                rows={2}
                placeholder="Ex: Pequeno risco na tela, funciona perfeitamente"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagem do Produto
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                {editingProduct ? 'Atualizar' : 'Criar'} Produto
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {product.image_url ? (
              <img
                src={`http://localhost:5001${product.image_url.replace('/uploads/', '/')}`}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Sem imagem</span>
              </div>
            )}
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {product.name}
              </h3>
              
              {product.description && (
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {product.description}
                </p>
              )}
              
              {product.condition_description && (
                <p className="text-orange-600 text-sm mb-2">
                  ⚠️ {product.condition_description}
                </p>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xl font-bold text-primary-600">
                    R$ {product.price.toFixed(2)}
                  </span>
                  {product.original_price && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      R$ {product.original_price.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  {editingStock === product.id ? (
                    <div className="space-y-2">
                      <input
                        type="number"
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value)}
                        className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                        min="0"
                      />
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleStockUpdate(product.id)}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={cancelStockEditing}
                          className="bg-gray-500 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className={`text-sm font-medium ${
                        product.stock === 0 
                          ? 'text-red-600' 
                          : product.stock < 5 
                            ? 'text-orange-600' 
                            : 'text-gray-600'
                      }`}>
                        Estoque: {product.stock}
                      </span>
                      <button
                        onClick={() => startStockEditing(product.id, product.stock)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded block"
                      >
                        Editar Estoque
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors"
                >
                  Deletar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;

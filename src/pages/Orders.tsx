import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Order } from '../types';
import { orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await orderService.getAll();
        setOrders(data);
      } catch (err) {
        setError('Erro ao carregar pedidos');
        console.error('Erro ao carregar pedidos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const handleStatusUpdate = async (orderId: number) => {
    if (!newStatus) return;

    try {
      const response = await orderService.updateStatus(orderId, newStatus);
      
      // Mostrar mensagem específica baseada na resposta
      if (response.message) {
        alert(response.message);
      } else {
        alert('Status do pedido atualizado com sucesso!');
      }
      
      // Recarregar lista de pedidos
      const data = await orderService.getAll();
      setOrders(data);
      
      // Limpar estado de edição
      setEditingOrder(null);
      setNewStatus('');
    } catch (err: any) {
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert('Erro ao atualizar status do pedido');
      }
      console.error('Erro ao atualizar status:', err);
    }
  };

  const startEditing = (orderId: number, currentStatus: string) => {
    setEditingOrder(orderId);
    setNewStatus(currentStatus);
  };

  const cancelEditing = () => {
    setEditingOrder(null);
    setNewStatus('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'processing':
        return 'Processando';
      case 'shipped':
        return 'Enviado';
      case 'delivered':
        return 'Entregue';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {user?.role === 'admin' ? 'Todos os Pedidos' : 'Meus Pedidos'}
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            Nenhum pedido encontrado
          </h2>
          <p className="text-gray-500 mb-6">
            {user?.role === 'admin' 
              ? 'Ainda não há pedidos no sistema'
              : 'Você ainda não fez nenhum pedido'
            }
          </p>
          <Link
            to="/"
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Ver Produtos
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pedido #{order.id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {user?.role === 'admin' && (
                    <p className="text-sm text-gray-600">
                      Cliente: {order.user_name} ({order.user_email})
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {user?.role === 'admin' ? (
                    <div className="space-y-2">
                      {editingOrder === order.id ? (
                        <div className="space-y-2">
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value="pending">Pendente</option>
                            <option value="processing">Processando</option>
                            <option value="shipped">Enviado</option>
                            <option value="delivered">Entregue</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleStatusUpdate(order.id)}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="bg-gray-500 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          <button
                            onClick={() => startEditing(order.id, order.status)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded block"
                          >
                            Editar Status
                          </button>
                        </div>
                      )}
                      <p className="text-lg font-bold text-gray-900">
                        R$ {order.total.toFixed(2)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <p className="text-lg font-bold text-gray-900 mt-2">
                        R$ {order.total.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Itens do pedido:</h4>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      {item.image_url ? (
                        <img
                          src={`http://localhost:5001${item.image_url}`}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-500 text-xs">Sem imagem</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Quantidade: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        R$ {item.price.toFixed(2)} cada
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;

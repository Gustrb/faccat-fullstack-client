import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-primary-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            🛒 FuckedUp Commerce
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link to="/" className="hover:text-primary-200 transition-colors">
              Produtos
            </Link>
            
            {user ? (
              <>
                <Link to="/cart" className="relative hover:text-primary-200 transition-colors flex items-center space-x-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8.5M17 18a2 2 0 100 4 2 2 0 000-4zM9 18a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  <span>Carrinho</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/orders" className="hover:text-primary-200 transition-colors">
                  Meus Pedidos
                </Link>
                
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin" className="hover:text-primary-200 transition-colors">
                      Produtos
                    </Link>
                    <Link to="/admin/orders" className="hover:text-primary-200 transition-colors">
                      Pedidos
                    </Link>
                  </>
                )}
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm">
                    Olá, {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-primary-700 hover:bg-primary-800 px-3 py-1 rounded transition-colors"
                  >
                    Sair
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="hover:text-primary-200 transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-700 hover:bg-primary-800 px-3 py-1 rounded transition-colors"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

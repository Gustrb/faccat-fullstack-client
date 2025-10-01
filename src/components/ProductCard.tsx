import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const discountPercentage = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-w-16 aspect-h-9">
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
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {product.description && (
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {product.description}
          </p>
        )}
        
        {product.condition_description && (
          <p className="text-orange-600 text-sm mt-2 font-medium">
            ⚠️ {product.condition_description}
          </p>
        )}
        
        <div className="mt-3 flex items-center justify-between">
          {product.stock > 0 ? (
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary-600">
                R$ {product.price.toFixed(2)}
              </span>
              {product.original_price && (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    R$ {product.original_price.toFixed(2)}
                  </span>
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                    -{discountPercentage}%
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="text-lg font-semibold text-red-600">
              Fora de Estoque
            </div>
          )}
          
          <div className={`text-sm font-medium ${
            product.stock === 0 
              ? 'text-red-600' 
              : product.stock < 5 
                ? 'text-orange-600' 
                : 'text-gray-500'
          }`}>
            {product.stock === 0 ? 'Indisponível' : `Estoque: ${product.stock}`}
            {product.stock > 0 && product.stock < 5 && ' (Últimas!)'}
          </div>
        </div>
        
        <div className="mt-4">
          <Link
            to={`/product/${product.id}`}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded transition-colors text-center block"
          >
            Ver Detalhes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

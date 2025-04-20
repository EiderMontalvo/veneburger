import { useState, useEffect, useCallback } from 'react';
import { menuService } from '../services/menuService';

const useProducts = (categoryId = null, initialOptions = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState(initialOptions);
  
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let result;
      if (categoryId) {
        result = await menuService.getProductsByCategory(categoryId);
      } else if (options.featured) {
        result = await menuService.getFeaturedProducts();
      } else if (options.search) {
        result = await menuService.searchProducts(options.search);
      } else {
        result = await menuService.getAllProducts(options.params);
      }
      
      setProducts(result.productos || result);
    } catch (err) {
      setError(err.message || 'Error al cargar productos');
      console.error('Error en useProducts:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, options]);
  
  // Función para actualizar opciones
  const updateOptions = useCallback((newOptions) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  }, []);
  
  // Cargar productos al montar o cuando cambien las dependencias
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  // Función para forzar recarga
  const refetch = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  return { products, loading, error, refetch, updateOptions };
};

export default useProducts;
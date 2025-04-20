import { useState, useEffect, useCallback } from 'react';
import { menuService } from '../services/menuService';

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await menuService.getCategories();
      setCategories(result.categorias || result);
    } catch (err) {
      setError(err.message || 'Error al cargar categorías');
      console.error('Error en useCategories:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  const refetch = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  return { categories, loading, error, refetch };
};

export default useCategories;
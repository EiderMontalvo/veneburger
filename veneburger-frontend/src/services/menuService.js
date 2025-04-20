import api from './api';

export const menuService = {
  // Obtener todas las categorías
  getCategories: async () => {
    try {
      const response = await api.get('/categorias');
      return response.data;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  },
  
  // Obtener productos por categoría
  getProductsByCategory: async (categoryId) => {
    try {
      const response = await api.get(`/productos?categoria_id=${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error);
      throw error;
    }
  },
  
  // Obtener todos los productos
  getAllProducts: async (params = {}) => {
    try {
      const response = await api.get('/productos', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },
  
  // Obtener detalles de un producto específico
  getProductDetails: async (productId) => {
    try {
      const response = await api.get(`/productos/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener detalles del producto:', error);
      throw error;
    }
  },
  
  // Obtener productos destacados
  getFeaturedProducts: async () => {
    try {
      const response = await api.get('/productos?destacado=true');
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos destacados:', error);
      throw error;
    }
  },
  
  // Obtener promociones activas
  getActivePromotions: async () => {
    try {
      const response = await api.get('/promociones?activo=true');
      return response.data;
    } catch (error) {
      console.error('Error al obtener promociones:', error);
      throw error;
    }
  },
  
  // Obtener extras o complementos
  getExtras: async (type = null) => {
    try {
      const url = type ? `/extras?tipo=${type}` : '/extras';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener extras:', error);
      throw error;
    }
  },
  
  // Buscar productos
  searchProducts: async (query) => {
    try {
      const response = await api.get(`/productos/buscar?q=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error al buscar productos:', error);
      throw error;
    }
  }
};

export default menuService;
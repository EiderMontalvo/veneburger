import api from './api';

export const deleteFile = async (
    type: 'productos' | 'categorias' | 'comprobantes', 
    filename?: string
  ): Promise<boolean> => {
    // No hacer nada si no hay archivo o es el default
    if (!filename || filename === 'default.png') {
      return true;
    }
    
    try {
      await api.delete(`/uploads/${type}/${filename}`);
      return true;
    } catch (error) {
      return false;
    }
  };
export const getImageUrl = (
  type: 'productos'|'categorias'|'comprobantes', 
  filename?: string|null,
  absolute: boolean = false,
  noCache: boolean = true
): string => {
  const defaultImage = `default.png`;
  const actualFilename = filename || defaultImage;
  
  // Añadir timestamp para evitar caché si se solicita
  const cacheBuster = noCache ? `?t=${Date.now()}` : '';
  
  // Si necesitamos URL absoluta (para previsualizaciones en formularios)
  if (absolute) {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
    const baseUrl = apiUrl.replace(/\/api$/, ''); 
    return `${baseUrl}/uploads/${type}/${actualFilename}${cacheBuster}`;
  }
  
  // URL relativa (para visualización en tablas, etc)
  return `/uploads/${type}/${actualFilename}${cacheBuster}`;
};
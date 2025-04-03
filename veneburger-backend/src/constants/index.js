// Constantes compartidas entre backend y frontend

// Roles de usuario
const ROLES = {
    ADMIN: 'admin',
    CLIENTE: 'cliente',
  };
  
  // Estados de pedido
  const ESTADOS_PEDIDO = {
    PENDIENTE: 'pendiente',
    PROCESANDO: 'procesando',
    LISTO: 'listo',
    ENTREGADO: 'entregado',
    CANCELADO: 'cancelado',
  };
  
  // Métodos de pago
  const METODOS_PAGO = {
    EFECTIVO: 'efectivo',
    TARJETA: 'tarjeta',
    TRANSFERENCIA: 'transferencia',
  };
  
  // Rutas de API
  const API_ROUTES = {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      PROFILE: '/api/auth/perfil',
    },
    PRODUCTOS: {
      BASE: '/api/productos',
      DETAIL: (id) => `/api/productos/${id}`,
    },
    CATEGORIAS: {
      BASE: '/api/categorias',
      DETAIL: (id) => `/api/categorias/${id}`,
    },
    PEDIDOS: {
      BASE: '/api/pedidos',
      DETAIL: (id) => `/api/pedidos/${id}`,
      UPDATE_STATUS: (id) => `/api/pedidos/${id}/estado`,
    },
    // Añadir más rutas según se necesiten
  };
  
  // Exportar todas las constantes
  module.exports = {
    ROLES,
    ESTADOS_PEDIDO,
    METODOS_PAGO,
    API_ROUTES,
  };
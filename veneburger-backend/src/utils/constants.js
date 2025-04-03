// Estados de pedidos
exports.ESTADOS_PEDIDO = {
    PENDIENTE: 'pendiente',
    PREPARANDO: 'preparando',
    LISTO: 'listo',
    EN_CAMINO: 'en_camino',
    ENTREGADO: 'entregado',
    CANCELADO: 'cancelado'
  };
  
  // Tipos de pedidos
  exports.TIPOS_PEDIDO = {
    LOCAL: 'local',
    DELIVERY: 'delivery',
    PARA_LLEVAR: 'para_llevar'
  };
  
  // Roles de usuario
  exports.ROLES = {
    ADMIN: 'admin',
    CLIENTE: 'cliente',
    REPARTIDOR: 'repartidor'
  };
  
  // Límites y valores por defecto
  exports.LIMITES = {
    PAGINACION_DEFECTO: 50,
    MAX_TAMANO_IMAGEN: 5 * 1024 * 1024, // 5MB
    MIN_PASSWORD_LENGTH: 6
  };
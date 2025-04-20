import api from './api';

export interface Usuario {
  id: number;
  nombre: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  ubicacion?: string;
}

export interface Categoria {
  id: number;
  nombre: string;
}

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria?: Categoria;
  imagen?: string;
}

export interface Crema {
  id: number;
  nombre: string;
}

export interface DetallePedidoCrema {
  id?: number;
  crema: Crema;
  cantidad: number;
}

export interface MetodoPago {
  id: number;
  nombre: string;
  descripcion?: string;
  requiere_confirmacion: boolean;
}

export interface Pago {
  id: number;
  metodo_pago: MetodoPago;
  monto: number;
  estado: 'pendiente' | 'completado' | 'rechazado';
  fecha_pago: string;
  fecha_confirmacion?: string;
}

export interface DetallePedido {
  id: number;
  producto: Producto;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  notas?: string;
  cremas?: DetallePedidoCrema[];
}

export interface Pedido {
  id: number;
  codigo: string;
  tipo: 'delivery' | 'local';
  estado: 'pendiente' | 'preparando' | 'listo' | 'en_camino' | 'entregado' | 'cancelado';
  usuario?: Usuario;
  repartidor?: Usuario;
  mesa?: Mesa;
  nombre_cliente?: string;
  subtotal: number;
  descuento: number;
  costo_envio: number;
  total: number;
  direccion_entrega?: string;
  referencia_direccion?: string;
  distrito?: string;
  ciudad?: string;
  telefono_contacto?: string;
  email_contacto?: string;
  tiempo_estimado_entrega: number;
  fecha_pedido: string;
  fecha_preparacion?: string;
  fecha_listo?: string;
  fecha_en_camino?: string;
  fecha_entrega?: string;
  fecha_cancelacion?: string;
  motivo_cancelacion?: string;
  notas?: string;
  calificacion?: number;
  comentario_calificacion?: string;
  origen: 'web' | 'app' | 'telefono' | 'presencial';
  detalles?: DetallePedido[];
  pagos?: Pago[];
}

export interface OrdersFilter {
  estado?: string;
  tipo?: 'delivery' | 'local';
  desde?: string;
  hasta?: string;
  usuario_id?: number;
  repartidor_id?: number;
  mesa_id?: number;
  limite?: number;
  pagina?: number;
}

export interface PaginationData {
  count: number;
  paginaActual: number;
  totalPaginas: number;
}

export interface OrderStatistics {
  totalPedidos: number;
  pedidosPorEstado: { estado: string; cantidad: number }[];
  pedidosPorTipo: { tipo: string; cantidad: number }[];
  ventasHoy: number;
  ventasSemana: number;
}

export const orderService = {
  // Listar pedidos con filtros opcionales
  listarPedidos: async (filters: OrdersFilter = {}) => {
    const response = await api.get('/pedidos', { params: filters });
    return {
      pedidos: response.data.data.pedidos as Pedido[],
      pagination: response.data.pagination as PaginationData
    };
  },

  // Obtener un pedido por ID
  obtenerPedidoPorId: async (id: number) => {
    const response = await api.get(`/pedidos/${id}`);
    return response.data.data.pedido as Pedido;
  },

  // Actualizar estado de un pedido
  actualizarEstadoPedido: async (id: number, data: {
    estado: Pedido['estado'];
    motivo_cancelacion?: string;
    repartidor_id?: number;
  }) => {
    const response = await api.patch(`/pedidos/${id}/estado`, data);
    return response.data.data.pedido;
  },

  // Calificar un pedido
  calificarPedido: async (id: number, data: {
    calificacion: number;
    comentario_calificacion?: string;
  }) => {
    const response = await api.post(`/pedidos/${id}/calificacion`, data);
    return response.data.data;
  },

  // Obtener estadísticas (solo admin)
  obtenerEstadisticas: async () => {
    const response = await api.get('/pedidos/estadisticas');
    return response.data.data as OrderStatistics;
  },
};
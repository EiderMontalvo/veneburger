import api from './api';

export interface DiaEspecial {
  id: number;
  fecha: string;
  tipo: 'horario_especial' | 'cerrado';
  hora_apertura: string | null;
  hora_cierre: string | null;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface DiaEspecialInput {
  fecha: string;
  tipo: 'horario_especial' | 'cerrado';
  hora_apertura?: string | null;
  hora_cierre?: string | null;
  activo?: boolean;
}

export const daysService = {
  // Listar días especiales con filtros opcionales
  listarDiasEspeciales: async (params?: { desde?: string; hasta?: string; activo?: boolean }) => {
    const response = await api.get('/dias-especiales', { params });
    return response.data.data.diasEspeciales as DiaEspecial[];
  },

  // Obtener un día especial por ID
  obtenerDiaPorId: async (id: number) => {
    const response = await api.get(`/dias-especiales/${id}`);
    return response.data.data.diaEspecial as DiaEspecial;
  },

  // Crear un nuevo día especial
  crearDiaEspecial: async (data: DiaEspecialInput) => {
    const response = await api.post('/dias-especiales', data);
    return response.data.data.diaEspecial as DiaEspecial;
  },

  // Actualizar un día especial existente
  actualizarDiaEspecial: async (id: number, data: Partial<DiaEspecialInput>) => {
    const response = await api.put(`/dias-especiales/${id}`, data);
    return response.data.data.diaEspecial as DiaEspecial;
  },

  // Eliminar un día especial
  eliminarDiaEspecial: async (id: number) => {
    const response = await api.delete(`/dias-especiales/${id}`);
    return response.data;
  },

  // Verificar si una fecha es día especial
  verificarDiaEspecial: async (fecha: string) => {
    const response = await api.get(`/dias-especiales/verificar/${fecha}`);
    return response.data;
  }
};
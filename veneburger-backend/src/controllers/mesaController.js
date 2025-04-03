const { Mesa, Pedido, Reserva } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

/**
 * Listar mesas
 */
exports.listarMesas = async (req, res) => {
  try {
    const { estado, ubicacion, activo } = req.query;
    
    const whereClause = {};
    
    // Aplicar filtros si se proporcionan
    if (estado) {
      whereClause.estado = estado;
    }
    
    if (ubicacion) {
      whereClause.ubicacion = ubicacion;
    }
    
    if (activo !== undefined) {
      whereClause.activo = activo === 'true';
    }
    
    const mesas = await Mesa.findAll({
      where: whereClause,
      order: [['numero', 'ASC']]
    });
    
    return res.status(200).json({
      status: 'success',
      results: mesas.length,
      data: { mesas }
    });
  } catch (error) {
    console.error('Error al listar mesas:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener las mesas'
    });
  }
};

/**
 * Obtener mesa por ID
 */
exports.obtenerMesaPorId = async (req, res) => {
  try {
    const mesa = await Mesa.findByPk(req.params.id);
    
    if (!mesa) {
      return res.status(404).json({
        status: 'error',
        message: 'Mesa no encontrada'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: { mesa }
    });
  } catch (error) {
    console.error('Error al obtener mesa:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener la mesa'
    });
  }
};

/**
 * Crear nueva mesa
 */
exports.crearMesa = async (req, res) => {
  try {
    // Verificar si ya existe una mesa con el mismo número
    const mesaExistente = await Mesa.findOne({
      where: { numero: req.body.numero }
    });
    
    if (mesaExistente) {
      return res.status(400).json({
        status: 'error',
        message: 'Ya existe una mesa con este número'
      });
    }
    
    // Crear la mesa
    const nuevaMesa = await Mesa.create({
      numero: req.body.numero,
      capacidad: req.body.capacidad || 4,
      estado: req.body.estado || 'disponible',
      ubicacion: req.body.ubicacion || 'interior',
      activo: req.body.activo !== undefined ? req.body.activo : true,
      fecha_actualizacion: new Date()
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'Mesa creada correctamente',
      data: { mesa: nuevaMesa }
    });
  } catch (error) {
    console.error('Error al crear mesa:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al crear la mesa'
    });
  }
};

/**
 * Actualizar mesa
 */
exports.actualizarMesa = async (req, res) => {
  try {
    const mesa = await Mesa.findByPk(req.params.id);
    
    if (!mesa) {
      return res.status(404).json({
        status: 'error',
        message: 'Mesa no encontrada'
      });
    }
    
    // Si se actualiza el número, verificar que no exista ya
    if (req.body.numero && req.body.numero !== mesa.numero) {
      const mesaExistente = await Mesa.findOne({
        where: { 
          numero: req.body.numero,
          id: { [Op.ne]: req.params.id }
        }
      });
      
      if (mesaExistente) {
        return res.status(400).json({
          status: 'error',
          message: 'Ya existe otra mesa con este número'
        });
      }
    }
    
    // Actualizar mesa
    await mesa.update({
      numero: req.body.numero !== undefined ? req.body.numero : mesa.numero,
      capacidad: req.body.capacidad !== undefined ? req.body.capacidad : mesa.capacidad,
      estado: req.body.estado !== undefined ? req.body.estado : mesa.estado,
      ubicacion: req.body.ubicacion !== undefined ? req.body.ubicacion : mesa.ubicacion,
      activo: req.body.activo !== undefined ? req.body.activo : mesa.activo,
      fecha_actualizacion: new Date()
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Mesa actualizada correctamente',
      data: { mesa }
    });
  } catch (error) {
    console.error('Error al actualizar mesa:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al actualizar la mesa'
    });
  }
};

/**
 * Eliminar mesa
 */
exports.eliminarMesa = async (req, res) => {
  try {
    const mesa = await Mesa.findByPk(req.params.id);
    
    if (!mesa) {
      return res.status(404).json({
        status: 'error',
        message: 'Mesa no encontrada'
      });
    }
    
    // Verificar si la mesa tiene pedidos asociados
    const pedidosCount = await Pedido.count({
      where: { mesa_id: req.params.id }
    });
    
    if (pedidosCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No se puede eliminar la mesa porque tiene pedidos asociados'
      });
    }
    
    // Verificar si la mesa tiene reservas futuras
    const reservasFuturas = await Reserva.count({
      where: { 
        mesa_id: req.params.id,
        fecha_reserva: { [Op.gte]: moment().format('YYYY-MM-DD') },
        estado: { [Op.in]: ['pendiente', 'confirmada'] }
      }
    });
    
    if (reservasFuturas > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No se puede eliminar la mesa porque tiene reservas futuras'
      });
    }
    
    // Eliminar mesa
    await mesa.destroy();
    
    return res.status(200).json({
      status: 'success',
      message: 'Mesa eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar mesa:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al eliminar la mesa'
    });
  }
};

/**
 * Cambiar estado de la mesa
 */
exports.cambiarEstado = async (req, res) => {
  try {
    const mesa = await Mesa.findByPk(req.params.id);
    
    if (!mesa) {
      return res.status(404).json({
        status: 'error',
        message: 'Mesa no encontrada'
      });
    }
    
    // Validar que el estado sea válido
    const estadosValidos = ['disponible', 'ocupada', 'reservada', 'mantenimiento'];
    if (!estadosValidos.includes(req.body.estado)) {
      return res.status(400).json({
        status: 'error',
        message: 'Estado de mesa inválido'
      });
    }
    
    // Actualizar estado
    await mesa.update({
      estado: req.body.estado,
      fecha_actualizacion: new Date()
    });
    
    return res.status(200).json({
      status: 'success',
      message: `Mesa actualizada a estado: ${req.body.estado}`,
      data: { mesa }
    });
  } catch (error) {
    console.error('Error al cambiar estado de mesa:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al cambiar el estado de la mesa'
    });
  }
};

/**
 * Obtener disponibilidad de mesas
 */
exports.obtenerDisponibilidad = async (req, res) => {
  try {
    const { fecha, hora, personas } = req.query;
    
    // Validar parámetros
    if (!fecha || !hora) {
      return res.status(400).json({
        status: 'error',
        message: 'Debe proporcionar fecha y hora'
      });
    }
    
    const cantidadPersonas = parseInt(personas) || 1;
    
    // Buscar mesas con capacidad suficiente y activas
    const mesasDisponibles = await Mesa.findAll({
      where: {
        capacidad: { [Op.gte]: cantidadPersonas },
        activo: true,
        estado: { [Op.in]: ['disponible'] }
      },
      order: [['capacidad', 'ASC'], ['numero', 'ASC']]
    });
    
    // Buscar reservas para la fecha y hora indicadas
    const reservas = await Reserva.findAll({
      where: {
        fecha_reserva: fecha,
        [Op.and]: [
          { hora_inicio: { [Op.lte]: hora } },
          { hora_fin: { [Op.gt]: hora } }
        ],
        estado: { [Op.in]: ['pendiente', 'confirmada'] }
      },
      attributes: ['mesa_id']
    });
    
    const mesasReservadas = reservas.map(r => r.mesa_id);
    
    // Filtrar mesas que no están reservadas en ese horario
    const mesasDisponiblesFiltradas = mesasDisponibles.filter(
      mesa => !mesasReservadas.includes(mesa.id)
    );
    
    return res.status(200).json({
      status: 'success',
      results: mesasDisponiblesFiltradas.length,
      data: { 
        mesas: mesasDisponiblesFiltradas,
        parametros: { fecha, hora, personas: cantidadPersonas }
      }
    });
  } catch (error) {
    console.error('Error al obtener disponibilidad de mesas:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al verificar disponibilidad de mesas'
    });
  }
};
const { Crema, DetallePedidoCrema } = require('../models');
const { Op } = require('sequelize');

/**
 * Listar todas las cremas
 */
exports.listarCremas = async (req, res) => {
  try {
    const { disponible } = req.query;
    
    const whereClause = {};
    
    // Si se especifica disponible, filtrar por ello
    if (disponible !== undefined) {
      whereClause.disponible = disponible === 'true';
    }
    
    const cremas = await Crema.findAll({
      where: whereClause,
      order: [['nombre', 'ASC']]
    });
    
    return res.status(200).json({
      status: 'success',
      results: cremas.length,
      data: { cremas }
    });
  } catch (error) {
    console.error('Error al listar cremas:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener las cremas'
    });
  }
};

/**
 * Obtener crema por ID
 */
exports.obtenerCremaPorId = async (req, res) => {
  try {
    const crema = await Crema.findByPk(req.params.id);
    
    if (!crema) {
      return res.status(404).json({
        status: 'error',
        message: 'Crema no encontrada'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: { crema }
    });
  } catch (error) {
    console.error('Error al obtener crema:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener la crema'
    });
  }
};

/**
 * Crear nueva crema
 */
exports.crearCrema = async (req, res) => {
  try {
    // Verificar si ya existe una crema con el mismo nombre
    const cremaExistente = await Crema.findOne({
      where: { nombre: req.body.nombre }
    });
    
    if (cremaExistente) {
      return res.status(400).json({
        status: 'error',
        message: 'Ya existe una crema con este nombre'
      });
    }
    
    // Crear la crema
    const nuevaCrema = await Crema.create({
      nombre: req.body.nombre,
      precio: req.body.precio || 0.00,
      disponible: req.body.disponible !== undefined ? req.body.disponible : true,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date()
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'Crema creada correctamente',
      data: { crema: nuevaCrema }
    });
  } catch (error) {
    console.error('Error al crear crema:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al crear la crema'
    });
  }
};

/**
 * Actualizar crema
 */
exports.actualizarCrema = async (req, res) => {
  try {
    const crema = await Crema.findByPk(req.params.id);
    
    if (!crema) {
      return res.status(404).json({
        status: 'error',
        message: 'Crema no encontrada'
      });
    }
    
    // Si se actualiza el nombre, verificar que no exista ya
    if (req.body.nombre && req.body.nombre !== crema.nombre) {
      const cremaExistente = await Crema.findOne({
        where: { 
          nombre: req.body.nombre,
          id: { [Op.ne]: req.params.id }
        }
      });
      
      if (cremaExistente) {
        return res.status(400).json({
          status: 'error',
          message: 'Ya existe otra crema con este nombre'
        });
      }
    }
    
    // Actualizar crema
    await crema.update({
      nombre: req.body.nombre !== undefined ? req.body.nombre : crema.nombre,
      precio: req.body.precio !== undefined ? req.body.precio : crema.precio,
      disponible: req.body.disponible !== undefined ? req.body.disponible : crema.disponible,
      fecha_actualizacion: new Date()
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Crema actualizada correctamente',
      data: { crema }
    });
  } catch (error) {
    console.error('Error al actualizar crema:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al actualizar la crema'
    });
  }
};

/**
 * Eliminar crema
 */
exports.eliminarCrema = async (req, res) => {
  try {
    const crema = await Crema.findByPk(req.params.id);
    
    if (!crema) {
      return res.status(404).json({
        status: 'error',
        message: 'Crema no encontrada'
      });
    }
    
    // Verificar si la crema está siendo usada en pedidos
    const usos = await DetallePedidoCrema.count({
      where: { crema_id: req.params.id }
    });
    
    if (usos > 0) {
      // Si está en uso, marcar como no disponible en lugar de eliminar
      await crema.update({
        disponible: false,
        fecha_actualizacion: new Date()
      });
      
      return res.status(200).json({
        status: 'success',
        message: 'La crema está siendo usada en pedidos existentes. Se ha marcado como no disponible.'
      });
    }
    
    // Eliminar crema si no está en uso
    await crema.destroy();
    
    return res.status(200).json({
      status: 'success',
      message: 'Crema eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar crema:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al eliminar la crema'
    });
  }
};

/**
 * Cambiar disponibilidad de la crema
 */
exports.cambiarDisponibilidad = async (req, res) => {
  try {
    const crema = await Crema.findByPk(req.params.id);
    
    if (!crema) {
      return res.status(404).json({
        status: 'error',
        message: 'Crema no encontrada'
      });
    }
    
    // Invertir disponibilidad
    await crema.update({
      disponible: !crema.disponible,
      fecha_actualizacion: new Date()
    });
    
    return res.status(200).json({
      status: 'success',
      message: `Crema marcada como ${crema.disponible ? 'disponible' : 'no disponible'}`,
      data: { disponible: crema.disponible }
    });
  } catch (error) {
    console.error('Error al cambiar disponibilidad de crema:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al cambiar disponibilidad de la crema'
    });
  }
};
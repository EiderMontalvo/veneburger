const { DiaEspecial } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

/**
 * Listar días especiales
 */
exports.listarDiasEspeciales = async (req, res) => {
  try {
    const { desde, hasta, activo } = req.query;
    
    const whereClause = {};
    
    // Filtrar por fecha
    if (desde && hasta) {
      whereClause.fecha = {
        [Op.between]: [desde, hasta]
      };
    } else if (desde) {
      whereClause.fecha = {
        [Op.gte]: desde
      };
    } else if (hasta) {
      whereClause.fecha = {
        [Op.lte]: hasta
      };
    }
    
    // Filtrar por activo
    if (activo !== undefined) {
      whereClause.activo = activo === 'true';
    }
    
    const diasEspeciales = await DiaEspecial.findAll({
      where: whereClause,
      order: [['fecha', 'ASC']]
    });
    
    return res.status(200).json({
      status: 'success',
      results: diasEspeciales.length,
      data: { diasEspeciales }
    });
  } catch (error) {
    console.error('Error al listar días especiales:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener los días especiales'
    });
  }
};

/**
 * Obtener día especial por ID
 */
exports.obtenerDiaEspecialPorId = async (req, res) => {
  try {
    const diaEspecial = await DiaEspecial.findByPk(req.params.id);
    
    if (!diaEspecial) {
      return res.status(404).json({
        status: 'error',
        message: 'Día especial no encontrado'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: { diaEspecial }
    });
  } catch (error) {
    console.error('Error al obtener día especial:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener el día especial'
    });
  }
};

/**
 * Crear día especial
 */
exports.crearDiaEspecial = async (req, res) => {
  try {
    // Verificar si ya existe un día especial para esta fecha
    const diaExistente = await DiaEspecial.findOne({
      where: { fecha: req.body.fecha }
    });
    
    if (diaExistente) {
      return res.status(400).json({
        status: 'error',
        message: 'Ya existe un día especial para esta fecha'
      });
    }
    
    // Crear día especial
    const nuevoDiaEspecial = await DiaEspecial.create({
      fecha: req.body.fecha,
      tipo: req.body.tipo,
      hora_apertura: req.body.tipo === 'horario_especial' ? req.body.hora_apertura : null,
      hora_cierre: req.body.tipo === 'horario_especial' ? req.body.hora_cierre : null,
      activo: req.body.activo !== undefined ? req.body.activo : true,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date()
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'Día especial creado correctamente',
      data: { diaEspecial: nuevoDiaEspecial }
    });
  } catch (error) {
    console.error('Error al crear día especial:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al crear el día especial'
    });
  }
};

/**
 * Actualizar día especial
 */
exports.actualizarDiaEspecial = async (req, res) => {
  try {
    const diaEspecial = await DiaEspecial.findByPk(req.params.id);
    
    if (!diaEspecial) {
      return res.status(404).json({
        status: 'error',
        message: 'Día especial no encontrado'
      });
    }
    
    // Si se actualiza la fecha, verificar que no exista ya
    if (req.body.fecha && req.body.fecha !== diaEspecial.fecha) {
      const diaExistente = await DiaEspecial.findOne({
        where: { 
          fecha: req.body.fecha,
          id: { [Op.ne]: req.params.id }
        }
      });
      
      if (diaExistente) {
        return res.status(400).json({
          status: 'error',
          message: 'Ya existe otro día especial para esta fecha'
        });
      }
    }
    
    // Actualizar día especial
    await diaEspecial.update({
      fecha: req.body.fecha !== undefined ? req.body.fecha : diaEspecial.fecha,
      tipo: req.body.tipo !== undefined ? req.body.tipo : diaEspecial.tipo,
      hora_apertura: req.body.tipo === 'horario_especial' ? req.body.hora_apertura : null,
      hora_cierre: req.body.tipo === 'horario_especial' ? req.body.hora_cierre : null,
      activo: req.body.activo !== undefined ? req.body.activo : diaEspecial.activo,
      fecha_actualizacion: new Date()
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Día especial actualizado correctamente',
      data: { diaEspecial }
    });
  } catch (error) {
    console.error('Error al actualizar día especial:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al actualizar el día especial'
    });
  }
};

/**
 * Eliminar día especial
 */
exports.eliminarDiaEspecial = async (req, res) => {
  try {
    const diaEspecial = await DiaEspecial.findByPk(req.params.id);
    
    if (!diaEspecial) {
      return res.status(404).json({
        status: 'error',
        message: 'Día especial no encontrado'
      });
    }
    
    // Verificar si la fecha es pasada
    const fechaDia = moment(diaEspecial.fecha);
    const hoy = moment().startOf('day');
    
    if (fechaDia.isBefore(hoy)) {
      return res.status(400).json({
        status: 'error',
        message: 'No se puede eliminar un día especial de fecha pasada'
      });
    }
    
    // Eliminar día especial
    await diaEspecial.destroy();
    
    return res.status(200).json({
      status: 'success',
      message: 'Día especial eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar día especial:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al eliminar el día especial'
    });
  }
};

/**
 * Verificar si una fecha es día especial
 */
exports.verificarDiaEspecial = async (req, res) => {
  try {
    const { fecha } = req.params;
    
    // Validar formato de fecha
    if (!moment(fecha, 'YYYY-MM-DD', true).isValid()) {
      return res.status(400).json({
        status: 'error',
        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }
    
    const diaEspecial = await DiaEspecial.findOne({
      where: { 
        fecha, 
        activo: true 
      }
    });
    
    if (!diaEspecial) {
      return res.status(200).json({
        status: 'success',
        esDiaEspecial: false,
        mensaje: 'Horario normal de atención para esta fecha'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      esDiaEspecial: true,
      data: { diaEspecial }
    });
  } catch (error) {
    console.error('Error al verificar día especial:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al verificar si es día especial'
    });
  }
};
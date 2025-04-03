const bcrypt = require('bcryptjs');
const { Usuario, Pedido } = require('../models');
const { Op } = require('sequelize');
const logger = require('../middleware/logger');

/**
 * Listar usuarios (solo admin)
 */
exports.listarUsuarios = async (req, res) => {
  try {
    const { rol, activo, buscar, limite = 50, pagina = 1 } = req.query;
    
    const whereClause = {};
    
    // Aplicar filtros
    if (rol) {
      whereClause.rol = rol;
    }
    
    if (activo !== undefined) {
      whereClause.activo = activo === 'true';
    }
    
    if (buscar) {
      whereClause[Op.or] = [
        { nombre: { [Op.like]: `%${buscar}%` } },
        { apellidos: { [Op.like]: `%${buscar}%` } },
        { email: { [Op.like]: `%${buscar}%` } },
        { telefono: { [Op.like]: `%${buscar}%` } }
      ];
    }
    
    // Calcular offset para paginación
    const offset = (pagina - 1) * limite;
    
    // Obtener usuarios con paginación
    const { count, rows: usuarios } = await Usuario.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['fecha_registro', 'DESC']],
      limit: parseInt(limite),
      offset: offset
    });
    
    return res.status(200).json({
      status: 'success',
      results: usuarios.length,
      pagination: {
        count,
        paginaActual: parseInt(pagina),
        totalPaginas: Math.ceil(count / limite)
      },
      data: { usuarios }
    });
  } catch (error) {
    logger.error('Error al listar usuarios:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener los usuarios'
    });
  }
};

/**
 * Obtener usuario por ID
 */
exports.obtenerUsuarioPorId = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!usuario) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }
    
    // Si no es admin y no es el propio usuario, denegar acceso
    if (req.usuario.rol !== 'admin' && req.usuario.id !== usuario.id) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para ver este usuario'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: { usuario }
    });
  } catch (error) {
    logger.error('Error al obtener usuario:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener el usuario'
    });
  }
};

/**
 * Crear nuevo usuario (solo admin)
 */
exports.crearUsuario = async (req, res) => {
  try {
    // Verificar si el correo ya existe
    const usuarioExistente = await Usuario.findOne({
      where: { email: req.body.email }
    });
    
    if (usuarioExistente) {
      return res.status(400).json({
        status: 'error',
        message: 'Este correo electrónico ya está registrado'
      });
    }
    
    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      nombre: req.body.nombre,
      apellidos: req.body.apellidos || null,
      email: req.body.email,
      telefono: req.body.telefono || null,
      password: hashedPassword,
      direccion: req.body.direccion || null,
      referencia_direccion: req.body.referencia_direccion || null,
      ciudad: req.body.ciudad || 'Lima',
      distrito: req.body.distrito || null,
      rol: req.body.rol || 'cliente',
      fecha_registro: new Date(),
      activo: req.body.activo !== undefined ? req.body.activo : true
    });
    
    // Registrar actividad
    logger.info(`Usuario creado: ${nuevoUsuario.email} (${nuevoUsuario.rol})`);
    
    // Responder sin la contraseña
    const usuarioData = nuevoUsuario.toJSON();
    delete usuarioData.password;
    
    return res.status(201).json({
      status: 'success',
      message: 'Usuario creado correctamente',
      data: { usuario: usuarioData }
    });
  } catch (error) {
    logger.error('Error al crear usuario:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al crear el usuario'
    });
  }
};

/**
 * Actualizar usuario
 */
exports.actualizarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar permisos: solo admin puede editar cualquier usuario
    // Un usuario normal solo puede editar su propio perfil
    if (req.usuario.rol !== 'admin' && req.usuario.id !== usuario.id) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para editar este usuario'
      });
    }
    
    // Si se intenta cambiar el rol, solo admin puede hacerlo
    if (req.body.rol && req.usuario.rol !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para cambiar el rol'
      });
    }
    
    // Si se cambia el email, verificar que no exista
    if (req.body.email && req.body.email !== usuario.email) {
      const emailExistente = await Usuario.findOne({
        where: { 
          email: req.body.email,
          id: { [Op.ne]: req.params.id }
        }
      });
      
      if (emailExistente) {
        return res.status(400).json({
          status: 'error',
          message: 'Este correo electrónico ya está registrado por otro usuario'
        });
      }
    }
    
    // Preparar datos para actualizar
    const datosActualizados = {
      nombre: req.body.nombre !== undefined ? req.body.nombre : usuario.nombre,
      apellidos: req.body.apellidos !== undefined ? req.body.apellidos : usuario.apellidos,
      email: req.body.email !== undefined ? req.body.email : usuario.email,
      telefono: req.body.telefono !== undefined ? req.body.telefono : usuario.telefono,
      direccion: req.body.direccion !== undefined ? req.body.direccion : usuario.direccion,
      referencia_direccion: req.body.referencia_direccion !== undefined ? req.body.referencia_direccion : usuario.referencia_direccion,
      ciudad: req.body.ciudad !== undefined ? req.body.ciudad : usuario.ciudad,
      distrito: req.body.distrito !== undefined ? req.body.distrito : usuario.distrito,
    };
    
    // Solo admin puede cambiar estos campos
    if (req.usuario.rol === 'admin') {
      if (req.body.rol !== undefined) datosActualizados.rol = req.body.rol;
      if (req.body.activo !== undefined) datosActualizados.activo = req.body.activo;
    }
    
    // Actualizar usuario
    await usuario.update(datosActualizados);
    
    // Registrar actividad
    logger.info(`Usuario actualizado: ${usuario.email}`);
    
    // Responder sin la contraseña
    const usuarioActualizado = await Usuario.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Usuario actualizado correctamente',
      data: { usuario: usuarioActualizado }
    });
  } catch (error) {
    logger.error('Error al actualizar usuario:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al actualizar el usuario'
    });
  }
};

/**
 * Eliminar usuario (soft delete)
 */
exports.eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar si tiene pedidos activos
    const pedidosActivos = await Pedido.count({
      where: {
        usuario_id: req.params.id,
        estado: {
          [Op.in]: ['pendiente', 'preparando', 'listo', 'en_camino']
        }
      }
    });
    
    if (pedidosActivos > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'El usuario tiene pedidos activos, no se puede eliminar'
      });
    }
    
    // Soft delete: solo desactivar en lugar de eliminar físicamente
    await usuario.update({ 
      activo: false,
      email: `${usuario.email}.deleted.${Date.now()}`  // Asegurar que el email no pueda ser reutilizado
    });
    
    // Registrar actividad
    logger.info(`Usuario desactivado: ${usuario.email}`);
    
    return res.status(200).json({
      status: 'success',
      message: 'Usuario desactivado correctamente'
    });
  } catch (error) {
    logger.error('Error al eliminar usuario:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al eliminar el usuario'
    });
  }
};

/**
 * Cambiar contraseña de usuario
 */
exports.cambiarPassword = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar permisos
    if (req.usuario.rol !== 'admin' && req.usuario.id !== usuario.id) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para cambiar la contraseña de este usuario'
      });
    }
    
    // Si no es admin, debe proporcionar la contraseña actual
    if (req.usuario.rol !== 'admin') {
      if (!req.body.passwordActual) {
        return res.status(400).json({
          status: 'error',
          message: 'Debe proporcionar la contraseña actual'
        });
      }
      
      const esPasswordCorrecta = await bcrypt.compare(req.body.passwordActual, usuario.password);
      
      if (!esPasswordCorrecta) {
        return res.status(401).json({
          status: 'error',
          message: 'La contraseña actual es incorrecta'
        });
      }
    }
    
    // Validar nueva contraseña
    if (!req.body.passwordNueva || req.body.passwordNueva.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }
    
    // Hash de la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.passwordNueva, salt);
    
    // Actualizar contraseña
    await usuario.update({ password: hashedPassword });
    
    // Registrar actividad
    logger.info(`Contraseña cambiada para: ${usuario.email}`);
    
    return res.status(200).json({
      status: 'success',
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    logger.error('Error al cambiar contraseña:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al cambiar la contraseña'
    });
  }
};
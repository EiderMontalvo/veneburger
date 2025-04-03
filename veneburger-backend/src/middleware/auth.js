const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

/**
 * Middleware para proteger rutas
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Verificar si hay token en los headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No estás autorizado para acceder a esta ruta'
      });
    }
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar si el usuario existe
    const currentUser = await Usuario.findByPk(decoded.id);
    
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'El usuario asociado a este token ya no existe'
      });
    }
    
    if (!currentUser.activo) {
      return res.status(401).json({
        status: 'error',
        message: 'Tu cuenta ha sido desactivada'
      });
    }
    
    // Si todo está bien, agregar usuario a la solicitud
    req.usuario = currentUser;
    next();
    
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido o expirado'
    });
  }
};

/**
 * Middleware para restringir acceso por roles
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para realizar esta acción'
      });
    }
    next();
  };
};
const logger = require('./logger');

/**
 * Middleware de manejo de errores global
 */
module.exports = (err, req, res, next) => {
  // Loggear el error con su stack trace completo
  logger.error(`${err.name}: ${err.message}`, { 
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    stack: err.stack
  });

  // Determinar código de estado
  let statusCode = err.statusCode || 500;
  let errorMessage = process.env.NODE_ENV === 'production'
    ? 'Ocurrió un error en el servidor'
    : err.message;

  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      status: 'error',
      message: 'Token CSRF inválido o faltante'
    });
  }

  // Manejar errores específicos
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(statusCode).json({
      status: 'error',
      message: 'Error de validación',
      errors
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorMessage = 'Sesión inválida o expirada. Por favor, inicie sesión nuevamente';
  }

  if (err.name === 'SequelizeDatabaseError') {
    if (err.original && err.original.code === 'ER_NO_REFERENCED_ROW_2') {
      statusCode = 400;
      errorMessage = 'La referencia a otro registro no existe';
    }
  }

  // Enviar respuesta de error
  res.status(statusCode).json({
    status: 'error',
    message: errorMessage,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};
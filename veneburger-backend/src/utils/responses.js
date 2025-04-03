/**
 * Respuestas estandarizadas para la API
 */

// Respuesta exitosa
exports.success = (res, data = null, message = 'Operación exitosa', statusCode = 200) => {
    return res.status(statusCode).json({
      status: 'success',
      message,
      ...(data && { data })
    });
  };
  
  // Respuesta de error
  exports.error = (res, message = 'Error en la operación', statusCode = 400, errors = null) => {
    return res.status(statusCode).json({
      status: 'error',
      message,
      ...(errors && { errors })
    });
  };
  
  // Respuesta no encontrado
  exports.notFound = (res, message = 'Recurso no encontrado') => {
    return res.status(404).json({
      status: 'error',
      message
    });
  };
  
  // Respuesta no autorizado
  exports.unauthorized = (res, message = 'No autorizado') => {
    return res.status(401).json({
      status: 'error',
      message
    });
  };
  
  // Respuesta prohibido
  exports.forbidden = (res, message = 'Acceso prohibido') => {
    return res.status(403).json({
      status: 'error',
      message
    });
  };
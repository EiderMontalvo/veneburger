// Este servicio es un placeholder para implementar envío de emails en el futuro
// Dependencias recomendadas: nodemailer, sendgrid, mailgun, etc.

const logger = require('../middleware/logger');

exports.enviarEmailConfirmacion = async (destinatario, datos) => {
  // Implementación futura
  logger.debug(`[Simulación] Email de confirmación enviado a ${destinatario}`);
  return true;
};

exports.enviarEmailRecuperacion = async (destinatario, token) => {
  // Implementación futura
  logger.debug(`[Simulación] Email de recuperación enviado a ${destinatario}`);
  return true;
};
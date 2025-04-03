const winston = require('winston');
const path = require('path');

// Configuración de formatos
const { format } = winston;
const { combine, timestamp, printf, colorize, errors } = format;

// Crear directorio de logs si no existe
const logsDir = path.join(process.cwd(), 'logs');

// Formato personalizado
const myFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${message} ${stack ? '\n' + stack : ''}`;
});

// Crear instancia de logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    myFormat
  ),
  defaultMeta: { service: 'veneburger-backend' },
  transports: [
    // Archivo para todos los logs
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Archivo separado para errores
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// En desarrollo, loggear a la consola también
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      myFormat
    ),
  }));
}

// Función para loggear solicitudes HTTP
logger.logRequest = (req, res, next) => {
  const start = Date.now();
  
  // Log cuando la respuesta termina
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    
    if (res.statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.info(message);
    }
  });
  
  next();
};

module.exports = logger;
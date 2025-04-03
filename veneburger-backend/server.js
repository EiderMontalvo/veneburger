require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const { rateLimit } = require('express-rate-limit');
const { testConnection } = require('./src/config/database');
const db = require('./src/models');
const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');
const logger = require('./src/middleware/logger');
const swagger = require('./src/config/swagger');

// Inicializar app
const app = express();
const PORT = process.env.PORT || 3000;
app.use('/api-docs', swagger.serve, swagger.setup);

// Configuración de seguridad
app.use(helmet());

// Configuración específica para producción
if (process.env.NODE_ENV === 'production') {
  // Comprimir respuestas
  app.use(compression());
  
  // Políticas de seguridad estrictas
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      upgradeInsecureRequests: [],
    },
  }));
}

// Limitar peticiones
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' 
    ? (process.env.RATE_LIMIT_MAX || 60) // Más estricto en producción
    : (process.env.RATE_LIMIT_MAX || 100), // Más permisivo en desarrollo
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Demasiadas solicitudes, por favor intente más tarde.'
  }
});
app.use(limiter);

// Middleware para parsear JSON
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  maxAge: 86400 // 24 horas (CORS preflight cache)
};
app.use(cors(corsOptions));

// Logging
if (process.env.NODE_ENV === 'production') {
  // En producción, usar el logger personalizado
  app.use(logger.logRequest);
} else {
  // En desarrollo, usar morgan para formato más legible en consola
  app.use(morgan('dev'));
}

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d' // Cache de 7 días para archivos estáticos
}));

// Añadir timestamp a todas las solicitudes
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Rutas API
app.use('/api', routes);

// Ruta para verificar estado del servidor
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// Manejador de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Ruta no encontrada: ${req.originalUrl}`
  });
});

// Manejador de errores global
app.use(errorHandler);

// Función para sincronizar la base de datos y arrancar servidor
const startServer = async () => {
  try {
    // Probar la conexión a la base de datos primero
    const connected = await testConnection();
    if (!connected) {
      throw new Error('No se pudo establecer conexión con la base de datos MySQL');
    }
    
    // Opciones de sincronización según ambiente
    const syncOptions = {
      // En desarrollo, podemos alterar las tablas (crear columnas que falten)
      // En producción, no modificamos nada automáticamente
      alter: process.env.NODE_ENV === 'development'
    };
    
    // Sincronizar base de datos
    await db.sequelize.sync(syncOptions);
    logger.info('Base de datos sincronizada correctamente');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`Servidor iniciado en puerto ${PORT}`);
      logger.info(`Ambiente: ${process.env.NODE_ENV}`);
      logger.info(`Fecha de inicio: ${new Date().toLocaleString()}`);
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();

// Manejo de excepciones no capturadas
process.on('unhandledRejection', (err) => {
  logger.error('ERROR NO CAPTURADO (Promise):', err);
  // Cierre controlado
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('ERROR NO CAPTURADO (Exception):', err);
  // Cierre controlado
  process.exit(1);
});
const Sequelize = require('sequelize');
require('dotenv').config();
const logger = require('../middleware/logger');

// Configuración de la base de datos
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    timezone: '-05:00', // Zona horaria
    define: {
      timestamps: true,
      underscored: true, // Para usar snake_case en la BD
      freezeTableName: true, // Para evitar pluralización
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    dialectOptions: {
      typeCast: function (field, next) {
        if (field.type === 'TINY' && field.length === 1) {
          return (field.string() === '1'); // Convertir 1 y 0 a true/false
        }
        return next();
      },
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

// Función para inicializar la conexión
const testConnection = async () => {
  try {
      await sequelize.authenticate();
      logger.debug('Conexión a MySQL establecida correctamente');
      return true;
    } catch (error) {
      logger.error('Error al conectar con la base de datos:', error);
      return false;
    }
  };

module.exports = {
  sequelize,
  testConnection
};

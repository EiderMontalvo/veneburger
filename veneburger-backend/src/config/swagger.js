const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VeneBurger API',
      version: '1.0.0',
      description: 'API para el sistema de VeneBurger',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.veneburger.com' 
          : 'http://localhost:3000',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Rutas donde están los comentarios de Swagger
};

const specs = swaggerJsdoc(options);

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(specs),
};
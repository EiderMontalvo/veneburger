const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./authRoutes');
const categoriaRoutes = require('./categoriaRoutes');
const productoRoutes = require('./productoRoutes');
const cremaRoutes = require('./cremaRoutes');
const mesaRoutes = require('./mesaRoutes');
const diaEspecialRoutes = require('./diaEspecialRoutes');
const pedidoRoutes = require('./pedidoRoutes');
const reporteRoutes = require('./reporteRoutes');
const usuarioRoutes = require('./usuarioRoutes');

// Definir rutas
router.use('/auth', authRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/productos', productoRoutes);
router.use('/cremas', cremaRoutes);
router.use('/mesas', mesaRoutes);
router.use('/dias-especiales', diaEspecialRoutes);
router.use('/pedidos', pedidoRoutes);
router.use('/reportes', reporteRoutes);
router.use('/usuarios', usuarioRoutes);

// Información básica sobre la API
router.get('/', (req, res) => {
  res.status(200).json({
    nombre: 'VeneBurger API',
    version: '1.0.0',
    descripcion: 'API REST para el restaurante VeneBurger',
    autor: 'Eider Montalvo',
    fecha: '2025-04-01',
    documentacion: '/api/docs',
    estado: 'Activo'
  });
});


module.exports = router;
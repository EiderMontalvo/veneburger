const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./authRoutes');
const categoriaRoutes = require('./categoriaRoutes');
const productoRoutes = require('./productoRoutes');
const uploadRoutes = require('./uploadRoutes')
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
router.use('/uploads', uploadRoutes);
router.use('/cremas', cremaRoutes);
router.use('/mesas', mesaRoutes);
router.use('/dias-especiales', diaEspecialRoutes);
router.use('/pedidos', pedidoRoutes);
router.use('/reportes', reporteRoutes);
router.use('/usuarios', usuarioRoutes);

module.exports = router;
const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const { protect, restrictTo } = require('../middleware/auth');

// Todas las rutas de reportes están protegidas y restringidas a admins
router.use(protect);
router.use(restrictTo('admin'));

router.get('/ventas/diarias', reporteController.ventasDiarias);
router.get('/ventas/mensuales', reporteController.ventasMensuales);
router.get('/ventas/por-tipo', reporteController.ventasPorTipo);
router.get('/productos/mas-vendidos', reporteController.productosMasVendidos);
router.get('/clientes/frecuentes', reporteController.clientesFrecuentes);

module.exports = router;
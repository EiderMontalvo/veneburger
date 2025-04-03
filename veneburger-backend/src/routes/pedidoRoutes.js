const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const { protect, restrictTo } = require('../middleware/auth');
const { pedidoValidation, validar } = require('../middleware/validator');

// Rutas protegidas (requieren autenticación)
router.use(protect);

// Rutas para todos los usuarios autenticados
router.get('/', pedidoController.listarPedidos);
router.get('/:id', pedidoController.obtenerPedidoPorId);
router.post('/', pedidoValidation.crear, validar, pedidoController.crearPedido);

// Ruta para calificar (solo clientes)
router.patch('/:id/calificar', pedidoController.calificarPedido);

// Rutas para admin y repartidores
router.patch('/:id/estado', 
  restrictTo('admin', 'repartidor'),
  pedidoValidation.actualizarEstado, 
  validar,
  pedidoController.actualizarEstadoPedido
);

// Rutas solo para admin
router.get('/estadisticas/basicas', 
  restrictTo('admin'),
  pedidoController.obtenerEstadisticas
);

module.exports = router;
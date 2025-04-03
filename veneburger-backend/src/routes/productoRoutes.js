const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { protect, restrictTo } = require('../middleware/auth');
const { productoValidation, validar } = require('../middleware/validator');
const { uploadProducto } = require('../config/multer');

// Rutas públicas
router.get('/', productoController.listarProductos);
router.get('/:id', productoValidation.obtenerPorId, validar, productoController.obtenerProductoPorId);
router.get('/categoria/:categoriaId', productoController.listarProductosPorCategoria);

// Rutas protegidas (solo admin)
router.post('/', 
  protect, 
  restrictTo('admin'), 
  uploadProducto.single('imagen'),
  productoValidation.crear, 
  validar, 
  productoController.crearProducto
);

router.put('/:id', 
  protect, 
  restrictTo('admin'), 
  uploadProducto.single('imagen'),
  productoValidation.actualizar, 
  validar, 
  productoController.actualizarProducto
);

router.delete('/:id', 
  protect, 
  restrictTo('admin'), 
  productoValidation.eliminar, 
  validar, 
  productoController.eliminarProducto
);

router.patch('/:id/disponibilidad', 
  protect, 
  restrictTo('admin'), 
  productoController.cambiarDisponibilidad
);

module.exports = router;
const express = require('express');
const router = express.Router();
const mesaController = require('../controllers/mesaController');
const { protect, restrictTo } = require('../middleware/auth');
const { mesaValidation, validar } = require('../middleware/validator');

// Rutas protegidas (accesibles a todos los usuarios autenticados)
router.get('/', protect, mesaController.listarMesas);
router.get('/disponibilidad', protect, mesaController.obtenerDisponibilidad);
router.get('/:id', protect, mesaController.obtenerMesaPorId);

// Rutas protegidas (solo admin)
router.post('/',
  protect,
  restrictTo('admin'),
  mesaValidation.crear,
  validar,
  mesaController.crearMesa
);

router.put('/:id',
  protect,
  restrictTo('admin'),
  mesaValidation.actualizar,
  validar,
  mesaController.actualizarMesa
);

router.delete('/:id',
  protect,
  restrictTo('admin'),
  mesaValidation.actualizar,
  validar,
  mesaController.eliminarMesa
);

router.patch('/:id/estado',
  protect,
  restrictTo('admin'),
  mesaValidation.cambiarEstado,
  validar,
  mesaController.cambiarEstado
);

module.exports = router;
const express = require('express');
const router = express.Router();
const cremaController = require('../controllers/cremaController');
const { protect, restrictTo } = require('../middleware/auth');
const { cremaValidation, validar } = require('../middleware/validator');

// Rutas públicas
router.get('/', cremaController.listarCremas);
router.get('/:id', cremaController.obtenerCremaPorId);

// Rutas protegidas (solo admin)
router.post('/',
  protect,
  restrictTo('admin'),
  cremaValidation.crear,
  validar,
  cremaController.crearCrema
);

router.put('/:id',
  protect,
  restrictTo('admin'),
  cremaValidation.actualizar,
  validar,
  cremaController.actualizarCrema
);

router.delete('/:id',
  protect,
  restrictTo('admin'),
  cremaValidation.actualizar,
  validar,
  cremaController.eliminarCrema
);

router.patch('/:id/disponibilidad',
  protect,
  restrictTo('admin'),
  cremaValidation.actualizar,
  validar,
  cremaController.cambiarDisponibilidad
);

module.exports = router;
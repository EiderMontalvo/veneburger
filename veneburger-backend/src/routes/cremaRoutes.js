const express = require('express');
const router = express.Router();
const cremaController = require('../controllers/cremaController');
const { protect, restrictTo } = require('../middleware/auth');

// Rutas públicas
router.get('/', cremaController.listarCremas);
router.get('/:id', cremaController.obtenerCremaPorId);

// Rutas protegidas (solo admin)
router.post('/', 
  protect, 
  restrictTo('admin'), 
  cremaController.crearCrema
);

router.put('/:id', 
  protect, 
  restrictTo('admin'), 
  cremaController.actualizarCrema
);

router.delete('/:id', 
  protect, 
  restrictTo('admin'), 
  cremaController.eliminarCrema
);

router.patch('/:id/disponibilidad', 
  protect, 
  restrictTo('admin'), 
  cremaController.cambiarDisponibilidad
);

module.exports = router;
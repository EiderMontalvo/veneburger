const express = require('express');
const router = express.Router();
const mesaController = require('../controllers/mesaController');
const { protect, restrictTo } = require('../middleware/auth');

// Rutas protegidas (accesibles a todos los usuarios autenticados)
router.get('/', protect, mesaController.listarMesas);
router.get('/disponibilidad', protect, mesaController.obtenerDisponibilidad);
router.get('/:id', protect, mesaController.obtenerMesaPorId);

// Rutas protegidas (solo admin)
router.post('/', 
  protect, 
  restrictTo('admin'), 
  mesaController.crearMesa
);

router.put('/:id', 
  protect, 
  restrictTo('admin'), 
  mesaController.actualizarMesa
);

router.delete('/:id', 
  protect, 
  restrictTo('admin'), 
  mesaController.eliminarMesa
);

router.patch('/:id/estado', 
  protect, 
  restrictTo('admin'), 
  mesaController.cambiarEstado
);

module.exports = router;
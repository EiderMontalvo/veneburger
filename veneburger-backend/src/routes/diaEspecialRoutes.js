const express = require('express');
const router = express.Router();
const diaEspecialController = require('../controllers/diaEspecialController');
const { protect, restrictTo } = require('../middleware/auth');
const { diaEspecialValidation, validar } = require('../middleware/validator');

// Rutas públicas
router.get('/verificar/:fecha', diaEspecialController.verificarDiaEspecial);

// Rutas protegidas (listado accesible a todos los usuarios autenticados)
router.get('/', protect, diaEspecialController.listarDiasEspeciales);
router.get('/:id', protect, diaEspecialController.obtenerDiaEspecialPorId);

// Rutas protegidas (solo admin)
router.post('/', 
  protect, 
  restrictTo('admin'), 
  diaEspecialValidation.crear,
  validar,
  diaEspecialController.crearDiaEspecial
);

router.put('/:id', 
  protect, 
  restrictTo('admin'), 
  diaEspecialController.actualizarDiaEspecial
);

router.delete('/:id', 
  protect, 
  restrictTo('admin'), 
  diaEspecialController.eliminarDiaEspecial
);

module.exports = router;
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { protect, restrictTo } = require('../middleware/auth');
const { usuarioValidation, validar } = require('../middleware/validator');

// Rutas protegidas para administradores
router.get('/', 
  protect, 
  restrictTo('admin'), 
  usuarioController.listarUsuarios
);

router.post('/',
  protect,
  restrictTo('admin'),
  usuarioValidation.crear,
  validar,
  usuarioController.crearUsuario
);

// Rutas para obtener y actualizar cualquier usuario (admin)
// o el propio perfil (cliente/repartidor)
router.get('/:id',
  protect,
  usuarioValidation.actualizar,
  validar,
  usuarioController.obtenerUsuarioPorId
);

router.put('/:id',
  protect,
  usuarioValidation.actualizar,
  validar,
  usuarioController.actualizarUsuario
);

router.patch('/:id/password',
  protect,
  usuarioValidation.cambiarPassword,
  validar,
  usuarioController.cambiarPassword
);

router.delete('/:id', 
  protect, 
  restrictTo('admin'), 
  usuarioController.eliminarUsuario
);

module.exports = router;
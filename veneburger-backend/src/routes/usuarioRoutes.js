const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { protect, restrictTo } = require('../middleware/auth');

// Rutas protegidas para administradores
router.get('/', 
  protect, 
  restrictTo('admin'), 
  usuarioController.listarUsuarios
);

router.post('/', 
  protect, 
  restrictTo('admin'), 
  usuarioController.crearUsuario
);

// Rutas para obtener y actualizar cualquier usuario (admin)
// o el propio perfil (cliente/repartidor)
router.get('/:id', 
  protect, 
  usuarioController.obtenerUsuarioPorId
);

router.put('/:id', 
  protect, 
  usuarioController.actualizarUsuario
);

router.patch('/:id/password', 
  protect, 
  usuarioController.cambiarPassword
);

router.delete('/:id', 
  protect, 
  restrictTo('admin'), 
  usuarioController.eliminarUsuario
);

module.exports = router;
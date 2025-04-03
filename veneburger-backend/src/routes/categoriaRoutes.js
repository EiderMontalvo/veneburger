const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadCategoria } = require('../config/multer');
const { categoriaValidation, validar } = require('../middleware/validator');

// Rutas públicas
router.get('/', categoriaController.listarCategorias);
router.get('/:id', categoriaController.obtenerCategoriaPorId);

// Rutas protegidas (solo admin)
router.post('/', 
  protect, 
  restrictTo('admin'), 
  uploadCategoria.single('imagen'), 
  categoriaValidation.crear, 
  validar, 
  categoriaController.crearCategoria
);

router.put('/:id', 
  protect, 
  restrictTo('admin'), 
  uploadCategoria.single('imagen'), 
  categoriaValidation.actualizar, 
  validar, 
  categoriaController.actualizarCategoria
);

router.delete('/:id', 
  protect, 
  restrictTo('admin'), 
  categoriaController.eliminarCategoria
);

module.exports = router;
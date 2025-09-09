const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadValidation, validar } = require('../middleware/validator');

// Ruta para eliminar archivos
router.delete('/:type/:filename',
  protect,
  restrictTo('admin'),
  uploadValidation.eliminar,
  validar,
  uploadController.deleteFile
);

module.exports = router;
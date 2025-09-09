const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect, restrictTo } = require('../middleware/auth');

// Ruta para eliminar archivos
router.delete('/:type/:filename', protect, restrictTo('admin'), uploadController.deleteFile);

module.exports = router;
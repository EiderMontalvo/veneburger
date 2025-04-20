const expres = require('express');
const router = expres.Router();
const uploadController = require('../controllers/uploadController');
const { protect, restrictTo } = require('../middleware/auth');

//ruta para eliminar archivos
router.delete('/:type/:filename', protect, restrictTo('admin'), uploadController.deleteFile);
module.exports = router;
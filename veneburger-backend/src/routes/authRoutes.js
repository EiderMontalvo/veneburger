const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authValidation, validar } = require('../middleware/validator');

// Rutas públicas
router.post('/registro', authValidation.registro, validar, authController.registro);
router.post('/login', authValidation.login, validar, authController.login);

// Rutas protegidas
router.get('/perfil', protect, authController.obtenerPerfil);
router.patch('/actualizar-password', protect, authController.actualizarPassword);

module.exports = router;
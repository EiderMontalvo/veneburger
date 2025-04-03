const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const logger = require('../middleware/logger');

/**
 * Generar JWT token
 */
const generarToken = (id, rol) => {
  return jwt.sign(
    { id, rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

/**
 * Registrar un nuevo usuario
 */
exports.registro = async (req, res) => {
  try {
    // Verificar si el correo ya existe
    const usuarioExistente = await Usuario.findOne({
      where: { email: req.body.email }
    });

    if (usuarioExistente) {
      return res.status(400).json({
        status: 'error',
        message: 'Este correo electrónico ya está registrado'
      });
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Crear nuevo usuario
    const nuevoUsuario = await Usuario.create({
      nombre: req.body.nombre,
      apellidos: req.body.apellidos || null,
      email: req.body.email,
      telefono: req.body.telefono || null,
      password: hashedPassword,
      direccion: req.body.direccion || null,
      referencia_direccion: req.body.referencia_direccion || null,
      ciudad: req.body.ciudad || 'Lima',
      distrito: req.body.distrito || null,
      rol: 'cliente'
    });

    // Generar token
    const token = generarToken(nuevoUsuario.id, nuevoUsuario.rol);

    // Responder sin exponer la contraseña
    const usuarioData = nuevoUsuario.toJSON();
    delete usuarioData.password;

    return res.status(201).json({
      status: 'success',
      message: 'Usuario registrado correctamente',
      token,
      data: { usuario: usuarioData }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al registrar el usuario'
    });
  }
};

/**
 * Iniciar sesión
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const usuario = await Usuario.findOne({
      where: { email, activo: true }
    });

    // Si no existe o contraseña incorrecta
    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Correo electrónico o contraseña incorrectos'
      });
    }

    // Actualizar último login
    await usuario.update({ ultimo_login: new Date() });

    // Generar token
    const token = generarToken(usuario.id, usuario.rol);

    // Responder sin exponer la contraseña
    const usuarioData = usuario.toJSON();
    delete usuarioData.password;

    return res.status(200).json({
      status: 'success',
      message: 'Inicio de sesión exitoso',
      token,
      data: { usuario: usuarioData }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al iniciar sesión'
    });
  }
};

/**
 * Obtener perfil del usuario actual
 */
exports.obtenerPerfil = async (req, res) => {
  try {
    // Obtener usuario sin la contraseña
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: { exclude: ['password'] }
    });

    if (!usuario) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { usuario }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener el perfil'
    });
  }
};

/**
 * Actualizar contraseña
 */
exports.actualizarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;

    // Obtener usuario con contraseña
    const usuario = await Usuario.findByPk(req.usuario.id);

    // Verificar contraseña actual
    if (!(await bcrypt.compare(passwordActual, usuario.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'La contraseña actual es incorrecta'
      });
    }

    // Hash de la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordNueva, salt);

    // Actualizar contraseña
    await usuario.update({ password: hashedPassword });

    return res.status(200).json({
      status: 'success',
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al actualizar la contraseña'
    });
  }
};
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.generarToken = (id, rol) => {
  return jwt.sign(
    { id, rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

exports.verificarPassword = async (passwordPlana, passwordHash) => {
  return await bcrypt.compare(passwordPlana, passwordHash);
};

exports.hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};
const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware para validar resultados
 */
exports.validar = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      mensaje: 'Error de validación',
      errores: errores.array().map(err => ({
        campo: err.param,
        mensaje: err.msg
      }))
    });
  }
  next();
};

/**
 * Validaciones para autenticación
 */
exports.authValidation = {
  login: [
    body('email')
      .trim()
      .isEmail().withMessage('Ingrese un email válido')
      .normalizeEmail()
      .escape(),
    body('password')
      .notEmpty().withMessage('La contraseña es obligatoria')
      .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
      .escape()
  ],
  
  registro: [
    body('nombre')
      .trim()
      .notEmpty().withMessage('El nombre es obligatorio')
      .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres')
      .escape(),
    body('email')
      .trim()
      .isEmail().withMessage('Ingrese un email válido')
      .normalizeEmail()
      .escape(),
    body('password')
      .notEmpty().withMessage('La contraseña es obligatoria')
      .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
      .escape(),
    body('telefono')
      .optional()
      .trim()
      .isLength({ min: 7, max: 20 }).withMessage('El teléfono debe tener entre 7 y 20 caracteres')
      .escape(),
    body('direccion')
      .optional()
      .trim()
      .escape(),
    body('referencia_direccion')
      .optional()
      .trim()
      .escape(),
    body('ciudad')
      .optional()
      .trim()
      .escape(),
    body('distrito')
      .optional()
      .trim()
      .escape()
  ]
};

/**
 * Validaciones para productos
 */
exports.productoValidation = {
  crear: [
    body('nombre')
      .trim()
      .notEmpty().withMessage('El nombre es obligatorio')
      .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres')
      .escape(),
    body('descripcion')
      .optional()
      .trim()
      .escape(),
    body('precio')
      .notEmpty().withMessage('El precio es obligatorio')
      .isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor a 0')
      .escape(),
    body('categoria_id')
      .notEmpty().withMessage('La categoría es obligatoria')
      .isInt({ min: 1 }).withMessage('Categoría inválida')
      .escape(),
    body('tiempo_preparacion')
      .optional()
      .isInt({ min: 1 }).withMessage('El tiempo de preparación debe ser un número positivo')
      .escape(),
    body('disponible')
      .optional()
      .isBoolean().withMessage('Disponible debe ser un valor booleano')
      .escape(),
    body('destacado')
      .optional()
      .isBoolean().withMessage('Destacado debe ser un valor booleano')
      .escape()
  ],
  
  actualizar: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de producto inválido')
      .escape(),
    body('nombre')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres')
      .escape(),
    body('descripcion')
      .optional()
      .trim()
      .escape(),
    body('precio')
      .optional()
      .isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor a 0')
      .escape(),
    body('categoria_id')
      .optional()
      .isInt({ min: 1 }).withMessage('Categoría inválida')
      .escape(),
    body('tiempo_preparacion')
      .optional()
      .isInt({ min: 1 }).withMessage('El tiempo de preparación debe ser un número positivo')
      .escape(),
    body('disponible')
      .optional()
      .isBoolean().withMessage('Disponible debe ser un valor booleano')
      .escape(),
    body('destacado')
      .optional()
      .isBoolean().withMessage('Destacado debe ser un valor booleano')
      .escape()
  ],
  
  eliminar: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de producto inválido')
      .escape()
  ],
  
  obtenerPorId: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de producto inválido')
      .escape()
  ],
  
  listar: [
    query('categoria_id')
      .optional()
      .isInt({ min: 1 }).withMessage('Categoría inválida')
      .escape(),
    query('disponible')
      .optional()
      .isBoolean().withMessage('Disponible debe ser un valor booleano')
      .escape(),
    query('destacado')
      .optional()
      .isBoolean().withMessage('Destacado debe ser un valor booleano')
      .escape(),
    query('limite')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Límite inválido')
      .escape(),
    query('pagina')
      .optional()
      .isInt({ min: 1 }).withMessage('Página inválida')
      .escape()
  ]
};

/**
 * Validaciones para pedidos
 */
exports.pedidoValidation = {
  crear: [
    body('nombre_cliente')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
      .escape(),
    body('tipo')
      .notEmpty().withMessage('El tipo de pedido es obligatorio')
      .isIn(['local', 'delivery', 'para_llevar']).withMessage('Tipo de pedido inválido')
      .escape(),
    body('direccion_entrega')
      .if(body('tipo').equals('delivery'))
      .notEmpty().withMessage('La dirección de entrega es obligatoria para delivery')
      .trim()
      .escape(),
    body('telefono_contacto')
      .if(body('tipo').equals('delivery'))
      .notEmpty().withMessage('El teléfono de contacto es obligatorio para delivery')
      .trim()
      .escape(),
    body('productos')
      .notEmpty().withMessage('Debe incluir al menos un producto')
      .isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
    body('productos.*.producto_id')
      .notEmpty().withMessage('ID de producto obligatorio')
      .isInt({ min: 1 }).withMessage('ID de producto inválido')
      .escape(),
    body('productos.*.cantidad')
      .notEmpty().withMessage('Cantidad obligatoria')
      .isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1')
      .escape(),
    body('productos.*.cremas')
      .optional()
      .isArray().withMessage('Las cremas deben ser un array'),
    body('productos.*.cremas.*')
      .optional()
      .isInt({ min: 1 }).withMessage('ID de crema inválido')
      .escape(),
    body('metodo_pago_id')
      .notEmpty().withMessage('El método de pago es obligatorio')
      .isInt({ min: 1 }).withMessage('Método de pago inválido')
      .escape()
  ],
  
  actualizarEstado: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de pedido inválido')
      .escape(),
    body('estado')
      .notEmpty().withMessage('El estado es obligatorio')
      .isIn(['pendiente', 'preparando', 'listo', 'en_camino', 'entregado', 'cancelado']).withMessage('Estado inválido')
      .escape()
  ]
};

/**
 * Validaciones para categorías
 */
exports.categoriaValidation = {
  crear: [
    body('nombre')
      .trim()
      .notEmpty().withMessage('El nombre es obligatorio')
      .isLength({ min: 2, max: 60 }).withMessage('El nombre debe tener entre 2 y 60 caracteres')
      .escape(),
    body('codigo')
      .trim()
      .notEmpty().withMessage('El código es obligatorio')
      .isLength({ min: 2, max: 20 }).withMessage('El código debe tener entre 2 y 20 caracteres')
      .escape(),
    body('descripcion')
      .optional()
      .trim()
      .escape(),
    body('orden')
      .optional()
      .isInt({ min: 0 }).withMessage('El orden debe ser un número positivo')
      .escape()
  ],
  
  actualizar: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de categoría inválido')
      .escape(),
    body('nombre')
      .optional()
      .trim()
      .isLength({ min: 2, max: 60 }).withMessage('El nombre debe tener entre 2 y 60 caracteres')
      .escape(),
    body('codigo')
      .optional()
      .trim()
      .isLength({ min: 2, max: 20 }).withMessage('El código debe tener entre 2 y 20 caracteres')
      .escape(),
    body('descripcion')
      .optional()
      .trim()
      .escape(),
    body('orden')
      .optional()
      .isInt({ min: 0 }).withMessage('El orden debe ser un número positivo')
      .escape(),
    body('activo')
      .optional()
      .isBoolean().withMessage('Activo debe ser un valor booleano')
      .escape()
  ]
};

/**
 * Validaciones para días especiales
 */
exports.diaEspecialValidation = {
  crear: [
    body('fecha')
      .notEmpty().withMessage('La fecha es obligatoria')
      .isDate().withMessage('Formato de fecha inválido')
      .escape(),
    body('tipo')
      .notEmpty().withMessage('El tipo es obligatorio')
      .isIn(['cerrado', 'horario_especial']).withMessage('Tipo inválido')
      .escape(),
    body('hora_apertura')
      .if(body('tipo').equals('horario_especial'))
      .notEmpty().withMessage('La hora de apertura es obligatoria para horario especial')
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).withMessage('Formato de hora inválido (HH:MM:SS)')
      .escape(),
    body('hora_cierre')
      .if(body('tipo').equals('horario_especial'))
      .notEmpty().withMessage('La hora de cierre es obligatoria para horario especial')
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).withMessage('Formato de hora inválido (HH:MM:SS)')
      .escape()
  ]
};


/**
 * Validaciones para usuarios
 */
exports.usuarioValidation = {
  crear: [
    body('nombre')
      .trim()
      .notEmpty().withMessage('El nombre es obligatorio')
      .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres')
      .escape(),
    body('email')
      .trim()
      .isEmail().withMessage('Ingrese un email válido')
      .normalizeEmail()
      .escape(),
    body('password')
      .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
      .escape(),
    body('rol')
      .optional()
      .isIn(['admin', 'cliente', 'repartidor']).withMessage('Rol inválido')
      .escape()
  ],
  actualizar: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de usuario inválido')
      .escape(),
    body('nombre')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres')
      .escape(),
    body('email')
      .optional()
      .trim()
      .isEmail().withMessage('Ingrese un email válido')
      .normalizeEmail()
      .escape(),
    body('rol')
      .optional()
      .isIn(['admin', 'cliente', 'repartidor']).withMessage('Rol inválido')
      .escape()
  ],
  cambiarPassword: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de usuario inválido')
      .escape(),
    body('password')
      .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
      .escape()
  ]
};

/**
 * Validaciones para cremas
 */
exports.cremaValidation = {
  crear: [
    body('nombre')
      .trim()
      .notEmpty().withMessage('El nombre es obligatorio')
      .isLength({ min: 2, max: 60 }).withMessage('El nombre debe tener entre 2 y 60 caracteres')
      .escape(),
    body('precio')
      .notEmpty().withMessage('El precio es obligatorio')
      .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo')
      .escape(),
    body('disponible')
      .optional()
      .isBoolean().withMessage('Disponible debe ser booleano')
      .escape()
  ],
  actualizar: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de crema inválido')
      .escape(),
    body('nombre')
      .optional()
      .trim()
      .isLength({ min: 2, max: 60 }).withMessage('El nombre debe tener entre 2 y 60 caracteres')
      .escape(),
    body('precio')
      .optional()
      .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo')
      .escape(),
    body('disponible')
      .optional()
      .isBoolean().withMessage('Disponible debe ser booleano')
      .escape()
  ]
};

/**
 * Validaciones para mesas
 */
exports.mesaValidation = {
  crear: [
    body('numero')
      .notEmpty().withMessage('El número es obligatorio')
      .isInt({ min: 1 }).withMessage('El número debe ser un entero positivo')
      .escape(),
    body('capacidad')
      .optional()
      .isInt({ min: 1 }).withMessage('La capacidad debe ser un entero positivo')
      .escape(),
    body('ubicacion')
      .optional()
      .trim()
      .escape()
  ],
  actualizar: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de mesa inválido')
      .escape(),
    body('numero')
      .optional()
      .isInt({ min: 1 }).withMessage('El número debe ser un entero positivo')
      .escape(),
    body('capacidad')
      .optional()
      .isInt({ min: 1 }).withMessage('La capacidad debe ser un entero positivo')
      .escape(),
    body('ubicacion')
      .optional()
      .trim()
      .escape()
  ],
  cambiarEstado: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de mesa inválido')
      .escape(),
    body('estado')
      .notEmpty().withMessage('El estado es obligatorio')
      .isIn(['disponible', 'ocupada', 'reservada', 'mantenimiento']).withMessage('Estado de mesa inválido')
      .escape()
  ]
};

/**
 * Validaciones para subida de archivos
 */
exports.uploadValidation = {
  eliminar: [
    param('type')
      .trim()
      .isIn(['productos', 'categorias', 'comprobantes']).withMessage('Tipo inválido')
      .escape(),
    param('filename')
      .trim()
      .matches(/^[\w.-]+$/).withMessage('Nombre de archivo inválido')
      .escape()
  ]
};

module.exports = exports;

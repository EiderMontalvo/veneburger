const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Función para crear directorios si no existen
const crearDirectorio = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Directorios de almacenamiento
const directorios = {
  productos: path.join(process.env.UPLOAD_PATH || './uploads', 'productos'),
  categorias: path.join(process.env.UPLOAD_PATH || './uploads', 'categorias'),
  comprobantes: path.join(process.env.UPLOAD_PATH || './uploads', 'comprobantes')
};

// Crear directorios
Object.values(directorios).forEach(crearDirectorio);

// Filtro de archivos para permitir solo imágenes
const fileFilter = (req, file, cb) => {
  // Verificar MIME type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('El archivo debe ser una imagen (jpeg, png, gif, webp)'), false);
  }
};

// Configuración de almacenamiento para productos
const productoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, directorios.productos);
  },
  filename: (req, file, cb) => {
    // Generar nombre único con id y timestamp
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `producto_${uniqueSuffix}${extension}`);
  }
});

// Configuración de almacenamiento para categorías
const categoriaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, directorios.categorias);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `categoria_${uniqueSuffix}${extension}`);
  }
});

// Configuración de almacenamiento para comprobantes
const comprobanteStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, directorios.comprobantes);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `comprobante_${uniqueSuffix}${extension}`);
  }
});

// Exportar configuraciones
exports.uploadProducto = multer({
  storage: productoStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

exports.uploadCategoria = multer({
  storage: categoriaStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

exports.uploadComprobante = multer({
  storage: comprobanteStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});
const fs = require('fs');
const path = require('path');

exports.eliminarArchivo = (tipo, nombreArchivo) => {
  return new Promise((resolve) => {
    // No eliminar archivo por defecto
    if (!nombreArchivo || nombreArchivo === 'default.png') {
      return resolve(false);
    }

    const baseDir = path.resolve(__dirname, `../../uploads/${tipo}`);
    const rutaArchivo = path.resolve(baseDir, nombreArchivo);

    // Prevenir path traversal asegurando que el archivo esté dentro del directorio permitido
    if (!rutaArchivo.startsWith(baseDir + path.sep)) {
      return resolve(false);
    }

    if (fs.existsSync(rutaArchivo)) {
      fs.unlink(rutaArchivo, (err) => {
        if (err) {
          console.error(`Error al eliminar archivo ${tipo}/${nombreArchivo}:`, err);
          return resolve(false);
        }
        return resolve(true);
      });
    } else {
      return resolve(false);
    }
  });
};

/**
 * Endpoint para eliminar un archivo
 */
exports.deleteFile = async (req, res) => {
  const { type, filename } = req.params;
  const allowedTypes = ['productos', 'categorias', 'comprobantes'];
  
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({
      status: 'error',
      message: 'Tipo de archivo no válido'
    });
  }
  
  // Sanitizar nombre de archivo para evitar path traversal
  const sanitizedFilename = path.basename(filename);
  
  if (sanitizedFilename === 'default.png') {
    return res.status(400).json({
      status: 'error',
      message: 'No se puede eliminar el archivo por defecto'
    });
  }
  
  const resultado = await exports.eliminarArchivo(type, sanitizedFilename);
  
  if (resultado) {
    return res.status(200).json({
      status: 'success',
      message: 'Archivo eliminado correctamente'
    });
  } else {
    return res.status(404).json({
      status: 'error',
      message: 'No se pudo eliminar el archivo o no existe'
    });
  }
};
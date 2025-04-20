const { Categoria, Producto } = require('../models');
const { Op } = require('sequelize');
const uploadController = require('./uploadController');

/**
 * Obtener todas las categorías
 */
exports.listarCategorias = async (req, res) => {
  try {
    const { activo } = req.query;
    
    const whereClause = {};
    
    // Si se especifica el parámetro activo, filtramos por él
    if (activo !== undefined) {
      whereClause.activo = activo === 'true';
    }
    
    const categorias = await Categoria.findAll({
      where: whereClause,
      order: [
        ['orden', 'ASC'],
        ['nombre', 'ASC']
      ]
    });
    
    return res.status(200).json({
      status: 'success',
      results: categorias.length,
      data: { categorias }
    });
  } catch (error) {
    console.error('Error al listar categorías:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener las categorías'
    });
  }
};

/**
 * Obtener categoría por ID
 */
exports.obtenerCategoriaPorId = async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id, {
      include: [
        {
          model: Producto,
          as: 'productos',
          where: { disponible: true },
          required: false
        }
      ]
    });
    
    if (!categoria) {
      return res.status(404).json({
        status: 'error',
        message: 'Categoría no encontrada'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: { categoria }
    });
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener la categoría'
    });
  }
};

/**
 * Crear nueva categoría
 */
exports.crearCategoria = async (req, res) => {
  try {
    // Verificar si ya existe una categoría con el mismo código
    const categoriaExistente = await Categoria.findOne({
      where: { codigo: req.body.codigo }
    });
    
    if (categoriaExistente) {
      return res.status(400).json({
        status: 'error',
        message: 'Ya existe una categoría con este código'
      });
    }
    
    // Crear la categoría
    const nuevaCategoria = await Categoria.create({
      nombre: req.body.nombre,
      codigo: req.body.codigo,
      descripcion: req.body.descripcion,
      orden: req.body.orden || 0,
      imagen: req.file ? req.file.filename : null,
      activo: true,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date()
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'Categoría creada correctamente',
      data: { categoria: nuevaCategoria }
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al crear la categoría'
    });
  }
};

/**
 * Actualizar categoría
 */
exports.actualizarCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    
    if (!categoria) {
      return res.status(404).json({
        status: 'error',
        message: 'Categoría no encontrada'
      });
    }
    
    // Si se actualiza el código, verificar que no exista ya
    if (req.body.codigo && req.body.codigo !== categoria.codigo) {
      const categoriaExistente = await Categoria.findOne({
        where: { 
          codigo: req.body.codigo,
          id: { [Op.ne]: req.params.id }
        }
      });
      
      if (categoriaExistente) {
        return res.status(400).json({
          status: 'error',
          message: 'Ya existe otra categoría con este código'
        });
      }
    }
    
    // Guardar la imagen anterior en caso de que se suba una nueva
    const imagenAnterior = categoria.imagen;
    
    // Actualizar categoría
    await categoria.update({
      nombre: req.body.nombre !== undefined ? req.body.nombre : categoria.nombre,
      codigo: req.body.codigo !== undefined ? req.body.codigo : categoria.codigo,
      descripcion: req.body.descripcion !== undefined ? req.body.descripcion : categoria.descripcion,
      orden: req.body.orden !== undefined ? req.body.orden : categoria.orden,
      imagen: req.file ? req.file.filename : categoria.imagen,
      activo: req.body.activo !== undefined ? req.body.activo : categoria.activo,
      fecha_actualizacion: new Date()
    });
    
    // Si se subió una nueva imagen, eliminar la anterior usando uploadController
    if (req.file && imagenAnterior) {
      await uploadController.eliminarArchivo('categorias', imagenAnterior);
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Categoría actualizada correctamente',
      data: { categoria }
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al actualizar la categoría'
    });
  }
};

/**
 * Eliminar categoría
 */
exports.eliminarCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    
    if (!categoria) {
      return res.status(404).json({
        status: 'error',
        message: 'Categoría no encontrada'
      });
    }
    
    // Verificar si hay productos en esta categoría
    const productosCount = await Producto.count({
      where: { categoria_id: req.params.id }
    });
    
    if (productosCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No se puede eliminar la categoría porque tiene productos asociados'
      });
    }
    
    // Guardar nombre de imagen para eliminarla después
    const imagen = categoria.imagen;
    
    // Eliminar categoría
    await categoria.destroy();
    
    // Eliminar imagen usando uploadController si existe
    if (imagen) {
      await uploadController.eliminarArchivo('categorias', imagen);
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Categoría eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al eliminar la categoría'
    });
  }
};
const { Producto, Categoria, DetallePedido } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

/**
 * Listar productos con filtros opcionales
 */
exports.listarProductos = async (req, res) => {
  try {
    const { 
      categoria_id, 
      disponible, 
      destacado, 
      nombre,
      limite = 50,
      pagina = 1
    } = req.query;
    
    const whereClause = {};
    
    // Aplicar filtros si se proporcionan
    if (categoria_id) {
      whereClause.categoria_id = categoria_id;
    }
    
    if (disponible !== undefined) {
      whereClause.disponible = disponible === 'true';
    }
    
    if (destacado !== undefined) {
      whereClause.destacado = destacado === 'true';
    }
    
    if (nombre) {
      whereClause.nombre = { [Op.like]: `%${nombre}%` };
    }
    
    // Calcular offset para paginación
    const offset = (pagina - 1) * limite;
    
    // Obtener productos con paginación
    const { count, rows: productos } = await Producto.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Categoria,
          as: 'categoria',
          attributes: ['id', 'nombre', 'codigo']
        }
      ],
      order: [
        ['destacado', 'DESC'],
        ['nombre', 'ASC']
      ],
      limit: parseInt(limite),
      offset: offset
    });
    
    return res.status(200).json({
      status: 'success',
      results: productos.length,
      pagination: {
        count,
        paginaActual: parseInt(pagina),
        totalPaginas: Math.ceil(count / limite)
      },
      data: { productos }
    });
  } catch (error) {
    console.error('Error al listar productos:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener los productos'
    });
  }
};

/**
 * Obtener producto por ID
 */
exports.obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id, {
      include: [
        {
          model: Categoria,
          as: 'categoria'
        }
      ]
    });
    
    if (!producto) {
      return res.status(404).json({
        status: 'error',
        message: 'Producto no encontrado'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: { producto }
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener el producto'
    });
  }
};

/**
 * Listar productos por categoría
 */
exports.listarProductosPorCategoria = async (req, res) => {
  try {
    const { categoriaId } = req.params;
    const { disponible } = req.query;
    
    // Verificar si la categoría existe
    const categoria = await Categoria.findByPk(categoriaId);
    
    if (!categoria) {
      return res.status(404).json({
        status: 'error',
        message: 'Categoría no encontrada'
      });
    }
    
    const whereClause = { categoria_id: categoriaId };
    
    if (disponible !== undefined) {
      whereClause.disponible = disponible === 'true';
    }
    
    const productos = await Producto.findAll({
      where: whereClause,
      order: [
        ['destacado', 'DESC'],
        ['nombre', 'ASC']
      ]
    });
    
    return res.status(200).json({
      status: 'success',
      results: productos.length,
      data: { 
        categoria,
        productos 
      }
    });
  } catch (error) {
    console.error('Error al listar productos por categoría:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener los productos de la categoría'
    });
  }
};

/**
 * Crear producto
 */
exports.crearProducto = async (req, res) => {
  try {
    // Verificar si la categoría existe
    const categoriaExiste = await Categoria.findByPk(req.body.categoria_id);
    
    if (!categoriaExiste) {
      return res.status(404).json({
        status: 'error',
        message: 'La categoría seleccionada no existe'
      });
    }
    
    // Si se proporciona un código, verificar que sea único
    if (req.body.codigo) {
      const productoExistente = await Producto.findOne({
        where: { codigo: req.body.codigo }
      });
      
      if (productoExistente) {
        return res.status(400).json({
          status: 'error',
          message: 'Ya existe un producto con este código'
        });
      }
    }
    
    // Crear el producto
    const nuevoProducto = await Producto.create({
      categoria_id: req.body.categoria_id,
      codigo: req.body.codigo,
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      precio: req.body.precio,
      tiempo_preparacion: req.body.tiempo_preparacion || 15,
      imagen: req.file ? req.file.filename : 'default.png',
      disponible: req.body.disponible !== undefined ? req.body.disponible : true,
      destacado: req.body.destacado !== undefined ? req.body.destacado : false,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date()
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'Producto creado correctamente',
      data: { producto: nuevoProducto }
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al crear el producto'
    });
  }
};

/**
 * Actualizar producto
 */
exports.actualizarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    
    if (!producto) {
      return res.status(404).json({
        status: 'error',
        message: 'Producto no encontrado'
      });
    }
    
    // Si se actualiza la categoría, verificar que exista
    if (req.body.categoria_id) {
      const categoriaExiste = await Categoria.findByPk(req.body.categoria_id);
      
      if (!categoriaExiste) {
        return res.status(404).json({
          status: 'error',
          message: 'La categoría seleccionada no existe'
        });
      }
    }
    
    // Si se actualiza el código, verificar que sea único
    if (req.body.codigo && req.body.codigo !== producto.codigo) {
      const productoExistente = await Producto.findOne({
        where: { 
          codigo: req.body.codigo,
          id: { [Op.ne]: req.params.id }
        }
      });
      
      if (productoExistente) {
        return res.status(400).json({
          status: 'error',
          message: 'Ya existe otro producto con este código'
        });
      }
    }
    
    // Guardar la imagen anterior en caso de que se suba una nueva
    const imagenAnterior = producto.imagen;
    
    // Actualizar producto
    await producto.update({
      categoria_id: req.body.categoria_id !== undefined ? req.body.categoria_id : producto.categoria_id,
      codigo: req.body.codigo !== undefined ? req.body.codigo : producto.codigo,
      nombre: req.body.nombre !== undefined ? req.body.nombre : producto.nombre,
      descripcion: req.body.descripcion !== undefined ? req.body.descripcion : producto.descripcion,
      precio: req.body.precio !== undefined ? req.body.precio : producto.precio,
      tiempo_preparacion: req.body.tiempo_preparacion !== undefined ? req.body.tiempo_preparacion : producto.tiempo_preparacion,
      imagen: req.file ? req.file.filename : producto.imagen,
      disponible: req.body.disponible !== undefined ? req.body.disponible : producto.disponible,
      destacado: req.body.destacado !== undefined ? req.body.destacado : producto.destacado,
      fecha_actualizacion: new Date()
    });
    
    // Si se subió una nueva imagen y la anterior no es la default, eliminar la anterior
    if (req.file && imagenAnterior && imagenAnterior !== 'default.png') {
      const rutaImagenAnterior = path.join(__dirname, '../../uploads/productos', imagenAnterior);
      if (fs.existsSync(rutaImagenAnterior)) {
        fs.unlinkSync(rutaImagenAnterior);
      }
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Producto actualizado correctamente',
      data: { producto }
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al actualizar el producto'
    });
  }
};

/**
 * Eliminar producto
 */
exports.eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    
    if (!producto) {
      return res.status(404).json({
        status: 'error',
        message: 'Producto no encontrado'
      });
    }
    
    // Verificar si el producto está en algún pedido
    const pedidosCount = await DetallePedido.count({
      where: { producto_id: req.params.id }
    });
    
    if (pedidosCount > 0) {
      // Si está en pedidos, mejor desactivar que eliminar
      await producto.update({
        disponible: false,
        fecha_actualizacion: new Date()
      });
      
      return res.status(200).json({
        status: 'success',
        message: 'El producto está en pedidos existentes. Se ha marcado como no disponible.'
      });
    }
    
    // Guardar nombre de imagen para eliminarla después
    const imagen = producto.imagen;
    
    // Eliminar producto
    await producto.destroy();
    
    // Eliminar imagen si existe y no es la default
    if (imagen && imagen !== 'default.png') {
      const rutaImagen = path.join(__dirname, '../../uploads/productos', imagen);
      if (fs.existsSync(rutaImagen)) {
        fs.unlinkSync(rutaImagen);
      }
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Producto eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al eliminar el producto'
    });
  }
};

/**
 * Cambiar disponibilidad del producto
 */
exports.cambiarDisponibilidad = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    
    if (!producto) {
      return res.status(404).json({
        status: 'error',
        message: 'Producto no encontrado'
      });
    }
    
    // Invertir disponibilidad
    await producto.update({
      disponible: !producto.disponible,
      fecha_actualizacion: new Date()
    });
    
    return res.status(200).json({
      status: 'success',
      message: `Producto marcado como ${producto.disponible ? 'disponible' : 'no disponible'}`,
      data: { disponible: producto.disponible }
    });
  } catch (error) {
    console.error('Error al cambiar disponibilidad:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al cambiar disponibilidad del producto'
    });
  }
};
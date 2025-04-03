const { 
    Pedido, 
    DetallePedido, 
    DetallePedidoCrema, 
    Producto, 
    Crema, 
    Usuario, 
    Mesa, 
    MetodoPago,
    Pago,
    Categoria
  } = require('../models');
  const { Op } = require('sequelize');
  const sequelize = require('../config/database');
  const { generarCodigoPedido } = require('../utils/helpers');
  
  /**
   * Listar pedidos con filtros opcionales
   */
  exports.listarPedidos = async (req, res) => {
    try {
      const { 
        estado, 
        tipo, 
        desde, 
        hasta, 
        usuario_id,
        repartidor_id,
        mesa_id,
        limite = 50,
        pagina = 1
      } = req.query;
      
      const whereClause = {};
      
      // Aplicar filtros si se proporcionan
      if (estado) {
        whereClause.estado = estado;
      }
      
      if (tipo) {
        whereClause.tipo = tipo;
      }
      
      if (desde && hasta) {
        whereClause.fecha_pedido = {
          [Op.between]: [desde, hasta]
        };
      } else if (desde) {
        whereClause.fecha_pedido = {
          [Op.gte]: desde
        };
      } else if (hasta) {
        whereClause.fecha_pedido = {
          [Op.lte]: hasta
        };
      }
      
      if (usuario_id) {
        whereClause.usuario_id = usuario_id;
      }
      
      if (repartidor_id) {
        whereClause.repartidor_id = repartidor_id;
      }
      
      if (mesa_id) {
        whereClause.mesa_id = mesa_id;
      }
      
      // Si el usuario no es admin, solo puede ver sus propios pedidos
      if (req.usuario && req.usuario.rol === 'cliente') {
        whereClause.usuario_id = req.usuario.id;
      }
      
      // Si el usuario es repartidor, solo puede ver los pedidos asignados a él
      if (req.usuario && req.usuario.rol === 'repartidor') {
        whereClause.repartidor_id = req.usuario.id;
      }
      
      // Calcular offset para paginación
      const offset = (pagina - 1) * limite;
      
      // Obtener pedidos con paginación
      const { count, rows: pedidos } = await Pedido.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'apellidos', 'email', 'telefono']
          },
          {
            model: Usuario,
            as: 'repartidor',
            attributes: ['id', 'nombre', 'apellidos', 'telefono']
          },
          {
            model: Mesa,
            as: 'mesa',
            attributes: ['id', 'numero', 'capacidad']
          }
        ],
        order: [['fecha_pedido', 'DESC']],
        limit: parseInt(limite),
        offset: offset
      });
      
      return res.status(200).json({
        status: 'success',
        results: pedidos.length,
        pagination: {
          count,
          paginaActual: parseInt(pagina),
          totalPaginas: Math.ceil(count / limite)
        },
        data: { pedidos }
      });
    } catch (error) {
      console.error('Error al listar pedidos:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error al obtener los pedidos'
      });
    }
  };
  
  /**
   * Obtener pedido por ID con detalles completos
   */
  exports.obtenerPedidoPorId = async (req, res) => {
    try {
      const pedido = await Pedido.findByPk(req.params.id, {
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'apellidos', 'email', 'telefono', 'direccion']
          },
          {
            model: Usuario,
            as: 'repartidor',
            attributes: ['id', 'nombre', 'apellidos', 'telefono']
          },
          {
            model: Mesa,
            as: 'mesa',
            attributes: ['id', 'numero', 'capacidad', 'ubicacion']
          },
          {
            model: DetallePedido,
            as: 'detalles',
            include: [
              {
                model: Producto,
                as: 'producto',
                include: [
                  {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['id', 'nombre']
                  }
                ]
              },
              {
                model: DetallePedidoCrema,
                as: 'cremas',
                include: [
                  {
                    model: Crema,
                    as: 'crema'
                  }
                ]
              }
            ]
          },
          {
            model: Pago,
            as: 'pagos',
            include: [
              {
                model: MetodoPago,
                as: 'metodo_pago'
              }
            ]
          }
        ]
      });
      
      if (!pedido) {
        return res.status(404).json({
          status: 'error',
          message: 'Pedido no encontrado'
        });
      }
      
      // Verificar permisos de acceso
      if (
        req.usuario.rol === 'cliente' && 
        pedido.usuario_id !== req.usuario.id
      ) {
        return res.status(403).json({
          status: 'error',
          message: 'No tienes permiso para ver este pedido'
        });
      }
      
      if (
        req.usuario.rol === 'repartidor' && 
        pedido.repartidor_id !== req.usuario.id &&
        pedido.tipo === 'delivery'
      ) {
        return res.status(403).json({
          status: 'error',
          message: 'No tienes permiso para ver este pedido'
        });
      }
      
      return res.status(200).json({
        status: 'success',
        data: { pedido }
      });
    } catch (error) {
      console.error('Error al obtener pedido:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error al obtener el pedido'
      });
    }
  };
  
  /**
   * Crear nuevo pedido
   */
  exports.crearPedido = async (req, res) => {
    // Iniciar transacción
    const transaction = await sequelize.transaction();
    
    try {
      const {
        tipo,
        mesa_id,
        productos,
        nombre_cliente,
        telefono_contacto,
        direccion_entrega,
        referencia_direccion,
        distrito,
        ciudad,
        email_contacto,
        notas,
        metodo_pago_id
      } = req.body;
      
      // Validaciones específicas según el tipo de pedido
      if (tipo === 'delivery' && (!direccion_entrega || !telefono_contacto)) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: 'Para pedidos a domicilio se requiere dirección y teléfono'
        });
      }
      
      if (tipo === 'local' && !mesa_id) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: 'Para pedidos en local se requiere indicar la mesa'
        });
      }
      
      // Validar que haya productos
      if (!productos || !productos.length) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: 'El pedido debe incluir al menos un producto'
        });
      }
      
      // Verificar el método de pago
      const metodoPago = await MetodoPago.findByPk(metodo_pago_id);
      if (!metodoPago || !metodoPago.activo) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: 'El método de pago seleccionado no está disponible'
        });
      }
      
      // Verificar disponibilidad de mesa si es pedido en local
      if (tipo === 'local' && mesa_id) {
        const mesa = await Mesa.findByPk(mesa_id);
        
        if (!mesa) {
          await transaction.rollback();
          return res.status(404).json({
            status: 'error',
            message: 'La mesa seleccionada no existe'
          });
        }
        
        if (mesa.estado !== 'disponible') {
          await transaction.rollback();
          return res.status(400).json({
            status: 'error',
            message: 'La mesa seleccionada no está disponible'
          });
        }
        
        // Marcar mesa como ocupada
        await mesa.update({ 
          estado: 'ocupada',
          fecha_actualizacion: new Date()
        }, { transaction });
      }
      
      // Calcular totales y validar productos
      let subtotal = 0;
      const detallesValidados = [];
      
      for (const item of productos) {
        // Verificar si el producto existe y está disponible
        const producto = await Producto.findByPk(item.producto_id);
        
        if (!producto) {
          await transaction.rollback();
          return res.status(404).json({
            status: 'error',
            message: `El producto con ID ${item.producto_id} no existe`
          });
        }
        
        if (!producto.disponible) {
          await transaction.rollback();
          return res.status(400).json({
            status: 'error',
            message: `El producto ${producto.nombre} no está disponible`
          });
        }
        
        // Calcular subtotal del item
        const precioUnitario = parseFloat(producto.precio);
        const cantidad = parseInt(item.cantidad);
        const subtotalItem = precioUnitario * cantidad;
        
        // Preparar detalle
        const detalle = {
          producto_id: producto.id,
          cantidad: cantidad,
          precio_unitario: precioUnitario,
          subtotal: subtotalItem,
          notas: item.notas || null,
          cremas: []
        };
        
        // Verificar cremas si existen
        if (item.cremas && item.cremas.length > 0) {
          for (const cremaId of item.cremas) {
            // Verificar si la crema existe y está disponible
            const crema = await Crema.findByPk(cremaId);
            
            if (!crema) {
              await transaction.rollback();
              return res.status(404).json({
                status: 'error',
                message: `La crema con ID ${cremaId} no existe`
              });
            }
            
            if (!crema.disponible) {
              await transaction.rollback();
              return res.status(400).json({
                status: 'error',
                message: `La crema ${crema.nombre} no está disponible`
              });
            }
            
            detalle.cremas.push({
              crema_id: crema.id,
              cantidad: 1
            });
          }
        }
        
        detallesValidados.push(detalle);
        subtotal += subtotalItem;
      }
      
      // Calcular costo de envío para delivery
      const costoEnvio = tipo === 'delivery' ? 5.00 : 0;
      
      // Calcular total
      const total = subtotal + costoEnvio;
      
      // Generar código único para el pedido
      const codigo = await generarCodigoPedido();
      
      // Crear el pedido
      const nuevoPedido = await Pedido.create({
        codigo,
        usuario_id: req.usuario ? req.usuario.id : null,
        mesa_id: tipo === 'local' ? mesa_id : null,
        nombre_cliente: nombre_cliente || (req.usuario ? req.usuario.nombre : null),
        tipo,
        estado: 'pendiente',
        subtotal,
        descuento: 0,
        costo_envio: costoEnvio,
        total,
        direccion_entrega,
        referencia_direccion,
        distrito,
        ciudad: ciudad || 'Lima',
        telefono_contacto: telefono_contacto || (req.usuario ? req.usuario.telefono : null),
        email_contacto: email_contacto || (req.usuario ? req.usuario.email : null),
        tiempo_estimado_entrega: tipo === 'delivery' ? 45 : 30,
        fecha_pedido: new Date(),
        notas,
        origen: 'web'
      }, { transaction });
      
      // Crear detalles del pedido
      for (const detalle of detallesValidados) {
        const nuevoDetalle = await DetallePedido.create({
          pedido_id: nuevoPedido.id,
          producto_id: detalle.producto_id,
          cantidad: detalle.cantidad,
          precio_unitario: detalle.precio_unitario,
          descuento_unitario: 0,
          subtotal: detalle.subtotal,
          notas: detalle.notas
        }, { transaction });
        
        // Crear relaciones con cremas
        for (const crema of detalle.cremas) {
          await DetallePedidoCrema.create({
            detalle_pedido_id: nuevoDetalle.id,
            crema_id: crema.crema_id,
            cantidad: crema.cantidad
          }, { transaction });
        }
      }
      
      // Crear registro de pago
      await Pago.create({
        pedido_id: nuevoPedido.id,
        metodo_pago_id,
        monto: total,
        estado: metodoPago.requiere_confirmacion ? 'pendiente' : 'completado',
        fecha_pago: new Date(),
        fecha_confirmacion: metodoPago.requiere_confirmacion ? null : new Date()
      }, { transaction });
      
      // Confirmar transacción
      await transaction.commit();
      
      return res.status(201).json({
        status: 'success',
        message: 'Pedido creado correctamente',
        data: { 
          pedido: {
            id: nuevoPedido.id,
            codigo: nuevoPedido.codigo,
            total: nuevoPedido.total,
            estado: nuevoPedido.estado,
            fecha_pedido: nuevoPedido.fecha_pedido,
            tiempo_estimado_entrega: nuevoPedido.tiempo_estimado_entrega
          }
        }
      });
    } catch (error) {
      // Revertir transacción en caso de error
      await transaction.rollback();
      console.error('Error al crear pedido:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error al crear el pedido'
      });
    }
  };
  
  /**
   * Actualizar estado del pedido
   */
  exports.actualizarEstadoPedido = async (req, res) => {
    // Iniciar transacción
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { estado, motivo_cancelacion, repartidor_id } = req.body;
      
      const pedido = await Pedido.findByPk(id);
      
      if (!pedido) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Pedido no encontrado'
        });
      }
      
      // Validaciones según el estado actual
      if (pedido.estado === 'entregado' || pedido.estado === 'cancelado') {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: `No se puede actualizar un pedido en estado ${pedido.estado}`
        });
      }
      
      // Validar transiciones de estado
      const estadosValidos = {
        pendiente: ['preparando', 'cancelado'],
        preparando: ['listo', 'cancelado'],
        listo: ['en_camino', 'entregado', 'cancelado'],
        en_camino: ['entregado', 'cancelado']
      };
      
      if (!estadosValidos[pedido.estado] || !estadosValidos[pedido.estado].includes(estado)) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: `No se puede cambiar de estado ${pedido.estado} a ${estado}`
        });
      }
      
      // Si se cancela, verificar motivo
      if (estado === 'cancelado' && !motivo_cancelacion) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: 'Se requiere motivo de cancelación'
        });
      }
      
      // Si pasa a en_camino, verificar repartidor
      if (estado === 'en_camino') {
        if (!repartidor_id) {
          await transaction.rollback();
          return res.status(400).json({
            status: 'error',
            message: 'Se requiere asignar un repartidor'
          });
        }
        
        const repartidor = await Usuario.findOne({
          where: {
            id: repartidor_id,
            rol: 'repartidor',
            activo: true
          }
        });
        
        if (!repartidor) {
          await transaction.rollback();
          return res.status(400).json({
            status: 'error',
            message: 'El repartidor seleccionado no existe o no está activo'
          });
        }
      }
      
      // Campos a actualizar
      const actualizaciones = {
        estado,
        fecha_actualizacion: new Date()
      };
      
      // Campos específicos según el nuevo estado
      switch (estado) {
        case 'preparando':
          actualizaciones.fecha_preparacion = new Date();
          break;
        case 'listo':
          actualizaciones.fecha_listo = new Date();
          break;
        case 'en_camino':
          actualizaciones.fecha_en_camino = new Date();
          actualizaciones.repartidor_id = repartidor_id;
          break;
        case 'entregado':
          actualizaciones.fecha_entrega = new Date();
          break;
        case 'cancelado':
          actualizaciones.fecha_cancelacion = new Date();
          actualizaciones.motivo_cancelacion = motivo_cancelacion;
          break;
      }
      
      // Actualizar el pedido
      await pedido.update(actualizaciones, { transaction });
      
      // Si se entrega o cancela y el pedido era en local, liberar la mesa
      if ((estado === 'entregado' || estado === 'cancelado') && pedido.tipo === 'local' && pedido.mesa_id) {
        const mesa = await Mesa.findByPk(pedido.mesa_id);
        if (mesa) {
          await mesa.update({ 
            estado: 'disponible',
            fecha_actualizacion: new Date()
          }, { transaction });
        }
      }
      
      // Confirmar transacción
      await transaction.commit();
      
      return res.status(200).json({
        status: 'success',
        message: `Pedido actualizado a estado: ${estado}`,
        data: { 
          pedido: {
            id: pedido.id,
            codigo: pedido.codigo,
            estado
          }
        }
      });
    } catch (error) {
      // Revertir transacción en caso de error
      await transaction.rollback();
      console.error('Error al actualizar estado del pedido:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error al actualizar el estado del pedido'
      });
    }
  };
  
  /**
   * Calificar pedido
   */
  exports.calificarPedido = async (req, res) => {
    try {
      const { id } = req.params;
      const { calificacion, comentario_calificacion } = req.body;
      
      // Validar calificación
      if (calificacion < 1 || calificacion > 5) {
        return res.status(400).json({
          status: 'error',
          message: 'La calificación debe estar entre 1 y 5'
        });
      }
      
      const pedido = await Pedido.findByPk(id);
      
      if (!pedido) {
        return res.status(404).json({
          status: 'error',
          message: 'Pedido no encontrado'
        });
      }
      
      // Verificar que el usuario es el dueño del pedido
      if (req.usuario.rol === 'cliente' && pedido.usuario_id !== req.usuario.id) {
        return res.status(403).json({
          status: 'error',
          message: 'No tienes permiso para calificar este pedido'
        });
      }
      
      // Verificar que el pedido está entregado
      if (pedido.estado !== 'entregado') {
        return res.status(400).json({
          status: 'error',
          message: 'Sólo se pueden calificar pedidos entregados'
        });
      }
      
      // Actualizar pedido con calificación
      await pedido.update({
        calificacion,
        comentario_calificacion
      });
      
      return res.status(200).json({
        status: 'success',
        message: 'Calificación registrada correctamente',
        data: { 
          calificacion,
          comentario_calificacion
        }
      });
    } catch (error) {
      console.error('Error al calificar pedido:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error al registrar la calificación'
      });
    }
  };
  
  /**
   * Obtener estadísticas básicas de pedidos (solo admin)
   */
  exports.obtenerEstadisticas = async (req, res) => {
    try {
      // Verificar que sea admin
      if (req.usuario.rol !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'No tienes permiso para acceder a esta información'
        });
      }
      
      // Calcular estadísticas
      const totalPedidos = await Pedido.count();
      
      const pedidosPorEstado = await Pedido.findAll({
        attributes: [
          'estado',
          [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']
        ],
        group: ['estado']
      });
      
      const pedidosPorTipo = await Pedido.findAll({
        attributes: [
          'tipo',
          [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']
        ],
        group: ['tipo']
      });
      
      const ventasHoy = await Pedido.sum('total', {
        where: {
          fecha_pedido: {
            [Op.gte]: new Date().setHours(0, 0, 0, 0)
          },
          estado: { [Op.ne]: 'cancelado' }
        }
      });
      
      const ventasSemana = await Pedido.sum('total', {
        where: {
          fecha_pedido: {
            [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 7))
          },
          estado: { [Op.ne]: 'cancelado' }
        }
      });
      
      return res.status(200).json({
        status: 'success',
        data: {
          totalPedidos,
          pedidosPorEstado,
          pedidosPorTipo,
          ventasHoy: ventasHoy || 0,
          ventasSemana: ventasSemana || 0
        }
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error al obtener las estadísticas'
      });
    }
  };
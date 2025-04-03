module.exports = (sequelize, DataTypes) => {
    const Pedido = sequelize.define('Pedido', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      codigo: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      mesa_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      repartidor_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      nombre_cliente: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      tipo: {
        type: DataTypes.ENUM('local', 'delivery', 'para_llevar'),
        allowNull: false
      },
      estado: {
        type: DataTypes.ENUM('pendiente', 'preparando', 'listo', 'en_camino', 'entregado', 'cancelado'),
        defaultValue: 'pendiente'
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      descuento: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      costo_envio: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      direccion_entrega: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      referencia_direccion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      distrito: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      ciudad: {
        type: DataTypes.STRING(50),
        defaultValue: 'Lima'
      },
      telefono_contacto: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      email_contacto: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      tiempo_estimado_entrega: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      fecha_pedido: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      fecha_preparacion: {
        type: DataTypes.DATE,
        allowNull: true
      },
      fecha_listo: {
        type: DataTypes.DATE,
        allowNull: true
      },
      fecha_en_camino: {
        type: DataTypes.DATE,
        allowNull: true
      },
      fecha_entrega: {
        type: DataTypes.DATE,
        allowNull: true
      },
      fecha_cancelacion: {
        type: DataTypes.DATE,
        allowNull: true
      },
      motivo_cancelacion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      notas: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      calificacion: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      comentario_calificacion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      origen: {
        type: DataTypes.STRING(20),
        defaultValue: 'web'
      }
    }, {
      tableName: 'pedidos',
      timestamps: false
    });
  
    Pedido.associate = (models) => {
      Pedido.belongsTo(models.Usuario, {
        foreignKey: 'usuario_id',
        as: 'usuario'
      });
      
      Pedido.belongsTo(models.Mesa, {
        foreignKey: 'mesa_id',
        as: 'mesa'
      });
      
      Pedido.belongsTo(models.Usuario, {
        foreignKey: 'repartidor_id',
        as: 'repartidor'
      });
      
      Pedido.hasMany(models.DetallePedido, {
        foreignKey: 'pedido_id',
        as: 'detalles'
      });
      
      Pedido.hasMany(models.Pago, {
        foreignKey: 'pedido_id',
        as: 'pagos'
      });
    };
  
    return Pedido;
  };
module.exports = (sequelize, DataTypes) => {
    const DetallePedido = sequelize.define('DetallePedido', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      pedido_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      precio_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      descuento_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      notas: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      tableName: 'detalles_pedidos',
      timestamps: false
    });
  
    DetallePedido.associate = (models) => {
      DetallePedido.belongsTo(models.Pedido, {
        foreignKey: 'pedido_id',
        as: 'pedido'
      });
      
      DetallePedido.belongsTo(models.Producto, {
        foreignKey: 'producto_id',
        as: 'producto'
      });
      
      DetallePedido.hasMany(models.DetallePedidoCrema, {
        foreignKey: 'detalle_pedido_id',
        as: 'cremas'
      });
    };
  
    return DetallePedido;
  };
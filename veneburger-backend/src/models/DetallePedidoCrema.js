module.exports = (sequelize, DataTypes) => {
    const DetallePedidoCrema = sequelize.define('DetallePedidoCrema', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      detalle_pedido_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      crema_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      }
    }, {
      tableName: 'detalles_pedidos_cremas',
      timestamps: false
    });
  
    DetallePedidoCrema.associate = (models) => {
      DetallePedidoCrema.belongsTo(models.DetallePedido, {
        foreignKey: 'detalle_pedido_id',
        as: 'detalle'
      });
      
      DetallePedidoCrema.belongsTo(models.Crema, {
        foreignKey: 'crema_id',
        as: 'crema'
      });
    };
  
    return DetallePedidoCrema;
  };
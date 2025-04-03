module.exports = (sequelize, DataTypes) => {
    const Pago = sequelize.define('Pago', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      pedido_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      metodo_pago_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      monto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      referencia: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      comprobante: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      estado: {
        type: DataTypes.ENUM('pendiente', 'completado', 'cancelado'),
        defaultValue: 'pendiente'
      },
      fecha_pago: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      fecha_confirmacion: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      tableName: 'pagos',
      timestamps: false
    });
  
    Pago.associate = (models) => {
      Pago.belongsTo(models.Pedido, {
        foreignKey: 'pedido_id',
        as: 'pedido'
      });
      
      Pago.belongsTo(models.MetodoPago, {
        foreignKey: 'metodo_pago_id',
        as: 'metodo_pago'
      });
    };
  
    return Pago;
  };
module.exports = (sequelize, DataTypes) => {
    const Crema = sequelize.define('Crema', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      disponible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      fecha_actualizacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'cremas',
      timestamps: false
    });
  
    Crema.associate = (models) => {
      Crema.hasMany(models.DetallePedidoCrema, {
        foreignKey: 'crema_id',
        as: 'detalles'
      });
    };
  
    return Crema;
  };
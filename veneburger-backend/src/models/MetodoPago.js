module.exports = (sequelize, DataTypes) => {
    const MetodoPago = sequelize.define('MetodoPago', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      requiere_confirmacion: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      imagen: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    }, {
      tableName: 'metodos_pago',
      timestamps: false
    });
  
    MetodoPago.associate = (models) => {
      MetodoPago.hasMany(models.Pago, {
        foreignKey: 'metodo_pago_id',
        as: 'pagos'
      });
    };
  
    return MetodoPago;
  };
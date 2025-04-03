module.exports = (sequelize, DataTypes) => {
    const Promocion = sequelize.define('Promocion', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      descuento: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      tipo_descuento: {
        type: DataTypes.ENUM('porcentaje', 'monto'),
        defaultValue: 'porcentaje'
      },
      codigo: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true
      },
      fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: false
      },
      fecha_fin: {
        type: DataTypes.DATE,
        allowNull: false
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    }, {
      tableName: 'promociones',
      timestamps: false
    });
  
    return Promocion;
  };
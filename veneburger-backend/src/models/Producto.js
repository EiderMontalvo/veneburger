module.exports = (sequelize, DataTypes) => {
    const Producto = sequelize.define('Producto', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      categoria_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      codigo: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      tiempo_preparacion: {
        type: DataTypes.INTEGER,
        defaultValue: 15
      },
      imagen: {
        type: DataTypes.STRING(255),
        defaultValue: 'default.png'
      },
      disponible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      destacado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
      tableName: 'productos',
      timestamps: false
    });
  
    Producto.associate = (models) => {
      Producto.belongsTo(models.Categoria, {
        foreignKey: 'categoria_id',
        as: 'categoria'
      });
      
      Producto.hasMany(models.DetallePedido, {
        foreignKey: 'producto_id',
        as: 'detalles'
      });
    };
  
    return Producto;
  };
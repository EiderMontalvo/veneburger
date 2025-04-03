module.exports = (sequelize, DataTypes) => {
    const Categoria = sequelize.define('Categoria', {
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
      nombre: {
        type: DataTypes.STRING(60),
        allowNull: false
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      imagen: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      orden: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      activo: {
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
      tableName: 'categorias',
      timestamps: false
    });
  
    Categoria.associate = (models) => {
      Categoria.hasMany(models.Producto, {
        foreignKey: 'categoria_id',
        as: 'productos'
      });
    };
  
    return Categoria;
  };
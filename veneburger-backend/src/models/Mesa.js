module.exports = (sequelize, DataTypes) => {
    const Mesa = sequelize.define('Mesa', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      numero: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
      },
      capacidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 4
      },
      estado: {
        type: DataTypes.ENUM('disponible', 'ocupada', 'reservada', 'mantenimiento'),
        defaultValue: 'disponible'
      },
      ubicacion: {
        type: DataTypes.STRING(50),
        defaultValue: 'interior'
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      fecha_actualizacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'mesas',
      timestamps: false
    });
  
    Mesa.associate = (models) => {
      Mesa.hasMany(models.Pedido, {
        foreignKey: 'mesa_id',
        as: 'pedidos'
      });
      
      Mesa.hasMany(models.Reserva, {
        foreignKey: 'mesa_id',
        as: 'reservas'
      });
    };
  
    return Mesa;
  };
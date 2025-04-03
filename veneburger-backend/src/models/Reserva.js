module.exports = (sequelize, DataTypes) => {
    const Reserva = sequelize.define('Reserva', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      codigo: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      mesa_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      fecha_reserva: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      hora_inicio: {
        type: DataTypes.TIME,
        allowNull: false
      },
      hora_fin: {
        type: DataTypes.TIME,
        allowNull: false
      },
      num_personas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      estado: {
        type: DataTypes.ENUM('pendiente', 'confirmada', 'cancelada', 'completada', 'no_show'),
        defaultValue: 'pendiente'
      },
      comentarios: {
        type: DataTypes.TEXT,
        allowNull: true
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
      tableName: 'reservas',
      timestamps: false
    });
  
    Reserva.associate = (models) => {
      Reserva.belongsTo(models.Usuario, {
        foreignKey: 'usuario_id',
        as: 'usuario'
      });
      
      Reserva.belongsTo(models.Mesa, {
        foreignKey: 'mesa_id',
        as: 'mesa'
      });
    };
  
    return Reserva;
  };
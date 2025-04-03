module.exports = (sequelize, DataTypes) => {
    const DiaEspecial = sequelize.define('DiaEspecial', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: true
      },
      tipo: {
        type: DataTypes.ENUM('cerrado', 'horario_especial'),
        allowNull: false,
        defaultValue: 'cerrado'
      },
      hora_apertura: {
        type: DataTypes.TIME,
        allowNull: true
      },
      hora_cierre: {
        type: DataTypes.TIME,
        allowNull: true
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
      tableName: 'dias_especiales',
      timestamps: false
    });
  
    return DiaEspecial;
  };
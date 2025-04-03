module.exports = (sequelize, DataTypes) => {
    const HorarioAtencion = sequelize.define('HorarioAtencion', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      dia_semana: {
        type: DataTypes.ENUM('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'),
        allowNull: false,
        unique: true
      },
      hora_apertura: {
        type: DataTypes.TIME,
        allowNull: false
      },
      hora_cierre: {
        type: DataTypes.TIME,
        allowNull: false
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    }, {
      tableName: 'horarios_atencion',
      timestamps: false
    });
  
    return HorarioAtencion;
  };
module.exports = (sequelize, DataTypes) => {
    const Usuario = sequelize.define('Usuario', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      apellidos: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      telefono: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      direccion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      referencia_direccion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      ciudad: {
        type: DataTypes.STRING(50),
        defaultValue: 'Lima'
      },
      distrito: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      rol: {
        type: DataTypes.ENUM('cliente', 'admin', 'repartidor'),
        defaultValue: 'cliente'
      },
      fecha_registro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      ultimo_login: {
        type: DataTypes.DATE,
        allowNull: true
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    }, {
      tableName: 'usuarios',
      timestamps: false
    });
  
    return Usuario;
  };
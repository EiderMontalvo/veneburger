const Sequelize = require('sequelize');
const { sequelize } = require('../config/database');
const db = {};

// Inicializar modelos manualmente
db.Usuario = require('./Usuario')(sequelize, Sequelize.DataTypes);
db.Categoria = require('./Categoria')(sequelize, Sequelize.DataTypes);
db.Producto = require('./Producto')(sequelize, Sequelize.DataTypes);
db.Crema = require('./Crema')(sequelize, Sequelize.DataTypes);
db.Mesa = require('./Mesa')(sequelize, Sequelize.DataTypes);
db.Reserva = require('./Reserva')(sequelize, Sequelize.DataTypes);
db.Pedido = require('./Pedido')(sequelize, Sequelize.DataTypes);
db.DetallePedido = require('./DetallePedido')(sequelize, Sequelize.DataTypes);
db.DetallePedidoCrema = require('./DetallePedidoCrema')(sequelize, Sequelize.DataTypes);
db.MetodoPago = require('./MetodoPago')(sequelize, Sequelize.DataTypes);
db.Pago = require('./Pago')(sequelize, Sequelize.DataTypes);
db.DiaEspecial = require('./DiaEspecial')(sequelize, Sequelize.DataTypes);
db.HorarioAtencion = require('./HorarioAtencion')(sequelize, Sequelize.DataTypes);

// Establecer asociaciones
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
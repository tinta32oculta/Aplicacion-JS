// Correcto: usa "Sequelize" (con 'e' después de la 'q')
const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: console.log,
  define: {
    timestamps: true,
    underscored: true
  }
});

// Test de conexión
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a SQLite establecida');
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
})();

module.exports = sequelize;
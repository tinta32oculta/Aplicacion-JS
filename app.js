const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const Task = require('./models/task');
const taskRoutes = require('./routes/tasks');

// Configuración de Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/tasks', taskRoutes);

// Sincronización con la base de datos y arranque del servidor
const PORT = process.env.PORT || 8000;

async function initializeServer() {
  try {
    // Testear conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a SQLite establecida correctamente');

    // Sincronizar modelos con la base de datos
    await sequelize.sync({ force: false }); // force: true resetea las tablas (solo desarrollo)
    console.log('🔄 Modelos sincronizados con la base de datos');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(` Servidor corriendo en http://localhost:${PORT}`);
      console.log(' Endpoints disponibles:');
      console.log(`- GET    http://localhost:${PORT}/api/tasks`);
      console.log(`- POST   http://localhost:${PORT}/api/tasks`);
      console.log(`- PATCH  http://localhost:${PORT}/api/tasks/:id`);
      console.log(`- DELETE http://localhost:${PORT}/api/tasks/:id`);
    });

  } catch (error) {
    console.error(' Error al iniciar el servidor:', error);
    process.exit(1); // Salir con código de error
  }
}

// Inicializar la aplicación
initializeServer();

// Manejo de errores global
process.on('unhandledRejection', (err) => {
  console.error('⚠ Error no manejado:', err);
});

// Exportar para testing (opcional)
module.exports = app;

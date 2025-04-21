
const express = require('express');
const cors = require('cors');
const { initializeDatabase, createPool } = require('./database');
const routes = require('./routes'); // <-- Import modular routers

// Initialize express application
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create connection pool
const pool = createPool();

// Health check route
app.get('/', (req, res) => {
  res.send('ListaAi API is running');
});

// Use combined routers (all /server/* endpoints)
app.use('/server', routes);

// Redirect all other /server routes to error or mock response
app.all('/server/*', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Esta rota não está disponível no modo mockado',
    message: 'Use o login mockado com admin@admin.com / admin123'
  });
});

// Initialize database before starting the server
async function startServer() {
  try {
    try {
      await initializeDatabase();
      console.log('Database initialized successfully.');
    } catch (dbError) {
      console.error('Warning: Failed to initialize database:', dbError);
      console.log('Starting server in mock mode - use admin@admin.com / admin123 to login');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Login mockado disponível: admin@admin.com / senha: admin123`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;

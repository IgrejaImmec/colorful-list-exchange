
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { initializeDatabase } = require('./database');

// Initialize express application
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.send('ListaAi API is running');
});

// Apply all routes
app.use('/server', routes);

// Initialize database before starting the server
async function startServer() {
  try {
    // Initialize database (create tables if they don't exist)
    await initializeDatabase();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize the application:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;

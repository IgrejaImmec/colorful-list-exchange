
const express = require('express');
const cors = require('cors');
const { testConnection } = require('../src/services/dbService');
const routes = require('./routes');

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

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error('Database connection failed. Server will start but may not function correctly.');
    } else {
      console.log('Database connection successful.');
    }

    // Start listening
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
